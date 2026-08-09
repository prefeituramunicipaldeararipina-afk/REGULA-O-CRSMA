import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gxeravysmfwqoiavrcgj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZXJhdnlzbWZ3cW9pYXZyY2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODk5MDMsImV4cCI6MjEwMTg2NTkwM30.4zLe-uPTBelIPnGzun-YSj-JgLaNDfRpDsWTseoE82E';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Helper to get all agendamentos from Supabase table 'agendamentos'
 */
export async function getAgendamentosFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .order('criadoEm', { ascending: false });

    if (error) {
      console.error('Supabase fetch agendamentos error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return null;
  }
}

/**
 * Helper to upsert agendamentos in Supabase
 */
export async function saveAgendamentosToSupabase(agendamentos) {
  if (!supabase || !agendamentos || !agendamentos.length) return false;
  try {
    const { error } = await supabase
      .from('agendamentos')
      .upsert(agendamentos, { onConflict: 'id' });

    if (error) {
      console.error('Supabase save agendamentos error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save error:', err);
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
      console.error('Supabase fetch usuarios error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase fetch usuarios error:', err);
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
      console.error('Supabase save usuarios error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save usuarios error:', err);
    return false;
  }
}

export default supabase;
