import { useAuthStore } from '@/store/authStore';
import { logAction, AuditLogEntry } from '@/app/actions/sheetsActions';

export type AuditAction = 
  | 'business_created'
  | 'business_updated' 
  | 'business_deleted'
  | 'business_stage_changed'
  | 'creator_created'
  | 'creator_updated'
  | 'creator_deleted'
  | 'campaign_created'
  | 'campaign_updated'
  | 'campaign_deleted'
  | 'user_login'
  | 'user_logout'
  | 'data_sync'
  | 'export_data'
  | 'import_data';

export interface LogActionParams {
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityName: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
}

export function useAuditLog() {
  const { user } = useAuthStore();

  const log = async (params: LogActionParams) => {
    if (!user) {
      console.warn('⚠️ Usuário não autenticado, log não será registrado');
      return false;
    }

    try {
      const entry: Omit<AuditLogEntry, 'id' | 'timestamp'> = {
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        entity_name: params.entityName,
        old_value: params.oldValue,
        new_value: params.newValue,
        user_id: user.id,
        user_name: user.name,
        details: params.details
      };

      const success = await logAction(entry);
      
      if (success) {
        console.log(`📝 Log registrado: ${params.action} - ${params.entityName}`);
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao registrar log:', error);
      return false;
    }
  };

  // Funções específicas para diferentes tipos de ação
  const logBusinessStageChange = async (
    businessId: string,
    businessName: string,
    oldStage: string,
    newStage: string
  ) => {
    return log({
      action: 'business_stage_changed',
      entityType: 'business',
      entityId: businessId,
      entityName: businessName,
      oldValue: oldStage,
      newValue: newStage,
      details: `Negócio movido de "${oldStage}" para "${newStage}"`
    });
  };

  const logBusinessCreated = async (
    businessId: string,
    businessName: string,
    details?: string
  ) => {
    return log({
      action: 'business_created',
      entityType: 'business',
      entityId: businessId,
      entityName: businessName,
      details: details || 'Novo negócio criado'
    });
  };

  const logBusinessUpdated = async (
    businessId: string,
    businessName: string,
    field: string,
    oldValue: string,
    newValue: string
  ) => {
    return log({
      action: 'business_updated',
      entityType: 'business',
      entityId: businessId,
      entityName: businessName,
      oldValue,
      newValue,
      details: `Campo "${field}" atualizado`
    });
  };

  const logDataSync = async (source: string, recordsCount: number) => {
    return log({
      action: 'data_sync',
      entityType: 'system',
      entityId: 'sync_' + Date.now(),
      entityName: source,
      details: `Sincronização de ${recordsCount} registros de ${source}`
    });
  };

  const logUserLogin = async () => {
    if (!user) return false;
    
    return log({
      action: 'user_login',
      entityType: 'user',
      entityId: user.id,
      entityName: user.name,
      details: `Login realizado - ${user.email}`
    });
  };

  const logUserLogout = async () => {
    if (!user) return false;
    
    return log({
      action: 'user_logout',
      entityType: 'user',
      entityId: user.id,
      entityName: user.name,
      details: `Logout realizado - ${user.email}`
    });
  };

  return {
    log,
    logBusinessStageChange,
    logBusinessCreated,
    logBusinessUpdated,
    logDataSync,
    logUserLogin,
    logUserLogout
  };
}
