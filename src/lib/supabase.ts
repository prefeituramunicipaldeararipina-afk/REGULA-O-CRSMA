import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gxeravysmfwqoiavrcgj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZXJhdnlzbWZ3cW9pYXZyY2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODk5MDMsImV4cCI6MjEwMTg2NTkwM30.4zLe-uPTBelIPnGzun-YSj-JgLaNDfRpDsWTseoE82E';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
