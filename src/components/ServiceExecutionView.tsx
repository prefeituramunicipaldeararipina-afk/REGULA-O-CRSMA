import React, { useState } from 'react';
import { Agendamento, EspecialidadeCRSMA, PerfilUsuario, Usuario } from '../types';
import {
  ESPECIALIDADES,
  ESPECIALIDADES_DESCRICAO,
  DISTRITOS_SANITARIOS,
  CLASSIFICACAO_RISCO_MAP,
} from '../data/constants';
import {
  CheckSquare,
  UserCheck,
  UserX,
  Calendar,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeftRight,
  ShieldCheck,
  Building2,
  FileText,
  PlusCircle,
  X,
  Award,
  UserPlus,
} from 'lucide-react';

interface ServiceExecutionViewProps {
  agendamentos: Agendamento[];
  onUpdateAgendamento: (agendamento: Agendamento) => void;
  onOpenAppointmentDetail: (agendamento: Agendamento) => void;
  onReturnToQueueNewRequest: (patientData: Partial<Agendamento>) => void;
  perfilUsuario?: PerfilUsuario;
  currentUser?: Usuario | null;
}

// Procedimentos SIGTAP associados a cada especialidade do CRSMA
const SIGTAP_MAP: Partial<Record<EspecialidadeCRSMA, { codigo: string; descricao: string; cbo: string }>> = {
  'PRÉ-NATAL DE ALTO RISCO': {
    codigo: '03.01.01.004-8',
    descricao: 'CONSULTA MEDICA EM ATENCAO ESPECIALIZADA EM GINECOLOGIA/OBSTETRICIA (PRE-NATAL ALTO RISCO)',
    cbo: '225130 - Médico Ginecologista e Obstetra',
  },
  'CONSULTA GINECOLÓGICA': {
    codigo: '03.01.01.007-2',
    descricao: 'CONSULTA MEDICA EM ATENCAO ESPECIALIZADA EM GINECOLOGIA GERAL',
    cbo: '225130 - Médico Ginecologista e Obstetra',
  },
  'COLPOSCOPIA': {
    codigo: '02.01.01.001-0',
    descricao: 'COLPOSCOPIA DE COLO UTERINO / VULVA',
    cbo: '225130 - Médico Ginecologista e Obstetra',
  },
  'COLPOSCOPIA E PROCEDIMENTOS': {
    codigo: '02.01.01.001-0',
    descricao: 'COLPOSCOPIA DE COLO UTERINO / VULVA',
    cbo: '225130 - Médico Ginecologista e Obstetra',
  },
  'INSERÇÃO DE DIU': {
    codigo: '03.01.04.008-7',
    descricao: 'INSERCAO DE DISPOSITIVO INTRA-UTERINO (DIU)',
    cbo: '225130 / 223505 - Médico / Enfermeiro Obstetra',
  },
  'REVISÃO DE DIU': {
    codigo: '03.01.04.008-7',
    descricao: 'ACOMPANHAMENTO E REVISÃO DE DISPOSITIVO INTRA-UTERINO (DIU)',
    cbo: '225130 / 223505 - Médico / Enfermeiro Obstetra',
  },
  'INSERÇÃO E REVISÃO DE DIU': {
    codigo: '03.01.04.008-7',
    descricao: 'INSERCAO E REVISAO DE DISPOSITIVO INTRA-UTERINO (DIU)',
    cbo: '225130 / 223505 - Médico / Enfermeiro Obstetra',
  },
  'INSERÇÃO DE IMPLANON': {
    codigo: '03.01.04.008-7',
    descricao: 'INSERCAO DE IMPLANTE SUBDERMICO (IMPLANON)',
    cbo: '225130 / 223505 - Médico / Enfermeiro Obstetra',
  },
  'IMPLANTE CONTRACEPTIVO SUBDÉRMICO': {
    codigo: '03.01.04.008-7',
    descricao: 'INSERCAO DE IMPLANTE CONTRACEPTIVO SUBDERMICO',
    cbo: '225130 / 223505 - Médico / Enfermeiro Obstetra',
  },
  'ULTRASSOM OBSTÉTRICO': {
    codigo: '02.05.02.009-7',
    descricao: 'ULTRASSONOGRAFIA OBSTETRICA',
    cbo: '225120 - Médico Ultrassonografista / Obstetra',
  },
  'ULTRASSOM OBSTÉTRICO - FAP': {
    codigo: '02.05.02.009-7',
    descricao: 'ULTRASSONOGRAFIA OBSTETRICA COM DOPPLER / FAP',
    cbo: '225120 - Médico Ultrassonografista / Obstetra',
  },
};

