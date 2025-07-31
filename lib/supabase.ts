import { createClient } from '@supabase/supabase-js';

// Configuração hardcoded para evitar problemas de environment variables
const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

console.log('🔧 [SUPABASE] Configurando cliente:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0
});

if (!supabaseUrl) {
  throw new Error('Supabase URL não configurada');
}

if (!supabaseAnonKey) {
  throw new Error('Supabase Anon Key não configurada');
}

// Criar uma única instância do Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'x-criadores-platform': 'client',
    },
  },
});

console.log('✅ [SUPABASE] Cliente configurado com sucesso');

// Client para uso no servidor (com service role key)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Configuração padrão da organização
export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Função para obter o business_id do cliente atual
export function getClientBusinessId(): string {
  const clientBusinessId = process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID;
  if (!clientBusinessId) {
    throw new Error('CLIENT_BUSINESS_ID não configurado');
  }
  return clientBusinessId;
}

// Função para verificar se está em modo cliente
export function isClientMode(): boolean {
  return process.env.NEXT_PUBLIC_CLIENT_MODE === 'true';
}

// Helper para verificar se usuário está autenticado
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export default supabase;
