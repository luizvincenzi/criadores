import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Client para uso no servidor (com service role key)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Tipos para TypeScript
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Tipos específicos das tabelas
export type Organization = Tables<'organizations'>;
export type User = Tables<'users'>;
export type Business = Tables<'businesses'>;
export type Creator = Tables<'creators'>;
export type Campaign = Tables<'campaigns'>;
export type CampaignCreator = Tables<'campaign_creators'>;
export type Lead = Tables<'leads'>;
export type Task = Tables<'tasks'>;
export type AuditLog = Tables<'audit_logs'>;

// Enums
export type UserRole = Enums<'user_role'>;
export type BusinessStatus = Enums<'business_status'>;
export type CreatorStatus = Enums<'creator_status'>;
export type CampaignStatus = Enums<'campaign_status'>;
export type TaskStatus = Enums<'task_status'>;
export type TaskPriority = Enums<'task_priority'>;

// Helper para verificar se usuário está autenticado
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper para obter organização do usuário
export const getCurrentOrganization = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('users')
    .select(`
      organization_id,
      organizations (
        id,
        name,
        settings
      )
    `)
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
};

// Helper para verificar permissões
export const checkPermission = async (resource: string, action: string) => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data } = await supabase
    .from('users')
    .select('permissions, role')
    .eq('id', user.id)
    .single();

  if (!data) return false;

  // Admin tem todas as permissões
  if (data.role === 'admin') return true;

  // Verificar permissões específicas
  const permissions = data.permissions as any;
  return permissions?.[resource]?.[action] === true;
};

// Helper para logs de auditoria
export const createAuditLog = async (
  tableName: string,
  recordId: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  oldValues?: any,
  newValues?: any
) => {
  const user = await getCurrentUser();
  const org = await getCurrentOrganization();

  await supabase.from('audit_logs').insert({
    organization_id: org.organization_id,
    table_name: tableName,
    record_id: recordId,
    action,
    old_values: oldValues,
    new_values: newValues,
    user_id: user?.id,
  });
};

export default supabase;
