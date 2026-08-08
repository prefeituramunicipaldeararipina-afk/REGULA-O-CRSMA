import React, { useState } from 'react';
import { Agendamento, EspecialidadeCRSMA, PerfilUsuario, Usuario } from '../types';
import {
  ESPECIALIDADES,
  ESPECIALIDADES_DESCRICAO,
  ESF_GRUPOS,
  TODAS_ESFS,
  CLASSIFICACAO_RISCO_MAP,
  DISTRITOS_SANITARIOS,
} from '../data/constants';
import { Search, Download, FileSpreadsheet, Plus, Filter, User, Calendar, Phone, CheckCircle, Clock, AlertCircle, Eye, Edit, Printer, ShieldAlert, UserPlus, RotateCcw } from 'lucide-react';
import { downloadCSV, generateCRSMACSV } from '../utils/spreadsheetExport';

interface SpreadsheetViewProps {
  agendamentos: Agendamento[];
  onOpenNewAppointmentWithEsfAndSpecialty?: (esf: string, especialidade: EspecialidadeCRSMA) => void;
  onOpenAppointmentDetail: (agendamento: Agendamento) => void;
  perfilUsuario?: PerfilUsuario;
  currentUser?: Usuario | null;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  agendamentos,
  onOpenNewAppointmentWithEsfAndSpecialty,
  onOpenAppointmentDetail,
  perfilUsuario,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('TODOS');
  const [selectedEsfFilter, setSelectedEsfFilter] = useState<string>('TODAS');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('TODAS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('TODOS');
  const [sortBy, setSortBy] = useState<'dataSolicitacaoDesc' | 'dataSolicitacaoAsc' | 'prioridade' | 'pacienteNome'>('dataSolicitacaoDesc');

  const handleDistrictFilterChange = (district: string) => {
    setSelectedDistrictFilter(district);
    if (district !== 'TODOS') {
      const distObj = DISTRITOS_SANITARIOS.find((d) => d.nome === district);
      if (distObj && selectedEsfFilter !== 'TODAS' && !distObj.unidades.includes(selectedEsfFilter)) {
        setSelectedEsfFilter('TODAS');
      }
    }
  };

  // Filtered Agendamentos (Solicitante sees ONLY their own unit's patients)
  const isSolicitante = perfilUsuario === 'SOLICITANTE';
  const userUnit = currentUser?.unidadeOuOrgao;

  const filteredAgendamentos = agendamentos.filter((a) => {
    // Solicitante Unit Protection
    if (isSolicitante && userUnit && a.esfOrigem !== userUnit) {
      return false;
    }

    const matchesSearch =
      a.pacienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cpf.includes(searchTerm) ||
      a.cartaoSus.includes(searchTerm) ||
      a.esfOrigem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.medicoCRSMA && a.medicoCRSMA.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDistrict =
      selectedDistrictFilter === 'TODOS' ||
      DISTRITOS_SANITARIOS.find((d) => d.nome === selectedDistrictFilter)?.unidades.includes(a.esfOrigem);

    const matchesEsf = selectedEsfFilter === 'TODAS' || a.esfOrigem === selectedEsfFilter;
    const matchesSpecialty = selectedSpecialtyFilter === 'TODAS' || a.especialidade === selectedSpecialtyFilter;
    const matchesStatus = selectedStatusFilter === 'TODOS' || a.status === selectedStatusFilter;

    return matchesSearch && matchesDistrict && matchesEsf && matchesSpecialty && matchesStatus;
  });

  const parseDateStr = (dateStr?: string): number => {
    if (!dateStr) return 0;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
      }
    }
    const ts = new Date(dateStr).getTime();
    return isNaN(ts) ? 0 : ts;
  };

  const sortedAgendamentos = [...filteredAgendamentos].sort((a, b) => {
    if (sortBy === 'dataSolicitacaoDesc') {
      return parseDateStr(b.dataSolicitacao) - parseDateStr(a.dataSolicitacao);
    }
    if (sortBy === 'dataSolicitacaoAsc') {
      return parseDateStr(a.dataSolicitacao) - parseDateStr(b.dataSolicitacao);
    }
    if (sortBy === 'prioridade') {
      const pA = CLASSIFICACAO_RISCO_MAP[a.classificacaoRisco || 'VERDE']?.prioridade ?? 2;
      const pB = CLASSIFICACAO_RISCO_MAP[b.classificacaoRisco || 'VERDE']?.prioridade ?? 2;
      if (pA !== pB) return pA - pB;
      return parseDateStr(b.dataSolicitacao) - parseDateStr(a.dataSolicitacao);
    }
    if (sortBy === 'pacienteNome') {
      return a.pacienteNome.localeCompare(b.pacienteNome);
    }
    return parseDateStr(b.dataSolicitacao) - parseDateStr(a.dataSolicitacao);
  });

  const handleExportCSV = () => {
    const csvContent = generateCRSMACSV(filteredAgendamentos);
    downloadCSV(`CRSMA_Regulacao_Araripina_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Agendado':
        return (
          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 inline-flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> AGENDADO
          </span>
        );
      case 'Confirmado':
        return (
          <span className="bg-teal-100 text-teal-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-300 inline-flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-teal-600" /> CONFIRMADO
          </span>
        );
      case 'Pendente':
        return (
          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> FILA DE ESPERA
          </span>
        );
      case 'Realizado':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">REALIZADO</span>;
      case 'Falta':
        return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">FALTA / ABSENTEÍSMO</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">{status}</span>;
    }
  };

  const esfsInDistrict =
    selectedDistrictFilter === 'TODOS'
      ? TODAS_ESFS
      : DISTRITOS_SANITARIOS.find((d) => d.nome === selectedDistrictFilter)?.unidades || TODAS_ESFS;

  const visibleEsfs = selectedEsfFilter === 'TODAS' ? esfsInDistrict : [selectedEsfFilter];
  const visibleSpecialties = selectedSpecialtyFilter === 'TODAS' ? ESPECIALIDADES : [selectedSpecialtyFilter as EspecialidadeCRSMA];

  return (
    <div className="space-y-4">
      {/* Solicitante View Notice Banner */}
      {isSolicitante && (
        <div className="p-4 bg-blue-50/90 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-start gap-3 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-blue-950 text-sm block">Acesso Restrito ao Perfil Solicitante</span>
            <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
              Você está visualizando exclusivamente as fichas reguladas da sua unidade de origem (<strong>{userUnit || 'Sua Unidade eSF'}</strong>). O acesso à lista completa unificada de todas as unidades municipais e distritos sanitários é exclusivo dos perfis <strong>Regulador (CRSMA)</strong> e <strong>Administrador</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        {/* Row 1: Filter Dropdowns (Distrito, eSF, Especialidade, Status) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Distrito Sanitário */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={selectedDistrictFilter}
              onChange={(e) => handleDistrictFilterChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 font-bold"
            >
              <option value="TODOS">Todos os Distritos</option>
              {DISTRITOS_SANITARIOS.map((d) => (
                <option key={d.nome} value={d.nome}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by eSF */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedEsfFilter}
              onChange={(e) => setSelectedEsfFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="TODAS">
                {selectedDistrictFilter === 'TODOS'
                  ? 'Todas as Unidades (32 eSF + Secretaria de Saúde)'
                  : `Todas do ${selectedDistrictFilter}`}
              </option>
              {selectedDistrictFilter === 'TODOS' ? (
                <>
                  {DISTRITOS_SANITARIOS.map((d) => (
                    <optgroup key={d.nome} label={d.nome}>
                      {d.unidades.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <optgroup label="SOLICITANTE CENTRAL">
                    <option value="Secretaria Municipal de Saúde">Secretaria Municipal de Saúde</option>
                  </optgroup>
                </>
              ) : (
                esfsInDistrict.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Filter by Specialty */}
          <select
            value={selectedSpecialtyFilter}
            onChange={(e) => setSelectedSpecialtyFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 font-medium"
          >
            <option value="TODAS">Todas Especialidades</option>
            {ESPECIALIDADES.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 font-medium"
          >
            <option value="TODOS">Todos Status</option>
            <option value="Agendado">Agendado</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Pendente">Pendente</option>
            <option value="Realizado">Realizado</option>
            <option value="Falta">Falta / Absenteísmo</option>
          </select>
        </div>

        {/* Row 2: Sort By Selector & Export CSV */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-teal-50/80 border border-teal-200 text-teal-900 font-bold rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500"
            >
              <option value="dataSolicitacaoDesc">📅 Solicitação: Mais Recentes Primeiro</option>
              <option value="dataSolicitacaoAsc">📅 Solicitação: Mais Antigas Primeiro (Ordem de Chegada)</option>
              <option value="prioridade">🚨 Prioridade de Risco</option>
              <option value="pacienteNome">👤 Nome do Paciente (A-Z)</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all shadow-2xs"
            title="Baixar em formato CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Row 3: Digitar Nome (Search Input) */}
        <div className="pt-2 border-t border-slate-100 space-y-1">
          <label className="block text-[11px] font-bold text-slate-700">
            Digitar Nome do Paciente, CPF ou Cartão SUS:
          </label>
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digitar nome do paciente, CPF, Cartão SUS ou eSF para filtrar..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>
        </div>
      </div>

      {/* LIST VIEW: LISTA DE PACIENTES REGULADOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>Lista de Pacientes Regulados</span>
            <span className="text-[11px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
              {filteredAgendamentos.length} registros
            </span>
          </h3>
        </div>

        <div className="divide-y divide-slate-200">
          {sortedAgendamentos.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhum agendamento encontrado com os filtros selecionados.
            </div>
          ) : (
            sortedAgendamentos.map((a) => (
              <div
                key={a.id}
                onClick={() => onOpenAppointmentDetail(a)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{a.pacienteNome}</span>
                    {(() => {
                      const riskMeta = CLASSIFICACAO_RISCO_MAP[a.classificacaoRisco || 'VERDE'];
                      return (
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded ${riskMeta.corBadge}`}
                          title={`Prioridade ${riskMeta.prioridade}: ${riskMeta.classificacao}`}
                        >
                          {riskMeta.emoji} P{riskMeta.prioridade}
                        </span>
                      );
                    })()}
                    {getStatusBadge(a.status)}
                    {a.tipoConsulta === 'retorno' ? (
                      <span className="text-[10px] font-bold text-purple-900 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 text-purple-600" /> RETORNO
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-teal-900 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <UserPlus className="w-3 h-3 text-teal-600" /> 1ª CONSULTA
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 border border-slate-200">
                      {a.esfOrigem}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>CPF: <strong>{a.cpf}</strong></span>
                    <span>Cartão SUS: <strong>{a.cartaoSus}</strong></span>
                    <span>Tel: <strong>{a.telefone}</strong></span>
                    <span>ACS: <strong>{a.acsResponsavel || 'Não informado'}</strong></span>
                  </div>

                  <div className="text-xs text-rose-700 font-bold">
                    Especialidade: {a.especialidade}
                  </div>

                  {a.observacoesClinicas && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100 mt-1 max-w-2xl">
                      "{a.observacoesClinicas}"
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <div className="text-xs font-semibold text-slate-700">
                    {a.dataAgendada ? (
                      <div className="text-emerald-800 font-bold flex items-center justify-end gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Agendado: {a.dataAgendada} {a.turnoHorario ? `(${a.turnoHorario})` : ''}</span>
                      </div>
                    ) : (
                      <div className="text-amber-900 font-bold flex items-center justify-end gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Fila de Espera (Aguardando Data)</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">Solicitado em: {a.dataSolicitacao}</div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAppointmentDetail(a);
                        setTimeout(() => window.print(), 300);
                      }}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
                      title="Imprimir Ficha do Paciente"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Imprimir Ficha</span>
                    </button>
                    <button
                      onClick={() => onOpenAppointmentDetail(a)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Prontuário</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
