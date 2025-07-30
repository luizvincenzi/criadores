'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  created_at: string;
}

export const useTaskNotifications = () => {
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { hasPermission } = usePermissions();
  const { authenticatedFetch } = useAuthenticatedFetch();

  const loadPendingTasksCount = async () => {
    if (!user?.id) return;

    // Verificar se o usuário tem permissão para ver tarefas
    if (!hasPermission('tasks', 'read')) {
      setPendingTasksCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/jornada-tasks');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta não é JSON válido');
      }

      const data = await response.json();

      if (data && Array.isArray(data.tasks)) {
        // Contar apenas tarefas não concluídas
        const pendingCount = data.tasks.filter((task: Task) => task.status !== 'done').length;
        setPendingTasksCount(pendingCount);
      } else {
        setPendingTasksCount(0);
      }
    } catch (error) {
      console.error('Erro ao carregar contador de tarefas:', error);
      setPendingTasksCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Carregar contador quando o usuário estiver logado
  useEffect(() => {
    if (user?.id) {
      loadPendingTasksCount();
      
      // Atualizar a cada 30 segundos
      const interval = setInterval(loadPendingTasksCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Função para atualizar manualmente o contador
  const refreshCount = () => {
    loadPendingTasksCount();
  };

  return {
    pendingTasksCount,
    loading,
    refreshCount
  };
};
