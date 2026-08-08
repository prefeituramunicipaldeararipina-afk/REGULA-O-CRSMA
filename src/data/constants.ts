import { EspecialidadeCRSMA, EsfGrupo, RegraCRSMA, ClassificacaoRisco } from '../types';

export interface ClassificacaoRiscoInfo {
  cor: ClassificacaoRisco;
  prioridade: number;
  classificacao: string;
  significado: string;
  emoji: string;
  corBadge: string;
  corBg: string;
  corTexto: string;
  corBorda: string;
  corDot: string;
}

export const CLASSIFICACAO_RISCO_MAP: Record<ClassificacaoRisco, ClassificacaoRiscoInfo> = {
  VERMELHO: {
    cor: 'VERMELHO',
    prioridade: 0,
    classificacao: 'PRIORIDADE 0',
    significado: 'situação clínica grave, que necessita de agendamento com prioridade máxima.',
    emoji: '🔴',
    corBadge: 'bg-rose-600 text-white font-extrabold',
    corBg: 'bg-rose-50',
    corTexto: 'text-rose-950',
    corBorda: 'border-rose-300',
    corDot: 'bg-rose-600',
  },
  AMARELO: {
    cor: 'AMARELO',
    prioridade: 1,
    classificacao: 'PRIORIDADE 1',
    significado: 'situação clínica que necessita de atendimento prioritário, o mais breve possível.',
    emoji: '🟡',
    corBadge: 'bg-amber-400 text-slate-950 font-extrabold',
    corBg: 'bg-amber-50',
    corTexto: 'text-amber-950',
    corBorda: 'border-amber-300',
    corDot: 'bg-amber-500',
  },
  VERDE: {
    cor: 'VERDE',
    prioridade: 2,
    classificacao: 'PRIORIDADE 2',
    significado: 'situação prioritária, porém não urgente, podendo aguardar conforme disponibilidade e protocolo da especialidade.',
    emoji: '🟢',
    corBadge: 'bg-emerald-600 text-white font-extrabold',
    corBg: 'bg-emerald-50',
    corTexto: 'text-emerald-950',
    corBorda: 'border-emerald-300',
    corDot: 'bg-emerald-600',
  },
  AZUL: {
    cor: 'AZUL',
    prioridade: 3,
    classificacao: 'PRIORIDADE 3',
    significado: 'atendimento eletivo, sem critérios clínicos de prioridade.',
    emoji: '🔵',
    corBadge: 'bg-blue-600 text-white font-extrabold',
    corBg: 'bg-blue-50',
    corTexto: 'text-blue-950',
    corBorda: 'border-blue-300',
    corDot: 'bg-blue-600',
  },
};

export const CLASSIFICACAO_RISCO_LIST: ClassificacaoRiscoInfo[] = Object.values(CLASSIFICACAO_RISCO_MAP);

export interface DistritoSanitario {
  nome: string;
  unidades: string[];
}

export const DISTRITOS_SANITARIOS: DistritoSanitario[] = [
  {
    nome: 'DISTRITO SANITÁRIO I',
    unidades: [
      'eSF Vila Serrania I',
      'eSF Vila Serrânia II',
      'eSF Feira Nova',
      'eSF Cavaco',
      'eSF Serra do Jardim',
      'eSF Vila Conceição',
      'eSF Serra da Torre I',
      'eSF Serra da Torre II',
      'eSF Cavalete',
      'eSF Cohab',
    ],
  },
  {
    nome: 'DISTRITO SANITÁRIO II',
    unidades: [
      'eSF Centro I',
      'eSF Centro II',
      'eSF Centro III',
      'eSF Santa Bárbara',
      'eSF José Martins',
      'eSF Alto da Boa Vista I',
      'eSF Alto da Boa Vista II',
      'eSF Alto da Boa Vista III',
      'eSF Nossa Senhora do Carmo',
      'eSF Sitio Santana',
    ],
  },
  {
    nome: 'DISTRITO SANITÁRIO III',
    unidades: [
      'eSF Vila Santa Maria I',
      'eSF Vila Santa Maria II',
      'eSF Bom Jardim do Araripe',
      'eSF Lagoa de Dentro',
      'eSF Gergelim I',
      'eSF Gergelim II',
      'eSF Nascente I',
      'eSF Nascente II',
      'eSF Sipaúba',
      'eSF Lagoa do Barro',
      'eSF Morais I',
      'eSF Morais II',
    ],
  },
];

export const ESF_GRUPOS: EsfGrupo[] = [
  ...DISTRITOS_SANITARIOS.map((d) => ({
    grupo: d.nome,
    unidades: d.unidades,
  })),
  {
    grupo: 'SOLICITANTE CENTRAL',
    unidades: ['Secretaria Municipal de Saúde'],
  },
];

export const TODAS_ESFS: string[] = [
  ...DISTRITOS_SANITARIOS.flatMap((d) => d.unidades),
  'Secretaria Municipal de Saúde',
];

