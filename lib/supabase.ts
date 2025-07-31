import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

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
