'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import SimpleNewTaskForm from './SimpleNewTaskForm';
import { TaskDetailModal } from './TaskDetailModal';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  assigned_to?: string;
  assigned_user?: {
    full_name: string;
    email: string;
  };
  task_type?: string;
  business_name?: string;
  campaign_month?: string;
  journey_stage?: string;
  is_auto_generated?: boolean;
  blocks_stage_progression?: boolean;
  created_at: string;
  updated_at: string;
}

interface TasksSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isPortal?: boolean;
}

export function TasksSidebar({ isOpen = true, onClose, isPortal = false }: TasksSidebarProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my' | 'jornada' | 'business' | 'deals'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'review' | 'done'>('all');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const { user } = useAuthStore();
  const { user: portalUser } = usePortalAuth();
  const { hasPermission, isAdmin } = usePermissions();
  const { authenticatedFetch } = useAuthenticatedFetch();

  // Determinar qual usuário usar baseado no contexto
  const currentUser = isPortal ? portalUser : user;

  // Calcular tarefas não concluídas para notificações
  const pendingTasksCount = tasks.filter(task => task.status !== 'done').length;

  // Carregar tarefas
  const loadTasks = async () => {
    // Verificar permissões antes de carregar (apenas para CRM)
    if (!isPortal && !hasPermission('tasks', 'read')) {
      console.warn('Usuário não tem permissão para ver tarefas');
      setTasks([]);
      return;
    }

    if (!currentUser) return;

    setLoading(true);
    try {
      let url = isPortal ? '/api/portal/tasks' : '/api/jornada-tasks';
      const params = new URLSearchParams();

      // Aplicar filtros baseados no tipo selecionado
      if (filter === 'my' && currentUser?.id) {
        params.append('assigned_to', currentUser.id);
      }
      // Para usuários não-admin, o backend já filtra automaticamente suas tarefas

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      let response;
      if (isPortal) {
        // Para o portal, usar token do portal
        const token = localStorage.getItem('portal_token');
        response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        // Para o CRM, usar authenticatedFetch normal
        response = await authenticatedFetch(url);
      }

      // Verificar se a resposta é válida
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta não é JSON válido');
      }

      const data = await response.json();

      if (data.tasks) {
        // Ordenar tarefas: não concluídas primeiro, depois concluídas
        const sortedTasks = data.tasks.sort((a: Task, b: Task) => {
          // Primeiro critério: status (não concluídas primeiro)
          if (a.status === 'done' && b.status !== 'done') return 1;
          if (a.status !== 'done' && b.status === 'done') return -1;

          // Segundo critério: prioridade (alta primeiro)
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority] || 1;
          const bPriority = priorityOrder[b.priority] || 1;
          if (aPriority !== bPriority) return bPriority - aPriority;

          // Terceiro critério: data de vencimento (mais próxima primeiro)
          if (a.due_date && b.due_date) {
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          }
          if (a.due_date && !b.due_date) return -1;
          if (!a.due_date && b.due_date) return 1;

          // Último critério: data de criação (mais recente primeiro)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setTasks(sortedTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar tarefas quando abrir sidebar ou filtros mudarem
  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen, filter, statusFilter]);

  // Atualizar status da tarefa
  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      // Atualizar localmente primeiro para feedback imediato
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : undefined }
            : task
        );

        // Reordenar tarefas após atualização
        return updatedTasks.sort((a: Task, b: Task) => {
          // Primeiro critério: status (não concluídas primeiro)
          if (a.status === 'done' && b.status !== 'done') return 1;
          if (a.status !== 'done' && b.status === 'done') return -1;

          // Segundo critério: prioridade (alta primeiro)
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority] || 1;
          const bPriority = priorityOrder[b.priority] || 1;
          if (aPriority !== bPriority) return bPriority - aPriority;

          // Terceiro critério: data de vencimento (mais próxima primeiro)
          if (a.due_date && b.due_date) {
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          }
          if (a.due_date && !b.due_date) return -1;
          if (!a.due_date && b.due_date) return 1;

          // Último critério: data de criação (mais recente primeiro)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      });

      const response = await authenticatedFetch('/api/jornada-tasks', {
        method: 'PUT',
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
          completed_at: newStatus === 'done' ? new Date().toISOString() : null
        })
      });

      // Verificar se a resposta é válida
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Resposta não é JSON, mas status foi atualizado');
        await loadTasks(); // Recarregar mesmo assim
        return;
      }

      const data = await response.json();

      if (data.success !== false) {
        await loadTasks(); // Recarregar tarefas
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      // Tentar recarregar as tarefas mesmo com erro
      await loadTasks();
    }
  };

  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter cor da prioridade
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Obter ícone do status
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>;
      case 'in_progress':
        return <div className="w-4 h-4 border-2 border-blue-500 rounded bg-blue-100"></div>;
      case 'review':
        return <div className="w-4 h-4 border-2 border-yellow-500 rounded bg-yellow-100"></div>;
      case 'done':
        return (
          <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar - Estilo minimalista inspirado no SyncTasks */}
      <div
        className="fixed right-0 w-80 bg-white shadow-2xl z-40 flex flex-col border-l border-gray-100"
        style={{
          top: '0', // Começa do topo da tela
          height: '100vh' // Altura total da tela
        }}
      >
        {/* Espaço em branco atrás do header */}
        {/* Espaço em branco atrás do header */}
        <div className="h-[120px] bg-white"></div>

        {/* Container do conteúdo - ocupa o restante da altura */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header - Minimalista - FIXO */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-white flex-shrink-0">
            <div>
              <h2 className="text-base font-medium text-gray-800">Tarefas</h2>
              {isAdmin() && (
                <p className="text-xs text-blue-600 mt-1">Modo Administrador - Todas as tarefas</p>
              )}
              {!isAdmin() && (
                <p className="text-xs text-gray-500 mt-1">Suas tarefas</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-50 rounded-md transition-colors text-gray-400 hover:text-gray-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Controles - Minimalista - FIXO */}
          <div className="px-6 py-3 border-b border-gray-50 bg-white flex-shrink-0">
            {/* Botão Nova Tarefa - só se tiver permissão */}
            {hasPermission('tasks', 'write') && (
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors mb-3 shadow-sm"
              >
                + Nova Tarefa
              </button>
            )}

            {/* Filtros Compactos */}
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
              >
                {isAdmin() ? (
                  <>
                    <option value="all">Todas</option>
                    <option value="my">Minhas</option>
                    <option value="jornada">Jornada</option>
                    <option value="business">Empresas</option>
                    <option value="deals">Negócios</option>
                  </>
                ) : (
                  <>
                    <option value="my">Minhas</option>
                    <option value="jornada">Jornada</option>
                    <option value="business">Empresas</option>
                    <option value="deals">Negócios</option>
                  </>
                )}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
              >
                <option value="all">Todos</option>
                <option value="todo">A fazer</option>
                <option value="in_progress">Fazendo</option>
                <option value="review">Revisão</option>
                <option value="done">Feito</option>
              </select>
            </div>
          </div>

          {/* Lista de Tarefas - COM SCROLL CUSTOMIZADO */}
          <div className="flex-1 overflow-y-auto min-h-0 tasks-sidebar-scroll">
            <div className="h-full">
              {loading ? (
                <div className="px-6 py-8 text-center text-gray-400">
                  <div className="animate-spin w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm">Carregando...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400">
                  <div className="mb-3">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-gray-300">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M3 6h18"/>
                      <path d="M3 12h18"/>
                      <path d="M3 18h18"/>
                    </svg>
                  </div>
                  <p className="text-sm">Nenhuma tarefa encontrada</p>
                </div>
              ) : (
                <div className="px-6 py-2 space-y-1 pb-6">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="group py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border-l-2 border-transparent hover:border-l-blue-400"
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskDetail(true);
                  }}
                >
                  {/* Linha principal da tarefa */}
                  <div className="flex items-center space-x-3">
                    {/* Checkbox - Um clique marca como concluída */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Se não está concluída, marca como concluída
                        // Se já está concluída, volta para 'todo'
                        const nextStatus = task.status === 'done' ? 'todo' : 'done';
                        updateTaskStatus(task.id, nextStatus);
                      }}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                      title={task.status === 'done' ? 'Marcar como pendente' : 'Marcar como concluída'}
                    >
                      {getStatusIcon(task.status)}
                    </button>

                    {/* Conteúdo da tarefa */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium truncate ${
                          task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}>
                          {task.title}
                        </h3>

                        {/* Indicador de prioridade - apenas cor */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${
                          task.priority === 'urgent' ? 'bg-red-400' :
                          task.priority === 'high' ? 'bg-orange-400' :
                          task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                      </div>

                      {/* Metadados compactos */}
                      <div className="flex items-center space-x-3 mt-1">
                        {task.business_name && (
                          <span className="text-xs text-gray-500 truncate">
                            {task.business_name}
                          </span>
                        )}

                        {task.due_date && (
                          <span className="text-xs text-gray-400">
                            {new Date(task.due_date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </span>
                        )}

                        {task.assigned_user && (
                          <span className="text-xs text-gray-400 truncate">
                            {task.assigned_user.full_name.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
                </div>
              )}
            </div>
          </div>

        {/* Formulário Simplificado de Nova Tarefa */}
        <SimpleNewTaskForm
          isOpen={showNewTaskForm}
          onClose={() => setShowNewTaskForm(false)}
          onTaskCreated={() => {
            setShowNewTaskForm(false);
            loadTasks();
          }}
        />

        {/* Modal de Detalhes da Tarefa */}
        <TaskDetailModal
          task={selectedTask}
          isOpen={showTaskDetail}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          onTaskUpdated={() => {
            loadTasks();
          }}
          onTaskDeleted={() => {
            loadTasks();
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
        />
        </div>
      </div>
    </>
  );
}
