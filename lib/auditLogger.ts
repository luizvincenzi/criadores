// Utilitário para logging de auditoria
// Sistema migrado para usar apenas Supabase

export interface AuditLogEntry {
  entity_type: 'business' | 'creator' | 'campaign' | 'user' | 'system';
  entity_id: string;
  entity_name?: string;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'login' | 'logout';
  field_name?: string;
  old_value?: string;
  new_value?: string;
  user_id?: string;
  user_email?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface AuditLogQuery {
  entity_type?: string;
  entity_id?: string;
  action?: string;
  user_email?: string;
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
}

class AuditLogger {
  // Sistema agora usa apenas Supabase
  constructor() {
    // Não precisa mais verificar fonte de dados
  }

  // Criar um novo log de auditoria
  async log(entry: AuditLogEntry): Promise<boolean> {
    try {
      // Usar apenas Supabase agora
      const success = await this.logToSupabase(entry);

      // Se o log foi criado com sucesso e é uma mudança de status,
      // tentar mostrar notificação (apenas no browser)
      if (success && entry.action === 'status_change' && typeof window !== 'undefined') {
        this.showNotificationForStatusChange(entry);
      }

      return success;
    } catch (error) {
      console.error('❌ Erro ao criar audit log:', error);
      return false;
    }
  }

  // Mostrar notificação para mudanças de status (apenas no browser)
  private showNotificationForStatusChange(entry: AuditLogEntry) {
    try {
      // Verificar se o contexto de notificações está disponível
      // Isso é uma implementação simples - em produção, seria melhor usar um event bus
      const event = new CustomEvent('auditLogStatusChange', {
        detail: {
          entity_type: entry.entity_type,
          entity_name: entry.entity_name,
          field_name: entry.field_name,
          old_value: entry.old_value,
          new_value: entry.new_value
        }
      });

      window.dispatchEvent(event);
    } catch (error) {
      // Falha silenciosa - notificações são opcionais
      console.debug('Não foi possível mostrar notificação:', error);
    }
  }

  // Buscar logs de auditoria
  async getLogs(query: AuditLogQuery = {}): Promise<any[]> {
    try {
      // Usar apenas Supabase agora
      return await this.getLogsFromSupabase(query);
    } catch (error) {
      console.error('❌ Erro ao buscar audit logs:', error);
      return [];
    }
  }

  // Implementação para Supabase
  private async logToSupabase(entry: AuditLogEntry): Promise<boolean> {
    try {
      // Verificar se estamos no servidor (Node.js) ou no browser
      const isServer = typeof window === 'undefined';
      const baseUrl = isServer ? 'http://localhost:3000' : '';

      const response = await fetch(`${baseUrl}/api/supabase/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Audit log criado no Supabase: ${entry.action} em ${entry.entity_type}`);
        return true;
      } else {
        console.error('❌ Erro ao criar audit log no Supabase:', data.error);
        
        // Se a tabela não existe, mostrar aviso
        if (data.migration_needed) {
          console.warn('⚠️ Tabela audit_log não existe. Execute a migration 002_audit_logs.sql');
        }
        
        return false;
      }
    } catch (error) {
      console.error('❌ Erro na requisição de audit log:', error);
      return false;
    }
  }

  // Função removida - sistema agora usa apenas Supabase

