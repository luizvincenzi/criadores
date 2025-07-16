'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationSystem from '@/components/NotificationSystem';

// Tipo do contexto
type NotificationContextType = ReturnType<typeof useNotifications>;

// Criar o contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider do contexto
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationMethods = useNotifications();

  // Listener para eventos de audit log
  useEffect(() => {
    const handleAuditLogStatusChange = (event: CustomEvent) => {
      const { entity_type, entity_name, old_value, new_value } = event.detail;

      switch (entity_type) {
        case 'business':
          notificationMethods.showBusinessStatusChange(entity_name, old_value, new_value);
          break;
        case 'creator':
          notificationMethods.showCreatorStatusChange(entity_name, old_value, new_value);
          break;
        case 'campaign':
          notificationMethods.showCampaignStatusChange(entity_name, old_value, new_value);
          break;
        default:
          notificationMethods.showSuccess(
            'Status Atualizado',
            `${entity_name}: ${old_value} → ${new_value}`
          );
      }
    };

    // Adicionar listener
    window.addEventListener('auditLogStatusChange', handleAuditLogStatusChange as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('auditLogStatusChange', handleAuditLogStatusChange as EventListener);
    };
  }, [notificationMethods]);

  return (
    <NotificationContext.Provider value={notificationMethods}>
      {children}
      <NotificationSystem
        notifications={notificationMethods.notifications}
        onRemove={notificationMethods.removeNotification}
        position="top-right"
        maxNotifications={5}
      />
    </NotificationContext.Provider>
  );
};

// Hook para usar o contexto
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

// Hook de conveniência para usar apenas as funções de notificação
export const useNotify = () => {
  const context = useNotificationContext();
  
  return {
    success: context.showSuccess,
    error: context.showError,
    warning: context.showWarning,
    info: context.showInfo,
    
    // Funções específicas do CRM
    businessStatusChange: context.showBusinessStatusChange,
    creatorStatusChange: context.showCreatorStatusChange,
    campaignStatusChange: context.showCampaignStatusChange,
    newBusinessCreated: context.showNewBusinessCreated,
    newCreatorAdded: context.showNewCreatorAdded,
    newCampaignCreated: context.showNewCampaignCreated,
    dataSyncSuccess: context.showDataSyncSuccess,
    dataSyncError: context.showDataSyncError,
    migrationProgress: context.showMigrationProgress,
    systemMaintenance: context.showSystemMaintenance
  };
};
