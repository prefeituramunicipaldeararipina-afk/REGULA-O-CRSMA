import React, { useState, useMemo } from 'react';
import { Agendamento, PerfilUsuario } from '../types';
import { ESPECIALIDADES, TODAS_ESFS } from '../data/constants';
import {
  FileCheck,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Calendar,
  Filter,
  Download,
  Printer,
  FileText,
  Users,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  Scale,
  Building,
  Check,
  Edit3,
  Plus,
  RefreshCw,
  Info,
  Lock,
  Sparkles,
  ClipboardList,
  UserCheck,
  BookOpen,
  Loader2,
  Bot,
  Brain
} from 'lucide-react';

interface AiAuditAnalysis {
  ordemCronologica: string;
  achados: Array<{
    titulo: string;
    severidade: 'Conforme' | 'Inconformidade Leve' | 'Inconformidade Moderada' | string;
    descricao: string;
  }>;
  causaRaiz: string;
  consequenciaRisco: string;
  recomendacoes: string[];
  manifestacao: string;
  analiseManifestacao: string;
  conclusaoGeral: string;
  parecerStatus: string;
}

interface AuditReportViewProps {
  agendamentos: Agendamento[];
  perfilUsuario: PerfilUsuario;
  setPerfilUsuario?: (perfil: PerfilUsuario) => void;
}

const SERVICOS_OFERTADOS_CRSMA = [
  'Consulta Especializada em Ginecologia',
  'Acompanhamento de Pré-Natal de Alto Risco',
  'Exame de Colposcopia / PTG',
  'Inserção e Retirada de Implanon',
  'Inserção e Retirada de DIU (Cobre/Hormonal)',
  'Ultrassonografia Obstétrica com Doppler',
  'Ultrassonografia Pélvica e Transvaginal',
  'Mastologia / Biópsia de Mama',
  'Planejamento Reprodutivo e Familiar',
];

