import React, { useState, useEffect } from 'react';
import { Agendamento, EspecialidadeCRSMA, PerfilUsuario, Usuario } from './types';
import { INITIAL_AGENDAMENTOS } from './data/mockInitialData';
import { INITIAL_USUARIOS } from './data/mockUsers';
import { Sidebar, TabType } from './components/Sidebar';
import { AvisosBanner } from './components/AvisosBanner';
import { FichasHomeView } from './components/FichasHomeView';
import { SpreadsheetView } from './components/SpreadsheetView';
import { RegulationQueueView } from './components/RegulationQueueView';
import { ServiceExecutionView } from './components/ServiceExecutionView';
import { BuscaAtivaView } from './components/BuscaAtivaView';
import { DashboardView } from './components/DashboardView';
import { RulesView } from './components/RulesView';
import { UserManagementView } from './components/UserManagementView';
import { AuditReportView } from './components/AuditReportView';
import { AppointmentFormView } from './components/AppointmentFormView';
import { AppointmentFormModal } from './components/AppointmentFormModal';
import { AppointmentDetailModal } from './components/AppointmentDetailModal';
import { LoginView } from './components/LoginView';
import {
  ActiveSession,
  getCurrentSession,
  logoutCurrentSession,
  sendHeartbeat,
} from './utils/sessionManager';

const LOCAL_STORAGE_KEY_AGENDAMENTOS = 'crsma_agendamentos_v2';
const LOCAL_STORAGE_KEY_PERFIL = 'crsma_perfil_usuario_v2';
const LOCAL_STORAGE_KEY_USUARIOS = 'crsma_usuarios_v2';

