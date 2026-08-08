import React, { useState, useEffect } from 'react';
import { Agendamento, EspecialidadeCRSMA, ClassificacaoRisco, PerfilUsuario, TipoConsulta } from '../types';
import {
  ESF_GRUPOS,
  ESPECIALIDADES,
  CONDICOES_VULNERABILIDADE_IMPLANON,
  CLASSIFICACAO_RISCO_LIST,
  DISTRITOS_SANITARIOS,
  getDistritoByUnidade,
} from '../data/constants';
import {
  FilePlus,
  Save,
  ShieldAlert,
  CheckCircle2,
  User,
  Calendar,
  Clock,
  Stethoscope,
  MessageSquare,
  AlertTriangle,
  FileSearch,
  Scissors,
  UserCheck,
  Sparkles,
  RefreshCw,
  Activity,
  Baby,
  Syringe,
  CheckSquare,
  Printer,
  UserPlus,
  RotateCcw,
} from 'lucide-react';

interface AppointmentFormViewProps {
  onSubmit: (agendamento: Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  initialEsf?: string;
  initialSpecialty?: EspecialidadeCRSMA;
  initialPatientData?: Partial<Agendamento>;
  onSuccessNavigate?: () => void;
  perfilUsuario?: PerfilUsuario;
}

export const AppointmentFormView: React.FC<AppointmentFormViewProps> = ({
  onSubmit,
  initialEsf,
  initialSpecialty,
  initialPatientData,
  onSuccessNavigate,
  perfilUsuario = 'SOLICITANTE',
}) => {
  const defaultEsf = initialPatientData?.esfOrigem || initialEsf || DISTRITOS_SANITARIOS[0].unidades[0];
  const defaultSpecialty = initialPatientData?.especialidade || initialSpecialty || 'PRÉ-NATAL DE ALTO RISCO';

  const [dataSolicitacao, setDataSolicitacao] = useState(new Date().toISOString().slice(0, 10));
  const [pacienteNome, setPacienteNome] = useState(initialPatientData?.pacienteNome || '');
  const [cpf, setCpf] = useState(initialPatientData?.cpf || '');
  const [cartaoSus, setCartaoSus] = useState(initialPatientData?.cartaoSus || '');
  const [telefone, setTelefone] = useState(initialPatientData?.telefone || '');
  const [dataNascimento, setDataNascimento] = useState(initialPatientData?.dataNascimento || '');
  const [esfOrigem, setEsfOrigem] = useState(defaultEsf);
  const [distritoSanitario, setDistritoSanitario] = useState(() =>
    getDistritoByUnidade(defaultEsf)
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
  const [especialidade, setEspecialidade] = useState<EspecialidadeCRSMA>(defaultSpecialty);
  const [profissionalSolicitante, setProfissionalSolicitante] = useState(initialPatientData?.profissionalSolicitante || '');
  const [temEncaminhamento, setTemEncaminhamento] = useState(initialPatientData?.temEncaminhamento ?? true);
  const [temCitologicoAnterior, setTemCitologicoAnterior] = useState(initialPatientData?.temCitologicoAnterior ?? true);
  const [observacoesClinicas, setObservacoesClinicas] = useState(initialPatientData?.observacoesClinicas || '');
  const [alertaProntuarioDuplo, setAlertaProntuarioDuplo] = useState(initialPatientData?.alertaProntuarioDuplo || false);

  // Classificação de Risco e Tipo de Atendimento
  const [classificacaoRisco, setClassificacaoRisco] = useState<ClassificacaoRisco>(initialPatientData?.classificacaoRisco || 'VERDE');
  const [tipoConsulta, setTipoConsulta] = useState<TipoConsulta>(initialPatientData?.tipoConsulta || '1a_consulta');

  // Particularidades da Ficha
  const [queixaEspecialidade, setQueixaEspecialidade] = useState(initialPatientData?.queixaEspecialidade || '');
  const [examesEspecialidade, setExamesEspecialidade] = useState(initialPatientData?.examesEspecialidade || '');
  const [historicoEspecialidade, setHistoricoEspecialidade] = useState(initialPatientData?.historicoEspecialidade || '');

  // Implanon - Condições de Vulnerabilidade
  const [condicoesVulnerabilidade, setCondicoesVulnerabilidade] = useState<string[]>(initialPatientData?.condicoesVulnerabilidadeImplanon || []);
  const [outraVulnerabilidade, setOutraVulnerabilidade] = useState(initialPatientData?.outraVulnerabilidadeImplanon || '');

  const handleToggleVulnerabilidade = (item: string) => {
    if (condicoesVulnerabilidade.includes(item)) {
      setCondicoesVulnerabilidade(condicoesVulnerabilidade.filter((c) => c !== item));
    } else {
      setCondicoesVulnerabilidade([...condicoesVulnerabilidade, item]);
    }
  };

  // High-risk Prenatal & Regulation specific fields
  const [dumOuUsgDate, setDumOuUsgDate] = useState(initialPatientData?.dumOuUsgDate || '');
  const [idadeGestacionalInicio, setIdadeGestacionalInicio] = useState(initialPatientData?.idadeGestacionalInicio || '');
  const [fatoresRiscoIdentificados, setFatoresRiscoIdentificados] = useState(initialPatientData?.fatoresRiscoIdentificados || '');
  const [dpp, setDpp] = useState(initialPatientData?.dpp || '');
  const [condutasRealizadasUbs, setCondutasRealizadasUbs] = useState(initialPatientData?.condutasRealizadasUbs || '');
  const [avisoUnidade, setAvisoUnidade] = useState(initialPatientData?.avisoUnidade || '');
  const [avisoCrsma, setAvisoCrsma] = useState(initialPatientData?.avisoCrsma || '');
  const [dataAgendada, setDataAgendada] = useState('');
  const [turnoHorario, setTurnoHorario] = useState('Manhã - 08:00');

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Sync state whenever initialPatientData prop changes dynamically
  useEffect(() => {
    if (initialPatientData) {
      setPacienteNome(initialPatientData.pacienteNome || '');
      setCpf(initialPatientData.cpf || '');
      setCartaoSus(initialPatientData.cartaoSus || '');
      setTelefone(initialPatientData.telefone || '');
      setDataNascimento(initialPatientData.dataNascimento || '');
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
      setTemCitologicoAnterior(initialPatientData.temCitologicoAnterior ?? true);
      setObservacoesClinicas(initialPatientData.observacoesClinicas || '');
      setAlertaProntuarioDuplo(initialPatientData.alertaProntuarioDuplo || false);
      setClassificacaoRisco(initialPatientData.classificacaoRisco || 'VERDE');
      setTipoConsulta(initialPatientData.tipoConsulta || '1a_consulta');
      setQueixaEspecialidade(initialPatientData.queixaEspecialidade || '');
      setExamesEspecialidade(initialPatientData.examesEspecialidade || '');
      setHistoricoEspecialidade(initialPatientData.historicoEspecialidade || '');
      setCondicoesVulnerabilidade(initialPatientData.condicoesVulnerabilidadeImplanon || []);
      setOutraVulnerabilidade(initialPatientData.outraVulnerabilidadeImplanon || '');
      setDumOuUsgDate(initialPatientData.dumOuUsgDate || '');
      setIdadeGestacionalInicio(initialPatientData.idadeGestacionalInicio || '');
      setFatoresRiscoIdentificados(initialPatientData.fatoresRiscoIdentificados || '');
      setDpp(initialPatientData.dpp || '');
      setCondutasRealizadasUbs(initialPatientData.condutasRealizadasUbs || '');
      setAvisoUnidade(initialPatientData.avisoUnidade || '');
      setAvisoCrsma(initialPatientData.avisoCrsma || '');
    }
  }, [initialPatientData]);

  // Auto set Risk classification suggestions based on specialty
  const handleSpecialtyChange = (newEsp: EspecialidadeCRSMA) => {
    setEspecialidade(newEsp);
    if (newEsp === 'PRÉ-NATAL DE ALTO RISCO') {
      setClassificacaoRisco('VERMELHO');
    } else if (newEsp === 'COLPOSCOPIA' || newEsp === 'EXÉRESE DE VERRUGA GENITAL') {
      setClassificacaoRisco('AMARELO');
    } else {
      setClassificacaoRisco('VERDE');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pacienteNome.trim() || !cpf.trim() || !cartaoSus.trim() || !telefone.trim()) {
      alert('Por favor, preencha os campos obrigatórios: Nome Completo (sem abreviações), CPF, CNS (Cartão SUS) e Telefone.');
      return;
    }

    if (!temEncaminhamento) {
      alert('Atenção: O encaminhamento médico/enfermeiro é obrigatório para regulação no CRSMA.');
    }

    const initialStatus = dataAgendada ? 'Agendado' : 'Pendente';

    onSubmit({
      dataSolicitacao: dataSolicitacao || new Date().toISOString().slice(0, 10),
      pacienteNome,
      cpf,
      cartaoSus,
      telefone,
      dataNascimento,
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
      classificacaoRisco,
      tipoConsulta,
      dumOuUsgDate,
      idadeGestacionalInicio,
      fatoresRiscoIdentificados,
      dpp,
      condutasRealizadasUbs,
      avisoUnidade,
      avisoCrsma,
      dataAgendada,
      turnoHorario,
      queixaEspecialidade,
      examesEspecialidade,
      historicoEspecialidade,
      condicoesVulnerabilidadeImplanon: condicoesVulnerabilidade,
      outraVulnerabilidadeImplanon: outraVulnerabilidade,
    });

    setSubmittedSuccess(true);
  };

  const handleReset = () => {
    setPacienteNome('');
    setCpf('');
    setCartaoSus('');
    setTelefone('');
    setDataNascimento('');
    setAcsResponsavel('');
    setObservacoesClinicas('');
    setDumOuUsgDate('');
    setIdadeGestacionalInicio('');
    setFatoresRiscoIdentificados('');
    setDpp('');
    setCondutasRealizadasUbs('');
    setAvisoUnidade('');
    setAvisoCrsma('');
    setDataAgendada('');
    setClassificacaoRisco('VERDE');
    setTipoConsulta('1a_consulta');
    setQueixaEspecialidade('');
    setExamesEspecialidade('');
    setHistoricoEspecialidade('');
    setCondicoesVulnerabilidade([]);
    setOutraVulnerabilidade('');
    setSubmittedSuccess(false);
  };

  if (submittedSuccess) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Solicitação Cadastrada com Sucesso!</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          A ficha de solicitação foi registrada no sistema do CRSMA Araripina e já está disponível na Planilha Geral e na Fila de Regulação.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-bold rounded-md bg-teal-800 text-white hover:bg-teal-900 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-teal-200" />
            <span>Imprimir Ficha Cadastrada</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
          >
            Cadastrar Outra Solicitação
          </button>
          {onSuccessNavigate && (
            <button
              onClick={onSuccessNavigate}
              className="px-4 py-2 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-300"
            >
              Ver na Lista de Pacientes
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* View Header */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <FilePlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
              Formulário Oficial de Regulação &bull; CRSMA Araripina
            </span>
            <h2 className="text-base font-bold text-white">
              Ficha de Regulação: <span className="text-teal-300 uppercase">{especialidade}</span>
            </h2>
          </div>
        </div>

        <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 font-mono">
          PEC / eSF - Araripina PE
        </span>
      </div>

      {/* Guidelines Notice */}
      <div className="p-4 bg-teal-50/60 border-b border-teal-100 text-slate-800 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-teal-900">
            Ficha Individual de Regulação por Especialidade:
          </p>
          <p className="text-slate-600 leading-relaxed">
            Cada ficha possui particularidades essenciais para a identificação do problema e classificação de risco no CRSMA. Preencha detalhadamente os dados específicos abaixo para garantir a correta priorização na Fila de Espera.
          </p>
        </div>
      </div>

      {initialPatientData && initialPatientData.pacienteNome && (
        <div className="mx-6 mt-6 p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-start gap-3 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-blue-950 text-xs uppercase tracking-wider block">
              Dados Pré-Preenchidos da Ficha Anterior
            </span>
            <p className="text-xs text-blue-800 mt-1 leading-relaxed">
              Os dados da paciente <strong>{initialPatientData.pacienteNome}</strong> (CPF: {initialPatientData.cpf || 'Não informado'}), eSF de Origem (<strong>{initialPatientData.esfOrigem || 'UBS'}</strong>), ACS (<strong>{initialPatientData.acsResponsavel || 'Não informado'}</strong>), classificação de risco, questionários e observações clínicas anteriores foram <strong>automaticamente pré-preenchidos</strong> para o retorno à fila de regulação.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Dados Gerais e Paciente */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <User className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Identificação Geral da Paciente e Solicitação
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Data da Solicitação *
              </label>
              <input
                type="date"
                required
                value={dataSolicitacao}
                onChange={(e) => setDataSolicitacao(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nome do Paciente completo e sem abreviações *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Maria Francisca das Chagas Silva"
                value={pacienteNome}
                onChange={(e) => setPacienteNome(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                CPF (Obrigatório) *
              </label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                CNS / Cartão SUS (Obrigatório) *
              </label>
              <input
                type="text"
                required
                placeholder="000 0000 0000 0000"
                value={cartaoSus}
                onChange={(e) => setCartaoSus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Telefone (Obrigatório) *
              </label>
              <input
                type="text"
                required
                placeholder="(87) 99999-8888"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Distrito Sanitário *
              </label>
              <select
                value={distritoSanitario}
                onChange={(e) => handleDistritoChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
              >
                {DISTRITOS_SANITARIOS.map((d) => (
                  <option key={d.nome} value={d.nome}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Unidade eSF / UBS de Origem *
              </label>
              <select
                value={esfOrigem}
                onChange={(e) => setEsfOrigem(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
              >
                {unidadesDoDistrito.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ACS Responsável (Agente de Saúde)
              </label>
              <input
                type="text"
                placeholder="Nome do ACS da microárea"
                value={acsResponsavel}
                onChange={(e) => setAcsResponsavel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Especialidade & Classificação de Risco */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Seleção de Especialidade & Classificação de Risco
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Especialidade / Ficha Solicitada *
              </label>
              <select
                value={especialidade}
                onChange={(e) => handleSpecialtyChange(e.target.value as EspecialidadeCRSMA)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-teal-900 bg-teal-50/50"
              >
                {ESPECIALIDADES.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Profissional Solicitante (Médico/Enfermeiro eSF)
              </label>
              <input
                type="text"
                placeholder="Ex: Dra. Patricia Lima / Enf. Clarice"
                value={profissionalSolicitante}
                onChange={(e) => setProfissionalSolicitante(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Tipo de Atendimento: 1ª Consulta vs Retorno */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-teal-600" />
                <span>TIPO DE ATENDIMENTO DA FICHA *</span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">
                Selecione se é 1ª Consulta ou Consulta de Retorno
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoConsulta('1a_consulta')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  tipoConsulta === '1a_consulta'
                    ? 'bg-teal-50 border-teal-600 text-teal-950 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  tipoConsulta === '1a_consulta' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs tracking-wide text-slate-900">1ª CONSULTA</span>
                    {tipoConsulta === '1a_consulta' && (
                      <span className="bg-teal-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        SELECIONADO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Encaminhamento inicial de paciente para o serviço do CRSMA.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTipoConsulta('retorno')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  tipoConsulta === 'retorno'
                    ? 'bg-purple-50 border-purple-600 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  tipoConsulta === 'retorno' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs tracking-wide text-slate-900">RETORNO</span>
                    {tipoConsulta === 'retorno' && (
                      <span className="bg-purple-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        SELECIONADO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Reavaliação, retorno de exames ou acompanhamento continuado.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Classificação de Risco / Priorização na Regulação */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>CLASSIFICAÇÃO DE RISCO / PRIORIZAÇÃO NA REGULAÇÃO *</span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">
                Prioridade clínica da paciente na regulação
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {CLASSIFICACAO_RISCO_LIST.map((item) => {
                const isSelected = classificacaoRisco === item.cor;
                return (
                  <button
                    key={item.cor}
                    type="button"
                    onClick={() => setClassificacaoRisco(item.cor)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? `${item.corBg} ${item.corBorda} ring-2 ring-teal-500 shadow-xs`
                        : 'bg-white border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-base">{item.emoji}</span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full ${item.corBadge}`}>
                          {item.classificacao}
                        </span>
                      </div>
                      <span className={`text-xs font-black uppercase block ${item.corTexto}`}>
                        {item.cor} &ndash; {item.classificacao}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2 leading-tight">
                      {item.significado}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: PARTICULARIDADES ESPECÍFICAS DA FICHA SELECIONADA */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <FileSearch className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Particularidades da Ficha: {especialidade}
            </h3>
          </div>

          {/* FICHA 1: PRÉ-NATAL DE ALTO RISCO */}
          {(especialidade === 'PRÉ-NATAL DE ALTO RISCO') && (
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-4">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                <Baby className="w-4 h-4 text-rose-600" />
                <span>Dados Obstétricos de Alto Risco</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    DUM ou USG Precoce *
                  </label>
                  <input
                    type="date"
                    value={dumOuUsgDate}
                    onChange={(e) => setDumOuUsgDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Idade Gestacional no Início do Pré-Natal
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 8 semanas e 3 dias"
                    value={idadeGestacionalInicio}
                    onChange={(e) => setIdadeGestacionalInicio(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    DPP (Data Provável do Parto)
                  </label>
                  <input
                    type="date"
                    value={dpp}
                    onChange={(e) => setDpp(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Fatores de Riscos Identificados (DHEG, Diabetes, Idade extremas, Cirurgia uterina) *
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva os fatores de risco obstétrico ou clínicos..."
                  value={fatoresRiscoIdentificados}
                  onChange={(e) => setFatoresRiscoIdentificados(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Condutas e Medicações já iniciadas na UBS
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Prescrito Metildopa, Ácido Fólico, Sulfato Ferroso, encaminhada para exames..."
                  value={condutasRealizadasUbs}
                  onChange={(e) => setCondutasRealizadasUbs(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white font-medium"
                />
              </div>
            </div>
          )}

          {/* FICHA 2: COLPOSCOPIA */}
          {(especialidade === 'COLPOSCOPIA' || especialidade === 'COLPOSCOPIA E PROCEDIMENTOS') && (
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-4">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
                <FileSearch className="w-4 h-4 text-purple-600" />
                <span>Dados de Citologia e Patologia Cervical</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Laudo / Resultado do Exame Citológico (Papanicolau) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: HSIL (Lesão Intraepitelial de Alto Grau), ASC-H, Carcinoma"
                    value={examesEspecialidade}
                    onChange={(e) => setExamesEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Queixas Clínicas Associadas
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sinusorragia (sangramento no coito), Leucorreia, Sangramento intermenstrual"
                    value={queixaEspecialidade}
                    onChange={(e) => setQueixaEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white font-medium"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-100/60 rounded-lg text-xs text-purple-950 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Obrigatório trazer o laudo impresso do Citológico (Papanicolau) no dia do atendimento.</span>
              </div>
            </div>
          )}

          {/* FICHA 3: EXÉRESE DE VERRUGA GENITAL */}
          {(especialidade === 'EXÉRESE DE VERRUGA GENITAL') && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Scissors className="w-4 h-4 text-amber-600" />
                <span>Mapeamento de Lesões e Tratamentos Prévios</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Localização e Extensão das Lesões Genitais *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Vulva, Períneo, Região Perianal, Colo do Útero"
                    value={queixaEspecialidade}
                    onChange={(e) => setQueixaEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tratamentos Tópicos Anteriores Realizados na UBS
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: TCA (Ácido Tricloroacético), Podofilina, Imiquimode - Sem resposta"
                    value={historicoEspecialidade}
                    onChange={(e) => setHistoricoEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FICHA 4: CONSULTA GINECOLÓGICA */}
          {(especialidade === 'CONSULTA GINECOLÓGICA') && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-4">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Sintomatologia Ginecológica Regulada</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Queixa Principal e Tempo de Evolução *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sangramento Uterino Anormal (SUA) há 3 meses / Dor pélvica crônica"
                    value={queixaEspecialidade}
                    onChange={(e) => setQueixaEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Exames Complementares em Mãos (USG Pélvico, Citológico)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: USG pélvico indicando miomatose uterina / Citológico negativo"
                    value={examesEspecialidade}
                    onChange={(e) => setExamesEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FICHA 5: INSERÇÃO DE DIU */}
          {(especialidade === 'INSERÇÃO DE DIU' || especialidade === 'INSERÇÃO E REVISÃO DE DIU') && (
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-4">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Parâmetros de Planejamento Familiar & Inserção do DIU</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Resultado e Data do Beta-HCG (&lt; 7 dias) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Negativo (coletado em 05/08/2026)"
                    value={examesEspecialidade}
                    onChange={(e) => setExamesEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Data da Última Menstruação (DUM)
                  </label>
                  <input
                    type="date"
                    value={dumOuUsgDate}
                    onChange={(e) => setDumOuUsgDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Paridade / Histórico Reprodutivo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Nulípara ou G2 P2 A0"
                    value={historicoEspecialidade}
                    onChange={(e) => setHistoricoEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FICHA 6: REVISÃO DE DIU */}
          {(especialidade === 'REVISÃO DE DIU') && (
            <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-4">
              <div className="flex items-center gap-2 text-cyan-900 font-bold text-xs uppercase tracking-wider">
                <RefreshCw className="w-4 h-4 text-cyan-600" />
                <span>Verificação de Posicionamento e Sintomas do DIU</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Aproximado da Inserção & Fios Visíveis ao Especular
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Inserido há 6 meses na UBS. Fios visíveis no colo."
                    value={historicoEspecialidade}
                    onChange={(e) => setHistoricoEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Sintomas Relatados (Cólicas, Sangramento, Corrimento)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dor pélvica esporádica / Sangramento de escape"
                    value={queixaEspecialidade}
                    onChange={(e) => setQueixaEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FICHA 7: ULTRASSOM OBSTÉTRICO */}
          {(especialidade === 'ULTRASSOM OBSTÉTRICO' || especialidade === 'ULTRASSOM OBSTÉTRICO - FAP') && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Indicação do Exame Ultrassonográfico</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    DUM ou Idade Gestacional Estimada
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 22 semanas de gestação"
                    value={idadeGestacionalInicio}
                    onChange={(e) => setIdadeGestacionalInicio(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Indicação Clínica do USG (Morfológico, Biometria, Oligoidrâmnio, Sangramento)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Avaliação de crescimento fetal e líquido amniótico no 2º trimestre"
                    value={queixaEspecialidade}
                    onChange={(e) => setQueixaEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FICHA ESPECÍFICA: IMPLANTE CONTRACEPTIVO SUBDÉRMICO */}
          {(especialidade === 'Implante contraceptivo subdérmico' || especialidade === 'IMPLANTE CONTRACEPTIVO SUBDÉRMICO' || especialidade === 'INSERÇÃO DE IMPLANON') && (
            <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2.5 text-indigo-900 font-extrabold text-xs uppercase tracking-wider border-b border-indigo-200/60 pb-3">
                <Syringe className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>FICHA ESPECÍFICA &bull; IMPLANTE CONTRACEPTIVO SUBDÉRMICO</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    <span>CONDIÇÕES DE VULNERABILIDADE / PRIORIDADE REPRODUTIVA</span>
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                    Selecione todas que se aplicam
                  </span>
                </div>

                <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                  Marque abaixo as situações de vulnerabilidade ou indicação prioritária para contracepção de longa duração (LARC):
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {CONDICOES_VULNERABILIDADE_IMPLANON.map((condicao, idx) => {
                    const isChecked = condicoesVulnerabilidade.includes(condicao);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-700 font-semibold shadow-xs ring-1 ring-indigo-500'
                            : 'bg-white text-slate-800 border-indigo-200/70 hover:bg-indigo-100/50 hover:border-indigo-300 font-medium'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleVulnerabilidade(condicao)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 shrink-0 cursor-pointer"
                        />
                        <span className="leading-tight">{condicao}</span>
                      </label>
                    );
                  })}
                </div>

                {/* If 'Outra situação de vulnerabilidade' is checked */}
                {condicoesVulnerabilidade.includes('Outra situação de vulnerabilidade') && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-200">
                    <label className="block text-xs font-bold text-indigo-950 mb-1">
                      Especifique a outra situação de vulnerabilidade *
                    </label>
                    <input
                      type="text"
                      placeholder="Descreva a condição de vulnerabilidade da usuária..."
                      value={outraVulnerabilidade}
                      onChange={(e) => setOutraVulnerabilidade(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          )}



          {/* Avisos eSF & CRSMA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                Aviso Unidade (Observação eSF de Origem)
              </label>
              <textarea
                rows={2}
                placeholder="Aviso da eSF para o CRSMA (ex: Cidadã com dificuldade de transporte / Prioridade clínica)"
                value={avisoUnidade}
                onChange={(e) => setAvisoUnidade(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                Aviso CRSMA (Parecer / Orientação da Regulação)
              </label>
              <textarea
                rows={2}
                placeholder="Aviso da Regulação CRSMA para a Unidade (ex: Vaga reservada / Trazer exames anteriores)"
                value={avisoCrsma}
                onChange={(e) => setAvisoCrsma(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Agendamento Preliminar & Horário (Apenas Regulador/Admin pode preencher) */}
          {perfilUsuario !== 'SOLICITANTE' ? (
            <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200 space-y-3">
              <div className="flex items-center justify-between border-b border-teal-200/60 pb-2">
                <h4 className="font-bold text-xs text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Data Agendada e Turno / Horário (Atribuição do Regulador)</span>
                </h4>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-200">
                  Perfil Regulador / Admin
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Data Agendada
                  </label>
                  <input
                    type="date"
                    value={dataAgendada}
                    onChange={(e) => setDataAgendada(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Turno e Horário
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Manhã - 08:30 ou Tarde - 13:30"
                    value={turnoHorario}
                    onChange={(e) => setTurnoHorario(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3 shadow-2xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-950 uppercase tracking-wide">
                    Encaminhamento para Fila de Espera de Regulação
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                    Modo Solicitante (eSF)
                  </span>
                </div>
                <p className="text-amber-900/90 leading-relaxed font-medium">
                  A <strong>Data Agendada</strong> e o <strong>Turno/Horário</strong> serão definidos e atribuídos exclusivamente pela Central de Regulação do CRSMA Araripina após análise do quadro clínico e classificação de risco. Esta solicitação entrará automaticamente na <strong>Fila de Espera</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Encaminhamento Checkbox */}
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={temEncaminhamento}
                onChange={(e) => setTemEncaminhamento(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <span>Possui Encaminhamento Físico impresso e assinado em mãos *</span>
            </label>

            {(especialidade === 'COLPOSCOPIA' || especialidade === 'COLPOSCOPIA E PROCEDIMENTOS') && (
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={temCitologicoAnterior}
                  onChange={(e) => setTemCitologicoAnterior(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span>Possui Exame Citológico (Preventivo) prévio impresso *</span>
              </label>
            )}

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={alertaProntuarioDuplo}
                onChange={(e) => setAlertaProntuarioDuplo(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <span className="text-amber-800 font-semibold">
                Sinalizar Alerta de Prontuário Duplo no e-SUS PEC para verificação
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Motivo Clínico / Observações Gerais do Encaminhamento
            </label>
            <textarea
              rows={3}
              placeholder="Descreva o motivo da consulta ou achados clínicos adicionais relevantes..."
              value={observacoesClinicas}
              onChange={(e) => setObservacoesClinicas(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Limpar Campos
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-xs font-bold rounded-md bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Cadastrar Solicitação CRSMA</span>
          </button>
        </div>
      </form>
    </div>
  );
};