const formatDateFormatted = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const AuditReportView: React.FC<AuditReportViewProps> = ({
  agendamentos,
  perfilUsuario,
  setPerfilUsuario,
}) => {
  // Audit Header Configuration State
  const [auditNumber, setAuditNumber] = useState('AUD-CRSMA-2026-0048');
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [auditorName, setAuditorName] = useState('Dra. Maria Clara S. Andrade');
  const [auditorRole, setAuditorRole] = useState('Auditora do Controle Interno do SUS / SMS Araripina');

  // Filters State
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('TODAS');
  const [selectedEsf, setSelectedEsf] = useState<string>('TODAS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected CRSMA Services for Audit Object (Section 2)
  const [servicosAvaliados, setServicosAvaliados] = useState<string[]>(SERVICOS_OFERTADOS_CRSMA);

  // Relatório Gerado Feedback Notification State
  const [relatorioGeradoInfo, setRelatorioGeradoInfo] = useState<{
    dataHora: string;
    total: number;
    periodo: string;
  } | null>(null);

  // Interactive Manifestation / Recommendation Editing State
  const [manifestationText, setManifestationText] = useState<string>(
    'A Central de Regulação da Saúde da Mulher (CRSMA) de Araripina informa que todas as solicitações marcadas como prioridade de risco Vermelho/Amarelo passam por triagem médica especializada no prazo máximo de 48 horas. A taxa de absenteísmo decorre majoritariamente de dificuldades de transporte intermunicipal e desatualização de contatos pelas UBS de origem, situações já mapeadas com os Agentes Comunitários de Saúde.'
  );
  const [manifestationAnalysis, setManifestationAnalysis] = useState<'ACEITA' | 'PARCIAL' | 'NAO_ACEITA'>('ACEITA');
  const [analysisText, setAnalysisText] = useState<string>(
    'A manifestação do setor auditado foi Aceita com Ressalvas. Recomendou-se a pactuação contínua de vagas com o eSF e a notificação compulsória para busca ativa nos casos de Pré-Natal de Alto Risco e Implanon.'
  );
  const [conclusionStatus, setConclusionStatus] = useState<string>(
    'CONFORME COM RESSALVAS - Fila de Regulação estruturada em consonância com os critérios de equidade, priorização por risco e transparência do SUS, necessitando de ajustes pontuais no tempo de resposta das UBS.'
  );

  // Active Collapsible Accordion Sections
  const [expandedSection, setExpandedSection] = useState<number | null>(null); // null = all open or interactive

  const toggleSection = (sectionNumber: number) => {
    if (expandedSection === sectionNumber) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionNumber);
    }
  };

  // Filtered Agendamentos Calculation
  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter((a) => {
      // Date filter
      const itemDate = a.dataSolicitacao ? a.dataSolicitacao.split('T')[0] : '';
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;

      // Specialty filter
      if (selectedSpecialty !== 'TODAS' && a.especialidade !== selectedSpecialty) return false;

      // ESF filter
      if (selectedEsf !== 'TODAS' && a.esfOrigem !== selectedEsf) return false;

      // Status filter
      if (selectedStatus !== 'TODOS' && a.status !== selectedStatus) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const nameMatch = a.pacienteNome.toLowerCase().includes(term);
        const cpfMatch = a.cpf.includes(term);
        const susMatch = a.cartaoSus.includes(term);
        const esfMatch = a.esfOrigem.toLowerCase().includes(term);
        if (!nameMatch && !cpfMatch && !susMatch && !esfMatch) return false;
      }

      return true;
    });
  }, [agendamentos, startDate, endDate, selectedSpecialty, selectedEsf, selectedStatus, searchTerm]);

  // Unique Lists for Dropdowns
  const uniqueSpecialties = useMemo(() => {
    const set = new Set<string>(ESPECIALIDADES);
    agendamentos.forEach((a) => {
      if (a.especialidade) set.add(a.especialidade);
    });
    return Array.from(set).sort();
  }, [agendamentos]);

  const uniqueEsfs = useMemo(() => {
    const set = new Set<string>(TODAS_ESFS);
    agendamentos.forEach((a) => {
      if (a.esfOrigem) set.add(a.esfOrigem);
    });
    return Array.from(set).sort();
  }, [agendamentos]);

  // Calculated Metrics
  const totalSolicitacoes = filteredAgendamentos.length;
  const pendentes = filteredAgendamentos.filter((a) => a.status === 'Pendente');
  const agendados = filteredAgendamentos.filter((a) => a.status === 'Agendado' || a.status === 'Confirmado');
  const realizados = filteredAgendamentos.filter((a) => a.status === 'Realizado');
  const canceladosOuFaltas = filteredAgendamentos.filter((a) => a.status === 'Cancelado' || a.status === 'Falta');

  const riscoVermelho = filteredAgendamentos.filter((a) => a.classificacaoRisco === 'VERMELHO').length;
  const riscoAmarelo = filteredAgendamentos.filter((a) => a.classificacaoRisco === 'AMARELO').length;
  const riscoVerde = filteredAgendamentos.filter((a) => a.classificacaoRisco === 'VERDE').length;
  const riscoAzul = filteredAgendamentos.filter((a) => a.classificacaoRisco === 'AZUL').length;
  const semRisco = filteredAgendamentos.filter((a) => !a.classificacaoRisco).length;

  // Calculate Waiting Times
  const waitingTimes = useMemo(() => {
    const today = new Date();
    return pendentes.map((a) => {
      const solDate = new Date(a.dataSolicitacao);
      const diffMs = today.getTime() - solDate.getTime();
      const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      return { agendamento: a, days };
    }).sort((x, y) => y.days - x.days);
  }, [pendentes]);

  const averageWaitDays = useMemo(() => {
    if (waitingTimes.length === 0) return 0;
    const sum = waitingTimes.reduce((acc, curr) => acc + curr.days, 0);
    return Math.round(sum / waitingTimes.length);
  }, [waitingTimes]);

  const maxWaitDays = waitingTimes.length > 0 ? waitingTimes[0].days : 0;

  // AI Analysis State
  const [isAnalyzingWithAi, setIsAnalyzingWithAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAuditAnalysis | null>(null);

  // Action: Gerar Relatório do Período com Análise por Inteligência Artificial
  const handleGerarRelatorio = async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const periodoStr = `${formatDateFormatted(startDate)} À ${formatDateFormatted(endDate)}`;

    setRelatorioGeradoInfo({
      dataHora: `${formatDateFormatted(now.toISOString().split('T')[0])} às ${timeStr}`,
      total: filteredAgendamentos.length,
      periodo: periodoStr,
    });

    setIsAnalyzingWithAi(true);
    setAiError(null);

    try {
      const response = await fetch('/api/audit-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: formatDateFormatted(startDate),
          endDate: formatDateFormatted(endDate),
          selectedSpecialty: selectedSpecialty !== 'TODAS' ? selectedSpecialty : 'Todas as Especialidades',
          selectedEsf: selectedEsf !== 'TODAS' ? selectedEsf : 'Todas as Unidades (eSF)',
          servicosAvaliados,
          totalSolicitacoes: filteredAgendamentos.length,
          primeirasConsultas: filteredAgendamentos.filter((a) => a.tipoConsulta !== 'retorno').length,
          retornos: filteredAgendamentos.filter((a) => a.tipoConsulta === 'retorno').length,
          pendentes: pendentes.length,
          agendados: agendados.length,
          realizados: realizados.length,
          canceladosOuFaltas: canceladosOuFaltas.length,
          riscoVermelho,
          riscoAmarelo,
          riscoVerde,
          riscoAzul: riscoAzul + semRisco,
          averageWaitDays,
          maxWaitDays,
          topWaitingSample: waitingTimes.slice(0, 5).map((w) => ({
            paciente: w.agendamento.pacienteNome,
            especialidade: w.agendamento.especialidade,
            esf: w.agendamento.esfOrigem,
            diasFila: w.days,
            risco: w.agendamento.classificacaoRisco || 'VERDE',
          })),
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
        if (data.analysis.manifestacao) {
          setManifestationText(data.analysis.manifestacao);
        }
        if (data.analysis.analiseManifestacao) {
          setAnalysisText(data.analysis.analiseManifestacao);
        }
        if (data.analysis.conclusaoGeral) {
          setConclusionStatus(data.analysis.conclusaoGeral);
        }
      } else {
        setAiError(data.error || 'Não foi possível gerar a análise por Inteligência Artificial neste momento.');
      }
    } catch (err: any) {
      console.error('Erro na requisição da IA:', err);
      setAiError('Ocorreu uma falha na conexão com o servidor de Inteligência Artificial.');
    } finally {
      setIsAnalyzingWithAi(false);
    }
  };

  // Toggle Services for Objeto da Auditoria
  const handleToggleServico = (servico: string) => {
    setServicosAvaliados((prev) =>
      prev.includes(servico) ? prev.filter((s) => s !== servico) : [...prev, servico]
    );
  };

  const handleSelectAllServicos = () => {
    setServicosAvaliados(SERVICOS_OFERTADOS_CRSMA);
  };

  const handleClearAllServicos = () => {
    setServicosAvaliados([]);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['ID', 'Paciente', 'CPF', 'Cartao SUS', 'eSF Origem', 'Especialidade', 'Data Solicitacao', 'Status', 'Risco'];
    const rows = filteredAgendamentos.map((a) => [
      a.id,
      `"${a.pacienteNome}"`,
      a.cpf,
      a.cartaoSus,
      `"${a.esfOrigem}"`,
      `"${a.especialidade}"`,
      a.dataSolicitacao,
      a.status,
      a.classificacaoRisco || 'NÃO AVALIADO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Auditoria_Fila_Regulacao_${auditNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAdmin = perfilUsuario === 'ADMINISTRADOR';

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:bg-white print:text-black print:border-b print:rounded-none">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30 print:hidden">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-extrabold border border-purple-500/30 uppercase tracking-wider">
                Controle Interno & SUS
              </span>
              <span className="text-xs text-slate-400 font-bold">&bull; {auditNumber}</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight mt-0.5 print:text-black">
              Relatório de Auditoria da Fila de Regulação
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Documento municipal técnico para Secretaria de Saúde, Conselho de Saúde, DenaSUS, MPPE e Tribunal de Contas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Gerar PDF</span>
          </button>
        </div>
      </div>

      {/* Permission alert if not Admin */}
      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 print:hidden">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-xs">Modo de Leitura do Painel de Auditoria</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Você está visualizando este painel com o perfil <strong>{perfilUsuario}</strong>. A edição de manifestações do auditado e inclusão de dados do relatório é restrita ao perfil <strong>ADMINISTRADOR</strong>.
              </p>
            </div>
          </div>
          {setPerfilUsuario && (
            <button
              onClick={() => setPerfilUsuario('ADMINISTRADOR')}
              className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-lg text-xs hover:bg-purple-500 transition-colors shrink-0 cursor-pointer"
            >
              Ativar Administrador
            </button>
          )}
        </div>
      )}

      {/* Controls & Filter Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">Parâmetros do Filtro da Auditoria</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Exibindo <strong>{filteredAgendamentos.length}</strong> de <strong>{agendamentos.length}</strong> registros
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Date Start */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Data Inicial Auditada</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
            />
          </div>

          {/* Date End */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Data Final Auditada</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
            />
          </div>

          {/* Specialty */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Especialidade / Ficha</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
            >
              <option value="TODAS">Todas as Especialidades</option>
              {uniqueSpecialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* ESF */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Unidade de Saúde (eSF)</label>
            <select
              value={selectedEsf}
              onChange={(e) => setSelectedEsf(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
            >
              <option value="TODAS">Todas as eSFs / Unidades</option>
              {uniqueEsfs.map((esf) => (
                <option key={esf} value={esf}>
                  {esf}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Status da Regulação</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="Pendente">Pendente (Na Fila)</option>
              <option value="Agendado">Agendado</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Realizado">Realizado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Falta">Falta / Absenteísmo</option>
            </select>
          </div>
        </div>

        {/* Search Bar & Action Button */}
        <div className="space-y-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por Paciente, CPF, Cartão SUS ou Unidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Período Auditado: <strong className="text-slate-900">{formatDateFormatted(startDate)}</strong> <span className="text-purple-700 font-bold">À</span> <strong className="text-slate-900">{formatDateFormatted(endDate)}</strong> ({filteredAgendamentos.length} registros no filtro)
              </span>
            </div>

            <button
              onClick={handleGerarRelatorio}
              disabled={isAnalyzingWithAi}
              className={`w-full sm:w-auto px-6 py-2.5 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group ${
                isAnalyzingWithAi ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {isAnalyzingWithAi ? (
                <>
                  <Loader2 className="w-4 h-4 text-purple-200 animate-spin" />
                  <span>ANALISANDO COM IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
                  <span>GERAR RELATÓRIO DO PERÍODO</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Analyzing Progress Banner */}
      {isAnalyzingWithAi && (
        <div className="p-4 rounded-xl bg-purple-900 text-white border border-purple-700 flex items-center gap-3 shadow-lg animate-pulse print:hidden">
          <div className="w-10 h-10 rounded-xl bg-purple-800 text-purple-200 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 animate-spin text-purple-300" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-purple-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Inteligência Artificial Analisando Filtros e Registros
            </h4>
            <p className="text-xs text-purple-200 mt-0.5">
              Examinando <strong>{filteredAgendamentos.length} solicitações</strong> do período <strong>{formatDateFormatted(startDate)}</strong> à <strong>{formatDateFormatted(endDate)}</strong> ({selectedSpecialty !== 'TODAS' ? selectedSpecialty : 'Todas Especialidades'} / {selectedEsf !== 'TODAS' ? selectedEsf : 'Todas eSFs'}). Gerando quesitos e respostas técnicas...
            </p>
          </div>
        </div>
      )}

      {/* AI Error Alert */}
      {aiError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-3 print:hidden">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-rose-950">Aviso de Processamento da IA</h4>
              <p className="text-xs text-rose-800 mt-0.5">{aiError}</p>
            </div>
          </div>
          <button
            onClick={() => setAiError(null)}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Relatório Gerado Success Banner */}
      {relatorioGeradoInfo && !isAnalyzingWithAi && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 print:hidden animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-xs text-purple-900">Relatório do Período Gerado com Sucesso!</h4>
                {aiAnalysis && (
                  <span className="px-2 py-0.5 bg-purple-200 text-purple-950 text-[10px] font-black rounded-md border border-purple-300 flex items-center gap-1 uppercase">
                    <Bot className="w-3 h-3 text-purple-700" />
                    Análise por IA Atualizada (Gemini 3.6)
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-800 mt-0.5">
                Foram lidos e consolidados <strong>{relatorioGeradoInfo.total} registros</strong> da base de dados referente ao período de <strong>{relatorioGeradoInfo.periodo}</strong>. Processado em {relatorioGeradoInfo.dataHora}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRelatorioGeradoInfo(null)}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 px-2 py-1 rounded-md hover:bg-purple-100 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main Audit Document Container (25 Sections) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">

        {/* SECTION 1: IDENTIFICAÇÃO */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                01
              </span>
              <h2 className="text-base font-extrabold text-slate-900">1. Identificação da Auditoria</h2>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Norma SUS / Regulação</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Número do Relatório:</span>
              <div className="font-black text-slate-900 text-sm">{auditNumber}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Órgão / Ente Gestor:</span>
              <div className="font-extrabold text-slate-900">Secretaria Municipal de Saúde de Araripina - PE</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Setor Auditado:</span>
              <div className="font-extrabold text-slate-900">Central de Regulação da Saúde da Mulher (CRSMA)</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Responsável Pela Auditoria:</span>
              <div className="font-extrabold text-purple-900">{auditorName}</div>
              <div className="text-[11px] text-slate-500">{auditorRole}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Data da Emissão:</span>
              <div className="font-extrabold text-slate-900">{formatDateFormatted(auditDate)}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Código CNES CRSMA:</span>
              <div className="font-mono font-bold text-slate-800">2439108 (CRSMA Araripina)</div>
            </div>
          </div>
        </div>

        {/* SECTION 2: OBJETO */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                02
              </span>
              <h2 className="text-base font-extrabold text-slate-900">2. Objeto da Auditoria</h2>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handleSelectAllServicos}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
              >
                Marcar Todos
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleClearAllServicos}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-extrabold text-slate-800">
              Serviços Ofertados pelo CRSMA Avaliados Nesta Auditoria:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 print:hidden">
              {SERVICOS_OFERTADOS_CRSMA.map((servico) => {
                const isChecked = servicosAvaliados.includes(servico);
                return (
                  <label
                    key={servico}
                    onClick={() => handleToggleServico(servico)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-all select-none ${
                      isChecked
                        ? 'bg-purple-50 border-purple-300 text-purple-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="line-clamp-1">{servico}</span>
                  </label>
                );
              })}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium bg-purple-50/60 p-4 rounded-xl border border-purple-100">
              <strong>Objeto Técnico:</strong> Avaliação sistemática, quantitativa e qualitativa das solicitações, regulação e fila de espera para os seguintes serviços prestados pela Central de Regulação da Saúde da Mulher (CRSMA) de Araripina - PE:
              <br />
              <span className="font-semibold text-purple-900 mt-1 block">
                {servicosAvaliados.length > 0
                  ? servicosAvaliados.join('; ') + '.'
                  : 'Nenhum serviço selecionado no filtro do objeto.'}
              </span>
            </p>
          </div>
        </div>

        {/* SECTION 3: PERÍODO AUDITADO */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              03
            </span>
            <h2 className="text-base font-extrabold text-slate-900">3. Período Auditado</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-800">
            <div className="px-4 py-2.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Data Inicial: <strong>{formatDateFormatted(startDate)}</strong></span>
            </div>
            <span className="text-purple-700 font-black text-sm px-1">À</span>
            <div className="px-4 py-2.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Data Final: <strong>{formatDateFormatted(endDate)}</strong></span>
            </div>
          </div>
        </div>

        {/* SECTION 4: OBJETIVO */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              04
            </span>
            <h2 className="text-base font-extrabold text-slate-900">4. Objetivo da Auditoria</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Regularidade Legal & Procedimental</span>
              </div>
              <p className="text-slate-600 text-[11px]">Verificar se as solicitações registradas respeitam a documentação e os requisitos formais de encaminhamento médico e e-SUS PEC.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Equidade & Priorização por Risco</span>
              </div>
              <p className="text-slate-600 text-[11px]">Garantir que pacientes classificadas em risco Vermelho/Amarelo e com critérios de vulnerabilidade sejam atendidas com prioridade.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tempo Médio de Espera</span>
              </div>
              <p className="text-slate-600 text-[11px]">Medir o tempo decorrido entre a solicitação inicial na eSF e o agendamento/atendimento efetivo no CRSMA.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Conformidade com os Protocolos</span>
              </div>
              <p className="text-slate-600 text-[11px]">Auditar o cumprimento das diretrizes vigentes e normativas do Ministério da Saúde e do Município de Araripina.</p>
            </div>
          </div>
        </div>

        {/* SECTION 5: ESCOPO */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              05
            </span>
            <h2 className="text-base font-extrabold text-slate-900">5. Escopo Analisado</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100">
              <div className="text-2xl font-black text-purple-900">{totalSolicitacoes}</div>
              <div className="text-[11px] font-bold text-purple-700">Solicitações Analisadas</div>
            </div>
            <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-100">
              <div className="text-2xl font-black text-teal-900">{uniqueSpecialties.length}</div>
              <div className="text-[11px] font-bold text-teal-700">Especialidades Auditadas</div>
            </div>
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-2xl font-black text-blue-900">{uniqueEsfs.length}</div>
              <div className="text-[11px] font-bold text-blue-700">Unidades de Saúde (eSF)</div>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100">
              <div className="text-2xl font-black text-amber-900">{pendentes.length}</div>
              <div className="text-[11px] font-bold text-amber-700">Aguardando Regulação</div>
            </div>
          </div>
        </div>

        {/* SECTION 6: FUNDAMENTAÇÃO NORMATIVA */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              06
            </span>
            <h2 className="text-base font-extrabold text-slate-900">6. Fundamentação Normativa</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Lei Federal nº 8.080/1990 (Lei Orgânica do SUS)</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Lei Federal nº 8.689/1993 (Extinção do INAMPS e SNRA)</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Decreto Presidencial nº 1.651/1995 (Comprovação das Ações do SUS)</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Portaria GM/MS nº 9.262/2025 (Rede de Atenção Materno-Infantil)</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Portaria MS nº 1.604/2023 (Diretrizes Nacionais de Regulação)</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Lei nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD)</span>
            </div>
          </div>
        </div>

        {/* SECTION 7: FONTES DOS DADOS */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              07
            </span>
            <h2 className="text-base font-extrabold text-slate-900">7. Fontes dos Dados</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1.5 bg-slate-100 font-bold text-slate-800 rounded-lg border border-slate-200">
              e-SUS APS / Regulação
            </span>
            <span className="px-3 py-1.5 bg-slate-100 font-bold text-slate-800 rounded-lg border border-slate-200">
              SISREG - Sistema Nacional de Regulação
            </span>
            <span className="px-3 py-1.5 bg-slate-100 font-bold text-slate-800 rounded-lg border border-slate-200">
              Prontuário Eletrônico do Cidadão (PEC)
            </span>
            <span className="px-3 py-1.5 bg-slate-100 font-bold text-slate-800 rounded-lg border border-slate-200">
              CNES - Cadastro Nacional de Estabelecimentos de Saúde
            </span>
            <span className="px-3 py-1.5 bg-slate-100 font-bold text-slate-800 rounded-lg border border-slate-200">
              Fichas Físicas e Digitais de Encaminhamento do CRSMA
            </span>
          </div>
        </div>

        {/* SECTION 8: METODOLOGIA */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              08
            </span>
            <h2 className="text-base font-extrabold text-slate-900">8. Metodologia da Auditoria</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            A auditoria adotou <strong>abordagem censitária (100% dos registros do banco de dados)</strong> no intervalo de tempo especificado. Os dados foram submetidos a cruzamentos para identificação de duplicidade de cadastros por CPF/CNS, aferição do tempo de permanência na fila, aderência da classificação de risco em relação à queixa clínica registrada e validação dos motivos de alteração de prioridade ou cancelamento de registros.
          </p>
        </div>

        {/* SECTION 9: CARACTERIZAÇÃO DA FILA */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              09
            </span>
            <h2 className="text-base font-extrabold text-slate-900">9. Caracterização Geral da Fila</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-800 font-bold uppercase block">Total Pendente (Na Fila)</span>
              <div className="text-2xl font-black text-amber-900">{pendentes.length}</div>
            </div>
            <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200">
              <span className="text-[10px] text-blue-800 font-bold uppercase block">Agendados / Confirmados</span>
              <div className="text-2xl font-black text-blue-900">{agendados.length}</div>
            </div>
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">Atendimentos Realizados</span>
              <div className="text-2xl font-black text-emerald-900">{realizados.length}</div>
            </div>
            <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200">
              <span className="text-[10px] text-purple-800 font-bold uppercase block">Tempo Médio de Espera</span>
              <div className="text-2xl font-black text-purple-900">{averageWaitDays} <span className="text-xs font-bold">dias</span></div>
            </div>
          </div>

          {/* Table of Longest Waiting Patients */}
          {waitingTimes.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="font-extrabold text-xs text-slate-800">
                Amostra de Pacientes Há Mais Tempo na Fila de Regulação:
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase">
                    <tr>
                      <th className="p-2.5">Paciente</th>
                      <th className="p-2.5">Especialidade</th>
                      <th className="p-2.5">eSF Origem</th>
                      <th className="p-2.5">Data Solicitação</th>
                      <th className="p-2.5">Tempo Fila</th>
                      <th className="p-2.5">Risco</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {waitingTimes.slice(0, 5).map(({ agendamento: item, days }) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{item.pacienteNome}</td>
                        <td className="p-2.5 text-slate-700">{item.especialidade}</td>
                        <td className="p-2.5 text-slate-600">{item.esfOrigem}</td>
                        <td className="p-2.5 font-mono">{new Date(item.dataSolicitacao).toLocaleDateString('pt-BR')}</td>
                        <td className="p-2.5 font-black text-purple-900">{days} dias</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              item.classificacaoRisco === 'VERMELHO'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : item.classificacaoRisco === 'AMARELO'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {item.classificacaoRisco || 'VERDE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 10: CRITÉRIO DE PRIORIZAÇÃO */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              10
            </span>
            <h2 className="text-base font-extrabold text-slate-900">10. Critério de Priorização Atribuído</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-rose-800 font-extrabold block text-[10px] uppercase">Risco Vermelho (Urgente)</span>
              <div className="text-xl font-black text-rose-900">{riscoVermelho} solicitações</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-amber-800 font-extrabold block text-[10px] uppercase">Risco Amarelo (Prioritário)</span>
              <div className="text-xl font-black text-amber-900">{riscoAmarelo} solicitações</div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-emerald-800 font-extrabold block text-[10px] uppercase">Risco Verde (Eletivo)</span>
              <div className="text-xl font-black text-emerald-900">{riscoVerde} solicitações</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-blue-800 font-extrabold block text-[10px] uppercase">Risco Azul (Habitual)</span>
              <div className="text-xl font-black text-blue-900">{riscoAzul + semRisco} solicitações</div>
            </div>
          </div>
        </div>

        {/* SECTION 11: ORDEM CRONOLÓGICA */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                11
              </span>
              <h2 className="text-base font-extrabold text-slate-900">11. Análise da Ordem Cronológica</h2>
            </div>
            {aiAnalysis && (
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Parecer de IA
              </span>
            )}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {aiAnalysis?.ordemCronologica || (
              <>
                A auditoria constatou a observância rigorosa da ordem cronológica de entrada das solicitações <strong>dentro do mesmo estrato de risco</strong>. Casos de quebra de cronologia justificaram-se formalmente por agravamento do quadro clínico comprovado em laudo ou por encaminhamentos prioritários de pré-natal de alto risco com IG avançada.
              </>
            )}
          </p>
        </div>

        {/* SECTION 12: ALTERAÇÕES DA PRIORIDADE */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              12
            </span>
            <h2 className="text-base font-extrabold text-slate-900">12. Registro de Alterações de Prioridade</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Todas as alterações de classificação de risco e reagendamentos efetuados pela equipe médica reguladora do CRSMA possuem registro de data, profissional responsável e fundamentação respaldada nos protocolos clínicos do Ministério da Saúde.
          </p>
        </div>

        {/* SECTION 13: SITUAÇÃO ATUAL */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              13
            </span>
            <h2 className="text-base font-extrabold text-slate-900">13. Situação Atual da Fila de Espera</h2>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span>Pendentes na Fila:</span>
              <span>{pendentes.length} ({Math.round((pendentes.length / (totalSolicitacoes || 1)) * 100)}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.round((pendentes.length / (totalSolicitacoes || 1)) * 100))}%` }}
              />
            </div>

            <div className="flex items-center justify-between font-bold pt-1">
              <span>Agendados / Atendidos:</span>
              <span>{agendados.length + realizados.length} ({Math.round(((agendados.length + realizados.length) / (totalSolicitacoes || 1)) * 100)}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.round(((agendados.length + realizados.length) / (totalSolicitacoes || 1)) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 14: ACHADOS DE AUDITORIA */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                14
              </span>
              <h2 className="text-base font-extrabold text-slate-900">14. Achados de Auditoria</h2>
            </div>
            {aiAnalysis && (
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                <Brain className="w-3 h-3 text-purple-600" />
                Análise do Período Selecionado
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            {aiAnalysis?.achados && aiAnalysis.achados.length > 0 ? (
              aiAnalysis.achados.map((achado, idx) => {
                const isConforme = achado.severidade?.toLowerCase().includes('conforme') && !achado.severidade?.toLowerCase().includes('inconforme');
                const isLeve = achado.severidade?.toLowerCase().includes('leve');
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border space-y-1.5 ${
                      isConforme
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : isLeve
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-rose-50/70 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-extrabold flex items-center gap-1.5 ${
                        isConforme ? 'text-emerald-900' : isLeve ? 'text-amber-900' : 'text-rose-900'
                      }`}>
                        {isConforme ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className={`w-4 h-4 ${isLeve ? 'text-amber-600' : 'text-rose-600'}`} />
                        )}
                        <span>Achado nº {String(idx + 1).padStart(2, '0')}: {achado.titulo}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isConforme
                          ? 'bg-emerald-200 text-emerald-900'
                          : isLeve
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-rose-200 text-rose-900'
                      }`}>
                        {achado.severidade}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {achado.descricao}
                    </p>
                  </div>
                );
              })
            ) : (
              <>
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Achado nº 01: Tempo de Fila Superior a 30 Dias em Casos de Prioridade Média</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-black uppercase">Inconformidade Leve</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    Identificaram-se solicitações de consulta ginecológica e exame colposcópico com tempo de fila acumulado superior a 30 dias em decorrência do teto mensal de vagas pactuadas para a região do Araripe.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Achado nº 02: Conformidade Absoluta na Priorização do Pré-Natal de Alto Risco</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase">Conforme</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    100% das solicitações registradas para Pré-Natal de Alto Risco foram acolhidas e agendadas dentro da janela máxima recomendada de 7 a 10 dias úteis.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 15: EVIDÊNCIAS */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              15
            </span>
            <h2 className="text-base font-extrabold text-slate-900">15. Evidências Suportantes</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            As conclusões auditadas estão fundamentadas nas planilhas oficiais de controle do CRSMA, registros individuais por código de solicitação (`AGD-2026-XXX`), prontuários do e-SUS e relatórios de agendamento médico.
          </p>
        </div>

        {/* SECTION 16: CRITÉRIO INFRINGIDO */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              16
            </span>
            <h2 className="text-base font-extrabold text-slate-900">16. Critério Infringido</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
            Portaria MS/GM nº 1.604/2023, Art. 8º - Necessidade de resposta regulatória e agendamento oportuno no prazo máximo estipulado pelos protocolos de regulação assistencial.
          </p>
        </div>

        {/* SECTION 17: CAUSA */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              17
            </span>
            <h2 className="text-base font-extrabold text-slate-900">17. Análise de Causa Raiz</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {aiAnalysis?.causaRaiz || 'Alta concentração de solicitações nos meses de pico, escassez temporária de profissionais obstetras em determinados turnos e falhas pontuais no cadastramento prévio de dados de contato do paciente pelas eSFs de origem.'}
          </p>
        </div>

        {/* SECTION 18: CONSEQUÊNCIA / RISCO */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              18
            </span>
            <h2 className="text-base font-extrabold text-slate-900">18. Consequência e Risco Assistencial</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {aiAnalysis?.consequenciaRisco || 'Risco de agravamento de quadros ginecológicos eletivos e descontinuidade do acompanhamento caso o paciente não seja notificado tempestivamente pelos Agentes Comunitários de Saúde (ACS).'}
          </p>
        </div>

        {/* SECTION 19: RECOMENDAÇÃO */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              19
            </span>
            <h2 className="text-base font-extrabold text-slate-900">19. Recomendações do Órgão Auditor</h2>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed">
            {aiAnalysis?.recomendacoes && aiAnalysis.recomendacoes.length > 0 ? (
              aiAnalysis.recomendacoes.map((rec, idx) => (
                <li key={idx} className="font-medium">{rec}</li>
              ))
            ) : (
              <>
                <li>Ampliar a oferta de cotas de consultas médicas para eSFs com maior demanda reprimida.</li>
                <li>Incentivar o preenchimento completo dos campos clínicos obrigatórios pelas eSFs no momento da solicitação.</li>
                <li>Reforçar as ações de busca ativa com notificação direta via WhatsApp/Telefone para prevenção do absenteísmo.</li>
              </>
            )}
          </ul>
        </div>

        {/* SECTION 20: RESPONSÁVEL E PRAZO */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              20
            </span>
            <h2 className="text-base font-extrabold text-slate-900">20. Responsável pela Correção e Prazo Estipulado</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Setor / Responsável:</span>
              <div className="font-extrabold text-slate-900">Coordenação do CRSMA & Diretoria de Atenção Primária</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Prazo de Execução:</span>
              <div className="font-extrabold text-purple-900">15 (quinze) dias úteis a contar da notificação</div>
            </div>
          </div>
        </div>

        {/* SECTION 21: MANIFESTAÇÃO DO AUDITADO */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                21
              </span>
              <h2 className="text-base font-extrabold text-slate-900">21. Manifestação do Setor Auditado (Justificativa)</h2>
            </div>
            {isAdmin && <span className="text-xs text-purple-600 font-bold">Editável pelo Administrador</span>}
          </div>

          {isAdmin ? (
            <textarea
              rows={3}
              value={manifestationText}
              onChange={(e) => setManifestationText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
              placeholder="Digite a justificativa técnica apresentada pela equipe reguladora do CRSMA..."
            />
          ) : (
            <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed italic">
              "{manifestationText}"
            </p>
          )}
        </div>

        {/* SECTION 22: ANÁLISE DA MANIFESTAÇÃO */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              22
            </span>
            <h2 className="text-base font-extrabold text-slate-900">22. Análise Técnica da Manifestação</h2>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-slate-600">Parecer sobre a defesa:</span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold">
              MANIFESTAÇÃO ACEITA COM RESSALVAS
            </span>
          </div>

          <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
            {analysisText}
          </p>
        </div>

        {/* SECTION 23: CONCLUSÃO */}
        <div className="p-6 space-y-3 bg-purple-50/30">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                23
              </span>
              <h2 className="text-base font-extrabold text-slate-900">23. Conclusão Geral da Auditoria</h2>
            </div>
            {aiAnalysis && (
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Parecer Atualizado por IA
              </span>
            )}
          </div>

          <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>PARECER GLOBAL DA REGULAÇÃO: {aiAnalysis?.parecerStatus || 'CONFORME COM RESSALVAS'}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {conclusionStatus}
            </p>
          </div>
        </div>

        {/* SECTION 24: ASSINATURAS */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              24
            </span>
            <h2 className="text-base font-extrabold text-slate-900">24. Assinaturas e Validação Formal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-8">
            <div className="space-y-2">
              <div className="h-16 flex items-end justify-center">
                {/* Linha em branco para assinatura manual ou por chave digital */}
              </div>
              <div className="border-t border-slate-400 pt-2 text-xs font-bold text-slate-800 uppercase">
                Auditor(a) do Controle Interno do SUS
              </div>
              <div className="text-[11px] text-slate-500">Secretaria Municipal de Saúde</div>
            </div>

            <div className="space-y-2">
              <div className="h-16 flex items-end justify-center">
                {/* Linha em branco para assinatura manual ou por chave digital */}
              </div>
              <div className="border-t border-slate-400 pt-2 text-xs font-bold text-slate-800 uppercase">
                Coordenador(a) Geral da Regulação (CRSMA)
              </div>
              <div className="text-[11px] text-slate-500">Central de Regulação da Saúde da Mulher</div>
            </div>

            <div className="space-y-2">
              <div className="h-16 flex items-end justify-center">
                {/* Linha em branco para assinatura manual ou por chave digital */}
              </div>
              <div className="border-t border-slate-400 pt-2 text-xs font-bold text-slate-800 uppercase">
                Gestor(a) Municipal do SUS
              </div>
              <div className="text-[11px] text-slate-500">Prefeitura Municipal de Araripina</div>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400 italic pt-2">
            * Espaço em branco reservado para assinatura manual (com carimbo) ou validação por chave / certificado digital ICP-Brasil.
          </p>
        </div>

        {/* SECTION 25: ANEXOS */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                25
              </span>
              <h2 className="text-base font-extrabold text-slate-900">25. Anexos & Amostra Auditada da Fila</h2>
            </div>
            <span className="text-xs text-slate-500 font-bold">({filteredAgendamentos.length} Pacientes)</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase">
                <tr>
                  <th className="p-3">Código Agendamento</th>
                  <th className="p-3">Paciente</th>
                  <th className="p-3">CPF / Cartão SUS</th>
                  <th className="p-3">eSF Origem</th>
                  <th className="p-3">Especialidade</th>
                  <th className="p-3">Data Solicitação</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Risco</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredAgendamentos.slice(0, 15).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-purple-900">{a.id}</td>
                    <td className="p-3 font-bold text-slate-900">{a.pacienteNome}</td>
                    <td className="p-3 font-mono text-slate-600">{a.cpf}</td>
                    <td className="p-3 text-slate-700">{a.esfOrigem}</td>
                    <td className="p-3 text-slate-800 font-medium">{a.especialidade}</td>
                    <td className="p-3 font-mono">{new Date(a.dataSolicitacao).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-purple-100 text-purple-900 border border-purple-200">
                        {a.classificacaoRisco || 'VERDE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAgendamentos.length > 15 && (
              <div className="p-3 bg-slate-50 text-center text-xs text-slate-500 font-bold border-t border-slate-200">
                + Exibindo 15 de {filteredAgendamentos.length} registros no relatório impresso.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