export default function App() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USUARIOS);
    let loaded: Usuario[] = [];
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved usuarios', e);
      }
    }

    // Merge INITIAL_USUARIOS with saved users so all official logins exist
    const mergedMap = new Map<string, Usuario>();

    // 1. Load initial official users
    INITIAL_USUARIOS.forEach((u) => {
      mergedMap.set(u.cnesUnidade, u);
    });

    // 2. Merge saved state (preserve custom users and activity logs)
    loaded.forEach((u) => {
      if (u.cnesUnidade && mergedMap.has(u.cnesUnidade)) {
        const official = mergedMap.get(u.cnesUnidade)!;
        mergedMap.set(u.cnesUnidade, {
          ...u,
          nome: official.nome,
          cnesUnidade: official.cnesUnidade,
          cpfOuCnes: official.cpfOuCnes,
          senha: official.senha,
          perfil: official.perfil,
          unidadeOuOrgao: official.unidadeOuOrgao,
          ativo: true,
        });
      } else {
        mergedMap.set(u.id || u.cnesUnidade, u);
      }
    });

    return Array.from(mergedMap.values());
  });

  // Current logged in session & user
  const [currentSession, setCurrentSessionState] = useState<ActiveSession | null>(() => {
    return getCurrentSession();
  });

  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const session = getCurrentSession();
    if (session) {
      const found = usuarios.find((u) => u.id === session.userId) || INITIAL_USUARIOS.find((u) => u.id === session.userId);
      if (found) return found;
    }
    return null;
  });

  const [perfilUsuario, setPerfilUsuario] = useState<PerfilUsuario>(() => {
    if (currentUser) return currentUser.perfil;
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PERFIL);
    return (saved as PerfilUsuario) || 'SOLICITANTE';
  });

  // Keep heartbeat alive while logged in
  useEffect(() => {
    if (!currentSession) return;

    // Send heartbeat immediately on load
    sendHeartbeat(currentSession.sessionId);

    // Send heartbeat every 30 seconds
    const interval = setInterval(() => {
      sendHeartbeat(currentSession.sessionId);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const handleLoginSuccess = (user: Usuario, session: ActiveSession) => {
    setCurrentUser(user);
    setCurrentSessionState(session);
    setPerfilUsuario(user.perfil);
  };

  const handleLogout = () => {
    logoutCurrentSession();
    setCurrentUser(null);
    setCurrentSessionState(null);
  };

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_AGENDAMENTOS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved agendamentos', e);
      }
    }
    return INITIAL_AGENDAMENTOS;
  });

  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Modals & Form Preset State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formInitialEsf, setFormInitialEsf] = useState<string | undefined>(undefined);
  const [formInitialSpecialty, setFormInitialSpecialty] = useState<EspecialidadeCRSMA | undefined>(undefined);
  const [formInitialPatientData, setFormInitialPatientData] = useState<Partial<Agendamento> | undefined>(undefined);

  const [selectedAppointment, setSelectedAppointment] = useState<Agendamento | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sync agendamentos to local storage and send to central backend server API
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_AGENDAMENTOS, JSON.stringify(agendamentos));
    fetch('/api/agendamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agendamentos }),
    }).catch(() => {});
  }, [agendamentos]);

  // Periodic real-time fetch from central backend API (/api/agendamentos) to sync across all browsers & users
  useEffect(() => {
    const fetchCentralAgendamentos = async () => {
      try {
        const res = await fetch('/api/agendamentos');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (Array.isArray(data.agendamentos) && data.agendamentos.length > 0) {
              setAgendamentos((prev) => {
                const map = new Map<string, Agendamento>();
                data.agendamentos.forEach((a: Agendamento) => map.set(a.id, a));
                // Include any local records not yet on server
                prev.forEach((a) => {
                  if (!map.has(a.id)) map.set(a.id, a);
                });
                const merged = Array.from(map.values());
                return JSON.stringify(merged) !== JSON.stringify(prev) ? merged : prev;
              });
            } else if ((!data.agendamentos || data.agendamentos.length === 0) && agendamentos.length > 0) {
              // Seed server if file is empty
              fetch('/api/agendamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agendamentos }),
              }).catch(() => {});
            }
          }
        }
      } catch (e) {
        // Quiet fail if backend API is not running or on purely static host
      }
    };

    fetchCentralAgendamentos();
    const interval = setInterval(fetchCentralAgendamentos, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PERFIL, perfilUsuario);
  }, [perfilUsuario]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
    fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarios }),
    }).catch(() => {});
    window.dispatchEvent(new Event('crsma_usuarios_updated'));
  }, [usuarios]);

  // Real-time synchronization listener for usuarios across tabs & views
  useEffect(() => {
    const syncUsuarios = () => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USUARIOS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (JSON.stringify(parsed) !== JSON.stringify(usuarios)) {
            setUsuarios(parsed);
          }
        } catch (e) {
          console.error('Error parsing stored usuarios:', e);
        }
      }
    };

    window.addEventListener('storage', syncUsuarios);
    window.addEventListener('crsma_usuarios_updated', syncUsuarios);
    const interval = setInterval(syncUsuarios, 2000);

    return () => {
      window.removeEventListener('storage', syncUsuarios);
      window.removeEventListener('crsma_usuarios_updated', syncUsuarios);
      clearInterval(interval);
    };
  }, [usuarios]);

  const saveAndSetUsuarios = (newUsers: Usuario[]) => {
    setUsuarios(newUsers);
    localStorage.setItem(LOCAL_STORAGE_KEY_USUARIOS, JSON.stringify(newUsers));
    window.dispatchEvent(new Event('crsma_usuarios_updated'));
  };

  const handleAddUsuario = (newUsuarioData: Omit<Usuario, 'id' | 'criadoEm'>) => {
    const newUsuario: Usuario = {
      ...newUsuarioData,
      id: `usr-${Date.now()}`,
      criadoEm: new Date().toISOString(),
      ultimoAcesso: new Date().toISOString(),
    };
    saveAndSetUsuarios([newUsuario, ...usuarios]);
  };

  const handleUpdateUsuario = (updated: Usuario) => {
    saveAndSetUsuarios(usuarios.map((u) => (u.id === updated.id ? updated : u)));
  };

  const handleDeleteUsuario = (id: string) => {
    saveAndSetUsuarios(usuarios.filter((u) => u.id !== id));
  };

  const handleCreateAgendamento = (newAgendamento: Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const nextIdNumber = 100 + agendamentos.length + 1;
    const fullAgendamento: Agendamento = {
      ...newAgendamento,
      id: `AGD-2026-${nextIdNumber}`,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    setAgendamentos([fullAgendamento, ...agendamentos]);
  };

  const handleUpdateAgendamento = (updated: Agendamento) => {
    setAgendamentos((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    if (selectedAppointment?.id === updated.id) {
      setSelectedAppointment(updated);
    }
  };

  const handleDeleteAgendamento = (id: string) => {
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
    if (selectedAppointment?.id === id) {
      setSelectedAppointment(null);
      setIsDetailModalOpen(false);
    }
  };

  const handleOpenFormWithPreset = (esf: string, specialty: EspecialidadeCRSMA) => {
    setFormInitialEsf(esf);
    setFormInitialSpecialty(specialty);
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (agendamento: Agendamento) => {
    setSelectedAppointment(agendamento);
    setIsDetailModalOpen(true);
  };

  const pendingCount = agendamentos.filter((a) => a.status === 'Pendente').length;

  // Render Login Screen if not authenticated
  if (!currentSession) {
    return <LoginView usuarios={usuarios} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col lg:flex-row font-sans">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAppointment={() => {
          setFormInitialEsf(undefined);
          setFormInitialSpecialty(undefined);
          setActiveTab('form');
        }}
        pendingCount={pendingCount}
        perfilUsuario={perfilUsuario}
        setPerfilUsuario={setPerfilUsuario}
        currentUser={currentUser}
        currentSession={currentSession}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-72">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
          {/* Top Avisos Banner */}
          <AvisosBanner />

          {/* Tab Content Views */}
          {activeTab === 'home' && (
            <FichasHomeView
              agendamentos={agendamentos}
              onSelectSpecialty={(specialty) => {
                setFormInitialSpecialty(specialty);
                setActiveTab('form');
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'form' && (
            <AppointmentFormView
              onSubmit={handleCreateAgendamento}
              initialEsf={formInitialEsf}
              initialSpecialty={formInitialSpecialty}
              initialPatientData={formInitialPatientData}
              onSuccessNavigate={() => {
                setFormInitialPatientData(undefined);
                setActiveTab('spreadsheet');
              }}
              perfilUsuario={perfilUsuario}
            />
          )}

          {activeTab === 'spreadsheet' && (
            <SpreadsheetView
              agendamentos={agendamentos}
              onOpenNewAppointmentWithEsfAndSpecialty={(esf, spec) => {
                handleOpenFormWithPreset(esf, spec);
                setActiveTab('form');
              }}
              onOpenAppointmentDetail={handleOpenDetail}
              perfilUsuario={perfilUsuario}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'queue' && (
            <RegulationQueueView
              agendamentos={agendamentos}
              onUpdateAgendamento={handleUpdateAgendamento}
              onOpenAppointmentDetail={handleOpenDetail}
              perfilUsuario={perfilUsuario}
            />
          )}

          {activeTab === 'serviceExecution' && (
            <ServiceExecutionView
              agendamentos={agendamentos}
              onUpdateAgendamento={handleUpdateAgendamento}
              onOpenAppointmentDetail={handleOpenDetail}
              onReturnToQueueNewRequest={(patientData) => {
                setFormInitialPatientData(patientData);
                setActiveTab('form');
              }}
              perfilUsuario={perfilUsuario}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'audit' && (
            <AuditReportView
              agendamentos={agendamentos}
              perfilUsuario={perfilUsuario}
              setPerfilUsuario={setPerfilUsuario}
            />
          )}

          {activeTab === 'buscaAtiva' && (
            <BuscaAtivaView
              agendamentos={agendamentos}
              onUpdateAgendamento={handleUpdateAgendamento}
              onOpenAppointmentDetail={handleOpenDetail}
            />
          )}

          {activeTab === 'dashboard' && <DashboardView agendamentos={agendamentos} />}

          {activeTab === 'rules' && <RulesView />}

          {activeTab === 'users' && (
            <UserManagementView
              usuarios={usuarios}
              onAddUsuario={handleAddUsuario}
              onUpdateUsuario={handleUpdateUsuario}
              onDeleteUsuario={handleDeleteUsuario}
              perfilUsuario={perfilUsuario}
              setPerfilUsuario={setPerfilUsuario}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div>
              <p className="font-semibold text-slate-200">
                SISTEMA DE GESTÃO E REGULAÇÃO - CRSMA ARARIPINA - PE
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Secretaria Municipal de Saúde &bull; Centro de Referência em Saúde da Mulher
              </p>
            </div>

            <div className="text-[11px] text-slate-500">
              Integrado com e-SUS PEC &bull; CRSMA Araripina
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AppointmentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateAgendamento}
        initialEsf={formInitialEsf}
        initialSpecialty={formInitialSpecialty}
        initialPatientData={formInitialPatientData}
        perfilUsuario={perfilUsuario}
      />

      <AppointmentDetailModal
        agendamento={selectedAppointment}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAppointment(null);
        }}
        onUpdateAgendamento={handleUpdateAgendamento}
        onDeleteAgendamento={handleDeleteAgendamento}
        perfilUsuario={perfilUsuario}
      />
      {/* Print Watermark Identification */}
      <div className="hidden print:flex print-watermark">
        CENTRO DE REFERÊNCIA EM SAÚDE DA MULHER
        <br />
        CRSMA &bull; ARARIPINA - PE
      </div>
    </div>
  );
}
