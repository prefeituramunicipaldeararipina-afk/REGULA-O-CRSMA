import React from 'react';
import { Agendamento } from '../types';
import { ESPECIALIDADES, TODAS_ESFS } from '../data/constants';
import { BarChart3, Users, CalendarCheck, Clock, CheckCircle2, AlertCircle, FileSpreadsheet, Building2, UserX } from 'lucide-react';

interface DashboardViewProps {
  agendamentos: Agendamento[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ agendamentos }) => {
  const totalAgendamentos = agendamentos.length;
  const pendentesCount = agendamentos.filter((a) => a.status === 'Pendente').length;
  const agendadosCount = agendamentos.filter((a) => a.status === 'Agendado' || a.status === 'Confirmado').length;
  const realizadosCount = agendamentos.filter((a) => a.status === 'Realizado').length;
  const faltasCount = agendamentos.filter((a) => a.status === 'Falta').length;
  const buscaAtivaCount = agendamentos.filter((a) => a.buscaAtivaRealizada).length;

  // Group by specialty
  const porEspecialidade = ESPECIALIDADES.map((esp) => {
    const items = agendamentos.filter((a) => a.especialidade === esp);
    return {
      nome: esp,
      total: items.length,
      pendentes: items.filter((a) => a.status === 'Pendente').length,
      agendados: items.filter((a) => a.status === 'Agendado' || a.status === 'Confirmado').length,
    };
  });

  // Top eSFs sending requests
  const esfCounts: { [key: string]: number } = {};
  agendamentos.forEach((a) => {
    esfCounts[a.esfOrigem] = (esfCounts[a.esfOrigem] || 0) + 1;
  });

  const sortedEsfs = Object.entries(esfCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-5">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total de Pacientes</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalAgendamentos}</div>
            <span className="text-[11px] text-slate-500 font-medium">32 eSFs Reguladas</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-6 h-6 text-slate-700" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Fila de Regulação</span>
            <div className="text-2xl font-extrabold text-amber-900 mt-1">{pendentesCount}</div>
            <span className="text-[11px] text-amber-700 font-medium">Aguardando definição de data</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Consultas Agendadas</span>
            <div className="text-2xl font-extrabold text-emerald-900 mt-1">{agendadosCount}</div>
            <span className="text-[11px] text-emerald-700 font-medium">{buscaAtivaCount} com Busca Ativa OK</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Absenteísmo (Faltas)</span>
            <div className="text-2xl font-extrabold text-rose-900 mt-1">{faltasCount}</div>
            <span className="text-[11px] text-rose-700 font-medium">Monitorado via busca ativa</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Specialty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <BarChart3 className="w-4 h-4 text-teal-600" />
            <span>Demanda por Especialidade CRSMA</span>
          </h3>

          <div className="space-y-3">
            {porEspecialidade.map((esp) => {
              const percentage = totalAgendamentos > 0 ? Math.round((esp.total / totalAgendamentos) * 100) : 0;

              return (
                <div key={esp.nome} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>{esp.nome}</span>
                    <span className="font-extrabold text-slate-900">{esp.total} paciente(s) ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Agendados: {esp.agendados}</span>
                    <span>Pendentes: {esp.pendentes}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top eSF Origin Units */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Maiores Demandantes (Unidades eSF / UBS)</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {sortedEsfs.map(([esf, count], idx) => (
              <div key={esf} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-[11px]">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{esf}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-teal-50 text-teal-800 font-extrabold border border-teal-200 text-[11px]">
                  {count} Solicitações
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
