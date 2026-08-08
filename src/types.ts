export type StatusRegulacao =
  | 'Pendente'
  | 'Agendado'
  | 'Confirmado'
  | 'Realizado'
  | 'Cancelado'
  | 'Falta'
  | 'Reagendado';

export type EspecialidadeCRSMA =
  | 'PRÉ-NATAL DE ALTO RISCO'
  | 'COLPOSCOPIA'
  | 'EXÉRESE DE VERRUGA GENITAL'
  | 'CONSULTA GINECOLÓGICA'
  | 'INSERÇÃO DE DIU'
  | 'REVISÃO DE DIU'
  | 'ULTRASSOM OBSTÉTRICO'
  | 'Implante contraceptivo subdérmico'
  | 'IMPLANTE CONTRACEPTIVO SUBDÉRMICO'
  | 'INSERÇÃO DE IMPLANON'
  | 'COLPOSCOPIA E PROCEDIMENTOS'
  | 'INSERÇÃO E REVISÃO DE DIU'
  | 'ULTRASSOM OBSTÉTRICO - FAP';

export type ClassificacaoRisco = 'VERMELHO' | 'AMARELO' | 'VERDE' | 'AZUL';

export type TipoConsulta = '1a_consulta' | 'retorno';

export type PerfilUsuario = 'SOLICITANTE' | 'REGULADOR' | 'ADMINISTRADOR';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cnesUnidade?: string;
  cpfOuCnes?: string;
  unidadeOuOrgao: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  criadoEm: string;
  ultimoAcesso?: string;
  senha?: string;
}

export interface Agendamento {
  id: string;
  pacienteNome: string;
  cpf: string;
  cartaoSus: string;
  dataNascimento: string;
  idade?: number;
  telefone: string;
  esfOrigem: string;
  acsResponsavel: string;
  especialidade: EspecialidadeCRSMA;
  profissionalSolicitante: string;
  temEncaminhamento: boolean;
  temCitologicoAnterior: boolean;
  observacoesClinicas: string;
  dataSolicitacao: string;
  dataAgendada?: string; // YYYY-MM-DD
  turnoHorario?: string; // Shift & Time (e.g. Manhã - 08:30)
  medicoCRSMA?: string;
  status: StatusRegulacao;
  buscaAtivaRealizada: boolean;
  comunicadoUnidade?: string;
  alertaProntuarioDuplo?: boolean;

  // Classificação de Risco e Tipo de Consulta do CRSMA
  classificacaoRisco?: ClassificacaoRisco;
  tipoConsulta?: TipoConsulta;

  // Specific fields for Pré-Natal de Alto Risco & Regulação CRSMA
  dumOuUsgDate?: string; // DUM ou USG (data da IG na USG mais precoce)
  idadeGestacionalInicio?: string; // Idade gestacional que iniciou o pré-natal
  fatoresRiscoIdentificados?: string; // Fatores de riscos identificados
  dpp?: string; // Data Provável do Parto (DPP)
  condutasRealizadasUbs?: string; // Condutas realizadas na UBS
  avisoUnidade?: string; // Aviso Unidade
  avisoCrsma?: string; // Aviso CRSMA

  // Particularidades por Ficha
  queixaEspecialidade?: string;
  examesEspecialidade?: string;
  historicoEspecialidade?: string;

  // Implanon - Condições de Vulnerabilidade / Prioridade Reprodutiva
  condicoesVulnerabilidadeImplanon?: string[];
  outraVulnerabilidadeImplanon?: string;

  criadoEm: string;
  atualizadoEm: string;
}

export interface EsfGrupo {
  grupo: string;
  unidades: string[];
}

export interface RegraCRSMA {
  id: string;
  titulo: string;
  descricao: string;
  iconeName: string;
  severidade: 'importante' | 'alerta' | 'info';
}
