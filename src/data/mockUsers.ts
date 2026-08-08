import { Usuario } from '../types';

export interface DistritoSanitario {
  id: string;
  nome: string;
  subtitulo: string;
  corBg: string;
  corBorder: string;
  corText: string;
  unidades: string[];
}

export const DISTRITOS_SANITARIOS: DistritoSanitario[] = [
  {
    id: 'DISTRITO_1',
    nome: 'Distrito Sanitário I',
    subtitulo: 'Sede & Comunidades (10 eSF)',
    corBg: 'bg-blue-500/20',
    corBorder: 'border-blue-500',
    corText: 'text-blue-400',
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
    id: 'DISTRITO_2',
    nome: 'Distrito Sanitário II',
    subtitulo: 'Centro & Bairros Urbano (10 eSF)',
    corBg: 'bg-emerald-500/20',
    corBorder: 'border-emerald-500',
    corText: 'text-emerald-400',
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
    id: 'DISTRITO_3',
    nome: 'Distrito Sanitário III',
    subtitulo: 'Povoados & Zona Rural (12 eSF)',
    corBg: 'bg-amber-500/20',
    corBorder: 'border-amber-500',
    corText: 'text-amber-400',
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

export const ESF_UNIDADES_LIST = [
  // DISTRITO SANITÁRIO I (10)
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
  // DISTRITO SANITÁRIO II (10)
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
  // DISTRITO SANITÁRIO III (12)
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
  // SOLICITANTE CENTRAL
  'Secretaria Municipal de Saúde',
];

// Administrador Padrão do Sistema (SMS)
const ADMINISTRADORES_USUARIOS: Usuario[] = [
  {
    id: 'usr-adm-1',
    nome: 'Administrador do Sistema (SMS)',
    email: 'admin.crsma@araripina.pe.gov.br',
    cnesUnidade: '223505',
    cpfOuCnes: '223505',
    unidadeOuOrgao: 'Secretaria Municipal de Saúde',
    perfil: 'ADMINISTRADOR',
    ativo: true,
    criadoEm: '2026-01-01T08:00:00Z',
    ultimoAcesso: new Date().toISOString(),
    senha: '@900522We',
  },
];

// Reguladores Padrão do CRSMA
const REGULADORES_USUARIOS: Usuario[] = [
  {
    id: 'usr-reg-1',
    nome: 'Dra. Maria Clara (Regulação CRSMA)',
    email: 'regulacao.crsma@araripina.pe.gov.br',
    cnesUnidade: '200001',
    cpfOuCnes: '200001',
    unidadeOuOrgao: 'CRSMA - Regulação Central',
    perfil: 'REGULADOR',
    ativo: true,
    criadoEm: '2026-01-01T08:00:00Z',
    ultimoAcesso: new Date().toISOString(),
    senha: '123456',
  },
];

// Solicitantes Padrão para eSFs e SMS
const SOLICITANTES_USUARIOS: Usuario[] = [
  {
    id: 'usr-esf-1',
    nome: 'eSF Alto da Boa Vista I',
    email: 'esf.altodaboavista1@araripina.pe.gov.br',
    cnesUnidade: '230206',
    cpfOuCnes: '230206',
    unidadeOuOrgao: 'eSF Alto da Boa Vista I',
    perfil: 'SOLICITANTE',
    ativo: true,
    criadoEm: '2026-01-01T08:00:00Z',
    senha: '123456',
  },
  {
    id: 'usr-esf-2',
    nome: 'eSF Vila Serrania I',
    email: 'esf.vilaserrania1@araripina.pe.gov.br',
    cnesUnidade: '230101',
    cpfOuCnes: '230101',
    unidadeOuOrgao: 'eSF Vila Serrania I',
    perfil: 'SOLICITANTE',
    ativo: true,
    criadoEm: '2026-01-01T08:00:00Z',
    senha: '123456',
  },
  {
    id: 'usr-sms-1',
    nome: 'Secretaria Municipal de Saúde (Solicitante Central)',
    email: 'solicitante.sms@araripina.pe.gov.br',
    cnesUnidade: '230000',
    cpfOuCnes: '230000',
    unidadeOuOrgao: 'Secretaria Municipal de Saúde',
    perfil: 'SOLICITANTE',
    ativo: true,
    criadoEm: '2026-01-01T08:00:00Z',
    senha: '123456',
  },
];

export const INITIAL_USUARIOS: Usuario[] = [
  ...ADMINISTRADORES_USUARIOS,
  ...REGULADORES_USUARIOS,
  ...SOLICITANTES_USUARIOS,
];
