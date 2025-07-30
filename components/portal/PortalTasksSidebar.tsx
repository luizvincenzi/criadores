'use client';

import React, { useState, useEffect } from 'react';
import { usePortalAuth } from '@/hooks/usePortalAuth';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  assigned_to?: string;
  business_name?: string;
  campaign_name?: string;
  created_at: string;
  updated_at: string;
}

export default function PortalTasksSidebar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'review' | 'done'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const { user } = usePortalAuth();

  // Carregar tarefas do portal
  const loadTasks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('portal_token');
      let url = '/api/portal/tasks';
      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tasks) {
          // Ordenar tarefas: não concluídas primeiro, depois por prioridade
          const sortedTasks = data.tasks.sort((a: Task, b: Task) => {
            // Primeiro critério: status (não concluídas primeiro)
            if (a.status === 'done' && b.status !== 'done') return 1;
            if (a.status !== 'done' && b.status === 'done') return -1;

            // Segundo critério: prioridade
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority] || 1;
            const bPriority = priorityOrder[b.priority] || 1;
            if (aPriority !== bPriority) return bPriority - aPriority;

            // Terceiro critério: data de vencimento
            if (a.due_date && b.due_date) {
              return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            }
            if (a.due_date && !b.due_date) return -1;
            if (!a.due_date && b.due_date) return 1;

            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });

          setTasks(sortedTasks);
        } else {
          setTasks([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas do portal:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-success';
      case 'in_progress': return 'bg-warning';
      case 'review': return 'bg-info';
      default: return 'bg-outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'A fazer';
      case 'in_progress': return 'Em andamento';
      case 'review': return 'Em revisão';
      case 'done': return 'Concluída';
      default: return status;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-error text-xs">🔥</span>;
      case 'high':
        return <span className="text-warning text-xs">⚡</span>;
      case 'medium':
        return <span className="text-info text-xs">📋</span>;
      default:
        return <span className="text-outline text-xs">📝</span>;
    }
  };

  // Calcular tarefas não concluídas para badge
  const uncompletedTasks = tasks.filter(task => task.status !== 'done').length;

  return (
    <aside className="w-80 bg-surface border-l border-outline-variant">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface">Tarefas</h2>
            {uncompletedTasks > 0 && (
              <div className="bg-primary text-on-primary text-xs font-medium px-2 py-1 rounded-full">
                {uncompletedTasks}
              </div>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {user?.user_type === 'empresa' 
              ? 'Tarefas relacionadas às suas campanhas' 
              : 'Suas tarefas de criador'
            }
          </p>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b border-outline-variant">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 border border-outline rounded-xl bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          >
            <option value="all">Todas as tarefas</option>
            <option value="todo">A fazer</option>
            <option value="in_progress">Em andamento</option>
            <option value="review">Em revisão</option>
            <option value="done">Concluídas</option>
          </select>
        </div>

        {/* Lista de tarefas */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-on-surface-variant">Carregando tarefas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-on-surface-variant mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M3 6h18M3 12h18M3 18h18" />
              </svg>
              <p className="text-sm text-on-surface-variant">Nenhuma tarefa encontrada</p>
              <p className="text-xs text-on-surface-variant mt-1">
                {statusFilter !== 'all' ? 'Tente alterar o filtro' : 'Suas tarefas aparecerão aqui'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/50 hover:border-primary/30"
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskDetail(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getPriorityIcon(task.priority)}
                        <h4 className="text-sm font-medium text-on-surface line-clamp-2 flex-1">
                          {task.title}
                        </h4>
                      </div>
                      
                      {(task.business_name || task.campaign_name) && (
                        <p className="text-xs text-on-surface-variant mb-1 truncate">
                          {task.business_name || task.campaign_name}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {task.due_date && (
                          <p className="text-xs text-on-surface-variant">
                            {new Date(task.due_date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-on-surface-variant">
                            {getStatusLabel(task.status)}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer com informações */}
        <div className="p-4 border-t border-outline-variant bg-surface-container">
          <div className="text-center">
            <p className="text-xs text-on-surface-variant">
              {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''} 
              {uncompletedTasks > 0 && ` • ${uncompletedTasks} pendente${uncompletedTasks !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de detalhes da tarefa - Simplificado para portal */}
      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-on-surface">Detalhes da Tarefa</h3>
                <button
                  onClick={() => {
                    setShowTaskDetail(false);
                    setSelectedTask(null);
                  }}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-on-surface mb-2">{selectedTask.title}</h4>
                  {selectedTask.description && (
                    <p className="text-sm text-on-surface-variant">{selectedTask.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-on-surface-variant">Status:</span>
                    <p className="text-on-surface font-medium">{getStatusLabel(selectedTask.status)}</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Prioridade:</span>
                    <p className="text-on-surface font-medium capitalize">{selectedTask.priority}</p>
                  </div>
                  {selectedTask.due_date && (
                    <div className="col-span-2">
                      <span className="text-on-surface-variant">Prazo:</span>
                      <p className="text-on-surface font-medium">
                        {new Date(selectedTask.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