export function getDistritoByUnidade(unidade: string): string {
  if (!unidade) return DISTRITOS_SANITARIOS[0].nome;
  if (unidade.toLowerCase().includes('secretaria')) {
    return 'DISTRITO SANITÁRIO II';
  }
  const norm = unidade.toLowerCase().trim();
  const found = DISTRITOS_SANITARIOS.find((d) =>
    d.unidades.some((u) => {
      const uNorm = u.toLowerCase().trim();
      return uNorm === norm || norm.includes(uNorm) || uNorm.includes(norm);
    })
  );
  return found ? found.nome : DISTRITOS_SANITARIOS[0].nome;
}

export const ESPECIALIDADES: EspecialidadeCRSMA[] = [
  'PRÉ-NATAL DE ALTO RISCO',
  'COLPOSCOPIA',
  'EXÉRESE DE VERRUGA GENITAL',
  'CONSULTA GINECOLÓGICA',
  'INSERÇÃO DE DIU',
  'REVISÃO DE DIU',
  'ULTRASSOM OBSTÉTRICO',
  'IMPLANTE CONTRACEPTIVO SUBDÉRMICO',
];

export const CONDICOES_VULNERABILIDADE_IMPLANON = [
  'Situação de rua',
  'Privação de liberdade',
  'Trabalho sexual',
  'Adolescente',
  'Pós-parto',
  'Pós-abortamento',
  'História de gravidez não planejada',
  'Repetição de gravidez em curto intervalo',
  'Dificuldade de adesão a métodos contraceptivos de uso diário/mensal',
  'Uso de medicamento com potencial teratogênico',
  'Condição social que dificulta acesso continuado aos serviços de saúde',
  'Outra situação de vulnerabilidade',
  'Escolha da usuária pelo método, após orientação e decisão informada junto à equipe de saúde, considerando suas preferências, necessidades e contexto de vida.',
];

export const ESPECIALIDADES_DESCRICAO: Record<
  EspecialidadeCRSMA,
  { descricao: string; cor: string; textoCor: string; bordaCor: string; icone: string; tag: string }
> = {
  'PRÉ-NATAL DE ALTO RISCO': {
    descricao: 'Acompanhamento especializado para gestantes de alto risco obstétrico. Exige DUM/USG, IG, DPP e fatores de risco.',
    cor: 'bg-rose-50/80 hover:bg-rose-100/80',
    textoCor: 'text-rose-800',
    bordaCor: 'border-rose-200',
    icone: 'Baby',
    tag: 'Pré-Natal Alto Risco',
  },
  'COLPOSCOPIA': {
    descricao: 'Investigação patológica do colo do útero e biópsias guiadas. Obrigatório laudo de Citológico (Papanicolau) prévio.',
    cor: 'bg-purple-50/80 hover:bg-purple-100/80',
    textoCor: 'text-purple-800',
    bordaCor: 'border-purple-200',
    icone: 'FileSearch',
    tag: 'Exame / Biópsia',
  },
  'EXÉRESE DE VERRUGA GENITAL': {
    descricao: 'Procedimento ambulatorial especializado para remoção/cauterização de lesões e condilomas genitais.',
    cor: 'bg-amber-50/80 hover:bg-amber-100/80',
    textoCor: 'text-amber-800',
    bordaCor: 'border-amber-200',
    icone: 'Scissors',
    tag: 'Procedimento Ambulatorial',
  },
  'CONSULTA GINECOLÓGICA': {
    descricao: 'Atendimento médico ginecológico especializado para patologias reguladas e acompanhamento da mulher.',
    cor: 'bg-blue-50/80 hover:bg-blue-100/80',
    textoCor: 'text-blue-800',
    bordaCor: 'border-blue-200',
    icone: 'UserCheck',
    tag: 'Atendimento Médico',
  },
  'INSERÇÃO DE DIU': {
    descricao: 'Planejamento reprodutivo para inserção do Dispositivo Intrauterino (DIU de Cobre). Exige Beta HCG e citológico.',
    cor: 'bg-teal-50/80 hover:bg-teal-100/80',
    textoCor: 'text-teal-800',
    bordaCor: 'border-teal-200',
    icone: 'Sparkles',
    tag: 'Planejamento Familiar',
  },
  'REVISÃO DE DIU': {
    descricao: 'Acompanhamento clínico e ultrassonográfico pós-inserção do DIU para checagem de posicionamento dos fios.',
    cor: 'bg-cyan-50/80 hover:bg-cyan-100/80',
    textoCor: 'text-cyan-800',
    bordaCor: 'border-cyan-200',
    icone: 'RefreshCw',
    tag: 'Acompanhamento DIU',
  },
  'ULTRASSOM OBSTÉTRICO': {
    descricao: 'Exames de ultrassonografia obstétrica e ginecológica regulados para acompanhamento fetal e biometria.',
    cor: 'bg-emerald-50/80 hover:bg-emerald-100/80',
    textoCor: 'text-emerald-800',
    bordaCor: 'border-emerald-200',
    icone: 'Activity',
    tag: 'Ultrassonografia FAP',
  },
  'Implante contraceptivo subdérmico': {
    descricao: 'Inserção do implante subdérmico de Etonogestrel (LARC). Avalia condições de vulnerabilidade e prioridade reprodutiva.',
    cor: 'bg-indigo-50/80 hover:bg-indigo-100/80',
    textoCor: 'text-indigo-800',
    bordaCor: 'border-indigo-200',
    icone: 'Syringe',
    tag: 'LARC / Implante Subdérmico',
  },
  'IMPLANTE CONTRACEPTIVO SUBDÉRMICO': {
    descricao: 'Inserção do implante subdérmico de Etonogestrel (LARC). Avalia condições de vulnerabilidade e prioridade reprodutiva.',
    cor: 'bg-indigo-50/80 hover:bg-indigo-100/80',
    textoCor: 'text-indigo-800',
    bordaCor: 'border-indigo-200',
    icone: 'Syringe',
    tag: 'LARC / Implante Subdérmico',
  },
  'INSERÇÃO DE IMPLANON': {
    descricao: 'Inserção do implante subdérmico de Etonogestrel (LARC). Avalia condições de vulnerabilidade e prioridade reprodutiva.',
    cor: 'bg-indigo-50/80 hover:bg-indigo-100/80',
    textoCor: 'text-indigo-800',
    bordaCor: 'border-indigo-200',
    icone: 'Syringe',
    tag: 'LARC / Implante Subdérmico',
  },
  'COLPOSCOPIA E PROCEDIMENTOS': {
    descricao: 'Investigação patológica do colo do útero e biópsias. Exige laudo do citológico prévio.',
    cor: 'bg-purple-50/80 hover:bg-purple-100/80',
    textoCor: 'text-purple-800',
    bordaCor: 'border-purple-200',
    icone: 'FileSearch',
    tag: 'Procedimentos',
  },
  'INSERÇÃO E REVISÃO DE DIU': {
    descricao: 'Inserção e acompanhamento ultrassonográfico do Dispositivo Intrauterino.',
    cor: 'bg-teal-50/80 hover:bg-teal-100/80',
    textoCor: 'text-teal-800',
    bordaCor: 'border-teal-200',
    icone: 'Sparkles',
    tag: 'Planejamento Reprodutivo',
  },
  'ULTRASSOM OBSTÉTRICO - FAP': {
    descricao: 'Exames de imagem obstétricos regulados para acompanhamento do desenvolvimento fetal.',
    cor: 'bg-emerald-50/80 hover:bg-emerald-100/80',
    textoCor: 'text-emerald-800',
    bordaCor: 'border-emerald-200',
    icone: 'Activity',
    tag: 'Ultrassonografia FAP',
  },
};

