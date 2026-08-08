import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Shield,
  Lock,
  Users,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Activity,
  Eye,
  EyeOff,
  Info,
  CreditCard,
  LogIn,
  UserCheck,
  RefreshCw,
  X,
  ChevronRight,
  Download,
} from 'lucide-react';
import { Usuario, PerfilUsuario } from '../types';
import {
  getActiveSessions,
  checkLoginCapacity,
  loginUserSession,
  removeSessionById,
  ActiveSession,
  MAX_SESSIONS_PER_PERFIL,
} from '../utils/sessionManager';

interface LoginViewProps {
  usuarios: Usuario[];
  onLoginSuccess: (user: Usuario, session: ActiveSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ usuarios, onLoginSuccess }) => {
  const [cnesInput, setCnesInput] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [showSessionsModal, setShowSessionsModal] = useState<boolean>(false);

  // Sync active sessions state
  const refreshSessions = () => {
    const current = getActiveSessions();
    setActiveSessions(current);
  };

  useEffect(() => {
    refreshSessions();

    const handleStorage = () => refreshSessions();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('crsma_sessions_updated', handleStorage);

    const interval = setInterval(refreshSessions, 5000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('crsma_sessions_updated', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const solicitanteSessions = activeSessions.filter((s) => s.perfil === 'SOLICITANTE');
  const reguladorSessions = activeSessions.filter((s) => s.perfil === 'REGULADOR');
  const adminSessions = activeSessions.filter((s) => s.perfil === 'ADMINISTRADOR');

  // Find user by CNES or Email
  const findMatchingUser = (inputCnes: string): Usuario | undefined => {
    if (!inputCnes || !inputCnes.trim()) return undefined;
    const cleanInput = inputCnes.trim().toLowerCase();

    return usuarios.find((u) => {
      if (!u.ativo) return false;
      const uCnes = (u.cnesUnidade || u.cpfOuCnes || '').trim().toLowerCase();
      const uEmail = (u.email || '').trim().toLowerCase();

      return uCnes === cleanInput || uEmail === cleanInput;
    });
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const cnesClean = cnesInput.trim();
    if (!cnesClean) {
      setLoginError('Por favor, informe o Código CNES da unidade.');
      return;
    }

    if (!password) {
      setLoginError('Por favor, digite a senha de acesso.');
      return;
    }

    const user = findMatchingUser(cnesClean);

    if (!user) {
      setLoginError('Código CNES não encontrado ou usuário inativo. Verifique o CNES cadastrado pelo Administrador.');
      return;
    }

    // Validate user password
    const expectedPassword = user.senha || '123456';
    if (password.trim() !== expectedPassword) {
      setLoginError('Senha incorreta para o CNES informado.');
      return;
    }

    // Check capacity limit rule before logging in
    const capacity = checkLoginCapacity(user.perfil, user.id);
    if (!capacity.allowed) {
      setLoginError(capacity.message || `Limite de logins simultâneos atingido para o perfil ${user.perfil}.`);
      return;
    }

    // Execute session login
    const result = loginUserSession(user);
    if (!result.success || !result.session) {
      setLoginError(result.error || 'Não foi possível iniciar a sessão.');
      return;
    }

    // Notify parent
    onLoginSuccess(user, result.session);
  };

  const handleForceDisconnectSession = (sessionId: string) => {
    removeSessionById(sessionId);
    refreshSessions();
  };

  const getPerfilBadgeColor = (perfil: PerfilUsuario) => {
    switch (perfil) {
      case 'ADMINISTRADOR':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'REGULADOR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'SOLICITANTE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPerfilIcon = (perfil: PerfilUsuario) => {
    switch (perfil) {
      case 'ADMINISTRADOR':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      case 'REGULADOR':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'SOLICITANTE':
        return <User className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white font-sans">
      {/* Header */}
      <header className="bg-slate-950/90 border-b border-slate-800 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-teal-900/40 shrink-0">
              C
            </div>
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
                <span>CRSMA ARARIPINA - PE</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Regulação 2026
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Centro de Referência da Saúde da Mulher de Araripina &bull; Secretaria Municipal de Saúde
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSessionsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sessões Ativas ({activeSessions.length})</span>
            </button>

            <div className="hidden md:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sistemas Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center items-center">
        <div className="w-full space-y-6">
          {/* Main Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md w-full relative overflow-hidden">
            {/* Ambient Background Gradient Glow */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card Header Title */}
            <div className="text-center max-w-lg mx-auto space-y-2 mb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 text-teal-400 mb-1 shadow-inner">
                <UserCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Acesso ao Sistema CRSMA
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Informe o Código CNES da Unidade e sua senha de acesso cadastrada pelo Administrador.
              </p>
            </div>

            {/* Login Error Notification */}
            {loginError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-950/90 border border-red-700/80 text-red-200 flex items-start gap-3 shadow-md animate-shake">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-red-300">
                    Falha na Autenticação
                  </p>
                  <p className="text-xs leading-relaxed text-red-200">{loginError}</p>
                </div>
                <button
                  onClick={() => setLoginError(null)}
                  className="text-red-400 hover:text-white p-1 rounded-lg hover:bg-red-900/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* LoginForm Form */}
            <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto space-y-5">
              {/* CNES Input */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-400" />
                    <span>Código CNES da Unidade</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Obrigatório</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cnesInput}
                    onChange={(e) => {
                      setCnesInput(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="Digite o CNES da unidade (ex: 230206 ou 223505)"
                    className="w-full pl-4 pr-10 py-3 text-sm font-bold bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition-all"
                  />
                  {cnesInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setCnesInput('');
                        setLoginError(null);
                      }}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 text-xs font-bold"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-400" />
                    <span>Senha de Acesso</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha de acesso"
                    className="w-full pl-4 pr-10 py-3 text-sm bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-teal-950/50 hover:shadow-teal-500/20 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <LogIn className="w-5 h-5 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
                  <span>Acessar o Sistema</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-4 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">
          SISTEMA DE REGULAÇÃO E ATENDIMENTO À SAÚDE DA MULHER &bull; CRSMA ARARIPINA - PE
        </p>
        <p className="text-[11px] mt-0.5 text-slate-600">
          Secretaria Municipal de Saúde &bull; Autenticação Segura por CNES &bull; Perfis Gerenciados por Administrador
        </p>
      </footer>

      {/* Active Sessions Modal */}
      {showSessionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-black">Conexões Simultâneas Ativas</h3>
                  <p className="text-xs text-slate-400">
                    Monitoramento em tempo real dos perfis logados no sistema
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSessionsModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>

            {/* Overview Badges */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Solicitantes</span>
                <span className="text-lg font-black text-blue-400">
                  {solicitanteSessions.length} / {MAX_SESSIONS_PER_PERFIL.SOLICITANTE}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Reguladores</span>
                <span className="text-lg font-black text-emerald-400">
                  {reguladorSessions.length} / {MAX_SESSIONS_PER_PERFIL.REGULADOR}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Admins</span>
                <span className="text-lg font-black text-purple-400">
                  {adminSessions.length} / {MAX_SESSIONS_PER_PERFIL.ADMINISTRADOR}
                </span>
              </div>
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Lista de Sessões Conectadas
              </h4>

              {activeSessions.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                  Nenhuma sessão ativa no momento.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                  {activeSessions.map((s) => (
                    <div
                      key={s.sessionId}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{s.userName}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-extrabold border ${getPerfilBadgeColor(
                              s.perfil
                            )}`}
                          >
                            {s.perfil}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Conectado em: {new Date(s.loginTime).toLocaleTimeString('pt-BR')} &bull; {s.unidadeOuOrgao}
                        </p>
                      </div>

                      <button
                        onClick={() => handleForceDisconnectSession(s.sessionId)}
                        className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white border border-red-800 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Desconectar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowSessionsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