  // Buscar logs do Supabase
  private async getLogsFromSupabase(query: AuditLogQuery): Promise<any[]> {
    try {
      const params = new URLSearchParams();

      if (query.entity_type) params.append('entity_type', query.entity_type);
      if (query.entity_id) params.append('entity_id', query.entity_id);
      if (query.action) params.append('action', query.action);
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.offset) params.append('offset', query.offset.toString());

      // Verificar se estamos no servidor (Node.js) ou no browser
      const isServer = typeof window === 'undefined';
      const baseUrl = isServer ? 'http://localhost:3000' : '';

      const response = await fetch(`${baseUrl}/api/supabase/audit-logs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        console.error('❌ Erro ao buscar logs do Supabase:', data.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro na requisição de logs:', error);
      return [];
    }
  }

  // Função removida - sistema agora usa apenas Supabase

  // Métodos de conveniência para login/logout
  async logUserLogin(userEmail: string, details?: any): Promise<boolean> {
    return this.log({
      entity_type: 'user',
      entity_id: userEmail,
      entity_name: userEmail,
      action: 'login',
      user_email: userEmail,
      new_value: JSON.stringify(details || {})
    });
  }

  async logUserLogout(userEmail: string): Promise<boolean> {
    return this.log({
      entity_type: 'user',
      entity_id: userEmail,
      entity_name: userEmail,
      action: 'logout',
      user_email: userEmail
    });
  }

  // Métodos de conveniência para ações comuns
  async logBusinessStatusChange(businessId: string, businessName: string, oldStatus: string, newStatus: string, userEmail?: string): Promise<boolean> {
    return this.log({
      entity_type: 'business',
      entity_id: businessId,
      entity_name: businessName,
      action: 'status_change',
      field_name: 'status',
      old_value: oldStatus,
      new_value: newStatus,
      user_email: userEmail
    });
  }

  async logCreatorStatusChange(creatorId: string, creatorName: string, oldStatus: string, newStatus: string, userEmail?: string): Promise<boolean> {
    return this.log({
      entity_type: 'creator',
      entity_id: creatorId,
      entity_name: creatorName,
      action: 'status_change',
      field_name: 'status',
      old_value: oldStatus,
      new_value: newStatus,
      user_email: userEmail
    });
  }

  async logCampaignStatusChange(campaignId: string, campaignName: string, oldStatus: string, newStatus: string, userEmail?: string): Promise<boolean> {
    return this.log({
      entity_type: 'campaign',
      entity_id: campaignId,
      entity_name: campaignName,
      action: 'status_change',
      field_name: 'status',
      old_value: oldStatus,
      new_value: newStatus,
      user_email: userEmail
    });
  }

  async logBusinessCreate(businessId: string, businessName: string, userEmail?: string): Promise<boolean> {
    return this.log({
      entity_type: 'business',
      entity_id: businessId,
      entity_name: businessName,
      action: 'create',
      user_email: userEmail
    });
  }

  async logCreatorCreate(creatorId: string, creatorName: string, userEmail?: string): Promise<boolean> {
    return this.log({
      entity_type: 'creator',
      entity_id: creatorId,
      entity_name: creatorName,
      action: 'create',
      user_email: userEmail
    });
  }

  async logCampaignCreate(campaignId: string, campaignName: string, userEmail?: string): Promise<boolean> {
    return this.log({
      entity_type: 'campaign',
      entity_id: campaignId,
      entity_name: campaignName,
      action: 'create',
      user_email: userEmail
    });
  }

  async logUserLogin(userEmail: string, details?: Record<string, any>): Promise<boolean> {
    return this.log({
      entity_type: 'user',
      entity_id: userEmail,
      entity_name: userEmail,
      action: 'login',
      user_email: userEmail,
      details: details
    });
  }

  async logUserLogout(userEmail: string): Promise<boolean> {
    return this.log({
      entity_type: 'user',
      entity_id: userEmail,
      entity_name: userEmail,
      action: 'logout',
      user_email: userEmail
    });
  }
}

// Instância singleton
export const auditLogger = new AuditLogger();

// Funções de conveniência para uso direto
export const logBusinessStatusChange = auditLogger.logBusinessStatusChange.bind(auditLogger);
export const logCreatorStatusChange = auditLogger.logCreatorStatusChange.bind(auditLogger);
export const logCampaignStatusChange = auditLogger.logCampaignStatusChange.bind(auditLogger);
export const logBusinessCreate = auditLogger.logBusinessCreate.bind(auditLogger);
export const logCreatorCreate = auditLogger.logCreatorCreate.bind(auditLogger);
export const logCampaignCreate = auditLogger.logCampaignCreate.bind(auditLogger);
export const logUserLogin = auditLogger.logUserLogin.bind(auditLogger);
export const logUserLogout = auditLogger.logUserLogout.bind(auditLogger);

export default auditLogger;
