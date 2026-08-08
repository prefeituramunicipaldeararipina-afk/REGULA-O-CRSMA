import React, { useState, useEffect } from 'react';
import { Agendamento, EspecialidadeCRSMA, ClassificacaoRisco, PerfilUsuario, TipoConsulta } from '../types';
import {
  ESPECIALIDADES,
  ESF_GRUPOS,
  CONDICOES_VULNERABILIDADE_IMPLANON,
  CLASSIFICACAO_RISCO_LIST,
  DISTRITOS_SANITARIOS,
  getDistritoByUnidade,
} from '../data/constants';
import { X, Save, AlertCircle, CheckCircle2, User, FileText, Phone, Calendar, Clock, ShieldAlert, Syringe, CheckSquare, Printer, UserPlus, RotateCcw } from 'lucide-react';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newAgendamento: Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  initialEsf?: string;
  initialSpecialty?: EspecialidadeCRSMA;
  initialPatientData?: Partial<Agendamento>;
  perfilUsuario?: PerfilUsuario;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialEsf,
  initialSpecialty,
  initialPatientData,
  perfilUsuario = 'SOLICITANTE',
}) => {
  const [dataSolicitacao, setDataSolicitacao] = useState(new Date().toISOString().slice(0, 10));
  const [pacienteNome, setPacienteNome] = useState(initialPatientData?.pacienteNome || '');
  const [cpf, setCpf] = useState(initialPatientData?.cpf || '');
  const [cartaoSus, setCartaoSus] = useState(initialPatientData?.cartaoSus || '');
  const [dataNascimento, setDataNascimento] = useState(initialPatientData?.dataNascimento || '');
  const [telefone, setTelefone] = useState(initialPatientData?.telefone || '');
  const [esfOrigem, setEsfOrigem] = useState(initialPatientData?.esfOrigem || initialEsf || DISTRITOS_SANITARIOS[0].unidades[0]);
  const [distritoSanitario, setDistritoSanitario] = useState(() =>
    getDistritoByUnidade(initialPatientData?.esfOrigem || initialEsf || DISTRITOS_SANITARIOS[0].unidades[0])
  );

  const handleDistritoChange = (novoDistrito: string) => {
    setDistritoSanitario(novoDistrito);
    const distObj = DISTRITOS_SANITARIOS.find((d) => d.nome === novoDistrito);
    if (distObj && !distObj.unidades.includes(esfOrigem)) {
      setEsfOrigem(distObj.unidades[0]);
    }
  };

  const unidadesDoDistrito = [
    ...(DISTRITOS_SANITARIOS.find((d) => d.nome === distritoSanitario)?.unidades ||
      DISTRITOS_SANITARIOS[0].unidades),
    'Secretaria Municipal de Saúde',
  ];
  const [acsResponsavel, setAcsResponsavel] = useState(initialPatientData?.acsResponsavel || '');
  const [especialidade, setEspecialidade] = useState<EspecialidadeCRSMA>(initialPatientData?.especialidade || initialSpecialty || 'PRÉ-NATAL DE ALTO RISCO');
  const [profissionalSolicitante, setProfissionalSolicitante] = useState(initialPatientData?.profissionalSolicitante || '');
  const [temEncaminhamento, setTemEncaminhamento] = useState(initialPatientData?.temEncaminhamento ?? true);
  const [temCitologicoAnterior, setTemCitologicoAnterior] = useState(initialPatientData?.temCitologicoAnterior ?? false);
  const [observacoesClinicas, setObservacoesClinicas] = useState(initialPatientData?.observacoesClinicas || '');
  const [alertaProntuarioDuplo, setAlertaProntuarioDuplo] = useState(initialPatientData?.alertaProntuarioDuplo || false);

  // New requested fields for Pré-Natal de Alto Risco & Regulação
  const [dumOuUsgDate, setDumOuUsgDate] = useState(initialPatientData?.dumOuUsgDate || '');
  const [idadeGestacionalInicio, setIdadeGestacionalInicio] = useState(initialPatientData?.idadeGestacionalInicio || '');
  const [fatoresRiscoIdentificados, setFatoresRiscoIdentificados] = useState(initialPatientData?.fatoresRiscoIdentificados || '');
  const [dpp, setDpp] = useState(initialPatientData?.dpp || '');
  const [condutasRealizadasUbs, setCondutasRealizadasUbs] = useState(initialPatientData?.condutasRealizadasUbs || '');
  const [avisoUnidade, setAvisoUnidade] = useState(initialPatientData?.avisoUnidade || '');
  const [avisoCrsma, setAvisoCrsma] = useState(initialPatientData?.avisoCrsma || '');
  const [dataAgendada, setDataAgendada] = useState('');
  const [turnoHorario, setTurnoHorario] = useState('Manhã - 08:00');
  const [classificacaoRisco, setClassificacaoRisco] = useState<ClassificacaoRisco>(initialPatientData?.classificacaoRisco || 'VERDE');
  const [tipoConsulta, setTipoConsulta] = useState<TipoConsulta>(initialPatientData?.tipoConsulta || '1a_consulta');

  // Implanon - Condições de Vulnerabilidade
  const [condicoesVulnerabilidade, setCondicoesVulnerabilidade] = useState<string[]>(initialPatientData?.condicoesVulnerabilidadeImplanon || []);
  const [outraVulnerabilidade, setOutraVulnerabilidade] = useState(initialPatientData?.outraVulnerabilidadeImplanon || '');

  useEffect(() => {
    if (initialPatientData) {
      setPacienteNome(initialPatientData.pacienteNome || '');
      setCpf(initialPatientData.cpf || '');
      setCartaoSus(initialPatientData.cartaoSus || '');
      setDataNascimento(initialPatientData.dataNascimento || '');
      setTelefone(initialPatientData.telefone || '');
      if (initialPatientData.esfOrigem) {
        setEsfOrigem(initialPatientData.esfOrigem);
        setDistritoSanitario(getDistritoByUnidade(initialPatientData.esfOrigem));
      }
      if (initialPatientData.especialidade) {
        setEspecialidade(initialPatientData.especialidade);
      }
      setAcsResponsavel(initialPatientData.acsResponsavel || '');
      setProfissionalSolicitante(initialPatientData.profissionalSolicitante || '');
      setTemEncaminhamento(initialPatientData.temEncaminhamento ?? true);
      setTemCitologicoAnterior(initialPatientData.temCitologicoAnterior ?? false);
      setObservacoesClinicas(initialPatientData.observacoesClinicas || '');
      setAlertaProntuarioDuplo(initialPatientData.alertaProntuarioDuplo || false);
      setDumOuUsgDate(initialPatientData.dumOuUsgDate || '');
      setIdadeGestacionalInicio(initialPatientData.idadeGestacionalInicio || '');
      setFatoresRiscoIdentificados(initialPatientData.fatoresRiscoIdentificados || '');
      setDpp(initialPatientData.dpp || '');
      setCondutasRealizadasUbs(initialPatientData.condutasRealizadasUbs || '');
      setAvisoUnidade(initialPatientData.avisoUnidade || '');
      setAvisoCrsma(initialPatientData.avisoCrsma || '');
      setClassificacaoRisco(initialPatientData.classificacaoRisco || 'VERDE');
      setTipoConsulta(initialPatientData.tipoConsulta || '1a_consulta');
      setCondicoesVulnerabilidade(initialPatientData.condicoesVulnerabilidadeImplanon || []);
      setOutraVulnerabilidade(initialPatientData.outraVulnerabilidadeImplanon || '');
    }
  }, [initialPatientData]);

  const handleToggleVulnerabilidade = (item: string) => {
    if (condicoesVulnerabilidade.includes(item)) {
      setCondicoesVulnerabilidade(condicoesVulnerabilidade.filter((c) => c !== item));
    } else {
      setCondicoesVulnerabilidade([...condicoesVulnerabilidade, item]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pacienteNome.trim() || !cpf.trim() || !cartaoSus.trim() || !telefone.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios: Nome Completo (sem abreviações), CPF, CNS (Cartão SUS) e Telefone.');
      return;
    }

    if (!temEncaminhamento) {
      alert('Atenção: O encaminhamento médico/enfermeiro é obrigatório para atendimento no CRSMA.');
    }

    const initialStatus = dataAgendada ? 'Agendado' : 'Pendente';

    onSubmit({
      dataSolicitacao: dataSolicitacao || new Date().toISOString().slice(0, 10),
      pacienteNome,
      cpf,
      cartaoSus,
      dataNascimento,
      telefone,
      esfOrigem,
      acsResponsavel,
      especialidade,
      profissionalSolicitante,
      temEncaminhamento,
      temCitologicoAnterior,
      observacoesClinicas,
      status: initialStatus,
      buscaAtivaRealizada: false,
      comunicadoUnidade: avisoUnidade || 'Aguardando avaliação do CRSMA',
      alertaProntuarioDuplo,
      // High-risk & regulation specific fields
      dumOuUsgDate,
      idadeGestacionalInicio,
      fatoresRiscoIdentificados,
      dpp,
      condutasRealizadasUbs,
      avisoUnidade,
      avisoCrsma,
      dataAgendada,
      turnoHorario,
      classificacaoRisco,
      tipoConsulta,
      condicoesVulnerabilidadeImplanon: condicoesVulnerabilidade,
      outraVulnerabilidadeImplanon: outraVulnerabilidade,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
              Solicitação eSF &bull; Regulação CRSMA Araripina
            </span>
            <h2 className="text-lg font-bold text-white">Ficha de Nova Solicitação - CRSMA</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir Formulário / Ficha em Branco"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              <span>Imprimir Ficha</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800 text-xs">
          {/* Rules Reminder Notice */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Orientações de Regulação:</strong> Todos os campos obrigatórios (<strong>Nome Completo sem abreviações, CPF ou CNS e Telefone</strong>) devem ser preenchidos com precisão. Para Pré-natal de Alto Risco, especifique a DUM/USG, idade gestacional e fatores de risco.
            </p>
          </div>

          {/* Section 1: Dados Gerais da Solicitação & Paciente */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              1. Identificação Geral da Paciente e Solicitação
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-800">Data da Solicitação *</label>
                <input
                  type="date"
                  required
                  value={dataSolicitacao}
                  onChange={(e) => setDataSolicitacao(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold mb-1 text-slate-800">Nome do Paciente completo e sem abreviações *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria Francisca das Chagas Silva (sem abreviar)"
                  value={pacienteNome}
                  onChange={(e) => setPacienteNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">CPF (Obrigatório) *</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">CNS - Cartão SUS (Obrigatório) *</label>
                <input
                  type="text"
                  required
                  placeholder="898 0000 0000 0000"
                  value={cartaoSus}
                  onChange={(e) => setCartaoSus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Telefone (Obrigatório) *</label>
                <input
                  type="text"
                  required
                  placeholder="(87) 99999-8888"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Data de Nascimento</label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Distrito Sanitário *</label>
                <select
                  value={distritoSanitario}
                  onChange={(e) => handleDistritoChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs bg-white"
                >
                  {DISTRITOS_SANITARIOS.map((d) => (
                    <option key={d.nome} value={d.nome}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Unidade eSF / UBS de Origem *</label>
                <select
                  value={esfOrigem}
                  onChange={(e) => setEsfOrigem(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs bg-white"
                >
                  {unidadesDoDistrito.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">ACS Responsável (Agente de Saúde)</label>
                <input
                  type="text"
                  placeholder="Nome do ACS da microárea"
                  value={acsResponsavel}
                  onChange={(e) => setAcsResponsavel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Especialidade & Pré-natal de Alto Risco */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>2. Serviço Solicitado & Dados Clínicos Obstétricos</span>
              {especialidade === 'PRÉ-NATAL DE ALTO RISCO' && (
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Formulário Pré-Natal de Alto Risco Ativo
                </span>
              )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-800">Especialidade / Serviço Solicitado *</label>
                <select
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value as EspecialidadeCRSMA)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs bg-white font-bold text-teal-800"
                >
                  {ESPECIALIDADES.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Profissional Solicitante (Médico/Enfermeiro)</label>
                <input
                  type="text"
                  placeholder="Ex: Dra. Patricia Lima / Enf. Clarice"
                  value={profissionalSolicitante}
                  onChange={(e) => setProfissionalSolicitante(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                />
              </div>
            </div>

            {/* Tipo de Atendimento: 1ª Consulta vs Retorno */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-teal-600" />
                  <span>Tipo de Atendimento da Ficha *</span>
                </label>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Selecione 1ª Consulta ou Retorno
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTipoConsulta('1a_consulta')}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
                    tipoConsulta === '1a_consulta'
                      ? 'bg-teal-50 border-teal-600 text-teal-950 ring-2 ring-teal-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    tipoConsulta === '1a_consulta' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs tracking-wide text-slate-900">1ª CONSULTA</span>
                      {tipoConsulta === '1a_consulta' && (
                        <span className="bg-teal-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                          OK
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Encaminhamento inicial novo</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoConsulta('retorno')}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
                    tipoConsulta === 'retorno'
                      ? 'bg-purple-50 border-purple-600 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    tipoConsulta === 'retorno' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs tracking-wide text-slate-900">RETORNO</span>
                      {tipoConsulta === 'retorno' && (
                        <span className="bg-purple-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                          OK
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Consulta de reavaliação</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Questions Specific for High-Risk Prenatal / Obstetrics */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-teal-900 uppercase tracking-wider">
                Parâmetros Específicos: Pré-Natal / Obstetrícia
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-800">DUM ou USG (data da IG na USG mais precoce)</label>
                  <input
                    type="date"
                    value={dumOuUsgDate}
                    onChange={(e) => setDumOuUsgDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-800">Idade gestacional que iniciou o pré-natal</label>
                  <input
                    type="text"
                    placeholder="Ex: 8 semanas e 4 dias"
                    value={idadeGestacionalInicio}
                    onChange={(e) => setIdadeGestacionalInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-800">DPP (Data Provável do Parto)</label>
                  <input
                    type="date"
                    value={dpp}
                    onChange={(e) => setDpp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Fatores de riscos identificados</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Hipertensão arterial crônica, Diabetes gestacional, Pré-eclâmpsia prévia, Idade materna avançada (>35 anos)..."
                  value={fatoresRiscoIdentificados}
                  onChange={(e) => setFatoresRiscoIdentificados(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Condutas realizadas na UBS</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Iniciado Metildopa 250mg, solicitados exames de rotina de 1º trimestre, encaminhada para USG obstétrico..."
                  value={condutasRealizadasUbs}
                  onChange={(e) => setCondutasRealizadasUbs(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs bg-white"
                />
              </div>
            </div>

            {/* FICHA ESPECÍFICA: IMPLANTE CONTRACEPTIVO SUBDÉRMICO */}
            {(especialidade === 'Implante contraceptivo subdérmico' || especialidade === 'IMPLANTE CONTRACEPTIVO SUBDÉRMICO' || especialidade === 'INSERÇÃO DE IMPLANON') && (
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200/80 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider border-b border-indigo-200/60 pb-2">
                  <Syringe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>CONDIÇÕES DE VULNERABILIDADE / PRIORIDADE REPRODUTIVA (IMPLANTE SUBDÉRMICO)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  {CONDICOES_VULNERABILIDADE_IMPLANON.map((condicao, idx) => {
                    const isChecked = condicoesVulnerabilidade.includes(condicao);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-700 font-semibold shadow-xs'
                            : 'bg-white text-slate-800 border-indigo-200/70 hover:bg-indigo-100/50 font-medium'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleVulnerabilidade(condicao)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 shrink-0 cursor-pointer"
                        />
                        <span className="leading-tight">{condicao}</span>
                      </label>
                    );
                  })}
                </div>

                {condicoesVulnerabilidade.includes('Outra situação de vulnerabilidade') && (
                  <div className="mt-2 p-2.5 bg-white rounded-lg border border-indigo-200">
                    <label className="block text-xs font-bold text-indigo-950 mb-1">
                      Especifique a outra situação de vulnerabilidade *
                    </label>
                    <input
                      type="text"
                      placeholder="Descreva a condição de vulnerabilidade..."
                      value={outraVulnerabilidade}
                      onChange={(e) => setOutraVulnerabilidade(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                    />
                  </div>
                )}
              </div>
            )}



            {/* Classificação de Risco / Priorização na Regulação */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>CLASSIFICAÇÃO DE RISCO / PRIORIZAÇÃO NA REGULAÇÃO *</span>
                </label>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Selecione a prioridade clínica da paciente
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {CLASSIFICACAO_RISCO_LIST.map((item) => {
                  const isSelected = classificacaoRisco === item.cor;
                  return (
                    <button
                      key={item.cor}
                      type="button"
                      onClick={() => setClassificacaoRisco(item.cor)}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? `${item.corBg} ${item.corBorda} ring-2 ring-teal-500 shadow-2xs`
                          : 'bg-white border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs">{item.emoji}</span>
                          <span className={`text-[8px] uppercase font-black px-1.5 py-0.2 rounded-full ${item.corBadge}`}>
                            {item.classificacao}
                          </span>
                        </div>
                        <span className={`text-[11px] font-black uppercase block ${item.corTexto}`}>
                          {item.cor} &ndash; {item.classificacao}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1 leading-tight">
                        {item.significado}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Avisos & Regulamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-800">Aviso Unidade (Observação eSF de Origem)</label>
                <textarea
                  rows={2}
                  placeholder="Aviso da eSF para o CRSMA (ex: Cidadã com dificuldade de transporte / Prioridade clínica)"
                  value={avisoUnidade}
                  onChange={(e) => setAvisoUnidade(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Aviso CRSMA (Parecer / Orientação da Regulação)</label>
                <textarea
                  rows={2}
                  placeholder="Aviso da Regulação CRSMA para a Unidade (ex: Vaga reservada para próximo lote / Trazer exames anteriores)"
                  value={avisoCrsma}
                  onChange={(e) => setAvisoCrsma(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                />
              </div>
            </div>

            {/* Agendamento Preliminar / Turno e Horário (Apenas Regulador/Admin) */}
            {perfilUsuario !== 'SOLICITANTE' ? (
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3">
                <div className="flex items-center justify-between border-b border-teal-200/60 pb-2">
                  <h4 className="font-bold text-xs text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>Agendamento / Programação de Atendimento (Regulador)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-200">
                    Perfil Regulador / Admin
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Data Agendada</label>
                    <input
                      type="date"
                      value={dataAgendada}
                      onChange={(e) => setDataAgendada(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Turno e Horário</label>
                    <input
                      type="text"
                      placeholder="Ex: Manhã - 08:30 ou Tarde - 13:30"
                      value={turnoHorario}
                      onChange={(e) => setTurnoHorario(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-extrabold text-amber-950 uppercase tracking-wide block">
                    Status da Solicitação: Fila de Espera
                  </span>
                  <p className="text-amber-900/90 leading-relaxed font-medium">
                    A <strong>Data Agendada</strong> e o <strong>Turno/Horário</strong> serão atribuídos diretamente pela equipe de Regulação do CRSMA. A solicitação ficará mantida na <strong>Fila de Espera</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-2 pt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={temEncaminhamento}
                  onChange={(e) => setTemEncaminhamento(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span>Possui Encaminhamento Físico impresso e assinado em mãos *</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={temCitologicoAnterior}
                  onChange={(e) => setTemCitologicoAnterior(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <span>Trará Laudo do Exame Citológico (Papanicolau) prévio (Obrigatório para Colposcopia)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-900">
                <input
                  type="checkbox"
                  checked={alertaProntuarioDuplo}
                  onChange={(e) => setAlertaProntuarioDuplo(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <span>Possível duplicidade no e-SUS PEC (Avisar recepção do CRSMA para fundir cadastros)</span>
              </label>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-800">Motivo Clínico / Observações Gerais do Encaminhamento</label>
              <textarea
                rows={2}
                placeholder="Descreva o motivo da consulta ou achados clínicos adicionais relevantes..."
                value={observacoesClinicas}
                onChange={(e) => setObservacoesClinicas(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Cadastrar Solicitação CRSMA</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
