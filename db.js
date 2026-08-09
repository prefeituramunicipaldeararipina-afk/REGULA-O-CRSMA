import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gxeravysmfwqoiavrcgj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZXJhdnlzbWZ3cW9pYXZyY2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODk5MDMsImV4cCI6MjEwMTg2NTkwM30.4zLe-uPTBelIPnGzun-YSj-JgLaNDfRpDsWTseoE82E';

function getValidJwtKey(...candidates) {
  for (const k of candidates) {
    if (k && typeof k === 'string' && k.trim().startsWith('ey')) {
      return k.trim();
    }
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseUrl = (rawUrl || DEFAULT_SUPABASE_URL).trim().replace(/\/+$/, '');
const supabaseKey = getValidJwtKey(
  process.env.SUPABASE_ANON_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.VITE_SUPABASE_ANON_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  process.env.SUPABASE_SECRET_KEY,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

function normalizeRow(row) {
  if (!row) return row;
  if (row.dados && typeof row.dados === 'object' && row.dados.id) {
    return row.dados;
  }
  if (row.payload && typeof row.payload === 'object' && row.payload.id) {
    return row.payload;
  }
  let historico = [];
  try {
    historico = typeof row.historico === 'string' ? JSON.parse(row.historico) : (Array.isArray(row.historico) ? row.historico : []);
  } catch (e) {}

  let anexos = [];
  try {
    anexos = typeof row.anexos === 'string' ? JSON.parse(row.anexos) : (Array.isArray(row.anexos) ? row.anexos : []);
  } catch (e) {}

  return {
    id: String(row.id),
    numeroFicha: row.numeroFicha || row.numero_ficha || '',
    paciente: row.paciente || '',
    cpf: row.cpf || '',
    cartaoSus: row.cartaoSus || row.cartao_sus || '',
    especialidade: row.especialidade || '',
    prioridade: row.prioridade || '',
    status: row.status || 'PENDENTE',
    solicitante: row.solicitante || '',
    unidade: row.unidade || '',
    medicoRegulador: row.medicoRegulador || row.medico_regulador || '',
    motivoRegulacao: row.motivoRegulacao || row.motivo_regulacao || '',
    dataSolicitacao: row.dataSolicitacao || row.data_solicitacao || new Date().toISOString(),
    dataRegulacao: row.dataRegulacao || row.data_regulacao || '',
    dataAtendimento: row.dataAtendimento || row.data_atendimento || '',
    historico,
    anexos
  };
}

/**
 * Helper to get all agendamentos from Supabase table 'agendamentos'
 */
export async function getAgendamentosFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*');

    if (error) {
      console.warn('Supabase fetch agendamentos warning:', error.message);
      return null;
    }
    if (Array.isArray(data)) {
      return data.map(normalizeRow);
    }
    return data;
  } catch (err) {
    console.warn('Supabase connection warning:', err);
    return null;
  }
}

/**
 * Helper to upsert agendamentos in Supabase
 */
export async function saveAgendamentosToSupabase(agendamentos) {
  if (!supabase || !agendamentos || !agendamentos.length) return false;
  try {
    const rows = agendamentos.map(a => ({
      id: String(a.id),
      numeroFicha: a.numeroFicha || '',
      paciente: a.paciente || '',
      cpf: a.cpf || '',
      cartaoSus: a.cartaoSus || '',
      especialidade: a.especialidade || '',
      prioridade: a.prioridade || '',
      status: a.status || '',
      solicitante: a.solicitante || '',
      unidade: a.unidade || '',
      medicoRegulador: a.medicoRegulador || '',
      motivoRegulacao: a.motivoRegulacao || '',
      dataSolicitacao: a.dataSolicitacao || '',
      dataRegulacao: a.dataRegulacao || '',
      dataAtendimento: a.dataAtendimento || '',
      historico: a.historico || [],
      anexos: a.anexos || [],
      dados: a
    }));

    const { error } = await supabase
      .from('agendamentos')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase save agendamentos warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase save warning:', err);
    return false;
  }
}

/**
 * Helper to get all usuarios from Supabase table 'usuarios'
 */
export async function getUsuariosFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*');

    if (error) {
      console.warn('Supabase fetch usuarios warning:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetch usuarios warning:', err);
    return null;
  }
}

/**
 * Helper to upsert usuarios in Supabase
 */
export async function saveUsuariosToSupabase(usuarios) {
  if (!supabase || !usuarios || !usuarios.length) return false;
  try {
    const { error } = await supabase
      .from('usuarios')
      .upsert(usuarios, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase save usuarios warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase save usuarios warning:', err);
    return false;
  }
}

export default supabase;
