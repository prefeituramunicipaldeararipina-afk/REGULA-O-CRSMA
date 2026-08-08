import React, { useState } from 'react';
import { Agendamento, PerfilUsuario, ClassificacaoRisco } from '../types';
import { MEDICOS_CRSMA, CLASSIFICACAO_RISCO_MAP, CLASSIFICACAO_RISCO_LIST } from '../data/constants';
import { Clock, Calendar, CheckCircle, AlertCircle, User, FileText, ChevronRight, Filter, Lock, ShieldAlert, AlertTriangle, Printer, UserPlus, RotateCcw } from 'lucide-react';

interface RegulationQueueViewProps {
  agendamentos: Agendamento[];
  onUpdateAgendamento: (updated: Agendamento) => void;
  onOpenAppointmentDetail: (agendamento: Agendamento) => void;
  perfilUsuario?: PerfilUsuario;
}

export const RegulationQueueView: React.FC<RegulationQueueViewProps> = ({
  agendamentos,
  onUpdateAgendamento,
  onOpenAppointmentDetail,
  perfilUsuario = 'REGULADOR',
}) => {
  const pendingItems = agendamentos.filter((a) => a.status === 'Pendente');
  const [selectedItem, setSelectedItem] = useState<Agendamento | null>(pendingItems[0] || null);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('08:30');
  const [selectedDoctor, setSelectedDoctor] = useState(MEDICOS_CRSMA[0]);
  const [filterSpecialty, setFilterSpecialty] = useState('TODAS');
  const [selectedRisk, setSelectedRisk] = useState<ClassificacaoRisco>('VERDE');

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

  const filteredPending = pendingItems
    .filter((item) => filterSpecialty === 'TODAS' || item.especialidade === filterSpecialty)
    .sort((a, b) => {
      const pA = CLASSIFICACAO_RISCO_MAP[a.classificacaoRisco || 'VERDE']?.prioridade ?? 2;
      const pB = CLASSIFICACAO_RISCO_MAP[b.classificacaoRisco || 'VERDE']?.prioridade ?? 2;
      if (pA !== pB) return pA - pB;
      return parseDateStr(b.dataSolicitacao) - parseDateStr(a.dataSolicitacao);
    });

  const handleSelectQueueItem = (item: Agendamento) => {
    setSelectedItem(item);
    setSelectedRisk(item.classificacaoRisco || 'VERDE');
  };

  const handleApproveSchedule = () => {
    if (!selectedItem) return;
    if (!selectedDate) {
      alert('Por favor, selecione uma data para o agendamento.');
      return;
    }

    const fullDateTime = `${selectedDate}T${selectedTime}`;

    onUpdateAgendamento({
      ...selectedItem,
      dataAgendada: fullDateTime,
      medicoCRSMA: selectedDoctor,
      classificacaoRisco: selectedRisk,
      status: 'Agendado',
      comunicadoUnidade: 'Agendamento aprovado pelo CRSMA. Aguardando busca ativa do ACS.',
      atualizadoEm: new Date().toISOString(),
    });

    alert(`Agendamento de ${selectedItem.pacienteNome} confirmado com sucesso para ${selectedDate} às ${selectedTime}!`);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Title & Info Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Fila de Regulação & Agendamentos do CRSMA
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              {pendingItems.length} Solicitacões Pendentes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Analise as solicitações enviadas pelas eSFs de Araripina, defina a data, horário e atribua o médico especialista.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="TODAS">Todas Especialidades</option>
            <option value="PRÉ-NATAL DE ALTO RISCO">Pré-Natal de Alto Risco</option>
            <option value="COLPOSCOPIA E PROCEDIMENTOS">Colposcopia e Procedimentos</option>
            <option value="CONSULTA GINECOLÓGICA">Consulta Ginecológica</option>
            <option value="INSERÇÃO E REVISÃO DE DIU">Inserção/Revisão de DIU</option>
            <option value="ULTRASSOM OBSTÉTRICO - FAP">Ultrassom Obstétrico FAP</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Queue List + Scheduling Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Pending Requests List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-3 bg-slate-800 text-white font-bold text-xs flex items-center justify-between">
            <span>Solicitações Aguardando Vaga ({filteredPending.length})</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>

          <div className="divide-y divide-slate-200 overflow-y-auto flex-1">
            {filteredPending.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Nenhuma solicitação pendente no momento. Todas as vagas foram reguladas!
              </div>
            ) : (
              filteredPending.map((item) => {
                const riskMeta = CLASSIFICACAO_RISCO_MAP[item.classificacaoRisco || 'VERDE'];
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectQueueItem(item)}
                    className={`p-3.5 hover:bg-slate-50 transition-all cursor-pointer border-l-4 ${
                      selectedItem?.id === item.id
                        ? 'bg-teal-50/80 border-teal-600 shadow-2xs font-semibold'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-900 text-xs truncate">{item.pacienteNome}</span>
                      {item.tipoConsulta === 'retorno' ? (
                        <span className="text-[9px] font-bold text-purple-900 bg-purple-100 border border-purple-300 px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                          <RotateCcw className="w-2.5 h-2.5 text-purple-600" /> RETORNO
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-teal-900 bg-teal-100 border border-teal-300 px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                          <UserPlus className="w-2.5 h-2.5 text-teal-600" /> 1ª CONSULTA
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>eSF: <strong>{item.esfOrigem}</strong></div>
                      <div className="text-teal-700 font-bold">{item.especialidade}</div>
                      <div className="text-slate-400 text-[10px]">Solicitado em: {item.dataSolicitacao}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Scheduling Workspace */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                    Regulando Solicitação ID: {selectedItem.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{selectedItem.pacienteNome}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOpenAppointmentDetail(selectedItem);
                      setTimeout(() => window.print(), 300);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1 transition-colors"
                    title="Imprimir Ficha de Regulação do Paciente"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-700" />
                    <span>Imprimir Ficha</span>
                  </button>

                  <button
                    onClick={() => onOpenAppointmentDetail(selectedItem)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                  >
                    Ver Prontuário
                  </button>
                </div>
              </div>

              {/* Patient Quick Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">CPF</span>
                  <p className="font-semibold">{selectedItem.cpf}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Cartão SUS</span>
                  <p className="font-semibold">{selectedItem.cartaoSus}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Telefone</span>
                  <p className="font-semibold text-emerald-800">{selectedItem.telefone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Unidade eSF</span>
                  <p className="font-semibold text-rose-800">{selectedItem.esfOrigem}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Profissional eSF</span>
                  <p className="font-semibold">{selectedItem.profissionalSolicitante || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">ACS</span>
                  <p className="font-semibold">{selectedItem.acsResponsavel || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Tipo Atendimento</span>
                  <div>
                    {selectedItem.tipoConsulta === 'retorno' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-900 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-full">
                        <RotateCcw className="w-3 h-3 text-purple-600" /> RETORNO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-900 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-full">
                        <UserPlus className="w-3 h-3 text-teal-600" /> 1ª CONSULTA
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Clinical Note */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Motivo / Quadro Clínico:</span>
                <p className="text-slate-800 italic mt-0.5">"{selectedItem.observacoesClinicas || 'Sem observações adicionais.'}"</p>
              </div>

              {/* Form to Assign Schedule */}
              {perfilUsuario !== 'SOLICITANTE' ? (
                <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase text-rose-900 tracking-wider">
                    Agendar Vaga e Atribuir Médico Atendente
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-800">Data da Consulta *</label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-800">Horário da Consulta *</label>
                      <input
                        type="time"
                        required
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1 text-slate-800">Médico Especialista do CRSMA *</label>
                      <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold text-slate-900"
                      >
                        {MEDICOS_CRSMA.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleApproveSchedule}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-sm transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Aprovar & Confirmar Agendamento</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/90 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-xs uppercase tracking-wider text-amber-950">Apenas Perfil Regulador pode Aprovar e Agendar Vagas</p>
                    <p className="text-[11px] text-amber-800 mt-1">
                      No <strong>Perfil Solicitante (eSF)</strong> você pode acompanhar o andamento da fila e visualizar prontuários. Para aprovar solicitações, definir datas e atribuir médicos, mude para o <strong>Perfil Regulador (CRSMA)</strong> no menu superior.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <Calendar className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-medium">Selecione uma solicitação pendente ao lado para realizar o agendamento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
