import React, { useState } from 'react';
import {
  Home,
  Table,
  CalendarCheck,
  Megaphone,
  FileText,
  Plus,
  FileSpreadsheet,
  LayoutDashboard,
  CheckCircle2,
  User,
  ShieldCheck,
  Shield,
  Users,
  Menu,
  X,
  Building2,
  LogOut,
  Activity,
  Scale,
  FileCheck,
  CheckSquare,
} from 'lucide-react';
import { PerfilUsuario, Usuario } from '../types';
import { ActiveSession, MAX_SESSIONS_PER_PERFIL } from '../utils/sessionManager';

export type TabType = 'home' | 'form' | 'spreadsheet' | 'queue' | 'buscaAtiva' | 'dashboard' | 'rules' | 'users' | 'audit' | 'serviceExecution';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewAppointment: () => void;
  pendingCount: number;
  perfilUsuario: PerfilUsuario;
  setPerfilUsuario: (perfil: PerfilUsuario) => void;
  currentUser?: Usuario | null;
  currentSession?: ActiveSession | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAppointment,
  pendingCount,
  perfilUsuario,
  setPerfilUsuario,
  currentUser,
  currentSession,
  onLogout,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isChangingProfile, setIsChangingProfile] = useState(false);

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const menuItems = [
    {
      id: 'home' as const,
      label: 'Fichas de Regulação',
      sublabel: 'Tela Inicial',
      icon: Home,
    },
    {
      id: 'form' as const,
      label: 'Nova Solicitação',
      sublabel: 'Preencher Ficha',
      icon: Plus,
    },
    {
      id: 'spreadsheet' as const,
      label: 'Lista de Pacientes Regulados',
      sublabel: 'Consulta de Atendimentos',
      icon: Table,
    },
    {
      id: 'queue' as const,
      label: 'Fila de Regulação',
      sublabel: 'Agendar e Atribuir Médico',
      icon: CalendarCheck,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'serviceExecution' as const,
      label: 'Execução do Serviço',
      sublabel: 'Presença, Remarcação & BPA',
      icon: CheckSquare,
      badge: 'Regulação',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'audit' as const,
      label: 'Painel de Auditoria',
      sublabel: 'Relatório da Fila (25 Seções)',
      icon: Scale,
      badge: 'Admin',
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      id: 'buscaAtiva' as const,
      label: 'Busca Ativa & Avisos',
      sublabel: 'Notificar Pacientes & ACS',
      icon: Megaphone,
    },
    {
      id: 'dashboard' as const,
      label: 'Painel de Estatísticas',
      sublabel: 'Gráficos & Indicadores',
      icon: LayoutDashboard,
    },
    {
      id: 'rules' as const,
      label: 'Regras & e-SUS PEC',
      sublabel: 'Normativas de Regulação',
      icon: FileText,
    },
    {
      id: 'users' as const,
      label: 'Gestão de Usuários',
      sublabel: 'Controle de Acessos',
      icon: Users,
      badge: perfilUsuario === 'ADMINISTRADOR' ? 'Admin' : null,
      badgeColor: 'bg-purple-500 text-white',
    },
  ];

  // All tabs are accessible to all user profiles to guarantee full visibility and prevent duplicate registrations
  const filteredMenuItems = menuItems;

  const getPerfilDetails = (perfil: PerfilUsuario) => {
    switch (perfil) {
      case 'SOLICITANTE':
        return { label: 'Solicitante (eSF)', icon: User, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'REGULADOR':
        return { label: 'Regulador (CRSMA)', icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'ADMINISTRADOR':
        return { label: 'Administrador (SMS)', icon: Shield, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    }
  };

  const activePerfil = getPerfilDetails(perfilUsuario);
  const ActiveIcon = activePerfil.icon;

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="lg:hidden bg-slate-900 text-white p-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5" onClick={() => handleNavClick('home')}>
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white shadow-xs text-sm shrink-0">
            R
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-white">CRSMA Araripina</h1>
            <p className="text-[10px] text-teal-400 font-semibold">Sistema de Regulação</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Abrir menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-white border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header Section */}
        <div className="p-3.5 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3 cursor-pointer mb-2.5" onClick={() => handleNavClick('home')}>
            <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center font-extrabold text-white shadow-md text-lg shrink-0">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight">
                  CRSMA ARARIPINA
                </h1>
              </div>
              <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider mt-0.5">
                Regulação da Mulher
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Secretaria Municipal de Saúde &bull; Araripina - PE
          </p>

          {/* Action Button: Nova Solicitação */}
          <button
            onClick={() => {
              onOpenNewAppointment();
              setIsMobileOpen(false);
            }}
            className="w-full mt-2.5 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Solicitação</span>
          </button>
        </div>

        {/* Navigation Menu List - Fixed without visible scrollbars */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-2.5 space-y-1">
          <div className="px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Menu de Navegação
          </div>

          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-md transition-colors shrink-0 ${
                      isActive ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold leading-tight whitespace-nowrap text-slate-100">{item.label}</span>
                    <span className="block text-[10px] text-slate-400 font-normal truncate">{item.sublabel}</span>
                  </div>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${item.badgeColor} shrink-0`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Configs & Active Profile Section */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2.5 shrink-0">
          {/* Active Profile & Logged User Card */}
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg space-y-2">
            {currentUser && (
              <div className="pb-2 border-b border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Usuário Logado:
                </span>
                <p className="text-xs font-black text-white truncate">{currentUser.nome}</p>
                <p className="text-[10px] text-teal-400 font-medium truncate">{currentUser.unidadeOuOrgao}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Perfil Ativo:
              </span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Max {MAX_SESSIONS_PER_PERFIL[perfilUsuario]} Conexões
              </span>
            </div>

            <div className={`flex items-center justify-between p-2 rounded-md border ${activePerfil.color}`}>
              <div className="flex items-center gap-2 min-w-0">
                <ActiveIcon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-extrabold truncate text-white">{activePerfil.label}</span>
              </div>
              <span className="text-[8px] bg-teal-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase shrink-0">
                Ativo
              </span>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full mt-2 py-1.5 px-3 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair / Encerrar Sessão</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
