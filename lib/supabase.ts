import { createClient } from '@supabase/supabase-js';

// Configuração direta do Supabase
const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

console.log('🔧 [SUPABASE] Configurando cliente Supabase...');

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

console.log('✅ [SUPABASE] Cliente configurado com sucesso');

export default supabase;