export const ServiceExecutionView: React.FC<ServiceExecutionViewProps> = ({
  agendamentos,
  onUpdateAgendamento,
  onOpenAppointmentDetail,
  onReturnToQueueNewRequest,
  perfilUsuario,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('TODAS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('TODOS');
  
  // Date period for filtering (default current month)
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);

  // Reschedule Modal
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Agendamento | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTurno, setNewTurno] = useState('Manhã - 08:00');

  // BPA Report Modal State
  const [isBpaModalOpen, setIsBpaModalOpen] = useState(false);
  const [bpaSpecialty, setBpaSpecialty] = useState<EspecialidadeCRSMA>('PRÉ-NATAL DE ALTO RISCO');

  // Filter agendamentos for execution table
  const filteredAgendamentos = agendamentos.filter((a) => {
    const matchesSearch =
      a.pacienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cpf.includes(searchTerm) ||
      a.cartaoSus.includes(searchTerm) ||
      a.esfOrigem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.medicoCRSMA && a.medicoCRSMA.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialty = selectedSpecialty === 'TODAS' || a.especialidade === selectedSpecialty;
    const matchesStatus = selectedStatusFilter === 'TODOS' || a.status === selectedStatusFilter;

    // Filter by date range if dataAgendada is available
    let matchesDate = true;
    if (a.dataAgendada && (startDate || endDate)) {
      const scheduledDate = a.dataAgendada;
      if (startDate && scheduledDate < startDate) matchesDate = false;
      if (endDate && scheduledDate > endDate) matchesDate = false;
    }

    return matchesSearch && matchesSpecialty && matchesStatus && matchesDate;
  });

  // Action handlers
  const handleMarkAttendance = (agendamento: Agendamento, newStatus: 'Realizado' | 'Falta') => {
    const updated: Agendamento = {
      ...agendamento,
      status: newStatus,
      atualizadoEm: new Date().toISOString(),
    };
    onUpdateAgendamento(updated);
  };

  const handleOpenRescheduleModal = (agendamento: Agendamento) => {
    setRescheduleAppointment(agendamento);
    setNewDate(agendamento.dataAgendada || today.toISOString().slice(0, 10));
    setNewTurno(agendamento.turnoHorario || 'Manhã - 08:00');
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleAppointment) return;
    const updated: Agendamento = {
      ...rescheduleAppointment,
      dataAgendada: newDate,
      turnoHorario: newTurno,
      status: 'Agendado',
      atualizadoEm: new Date().toISOString(),
    };
    onUpdateAgendamento(updated);
    setRescheduleAppointment(null);
  };

  // Patients marked as 'Realizado' (Presente) in the selected period for BPA
  const bpaAttendedPatients = agendamentos.filter((a) => {
    if (a.status !== 'Realizado') return false;
    if (bpaSpecialty !== 'TODAS' && a.especialidade !== bpaSpecialty) return false;
    if (a.dataAgendada) {
      if (startDate && a.dataAgendada < startDate) return false;
      if (endDate && a.dataAgendada > endDate) return false;
    }
    return true;
  });

  const handlePrintBpa = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-teal-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider mb-1">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Mesa do Regulador & Atendimento Ambulatorial</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Execução do Serviço & Faturamento (BPA)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Marque presença (<strong className="text-emerald-300">Presente</strong>), absenteísmo (<strong className="text-red-300">Faltou</strong>) ou <strong className="text-amber-300">Remarcação</strong> de consultas. Reencaminhe pacientes para a Fila de Regulação e gere o Boletim de Procedimento Ambulatorial (BPA/SUS) para faturamento.
            </p>
          </div>

          <button
            onClick={() => setIsBpaModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/40 hover:scale-[1.02] transition-all cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Gerar BPA de Faturamento (PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por Paciente, CPF, Cartão SUS, eSF ou Médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Specialty */}
          <div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
            >
              <option value="TODAS">Todas as Especialidades</option>
              {ESPECIALIDADES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="Agendado">Agendado</option>
              <option value="Realizado">Presente (Realizado)</option>
              <option value="Falta">Faltou (Absenteísmo)</option>
              <option value="Pendente">Pendente / Fila</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Period Range */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-1/2 px-2 py-2 text-[11px] bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
            <span className="text-slate-400 font-bold text-xs">a</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-1/2 px-2 py-2 text-[11px] bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-slate-700">Resumo da Execução no Período:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
              Total: {filteredAgendamentos.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              Presentes: {filteredAgendamentos.filter((a) => a.status === 'Realizado').length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[11px] flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-600" />
              Faltas: {filteredAgendamentos.filter((a) => a.status === 'Falta').length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              Agendados: {filteredAgendamentos.filter((a) => a.status === 'Agendado').length}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Período: <strong className="text-slate-800">{startDate}</strong> até <strong className="text-slate-800">{endDate}</strong>
          </div>
        </div>
      </div>

      {/* Main Execution Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-400" />
            <h3 className="font-extrabold text-sm text-white">Lista de Pacientes & Registros de Atendimento</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Mostrando {filteredAgendamentos.length} registros
          </span>
        </div>

        {filteredAgendamentos.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">Nenhum atendimento encontrado para os filtros selecionados.</p>
            <p className="text-xs text-slate-400">Tente ajustar a busca, a especialidade ou o período de datas acima.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-3">Paciente & Documentos</th>
                  <th className="p-3">Especialidade / Ficha</th>
                  <th className="p-3">Unidade / eSF</th>
                  <th className="p-3">Data Agendada & Turno</th>
                  <th className="p-3">Médico Atendente</th>
                  <th className="p-3 text-center">Status / Presença</th>
                  <th className="p-3 text-center">Ações de Atendimento & Fila</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAgendamentos.map((item) => {
                  const isPresente = item.status === 'Realizado';
                  const isFalta = item.status === 'Falta';
                  const isAgendado = item.status === 'Agendado';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Patient Name & Docs */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{item.pacienteNome}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          CPF: {item.cpf} | SUS: {item.cartaoSus}
                        </div>
                        <button
                          onClick={() => onOpenAppointmentDetail(item)}
                          className="text-[10px] text-teal-600 font-bold hover:underline mt-1 block"
                        >
                          Ver Prontuário Completo ({item.id})
                        </button>
                      </td>

                      {/* Specialty */}
                      <td className="p-3">
                        <span className="font-extrabold text-slate-800 text-[11px] block">{item.especialidade}</span>
                        <div className="mt-0.5">
                          {item.tipoConsulta === 'retorno' ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-900 bg-purple-100 border border-purple-300 px-1.5 py-0.2 rounded-full">
                              <RotateCcw className="w-2.5 h-2.5 text-purple-600" /> RETORNO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-teal-900 bg-teal-100 border border-teal-300 px-1.5 py-0.2 rounded-full">
                              <UserPlus className="w-2.5 h-2.5 text-teal-600" /> 1ª CONSULTA
                            </span>
                          )}
                        </div>
                      </td>

                      {/* eSF */}
                      <td className="p-3">
                        <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {item.esfOrigem}
                        </span>
                        {item.acsResponsavel && (
                          <span className="text-[10px] text-slate-500 block">ACS: {item.acsResponsavel}</span>
                        )}
                      </td>

                      {/* Schedule Date & Turn */}
                      <td className="p-3">
                        {item.dataAgendada ? (
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-teal-600" />
                            {item.dataAgendada.split('-').reverse().join('/')}
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Aguardando Data
                          </span>
                        )}
                        {item.turnoHorario && (
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">{item.turnoHorario}</div>
                        )}
                      </td>

                      {/* Doctor */}
                      <td className="p-3">
                        <span className="font-bold text-slate-800 text-xs block">
                          {item.medicoCRSMA || 'Não Atribuído'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3 text-center">
                        {isPresente && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            PRESENTE (Atendido)
                          </span>
                        )}
                        {isFalta && (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-extrabold text-[10px] border border-red-300 inline-flex items-center gap-1 shadow-2xs">
                            <XCircle className="w-3 h-3 text-red-600" />
                            FALTOU (Absenteísmo)
                          </span>
                        )}
                        {isAgendado && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] border border-blue-300 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            AGENDADO
                          </span>
                        )}
                        {!isPresente && !isFalta && !isAgendado && (
                          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
                            {item.status}
                          </span>
                        )}
                      </td>

                      {/* Action Controls */}
                      <td className="p-3 text-center">
                        <div className="flex flex-col gap-1.5 items-center justify-center">
                          {/* Option 1: Mark Presente / Faltou / Remarcação */}
                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                              onClick={() => handleMarkAttendance(item, 'Realizado')}
                              title="Marcar paciente como Presente / Atendido"
                              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                                isPresente
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                              }`}
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Presente</span>
                            </button>

                            <button
                              onClick={() => handleMarkAttendance(item, 'Falta')}
                              title="Marcar como Faltou (Absenteísmo)"
                              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                                isFalta
                                  ? 'bg-red-600 text-white shadow-2xs'
                                  : 'bg-white text-slate-700 hover:bg-red-50 hover:text-red-700 border border-slate-200'
                              }`}
                            >
                              <UserX className="w-3 h-3" />
                              <span>Faltou</span>
                            </button>

                            <button
                              onClick={() => handleOpenRescheduleModal(item)}
                              title="Remarcar consulta para outra data/turno"
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-600" />
                              <span>Remarcar</span>
                            </button>
                          </div>

                          {/* Option 2: Voltar paciente para a Fila de Regulação */}
                          <button
                            onClick={() => onReturnToQueueNewRequest(item)}
                            className="text-[10px] font-extrabold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Abre a ficha de nova solicitação preenchida com todos os dados da paciente para voltar para a Fila de Regulação"
                          >
                            <ArrowLeftRight className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>Voltar Paciente para Fila de Regulação</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Remarcação Quick Modal */}
      {rescheduleAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-slate-900">Remarcar Atendimento</h3>
              </div>
              <button
                onClick={() => setRescheduleAppointment(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Defina a nova data e turno de agendamento para a paciente{' '}
              <strong className="text-slate-900">{rescheduleAppointment.pacienteNome}</strong>:
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nova Data Agendada</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Turno e Horário</label>
                <select
                  value={newTurno}
                  onChange={(e) => setNewTurno(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="Manhã - 08:00">Manhã - 08:00</option>
                  <option value="Manhã - 09:30">Manhã - 09:30</option>
                  <option value="Tarde - 13:30">Tarde - 13:30</option>
                  <option value="Tarde - 15:00">Tarde - 15:00</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setRescheduleAppointment(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-4 py-2 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirmar Remarcação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BPA Boletim de Procedimento Ambulatorial Modal / Print PDF */}
      {isBpaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-8 print:shadow-none print:border-none print:m-0 print:p-0 print:w-full">
            {/* Modal Controls Bar (Hidden during printing) */}
            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Boletim de Procedimento Ambulatorial (BPA - SIA/SUS)</h3>
                  <p className="text-[11px] text-slate-400">Padrão Oficial de Faturamento por Especialidade (Apenas Presentes)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Select Specialty for BPA */}
                <select
                  value={bpaSpecialty}
                  onChange={(e) => setBpaSpecialty(e.target.value as EspecialidadeCRSMA)}
                  className="px-3 py-1.5 text-xs bg-slate-800 text-white border border-slate-700 rounded-lg font-medium"
                >
                  {ESPECIALIDADES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handlePrintBpa}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Gerar PDF</span>
                </button>

                <button
                  onClick={() => setIsBpaModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE BPA REPORT CONTENT */}
            <div className="p-8 space-y-6 bg-white text-slate-900 font-sans print:p-4 print:text-black">
              {/* Header SUS / Prefeitura */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-700 text-white font-black flex items-center justify-center text-xl border border-teal-800">
                    SUS
                  </div>
                  <div>
                    <h2 className="font-black text-sm uppercase tracking-wide text-slate-900">
                      PREFEITURA MUNICIPAL DE ARARIPINA - PE
                    </h2>
                    <p className="text-xs font-extrabold text-slate-700">SECRETARIA MUNICIPAL DE SAÚDE</p>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      CENTRO DE REFERÊNCIA EM SAÚDE DA MULHER DE ARARIPINA (CRSMA)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">DOCUMENTO DE FATURAMENTO</span>
                  <h3 className="text-base font-black text-slate-900">BPA - INDIVIDUALIZADO</h3>
                  <span className="text-xs font-mono font-bold text-teal-800">CÓDIGO UNIDADE CNES: 2345678</span>
                </div>
              </div>

              {/* BPA Technical Header Box */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-300 text-xs font-semibold print:bg-white print:border-slate-800">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 block uppercase">PERÍODO DE APURAÇÃO</span>
                  <span className="font-bold text-slate-900">
                    {startDate.split('-').reverse().join('/')} a {endDate.split('-').reverse().join('/')}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 block uppercase">ESPECIALIDADE</span>
                  <span className="font-extrabold text-teal-900">{bpaSpecialty}</span>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 block uppercase">CÓDIGO SIGTAP / PROCEDIMENTO</span>
                  <span className="font-mono text-slate-900">{SIGTAP_MAP[bpaSpecialty]?.codigo || '03.01.01.007-2'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 block uppercase">CBO DO PROFISSIONAL</span>
                  <span className="text-[10px] text-slate-800 font-bold">{SIGTAP_MAP[bpaSpecialty]?.cbo || '225130'}</span>
                </div>
              </div>

              <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-bold flex items-center justify-between print:border-slate-800">
                <span>DESCRIÇÃO DO PROCEDIMENTO: {SIGTAP_MAP[bpaSpecialty]?.descricao}</span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-700 text-white font-black">
                  TOTAL ATENDIDOS (PRESENTES): {bpaAttendedPatients.length}
                </span>
              </div>

              {/* Patient BPA Table */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                  RELAÇÃO DE PACIENTES ATENDIDOS E COM PRESENÇA CONFIRMADA NO PERÍODO
                </h4>

                {bpaAttendedPatients.length === 0 ? (
                  <div className="p-6 border border-slate-300 rounded-xl text-center text-xs text-slate-500">
                    Nenhuma paciente com presença confirmada (&quot;Presente / Realizado&quot;) para a especialidade{' '}
                    <strong>{bpaSpecialty}</strong> no período selecionado.
                  </div>
                ) : (
                  <table className="w-full text-left text-[11px] border-collapse border border-slate-400">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 font-extrabold uppercase text-[9px] border-b border-slate-400 print:bg-slate-300">
                        <th className="p-2 border-r border-slate-400 text-center w-8">Nº</th>
                        <th className="p-2 border-r border-slate-400">NOME COMPLETO DA PACIENTE</th>
                        <th className="p-2 border-r border-slate-400">CARTÃO SUS</th>
                        <th className="p-2 border-r border-slate-400">CPF</th>
                        <th className="p-2 border-r border-slate-400">UNIDADE DE ORIGEM (eSF)</th>
                        <th className="p-2 border-r border-slate-400 text-center">DATA ATEND.</th>
                        <th className="p-2 text-center">MÉDICO / ATENDENTE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {bpaAttendedPatients.map((patient, idx) => (
                        <tr key={patient.id} className="border-b border-slate-300">
                          <td className="p-2 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-300 font-bold uppercase">{patient.pacienteNome}</td>
                          <td className="p-2 border-r border-slate-300 font-mono text-[10px]">{patient.cartaoSus}</td>
                          <td className="p-2 border-r border-slate-300 font-mono text-[10px]">{patient.cpf}</td>
                          <td className="p-2 border-r border-slate-300">{patient.esfOrigem}</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">
                            {patient.dataAgendada ? patient.dataAgendada.split('-').reverse().join('/') : '-'}
                          </td>
                          <td className="p-2 text-center font-semibold text-[10px]">
                            {patient.medicoCRSMA || 'Dr. Médico Atendente'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Signatures Footer for Faturamento */}
              <div className="pt-8 border-t border-slate-400 grid grid-cols-2 gap-8 text-center text-xs mt-12 print:pt-12">
                <div>
                  <div className="border-b border-slate-900 w-3/4 mx-auto mb-1"></div>
                  <p className="font-extrabold text-slate-900">RESPONSÁVEL PELO FATURAMENTO DO SIA/SUS</p>
                  <p className="text-[10px] text-slate-600">CRSMA Araripina - PE</p>
                </div>

                <div>
                  <div className="border-b border-slate-900 w-3/4 mx-auto mb-1"></div>
                  <p className="font-extrabold text-slate-900">COORDENAÇÃO DA REGULAÇÃO & CRSMA</p>
                  <p className="text-[10px] text-slate-600">Secretaria Municipal de Saúde de Araripina</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
