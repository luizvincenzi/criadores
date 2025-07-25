'use client';

import { useState, useCallback } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';

interface CalendarSyncStatus {
  taskId: string;
  isSynced: boolean;
  eventId: string | null;
  lastSync: string | null;
  syncError: string | null;
  hasDueDate: boolean;
  canSync: boolean;
}

interface CalendarSyncResult {
  success: boolean;
  message: string;
  eventId?: string;
  action: string;
}

export function useCalendarSync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authenticatedFetch } = useAuthenticatedFetch();

  // Verificar status de sincronização de uma tarefa
  const checkSyncStatus = useCallback(async (taskId: string): Promise<CalendarSyncStatus | null> => {
    try {
      setError(null);
      
      const response = await authenticatedFetch(`/api/calendar-sync?taskId=${taskId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao verificar status de sincronização');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error('❌ Erro ao verificar status de sincronização:', err);
      setError(err.message);
      return null;
    }
  }, [authenticatedFetch]);

  // Sincronizar tarefa com Google Calendar
  const syncTask = useCallback(async (
    taskId: string, 
    action: 'create' | 'update' | 'delete'
  ): Promise<CalendarSyncResult | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📅 Iniciando sincronização: ${action} para tarefa ${taskId}`);

      const response = await authenticatedFetch('/api/calendar-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          action
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na sincronização com Google Calendar');
      }

      const result = await response.json();
      console.log(`✅ Sincronização concluída:`, result);

      return result;
    } catch (err: any) {
      console.error('❌ Erro na sincronização:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  // Agendar tarefa no Google Calendar
  const scheduleTask = useCallback(async (taskId: string): Promise<CalendarSyncResult | null> => {
    return syncTask(taskId, 'create');
  }, [syncTask]);

  // Atualizar agendamento da tarefa
  const updateSchedule = useCallback(async (taskId: string): Promise<CalendarSyncResult | null> => {
    return syncTask(taskId, 'update');
  }, [syncTask]);

  // Remover agendamento da tarefa
  const removeSchedule = useCallback(async (taskId: string): Promise<CalendarSyncResult | null> => {
    return syncTask(taskId, 'delete');
  }, [syncTask]);

  // Alternar sincronização (agendar se não estiver agendado, remover se estiver)
  const toggleSync = useCallback(async (taskId: string): Promise<CalendarSyncResult | null> => {
    try {
      // Primeiro verificar o status atual
      const status = await checkSyncStatus(taskId);
      if (!status) {
        throw new Error('Não foi possível verificar o status da tarefa');
      }

      if (!status.canSync) {
        throw new Error('Tarefa deve ter uma data de vencimento para ser agendada');
      }

      // Se já está sincronizada, remover. Se não está, criar.
      const action = status.isSynced ? 'delete' : 'create';
      return syncTask(taskId, action);
    } catch (err: any) {
      console.error('❌ Erro ao alternar sincronização:', err);
      setError(err.message);
      return null;
    }
  }, [checkSyncStatus, syncTask]);

  return {
    loading,
    error,
    checkSyncStatus,
    syncTask,
    scheduleTask,
    updateSchedule,
    removeSchedule,
    toggleSync,
    clearError: () => setError(null)
  };
}
