import React from 'react';
import { Home, Table, CalendarCheck, Megaphone, FileText, Plus, LayoutDashboard, UserCheck, ShieldCheck, User, Shield, Users, Lock, Download } from 'lucide-react';
import { PerfilUsuario } from '../types';

interface HeaderProps {
  activeTab: 'home' | 'form' | 'spreadsheet' | 'queue' | 'buscaAtiva' | 'dashboard' | 'rules' | 'users';
  setActiveTab: (tab: 'home' | 'form' | 'spreadsheet' | 'queue' | 'buscaAtiva' | 'dashboard' | 'rules' | 'users') => void;
  onOpenNewAppointment: () => void;
  pendingCount: number;
  perfilUsuario: PerfilUsuario;
  setPerfilUsuario: (perfil: PerfilUsuario) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAppointment,
  pendingCount,
  perfilUsuario,
  setPerfilUsuario,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      {/* Top Municipal Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white shadow-sm text-base shrink-0">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                CRSMA - Centro de Referência em Saúde da Mulher de Araripina
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                SISTEMA MUNICIPAL DE REGULAÇÃO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Regulação Especializada e Agendamentos para Equipes de Saúde da Família (eSF)
            </p>
          </div>
        </div>

        {/* Action Controls & Profile Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Profile Switcher Box */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 p-1 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2 hidden sm:inline">
              Perfil Activo:
            </span>

            <button
              onClick={() => setPerfilUsuario('SOLICITANTE')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                perfilUsuario === 'SOLICITANTE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              title="Perfil Solicitante: apenas cria solicitações e visualiza acompanhamento"
            >
              <User className="w-3.5 h-3.5" />
              <span>Solicitante (eSF)</span>
              {perfilUsuario === 'SOLICITANTE' && <span className="text-[9px] bg-blue-500 text-white px-1 rounded">Somente Leitura Vagas</span>}
            </button>

            <button
              onClick={() => setPerfilUsuario('REGULADOR')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                perfilUsuario === 'REGULADOR'
                  ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              title="Perfil Regulador: poder total de agendamento, datas, médicos e vagas do CRSMA"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Regulador (CRSMA)</span>
              {perfilUsuario === 'REGULADOR' && <span className="text-[9px] bg-emerald-500 text-white px-1 rounded">Agendamento Liberado</span>}
            </button>

            {perfilUsuario !== 'SOLICITANTE' && (
              <button
                onClick={() => setPerfilUsuario('ADMINISTRADOR')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  perfilUsuario === 'ADMINISTRADOR'
                    ? 'bg-purple-600 text-white shadow-xs ring-1 ring-purple-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
                title="Perfil Administrador: poder total + cadastro e gestão de usuários de ambos os perfis"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Administrador (SMS)</span>
                {perfilUsuario === 'ADMINISTRADOR' && <span className="text-[9px] bg-purple-500 text-white px-1 rounded">Gestão de Usuários</span>}
              </button>
            )}
          </div>

          {/* Download Projeto ZIP (Exclusivo Administrador) */}
          {perfilUsuario === 'ADMINISTRADOR' && (
            <a
              href="/projeto_crsma.zip"
              download="projeto_crsma.zip"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 transition-colors shadow-xs active:scale-95"
              title="Download do código-fonte atualizado (.zip) - Exclusivo Administrador"
            >
              <Download className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Baixar ZIP do Código</span>
              <span className="sm:hidden">ZIP</span>
            </a>
          )}

          {/* New Appointment Button */}
          <button
            onClick={onOpenNewAppointment}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Solicitação</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 border-t border-slate-800/80 pt-1">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'home'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-teal-400" />
          <span>Fichas de Regulação (Tela Inicial)</span>
        </button>

        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'form'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-teal-400" />
          <span>Ficha de Nova Solicitação</span>
        </button>

        <button
          onClick={() => setActiveTab('spreadsheet')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'spreadsheet'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Table className="w-3.5 h-3.5 text-teal-400" />
          <span>Planilha Geral CRSMA</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'queue'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Fila de Regulação</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500 text-slate-950">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('buscaAtiva')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'buscaAtiva'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-teal-400" />
          <span>Busca Ativa & Comunicados</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'dashboard'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-teal-400" />
          <span>Painel de Estatísticas</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'rules'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-teal-400" />
          <span>Regras & e-SUS PEC</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'users'
              ? 'border-purple-400 text-purple-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Gestão de Usuários</span>
          {perfilUsuario === 'ADMINISTRADOR' && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500 text-white uppercase">
              Admin
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
