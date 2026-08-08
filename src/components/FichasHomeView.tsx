import React from 'react';
import { EspecialidadeCRSMA, Agendamento } from '../types';
import { ESPECIALIDADES, ESPECIALIDADES_DESCRICAO } from '../data/constants';
import {
  Baby,
  FileSearch,
  Scissors,
  UserCheck,
  Sparkles,
  RefreshCw,
  Activity,
  Syringe,
  ArrowRight,
  FileSpreadsheet,
  Clock,
  Search,
  BookOpen,
  FilePlus,
  ShieldCheck,
  Building2,
  CalendarCheck,
} from 'lucide-react';

interface FichasHomeViewProps {
  onSelectSpecialty: (specialty: EspecialidadeCRSMA) => void;
  onNavigateToTab: (tab: 'spreadsheet' | 'queue' | 'buscaAtiva' | 'rules' | 'dashboard') => void;
  agendamentos: Agendamento[];
}

export const FichasHomeView: React.FC<FichasHomeViewProps> = ({
  onSelectSpecialty,
  onNavigateToTab,
  agendamentos,
}) => {
  const pendingCount = agendamentos.filter((a) => a.status === 'Pendente').length;
  const scheduledCount = agendamentos.filter((a) => a.status === 'Agendado' || a.status === 'Confirmado').length;
  const totalCount = agendamentos.length;

  const getSpecialtyIcon = (specialty: EspecialidadeCRSMA) => {
    switch (specialty) {
      case 'PRÉ-NATAL DE ALTO RISCO':
        return <Baby className="w-6 h-6 text-rose-600" />;
      case 'COLPOSCOPIA':
      case 'COLPOSCOPIA E PROCEDIMENTOS':
        return <FileSearch className="w-6 h-6 text-purple-600" />;
      case 'EXÉRESE DE VERRUGA GENITAL':
        return <Scissors className="w-6 h-6 text-amber-600" />;
      case 'CONSULTA GINECOLÓGICA':
        return <UserCheck className="w-6 h-6 text-blue-600" />;
      case 'INSERÇÃO DE DIU':
      case 'INSERÇÃO E REVISÃO DE DIU':
        return <Sparkles className="w-6 h-6 text-teal-600" />;
      case 'REVISÃO DE DIU':
        return <RefreshCw className="w-6 h-6 text-cyan-600" />;
      case 'ULTRASSOM OBSTÉTRICO':
      case 'ULTRASSOM OBSTÉTRICO - FAP':
        return <Activity className="w-6 h-6 text-emerald-600" />;
      case 'Implante contraceptivo subdérmico':
      case 'IMPLANTE CONTRACEPTIVO SUBDÉRMICO':
      case 'INSERÇÃO DE IMPLANON':
        return <Syringe className="w-6 h-6 text-indigo-600" />;
      default:
        return <FilePlus className="w-6 h-6 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Banner / Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-3 py-1 text-xs text-teal-300 font-semibold tracking-wide">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Prefeitura Municipal de Araripina &bull; Secretaria de Saúde</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Fichas de Regulação por Especialidade
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Selecione a ficha abaixo referente à especialidade ou procedimento solicitado para abrir o formulário oficial de regulação do CRSMA.
          </p>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Specialty Forms Icons Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-teal-600" />
              <span>Fichas de Solicitação / Regulação CRSMA</span>
            </h2>
            <p className="text-xs text-slate-500">
              Clique no ícone da especialidade desejada para preencher a solicitação
            </p>
          </div>

          <span className="text-xs text-slate-600 bg-slate-100 font-semibold px-2.5 py-1 rounded-full border border-slate-200">
            {ESPECIALIDADES.length} Especialidades Ativas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ESPECIALIDADES.map((esp) => {
            const info = ESPECIALIDADES_DESCRICAO[esp];
            return (
              <div
                key={esp}
                onClick={() => onSelectSpecialty(esp)}
                className={`group relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                  info?.cor || 'bg-white'
                } ${info?.bordaCor || 'border-slate-200'}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getSpecialtyIcon(esp)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
                      {info?.tag || 'CRSMA'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-900 transition-colors">
                      {esp}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                      {info?.descricao}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-800">
                  <span>Preencher Ficha</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Cards & System Summary */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Módulos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Planilha Geral Card */}
          <div
            onClick={() => onNavigateToTab('spreadsheet')}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {totalCount} Registros
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-800 transition-colors">
                Lista de Pacientes Regulados
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Consulte todas as solicitações registradas no sistema em formato de tabela completa.
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-teal-700 pt-1">
              <span>Acessar Planilha</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Fila de Regulação Card */}
          <div
            onClick={() => onNavigateToTab('queue')}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {pendingCount} Pendentes
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-800 transition-colors">
                Fila de Regulação CRSMA
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Análise, triagem e agendamento de vagas prioritárias pelos reguladores do CRSMA.
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-teal-700 pt-1">
              <span>Ver Fila de Espera</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Busca Ativa Card */}
          <div
            onClick={() => onNavigateToTab('buscaAtiva')}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                <Search className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                Aviso ACS
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-800 transition-colors">
                Busca Ativa eSF & Notificações
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Painel para os Agentes Comunitários de Saúde (ACS) avisarem as pacientes agendadas.
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-teal-700 pt-1">
              <span>Abrir Busca Ativa</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
