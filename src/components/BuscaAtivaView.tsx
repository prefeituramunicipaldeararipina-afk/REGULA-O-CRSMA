import React, { useState } from 'react';
import { Agendamento } from '../types';
import { DISTRITOS_SANITARIOS, TODAS_ESFS } from '../data/constants';
import { Search, Megaphone, CheckCircle2, Clock, Phone, Send, AlertTriangle, UserCheck, MessageSquare, Filter, Printer } from 'lucide-react';

interface BuscaAtivaViewProps {
  agendamentos: Agendamento[];
  onUpdateAgendamento: (updated: Agendamento) => void;
  onOpenAppointmentDetail: (agendamento: Agendamento) => void;
}

export const BuscaAtivaView: React.FC<BuscaAtivaViewProps> = ({
  agendamentos,
  onUpdateAgendamento,
  onOpenAppointmentDetail,
}) => {
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('TODOS');
  const [selectedEsfFilter, setSelectedEsfFilter] = useState('TODAS');
  const [comunicadoText, setComunicadoText] = useState<{ [id: string]: string }>({});

  const handleDistrictFilterChange = (district: string) => {
    setSelectedDistrictFilter(district);
    if (district !== 'TODOS') {
      const distObj = DISTRITOS_SANITARIOS.find((d) => d.nome === district);
      if (distObj && selectedEsfFilter !== 'TODAS' && !distObj.unidades.includes(selectedEsfFilter)) {
        setSelectedEsfFilter('TODAS');
      }
    }
  };

  const agendamentosParaBuscaAtiva = agendamentos.filter((a) => a.status === 'Agendado' || a.status === 'Confirmado');

  const esfsInDistrict =
    selectedDistrictFilter === 'TODOS'
      ? TODAS_ESFS
      : DISTRITOS_SANITARIOS.find((d) => d.nome === selectedDistrictFilter)?.unidades || TODAS_ESFS;

  const filteredItems = agendamentosParaBuscaAtiva.filter((item) => {
    const matchesDistrict =
      selectedDistrictFilter === 'TODOS' ||
      DISTRITOS_SANITARIOS.find((d) => d.nome === selectedDistrictFilter)?.unidades.includes(item.esfOrigem);
    const matchesEsf = selectedEsfFilter === 'TODAS' || item.esfOrigem === selectedEsfFilter;
    return matchesDistrict && matchesEsf;
  });

  const handleToggleBuscaAtiva = (item: Agendamento) => {
    const updatedStatus = !item.buscaAtivaRealizada ? 'Confirmado' : 'Agendado';
    onUpdateAgendamento({
      ...item,
      buscaAtivaRealizada: !item.buscaAtivaRealizada,
      status: updatedStatus,
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleSendComunicado = (item: Agendamento) => {
    const text = comunicadoText[item.id];
    if (!text || !text.trim()) return;

    onUpdateAgendamento({
      ...item,
      comunicadoUnidade: text,
      atualizadoEm: new Date().toISOString(),
    });

    alert(`Comunicado para ${item.pacienteNome} atualizado com sucesso!`);
    setComunicadoText({ ...comunicadoText, [item.id]: '' });
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
              Diretriz Oficial de Regulação
            </span>
            <h2 className="text-base font-bold text-white">Busca Ativa pelo ACS & Comunicados eSF</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Ao agendar a vaga, o Agente Comunitário de Saúde (ACS) deve notificar a cidadã e registrar no sistema a confirmação ou liberação do agendamento.
            </p>
          </div>
        </div>

        {/* Stats badge */}
        <div className="flex items-center gap-2 bg-slate-800 p-3 rounded-lg border border-slate-700 shrink-0">
          <UserCheck className="w-5 h-5 text-teal-400" />
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Buscas Concluídas</div>
            <div className="text-sm font-extrabold text-white">
              {agendamentos.filter((a) => a.buscaAtivaRealizada).length} / {agendamentos.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-600" />
            <span>Pacientes Agendados Aguardando Notificação ({filteredItems.length})</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-teal-600" />
              <select
                value={selectedDistrictFilter}
                onChange={(e) => handleDistrictFilterChange(e.target.value)}
                className="text-xs bg-white border border-slate-200 text-slate-800 rounded-md px-2 py-1 focus:ring-2 focus:ring-teal-500 font-bold"
              >
                <option value="TODOS">Todos os Distritos</option>
                {DISTRITOS_SANITARIOS.map((d) => (
                  <option key={d.nome} value={d.nome}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedEsfFilter}
              onChange={(e) => setSelectedEsfFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 text-slate-800 rounded-md px-2 py-1 focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="TODAS">
                {selectedDistrictFilter === 'TODOS' ? 'Todas as Unidades (32 eSF + Secretaria de Saúde)' : `Todas do ${selectedDistrictFilter}`}
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
        </div>

        <div className="divide-y divide-slate-200">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhum agendamento pendente de busca ativa para o filtro selecionado.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{item.pacienteNome}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                        {item.esfOrigem}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
                        {item.especialidade}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>CPF: <strong>{item.cpf}</strong></span>
                      <span>Tel: <strong className="text-emerald-700">{item.telefone}</strong></span>
                      <span>ACS: <strong>{item.acsResponsavel || 'Não informado'}</strong></span>
                      <span>
                        Data Agendada:{' '}
                        <strong className="text-rose-700">
                          {item.dataAgendada
                            ? `${new Date(item.dataAgendada).toLocaleDateString('pt-BR')} às ${new Date(item.dataAgendada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Aguardando'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Toggle Checkbox */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleToggleBuscaAtiva(item)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                        item.buscaAtivaRealizada
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${item.buscaAtivaRealizada ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{item.buscaAtivaRealizada ? '✓ Busca Ativa Realizada' : 'Marcar Busca Ativa OK'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAppointmentDetail(item);
                        setTimeout(() => window.print(), 300);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="Imprimir Ficha de Busca Ativa"
                    >
                      <Printer className="w-3 h-3 text-slate-700" />
                      <span>Imprimir</span>
                    </button>

                    <button
                      onClick={() => onOpenAppointmentDetail(item)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                    >
                      Ver Ficha
                    </button>
                  </div>
                </div>

                {/* Comunicado Input Section */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                      <span>Comunicado Oficial da Unidade (eSF Origem)</span>
                    </span>
                    {item.comunicadoUnidade && (
                      <span className="text-[10px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {item.comunicadoUnidade}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ex: ACS informou que paciente confirmou presença / Desistiu e liberou a vaga..."
                      value={comunicadoText[item.id] !== undefined ? comunicadoText[item.id] : ''}
                      onChange={(e) => setComunicadoText({ ...comunicadoText, [item.id]: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500/20 bg-white"
                    />
                    <button
                      onClick={() => handleSendComunicado(item)}
                      className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar</span>
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
