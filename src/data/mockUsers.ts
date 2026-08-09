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

// Regulador Central do CRSMA (CNES: 8061149)
const REGULADORES_USUARIOS: Usuario[] = [
  {
    id: 'usr-reg-1',
    nome: 'CRSMA - Regulador Central',
    email: 'regulacao.crsma@araripina.pe.gov.br',
    cnesUnidade: '8061149',
    cpfOuCnes: '8061149',
    unidadeOuOrgao: 'CRSMA - Regulador Central',
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
    id: 'usr-sol-central',
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
  // DISTRITO SANITÁRIO I (10 eSFs)
  { id: 'usr-esf-4536746', nome: 'eSF Vila Serrania I', email: 'esf.vilaserrania1@araripina.pe.gov.br', cnesUnidade: '4536746', cpfOuCnes: '4536746', unidadeOuOrgao: 'eSF Vila Serrania I', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4437098', nome: 'eSF Vila Serrânia II', email: 'esf.vilaserrania2@araripina.pe.gov.br', cnesUnidade: '4437098', cpfOuCnes: '4437098', unidadeOuOrgao: 'eSF Vila Serrânia II', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4536681', nome: 'eSF Feira Nova', email: 'esf.feiranova@araripina.pe.gov.br', cnesUnidade: '4536681', cpfOuCnes: '4536681', unidadeOuOrgao: 'eSF Feira Nova', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4536754', nome: 'eSF Cavaco', email: 'esf.cavaco@araripina.pe.gov.br', cnesUnidade: '4536754', cpfOuCnes: '4536754', unidadeOuOrgao: 'eSF Cavaco', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4536789', nome: 'eSF Serra do Jardim', email: 'esf.serradojardim@araripina.pe.gov.br', cnesUnidade: '4536789', cpfOuCnes: '4536789', unidadeOuOrgao: 'eSF Serra do Jardim', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-2881284', nome: 'eSF Vila Conceição', email: 'esf.vilaconceicao@araripina.pe.gov.br', cnesUnidade: '2881284', cpfOuCnes: '2881284', unidadeOuOrgao: 'eSF Vila Conceição', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-0297941', nome: 'eSF Serra da Torre I', email: 'esf.serradatorre1@araripina.pe.gov.br', cnesUnidade: '0297941', cpfOuCnes: '0297941', unidadeOuOrgao: 'eSF Serra da Torre I', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4383427', nome: 'eSF Serra da Torre II', email: 'esf.serradatorre2@araripina.pe.gov.br', cnesUnidade: '4383427', cpfOuCnes: '4383427', unidadeOuOrgao: 'eSF Serra da Torre II', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-2635305', nome: 'eSF Cavalete', email: 'esf.cavalete@araripina.pe.gov.br', cnesUnidade: '2635305', cpfOuCnes: '2635305', unidadeOuOrgao: 'eSF Cavalete', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-6896863', nome: 'eSF Cohab', email: 'esf.cohab@araripina.pe.gov.br', cnesUnidade: '6896863', cpfOuCnes: '6896863', unidadeOuOrgao: 'eSF Cohab', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },

  // DISTRITO SANITÁRIO II (10 eSFs)
  { id: 'usr-esf-4120485', nome: 'eSF Centro I', email: 'esf.centro1@araripina.pe.gov.br', cnesUnidade: '4120485', cpfOuCnes: '4120485', unidadeOuOrgao: 'eSF Centro I', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4120531', nome: 'eSF Centro II', email: 'esf.centro2@araripina.pe.gov.br', cnesUnidade: '4120531', cpfOuCnes: '4120531', unidadeOuOrgao: 'eSF Centro II', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4414365', nome: 'eSF Centro III', email: 'esf.centro3@araripina.pe.gov.br', cnesUnidade: '4414365', cpfOuCnes: '4414365', unidadeOuOrgao: 'eSF Centro III', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-2635224', nome: 'eSF Santa Bárbara', email: 'esf.santabarbara@araripina.pe.gov.br', cnesUnidade: '2635224', cpfOuCnes: '2635224', unidadeOuOrgao: 'eSF Santa Bárbara', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4536657', nome: 'eSF José Martins', email: 'esf.josemartins@araripina.pe.gov.br', cnesUnidade: '4536657', cpfOuCnes: '4536657', unidadeOuOrgao: 'eSF José Martins', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-2635348', nome: 'eSF Alto da Boa Vista I', email: 'esf.altodaboavista1@araripina.pe.gov.br', cnesUnidade: '2635348', cpfOuCnes: '2635348', unidadeOuOrgao: 'eSF Alto da Boa Vista I', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-6339743', nome: 'eSF Alto da Boa Vista II', email: 'esf.altodaboavista2@araripina.pe.gov.br', cnesUnidade: '6339743', cpfOuCnes: '6339743', unidadeOuOrgao: 'eSF Alto da Boa Vista II', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4383389', nome: 'eSF Alto da Boa Vista III', email: 'esf.altodaboavista3@araripina.pe.gov.br', cnesUnidade: '4383389', cpfOuCnes: '4383389', unidadeOuOrgao: 'eSF Alto da Boa Vista III', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-0297933', nome: 'eSF Nossa Senhora do Carmo', email: 'esf.carmo@araripina.pe.gov.br', cnesUnidade: '0297933', cpfOuCnes: '0297933', unidadeOuOrgao: 'eSF Nossa Senhora do Carmo', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4237455', nome: 'eSF Sitio Santana', email: 'esf.sitiosantana@araripina.pe.gov.br', cnesUnidade: '4237455', cpfOuCnes: '4237455', unidadeOuOrgao: 'eSF Sitio Santana', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },

  // DISTRITO SANITÁRIO III (12 eSFs)
  { id: 'usr-esf-6339751', nome: 'eSF Vila Santa Maria I', email: 'esf.santamaria1@araripina.pe.gov.br', cnesUnidade: '6339751', cpfOuCnes: '6339751', unidadeOuOrgao: 'eSF Vila Santa Maria I', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4383435', nome: 'eSF Vila Santa Maria II', email: 'esf.santamaria2@araripina.pe.gov.br', cnesUnidade: '4383435', cpfOuCnes: '4383435', unidadeOuOrgao: 'eSF Vila Santa Maria II', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4237498', nome: 'eSF Bom Jardim do Araripe', email: 'esf.bomjardim@araripina.pe.gov.br', cnesUnidade: '4237498', cpfOuCnes: '4237498', unidadeOuOrgao: 'eSF Bom Jardim do Araripe', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4237471', nome: 'eSF Lagoa de Dentro', email: 'esf.lagoadadentro@araripina.pe.gov.br', cnesUnidade: '4237471', cpfOuCnes: '4237471', unidadeOuOrgao: 'eSF Lagoa de Dentro', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-2635291', nome: 'eSF Gergelim I', email: 'esf.gergelim1@araripina.pe.gov.br', cnesUnidade: '2635291', cpfOuCnes: '2635291', unidadeOuOrgao: 'eSF Gergelim I', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4383400', nome: 'eSF Gergelim II', email: 'esf.gergelim2@araripina.pe.gov.br', cnesUnidade: '4383400', cpfOuCnes: '4383400', unidadeOuOrgao: 'eSF Gergelim II', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-2635283', nome: 'eSF Nascente I', email: 'esf.nascente1@araripina.pe.gov.br', cnesUnidade: '2635283', cpfOuCnes: '2635283', unidadeOuOrgao: 'eSF Nascente I', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4081501', nome: 'eSF Nascente II', email: 'esf.nascente2@araripina.pe.gov.br', cnesUnidade: '4081501', cpfOuCnes: '4081501', unidadeOuOrgao: 'eSF Nascente II', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4536800', nome: 'eSF Sipaúba', email: 'esf.sipauba@araripina.pe.gov.br', cnesUnidade: '4536800', cpfOuCnes: '4536800', unidadeOuOrgao: 'eSF Sipaúba', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-2635321', nome: 'eSF Lagoa do Barro', email: 'esf.lagoadobarro@araripina.pe.gov.br', cnesUnidade: '2635321', cpfOuCnes: '2635321', unidadeOuOrgao: 'eSF Lagoa do Barro', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4081471', nome: 'eSF Morais I', email: 'esf.morais1@araripina.pe.gov.br', cnesUnidade: '4081471', cpfOuCnes: '4081471', unidadeOuOrgao: 'eSF Morais I', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
  { id: 'usr-esf-4383419', nome: 'eSF Morais II', email: 'esf.morais2@araripina.pe.gov.br', cnesUnidade: '4383419', cpfOuCnes: '4383419', unidadeOuOrgao: 'eSF Morais II', perfil: 'SOLICITANTE', ativo: true, criadoEm: '2026-01-01T08:00:00Z', senha: '123456' },
];

export const INITIAL_USUARIOS: Usuario[] = [
  ...ADMINISTRADORES_USUARIOS,
  ...REGULADORES_USUARIOS,
  ...SOLICITANTES_USUARIOS,
];
