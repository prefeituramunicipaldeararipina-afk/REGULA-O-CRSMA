import { createClient } from '@supabase/supabase-js';
import { Agendamento } from '../types';

const DEFAULT_SUPABASE_URL = 'https://gxeravysmfwqoiavrcgj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZXJhdnlzbWZ3cW9pYXZyY2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODk5MDMsImV4cCI6MjEwMTg2NTkwM30.4zLe-uPTBelIPnGzun-YSj-JgLaNDfRpDsWTseoE82E';

function getValidJwtKey(...candidates: (string | undefined)[]): string {
  for (const k of candidates) {
    if (k && typeof k === 'string' && k.trim().startsWith('ey')) {
      return k.trim();
    }
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

const metaEnv = (import.meta as any).env || {};
const rawSupabaseUrl = metaEnv.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseUrl = (rawSupabaseUrl || DEFAULT_SUPABASE_URL).trim().replace(/\/+$/, '');
const supabaseAnonKey = getValidJwtKey(
  metaEnv.VITE_SUPABASE_ANON_KEY,
  metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY,
  metaEnv.SUPABASE_ANON_KEY
);

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export function normalizeAgendamentoFromSupabase(row: any): Agendamento {
  if (!row) return row;
  if (row.dados && typeof row.dados === 'object' && row.dados.id) {
    return row.dados as Agendamento;
  }
  if (row.payload && typeof row.payload === 'object' && row.payload.id) {
    return row.payload as Agendamento;
  }
  return row as Agendamento;
}

export async function fetchAgendamentosDirectSupabase(): Promise<Agendamento[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('agendamentos').select('*');
    if (error) {
      console.warn('Supabase direct fetch error:', error.message);
      return null;
    }
    if (Array.isArray(data)) {
      return data.map(normalizeAgendamentoFromSupabase);
    }
  } catch (e) {
    console.warn('Supabase direct fetch exception:', e);
  }
  return null;
}

export async function saveAgendamentosDirectSupabase(agendamentos: Agendamento[]): Promise<boolean> {
  if (!supabase || !agendamentos.length) return false;
  try {
    const rows = agendamentos.map(a => ({
      id: String(a.id),
      pacienteNome: a.pacienteNome || '',
      cpf: a.cpf || '',
      cartaoSus: a.cartaoSus || '',
      status: a.status || 'Pendente',
      esfOrigem: a.esfOrigem || '',
      especialidade: a.especialidade || '',
      criadoEm: a.criadoEm || new Date().toISOString(),
      atualizadoEm: a.atualizadoEm || new Date().toISOString(),
      dados: a
    }));

    const { error } = await supabase.from('agendamentos').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase direct save error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase direct save exception:', e);
  }
  return false;
}
