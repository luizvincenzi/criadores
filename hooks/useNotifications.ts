import { useState, useCallback } from 'react';
import { Notification } from '@/components/NotificationSystem';

export interface NotificationOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((options: NotificationOptions) => {
    const notification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration !== undefined ? options.duration : 5000, // 5 segundos por padrão
      action: options.action,
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev]);
    return notification.id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Funções de conveniência para diferentes tipos de notificação
  const showSuccess = useCallback((title: string, message: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      title,
      message,
      type: 'success',
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      title,
      message,
      type: 'error',
      duration: 0, // Erros não removem automaticamente por padrão
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      title,
      message,
      type: 'warning',
      duration: 7000, // Warnings ficam um pouco mais tempo
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      title,
      message,
      type: 'info',
      ...options
    });
  }, [addNotification]);

  // Funções específicas para o CRM
  const showBusinessStatusChange = useCallback((businessName: string, oldStatus: string, newStatus: string) => {
    return showSuccess(
      'Status Atualizado',
      `${businessName}: ${oldStatus} → ${newStatus}`,
      {
        action: {
          label: 'Ver Detalhes',
          onClick: () => {
            // Navegar para a página do negócio
            window.location.href = '/businesses';
          }
        }
      }
    );
  }, [showSuccess]);

  const showCreatorStatusChange = useCallback((creatorName: string, oldStatus: string, newStatus: string) => {
    return showSuccess(
      'Criador Atualizado',
      `${creatorName}: ${oldStatus} → ${newStatus}`,
      {
        action: {
          label: 'Ver Criadores',
          onClick: () => {
            window.location.href = '/creators';
          }
        }
      }
    );
  }, [showSuccess]);

  const showCampaignStatusChange = useCallback((campaignName: string, oldStatus: string, newStatus: string) => {
    return showSuccess(
      'Campanha Atualizada',
      `${campaignName}: ${oldStatus} → ${newStatus}`,
      {
        action: {
          label: 'Ver Jornada',
          onClick: () => {
            window.location.href = '/jornada';
          }
        }
      }
    );
  }, [showSuccess]);

  const showNewBusinessCreated = useCallback((businessName: string) => {
    return showSuccess(
      'Novo Negócio Criado',
      `${businessName} foi adicionado ao sistema`,
      {
        action: {
          label: 'Ver Negócios',
          onClick: () => {
            window.location.href = '/businesses';
          }
        }
      }
    );
  }, [showSuccess]);

  const showNewCreatorAdded = useCallback((creatorName: string) => {
    return showSuccess(
      'Novo Criador Adicionado',
      `${creatorName} foi adicionado ao sistema`,
      {
        action: {
          label: 'Ver Criadores',
          onClick: () => {
            window.location.href = '/creators';
          }
        }
      }
    );
  }, [showSuccess]);

  const showNewCampaignCreated = useCallback((campaignName: string) => {
    return showSuccess(
      'Nova Campanha Criada',
      `${campaignName} foi criada com sucesso`,
      {
        action: {
          label: 'Ver Campanhas',
          onClick: () => {
            window.location.href = '/campaigns';
          }
        }
      }
    );
  }, [showSuccess]);

  const showDataSyncSuccess = useCallback((source: 'Supabase' | 'Google Sheets', count: number, entity: string) => {
    return showSuccess(
      'Sincronização Concluída',
      `${count} ${entity} sincronizados com ${source}`,
      {
        duration: 3000
      }
    );
  }, [showSuccess]);

  const showDataSyncError = useCallback((source: 'Supabase' | 'Google Sheets', error: string) => {
    return showError(
      'Erro na Sincronização',
      `Falha ao sincronizar com ${source}: ${error}`,
      {
        action: {
          label: 'Tentar Novamente',
          onClick: () => {
            window.location.reload();
          }
        }
      }
    );
  }, [showError]);

  const showMigrationProgress = useCallback((step: string, progress: number) => {
    return showInfo(
      'Migração em Andamento',
      `${step} - ${progress}% concluído`,
      {
        duration: 2000
      }
    );
  }, [showInfo]);

  const showSystemMaintenance = useCallback((message: string) => {
    return showWarning(
      'Manutenção do Sistema',
      message,
      {
        duration: 0 // Não remove automaticamente
      }
    );
  }, [showWarning]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    
    // Funções básicas
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Funções específicas do CRM
    showBusinessStatusChange,
    showCreatorStatusChange,
    showCampaignStatusChange,
    showNewBusinessCreated,
    showNewCreatorAdded,
    showNewCampaignCreated,
    showDataSyncSuccess,
    showDataSyncError,
    showMigrationProgress,
    showSystemMaintenance
  };
};