export const REGRAS_CRSMA: RegraCRSMA[] = [
  {
    id: 'busca_ativa',
    titulo: 'Busca Ativa pelo ACS & Comunicados',
    descricao:
      'As unidades eSF devem monitorar continuamente a planilha. Ao sair o agendamento, encaminhar a busca ativa para o ACS avisar a paciente. A unidade deve obrigatoriamente notificar em COMUNICADOS se a paciente irá ou se a vaga deve ser liberada para outro agendamento.',
    iconeName: 'Search',
    severidade: 'importante',
  },
  {
    id: 'encaminhamento',
    titulo: 'Encaminhamento Médico/Enfermeiro Obrigatório',
    descricao:
      'Somente inserir na planilha de agendamento pacientes com solicitação por escrito e assinada por médico ou enfermeiro da eSF. Orientar a paciente a levar o encaminhamento físico no dia da consulta, sob pena de não atendimento.',
    iconeName: 'FileText',
    severidade: 'alerta',
  },
  {
    id: 'documentacao_esus',
    titulo: 'Duplicidade de Prontuário no e-SUS PEC (CPF + Cartão SUS)',
    descricao:
      'Orientar a paciente a levar CPF e Cartão do SUS no dia da consulta. Devido à duplicidade de cadastros no e-SUS APS PEC, a recepção do CRSMA precisa dos dois documentos para unificar o prontuário da cidadã.',
    iconeName: 'CreditCard',
    severidade: 'alerta',
  },
  {
    id: 'citologico',
    titulo: 'Exame Citológico em Colposcopia',
    descricao:
      'É OBRIGATÓRIO que em casos de COLPOSCOPIA ou coleta para BIÓPSIA a mulher traga impresso o resultado do exame citológico (Papanicolau) prévio.',
    iconeName: 'Activity',
    severidade: 'alerta',
  },
  {
    id: 'telefone_atualizado',
    titulo: 'Telefone Atualizado para Contato',
    descricao:
      'Coloque sempre o número de telefone/WhatsApp atualizado na planilha para possível contato direto do CRSMA, mantendo a comunicação oficial entre o sistema e a eSF de origem.',
    iconeName: 'Phone',
    severidade: 'info',
  },
];

export const MEDICOS_CRSMA = [
  'Dra. Ana Paula Cavalcanti (Ginecologista / Obstetra)',
  'Dr. Fernando Alencar (Especialista em Colposcopia)',
  'Dra. Juliana Mendes (Obstetrícia de Alto Risco)',
  'Dr. Roberto Sampaio (Ultrassonografia FAP)',
];
