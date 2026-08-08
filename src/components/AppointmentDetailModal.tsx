import React, { useState } from 'react';
import { Agendamento, StatusRegulacao, PerfilUsuario, TipoConsulta } from '../types';
import { MEDICOS_CRSMA, CLASSIFICACAO_RISCO_MAP } from '../data/constants';
import { X, Calendar, User, Phone, FileText, CheckCircle, Clock, AlertTriangle, Printer, Trash2, Save, ShieldCheck, Lock, ShieldAlert, Syringe, CheckSquare, UserPlus, RotateCcw } from 'lucide-react';

interface AppointmentDetailModalProps {
  agendamento: Agendamento | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAgendamento: (updated: Agendamento) => void;
  onDeleteAgendamento: (id: string) => void;
  perfilUsuario?: PerfilUsuario;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  agendamento,
  isOpen,
  onClose,
  onUpdateAgendamento,
  onDeleteAgendamento,
  perfilUsuario = 'REGULADOR',
}) => {
  if (!isOpen || !agendamento) return null;

  const [dataAgendada, setDataAgendada] = useState(agendamento.dataAgendada || '');
  const [turnoHorario, setTurnoHorario] = useState(agendamento.turnoHorario || 'Manhã - 08:00');
  const [medicoCRSMA, setMedicoCRSMA] = useState(agendamento.medicoCRSMA || MEDICOS_CRSMA[0]);
  const [status, setStatus] = useState<StatusRegulacao>(agendamento.status);
  const [buscaAtivaRealizada, setBuscaAtivaRealizada] = useState(agendamento.buscaAtivaRealizada);
  const [comunicadoUnidade, setComunicadoUnidade] = useState(agendamento.comunicadoUnidade || '');
  const [avisoUnidade, setAvisoUnidade] = useState(agendamento.avisoUnidade || agendamento.comunicadoUnidade || '');
  const [avisoCrsma, setAvisoCrsma] = useState(agendamento.avisoCrsma || '');
  const [dumOuUsgDate, setDumOuUsgDate] = useState(agendamento.dumOuUsgDate || '');
  const [idadeGestacionalInicio, setIdadeGestacionalInicio] = useState(agendamento.idadeGestacionalInicio || '');
  const [fatoresRiscoIdentificados, setFatoresRiscoIdentificados] = useState(agendamento.fatoresRiscoIdentificados || '');
  const [dpp, setDpp] = useState(agendamento.dpp || '');
  const [condutasRealizadasUbs, setCondutasRealizadasUbs] = useState(agendamento.condutasRealizadasUbs || '');
  const [classificacaoRisco, setClassificacaoRisco] = useState(agendamento.classificacaoRisco || 'VERDE');
  const [tipoConsulta, setTipoConsulta] = useState<TipoConsulta>(agendamento.tipoConsulta || '1a_consulta');
  const [queixaEspecialidade, setQueixaEspecialidade] = useState(agendamento.queixaEspecialidade || '');
  const [examesEspecialidade, setExamesEspecialidade] = useState(agendamento.examesEspecialidade || '');
  const [historicoEspecialidade, setHistoricoEspecialidade] = useState(agendamento.historicoEspecialidade || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdateAgendamento({
      ...agendamento,
      dataAgendada,
      turnoHorario,
      medicoCRSMA,
      status,
      buscaAtivaRealizada,
      comunicadoUnidade: avisoUnidade || comunicadoUnidade,
      avisoUnidade,
      avisoCrsma,
      dumOuUsgDate,
      idadeGestacionalInicio,
      fatoresRiscoIdentificados,
      dpp,
      condutasRealizadasUbs,
      classificacaoRisco,
      tipoConsulta,
      queixaEspecialidade,
      examesEspecialidade,
      historicoEspecialidade,
      atualizadoEm: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleDelete = () => {
    if (perfilUsuario !== 'ADMINISTRADOR') {
      alert('Ação restrita: Somente o perfil ADMINISTRADOR tem permissão para excluir definitivamente uma ficha de regulação do banco de dados.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir definitivamente a ficha de agendamento de ${agendamento.pacienteNome}? Esta ação é irreversível e permitida apenas para o Administrador.`)) {
      onDeleteAgendamento(agendamento.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 print:shadow-none print:border-none">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
              Ficha do Agendamento &bull; {agendamento.id}
            </span>
            <h2 className="text-lg font-bold text-white">{agendamento.pacienteNome}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintSlip}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Comprovante</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Section */}
        <div className="p-6 space-y-5 text-slate-800 text-xs">
          {/* Official Printable Header */}
          <div className="text-center border-b border-slate-200 pb-3">
            <h1 className="text-sm font-extrabold uppercase text-slate-900">
              PREFEITURA MUNICIPAL DE ARARIPINA - SECRETARIA DE SAÚDE
            </h1>
            <h2 className="text-xs font-bold text-teal-700 uppercase">
              CENTRO DE REFERÊNCIA EM SAÚDE DA MULHER (CRSMA)
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              COMPROVANTE DE SOLICITAÇÃO / AGENDAMENTO DE CONSULTA REGULADA
            </p>
          </div>

          {/* Status & Risk Classification Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 gap-3">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status & Regulação:</span>
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                {(agendamento.dataAgendada || agendamento.status === 'Agendado' || agendamento.status === 'Confirmado') ? (
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    AGENDADO
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    FILA DE ESPERA (Aguardando Regulação)
                  </span>
                )}
                {agendamento.buscaAtivaRealizada && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    ✓ Busca Ativa ACS
                  </span>
                )}
              </div>
            </div>

            {/* Risk Badge */}
            {(() => {
              const riskMeta = CLASSIFICACAO_RISCO_MAP[agendamento.classificacaoRisco || 'VERDE'];
              return (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Classificação de Risco:</span>
                  <span
                    className={`text-xs ${riskMeta.corBadge} font-black px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5`}
                    title={riskMeta.significado}
                  >
                    <span>{riskMeta.emoji}</span>
                    <span>{riskMeta.classificacao} &bull; {riskMeta.cor}</span>
                  </span>
                </div>
              );
            })()}

            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Unidade Solicitante:</span>
              <div className="text-xs font-bold text-teal-800">{agendamento.esfOrigem}</div>
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Nome da Paciente (Completo):</span>
              <p className="font-bold text-slate-900 text-sm">{agendamento.pacienteNome}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Telefone:</span>
              <p className="font-bold text-slate-900 text-xs">{agendamento.telefone}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">CPF:</span>
              <p className="font-semibold text-slate-800 text-xs">{agendamento.cpf}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Cartão do SUS (CNS):</span>
              <p className="font-semibold text-slate-800 text-xs">{agendamento.cartaoSus}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Data de Nascimento:</span>
              <p className="font-medium text-slate-800 text-xs">{agendamento.dataNascimento || 'Não informada'}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Data da Solicitação:</span>
              <p className="font-medium text-slate-800 text-xs">{agendamento.dataSolicitacao}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">ACS Responsável:</span>
              <p className="font-medium text-slate-800 text-xs">{agendamento.acsResponsavel || 'Não informado'}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Profissional Solicitante:</span>
              <p className="font-medium text-slate-800 text-xs">{agendamento.profissionalSolicitante || 'Não informado'}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Tipo de Atendimento:</span>
              <div className="mt-0.5">
                {agendamento.tipoConsulta === 'retorno' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-purple-900 bg-purple-100 border border-purple-300 px-2.5 py-0.5 rounded-full">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                    RETORNO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-teal-900 bg-teal-100 border border-teal-300 px-2.5 py-0.5 rounded-full">
                    <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                    1ª CONSULTA
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* High-Risk Prenatal Clinical Block */}
          {(agendamento.especialidade === 'PRÉ-NATAL DE ALTO RISCO' || agendamento.dumOuUsgDate || agendamento.fatoresRiscoIdentificados) && (
            <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200 space-y-3">
              <h4 className="font-bold text-xs text-teal-900 uppercase tracking-wider">
                Dados Clínicos & Obstétricos (Pré-Natal de Alto Risco)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-teal-800 uppercase font-semibold">DUM / USG Precoce:</span>
                  <p className="font-bold text-slate-900 text-xs">{agendamento.dumOuUsgDate || 'Não informada'}</p>
                </div>

                <div>
                  <span className="text-[10px] text-teal-800 uppercase font-semibold">IG de Início do Pré-Natal:</span>
                  <p className="font-bold text-slate-900 text-xs">{agendamento.idadeGestacionalInicio || 'Não informada'}</p>
                </div>

                <div>
                  <span className="text-[10px] text-teal-800 uppercase font-semibold">DPP (Data Provável Parto):</span>
                  <p className="font-bold text-slate-900 text-xs">{agendamento.dpp || 'Não informada'}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-teal-800 uppercase font-semibold">Fatores de Riscos Identificados:</span>
                <p className="font-medium text-slate-800 text-xs bg-white p-2 rounded border border-teal-100 mt-0.5">
                  {agendamento.fatoresRiscoIdentificados || 'Nenhum fator de risco específico cadastrado.'}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-teal-800 uppercase font-semibold">Condutas Realizadas na UBS:</span>
                <p className="font-medium text-slate-800 text-xs bg-white p-2 rounded border border-teal-100 mt-0.5">
                  {agendamento.condutasRealizadasUbs || 'Nenhuma conduta prévia registrada.'}
                </p>
              </div>
            </div>
          )}

          {/* Particularidades da Especialidade */}
          {(agendamento.queixaEspecialidade || agendamento.examesEspecialidade || agendamento.historicoEspecialidade) && (
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
              <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider">
                Particularidades e Dados Específicos da Ficha
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {agendamento.queixaEspecialidade && (
                  <div>
                    <span className="text-[10px] text-purple-800 uppercase font-bold">Queixa / Indicação:</span>
                    <p className="font-semibold text-slate-900 bg-white p-2 rounded border border-purple-100 mt-0.5">{agendamento.queixaEspecialidade}</p>
                  </div>
                )}
                {agendamento.examesEspecialidade && (
                  <div>
                    <span className="text-[10px] text-purple-800 uppercase font-bold">Exames / Laudos Prévios:</span>
                    <p className="font-semibold text-slate-900 bg-white p-2 rounded border border-purple-100 mt-0.5">{agendamento.examesEspecialidade}</p>
                  </div>
                )}
                {agendamento.historicoEspecialidade && (
                  <div className="md:col-span-2">
                    <span className="text-[10px] text-purple-800 uppercase font-bold">Histórico / Conduta Prévia:</span>
                    <p className="font-semibold text-slate-900 bg-white p-2 rounded border border-purple-100 mt-0.5">{agendamento.historicoEspecialidade}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Implanon / Subdermal Implant Vulnerability Conditions */}
          {(agendamento.especialidade === 'Implante contraceptivo subdérmico' || agendamento.especialidade === 'IMPLANTE CONTRACEPTIVO SUBDÉRMICO' || agendamento.especialidade === 'INSERÇÃO DE IMPLANON' || (agendamento.condicoesVulnerabilidadeImplanon && agendamento.condicoesVulnerabilidadeImplanon.length > 0)) && (
            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                <Syringe className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Condições de Vulnerabilidade / Prioridade Reprodutiva (Implante Contraceptivo Subdérmico)</span>
              </div>

              {agendamento.condicoesVulnerabilidadeImplanon && agendamento.condicoesVulnerabilidadeImplanon.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {agendamento.condicoesVulnerabilidadeImplanon.map((cond, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-indigo-100 text-indigo-950 font-medium">
                        <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{cond}</span>
                      </div>
                    ))}
                  </div>

                  {agendamento.outraVulnerabilidadeImplanon && (
                    <div className="bg-white p-2 rounded-lg border border-indigo-200 text-xs mt-2">
                      <span className="text-[10px] text-indigo-800 uppercase font-bold block">Detalhamento da outra vulnerabilidade:</span>
                      <p className="text-slate-900 font-semibold">{agendamento.outraVulnerabilidadeImplanon}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-indigo-900/70 italic bg-white p-2 rounded border border-indigo-100">
                  Nenhuma condição de vulnerabilidade específica marcada.
                </p>
              )}
            </div>
          )}

          {/* Specialty & Regulation Schedule */}
          <div className={`p-4 rounded-xl border space-y-3 ${agendamento.dataAgendada ? 'bg-emerald-50/80 border-emerald-200' : 'bg-amber-50/80 border-amber-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className={`text-[10px] uppercase font-bold ${agendamento.dataAgendada ? 'text-emerald-800' : 'text-amber-800'}`}>
                  Especialidade Solicitada
                </span>
                <p className="text-sm font-extrabold text-slate-950">{agendamento.especialidade}</p>
              </div>

              {agendamento.dataAgendada ? (
                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center sm:justify-end gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Data Agendada pelo Regulador
                  </span>
                  <p className="text-sm font-extrabold text-emerald-950">
                    {agendamento.dataAgendada} {agendamento.turnoHorario ? `(${agendamento.turnoHorario})` : ''}
                  </p>
                </div>
              ) : (
                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center sm:justify-end gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Status da Vaga
                  </span>
                  <p className="text-xs font-extrabold text-amber-950 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300 inline-block mt-0.5">
                    FILA DE ESPERA &bull; Aguardando Regulação CRSMA
                  </p>
                </div>
              )}
            </div>

            {/* Avisos Unidade e CRSMA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-200 pt-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Aviso Unidade (eSF):</span>
                <p className="font-medium text-slate-800 text-xs">{agendamento.avisoUnidade || agendamento.comunicadoUnidade || 'Sem avisos da unidade'}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Aviso CRSMA (Regulação):</span>
                <p className="font-medium text-slate-800 text-xs">{agendamento.avisoCrsma || 'Sem avisos do CRSMA'}</p>
              </div>
            </div>

            {agendamento.medicoCRSMA && (
              <div className="text-xs text-slate-700 font-semibold border-t border-slate-200 pt-2">
                Profissional Atendente CRSMA: <span className="text-slate-900">{agendamento.medicoCRSMA}</span>
              </div>
            )}
          </div>

          {/* Requirements Checklist */}
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Instruções Importantes para o Dia da Consulta:</span>
            </h4>
            <ul className="list-disc list-inside text-[11px] space-y-1 text-amber-800">
              <li>
                <strong>Documentação Física:</strong> Levar obrigatoriamente <strong>CPF e Cartão SUS</strong> originais para checagem no e-SUS PEC.
              </li>
              <li>
                <strong>Encaminhamento:</strong> Apresentar a solicitação médica/enfermeiro impressa e assinada pela eSF.
              </li>
              {agendamento.especialidade === 'COLPOSCOPIA E PROCEDIMENTOS' && (
                <li className="font-bold text-red-800">
                  <strong>Laudo Citológico:</strong> OBRIGATÓRIO apresentar o resultado do exame preventivo (citológico) impresso.
                </li>
              )}
              <li>
                <strong>Horário:</strong> Chegar com 15 minutos de antecedência na recepção do CRSMA Araripina.
              </li>
            </ul>
          </div>

          {/* Edit Regulation Controls (Hidden when printing) */}
          <div className="border-t border-slate-200 pt-4 print:hidden space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Painel da Coordenação & Regulação CRSMA</span>
              </h4>
              
              {perfilUsuario !== 'SOLICITANTE' ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg border border-teal-200 transition-colors"
                >
                  {isEditing ? 'Cancelar Edição' : 'Editar Regulação / Parâmetros'}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-lg text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Modo Solicitante (Somente Leitura de Vagas)</span>
                </div>
              )}
            </div>

            {perfilUsuario === 'SOLICITANTE' && (
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Perfil Solicitante (Unidade / eSF):</p>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Seu perfil permite solicitar vagas e acompanhar o status das pacientes. O agendamento de datas, horário, médicos e reclassificação de risco é realizado exclusivamente pelos perfis <strong>Regulador</strong> e <strong>Administrador</strong>.
                  </p>
                </div>
              </div>
            )}

            {isEditing && perfilUsuario !== 'SOLICITANTE' && (
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Data Agendada</label>
                    <input
                      type="date"
                      value={dataAgendada}
                      onChange={(e) => setDataAgendada(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Turno e Horário</label>
                    <input
                      type="text"
                      placeholder="Ex: Manhã - 08:30"
                      value={turnoHorario}
                      onChange={(e) => setTurnoHorario(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Status da Regulação</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as StatusRegulacao)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                    >
                      <option value="Pendente">Pendente (Fila de Regulação)</option>
                      <option value="Agendado">Agendado</option>
                      <option value="Confirmado">Confirmado (ACS/eSF)</option>
                      <option value="Realizado">Realizado</option>
                      <option value="Falta">Falta / Absenteísmo</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Tipo de Atendimento</label>
                    <select
                      value={tipoConsulta}
                      onChange={(e) => setTipoConsulta(e.target.value as TipoConsulta)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold text-teal-900"
                    >
                      <option value="1a_consulta">1ª Consulta (Atendimento Inicial)</option>
                      <option value="retorno">Retorno (Consulta de Reavaliação)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Médico Atendente no CRSMA</label>
                    <select
                      value={medicoCRSMA}
                      onChange={(e) => setMedicoCRSMA(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    >
                      {MEDICOS_CRSMA.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">DUM / USG Precoce</label>
                    <input
                      type="date"
                      value={dumOuUsgDate}
                      onChange={(e) => setDumOuUsgDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">DPP (Data Provável do Parto)</label>
                    <input
                      type="date"
                      value={dpp}
                      onChange={(e) => setDpp(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Aviso Unidade (eSF)</label>
                    <input
                      type="text"
                      value={avisoUnidade}
                      onChange={(e) => setAvisoUnidade(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Aviso CRSMA (Regulação)</label>
                    <input
                      type="text"
                      value={avisoCrsma}
                      onChange={(e) => setAvisoCrsma(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Fatores de Riscos Identificados</label>
                  <textarea
                    rows={2}
                    value={fatoresRiscoIdentificados}
                    onChange={(e) => setFatoresRiscoIdentificados(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Condutas Realizadas na UBS</label>
                  <textarea
                    rows={2}
                    value={condutasRealizadasUbs}
                    onChange={(e) => setCondutasRealizadasUbs(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800 text-xs">
                    <input
                      type="checkbox"
                      checked={buscaAtivaRealizada}
                      onChange={(e) => setBuscaAtivaRealizada(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>Busca Ativa pelo ACS realizada com a cidadã</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delete Action (Exclusive to ADMINISTRADOR) */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2 print:hidden">
            {perfilUsuario === 'ADMINISTRADOR' ? (
              <button
                onClick={handleDelete}
                className="text-xs text-red-600 hover:text-red-700 font-extrabold flex items-center gap-1.5 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Excluir Definitivamente Ficha (Apenas Administrador)</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Exclusão definitiva restrita ao Administrador</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintSlip}
                className="px-3.5 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ficha / Comprovante</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
