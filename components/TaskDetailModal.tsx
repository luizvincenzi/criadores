'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useAuthStore } from '@/store/authStore';

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
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onTaskUpdated, onTaskDeleted }: TaskDetailModalProps) {
  const { user } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Verificar se é usuário business (não admin)
  const isBusinessUser = user?.role !== 'admin';
  const [calendarSyncStatus, setCalendarSyncStatus] = useState<any>(null);
  const {
    loading: calendarLoading,
    error: calendarError,
    checkSyncStatus,
    toggleSync,
    clearError
  } = useCalendarSync();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [formData, setFormData] = useState({
    title: '',
    category: 'outros',
    priority: 'medium' as Task['priority'],
    due_date: '',
    due_time: '',
    assigned_to: '',
    status: 'todo' as Task['status']
  });

  // Carregar dados da tarefa quando abrir
  useEffect(() => {
    if (task && isOpen) {
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      // Determinar categoria baseada no business_name
      let category = 'outros';
      if (task.business_name?.toLowerCase().includes('campanha')) {
        category = 'campanhas';
      } else if (task.business_name?.toLowerCase().includes('negócio') || task.business_name?.toLowerCase().includes('negocio')) {
        category = 'negocios';
      } else if (task.business_name?.toLowerCase().includes('criador')) {
        category = 'criadores';
      }

      setFormData({
        title: task.title,
        category: category,
        priority: task.priority, // Usar o valor original do enum
        due_date: dueDate ? dueDate.toISOString().split('T')[0] : '',
        due_time: dueDate ? dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
        assigned_to: task.assigned_to || '',
        status: task.status
      });
      loadUsers();
    }
  }, [task, isOpen]);

  // Verificar status de sincronização com Google Calendar
  useEffect(() => {
    if (task && isOpen) {
      checkCalendarSyncStatus();
    }
  }, [task, isOpen]);

  const checkCalendarSyncStatus = async () => {
    if (!task) return;

    try {
      const status = await checkSyncStatus(task.id);
      setCalendarSyncStatus(status);
    } catch (error) {
      console.error('Erro ao verificar status de sincronização:', error);
    }
  };

  const handleCalendarSync = async () => {
    if (!task) return;

    try {
      clearError();
      const result = await toggleSync(task.id);

      if (result) {
        // Atualizar status de sincronização
        await checkCalendarSyncStatus();

        // Mostrar mensagem de sucesso (você pode implementar um toast aqui)
        console.log('✅', result.message);
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleSave = async () => {
    if (!task) return;

    setLoading(true);
    try {
      // Combinar data e hora se ambos estiverem preenchidos
      let combinedDateTime = null;
      if (formData.due_date && formData.due_time) {
        combinedDateTime = `${formData.due_date}T${formData.due_time}:00`;
      }

      const updateData = {
        id: task.id,
        title: formData.title,
        description: null,
        status: formData.status,
        priority: formData.priority,
        due_date: combinedDateTime,
        assigned_to: formData.assigned_to || null,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseInt(formData.actual_hours) : null,
        business_name: formData.category === 'campanhas' ? 'Campanhas' :
                      formData.category === 'criadores' ? 'Criadores' : 'Outros',
        journey_stage: 'Reunião de briefing' // Usar sempre um valor válido do enum
      };

      const response = await authenticatedFetch('/api/jornada-tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        onTaskUpdated();
        setEditMode(false);
      } else {
        const error = await response.json();
        console.error('Erro ao atualizar tarefa:', error);
        alert('Erro ao atualizar tarefa: ' + (error.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      alert('Erro ao atualizar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await authenticatedFetch(`/api/jornada-tasks?id=${task.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onTaskDeleted();
        onClose();
      } else {
        const error = await response.json();
        console.error('Erro ao excluir tarefa:', error);
        alert('Erro ao excluir tarefa: ' + (error.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      alert('Erro ao excluir tarefa');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'review': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'done': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen || !task) return null;

  // Garantir que só renderiza no cliente
  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* Overlay - Cobrindo 100% da viewport incluindo header */}
      <div
        className="fixed inset-0 bg-black/60 z-[999999]"
        onClick={onClose}
      />

      {/* Modal - Acima de tudo */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999999] p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
          {/* Header - Mesmo estilo do modal de criação */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {editMode ? 'Editar Tarefa' : 'Detalhes da Tarefa'}
            </h2>
            <div className="flex items-center space-x-2">
              {!editMode && (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Editar"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m18 2 3 3-11 11-4 1 1-4 11-11z" />
                    </svg>
                  </button>

                  {/* Botão Agendar Google Calendar */}
                  <button
                    onClick={handleCalendarSync}
                    disabled={calendarLoading || !calendarSyncStatus?.canSync}
                    className={`transition-colors ${
                      calendarSyncStatus?.isSynced
                        ? 'text-green-600 hover:text-green-700'
                        : calendarSyncStatus?.canSync
                          ? 'text-blue-500 hover:text-blue-600'
                          : 'text-gray-300 cursor-not-allowed'
                    }`}
                    title={
                      calendarLoading ? 'Sincronizando...' :
                      !calendarSyncStatus?.canSync ? 'Tarefa precisa ter data de vencimento' :
                      calendarSyncStatus?.isSynced ? 'Remover do Google Calendar' : 'Agendar no Google Calendar'
                    }
                  >
                    {calendarLoading ? (
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 2v4" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18" />
                        {calendarSyncStatus?.isSynced ? (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 19h6" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 16v6" />
                          </>
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 19h6" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 16v6" />
                          </>
                        )}
                      </svg>
                    )}
                  </button>
                </>
              )}
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Excluir"
                disabled={loading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Fechar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content - Mesmo padding do modal de criação */}
          <div className="p-6 space-y-4">
            {editMode ? (
              /* Modo de Edição - Formato Minimalista */
              <div className="space-y-4">
                {/* Tarefa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Editar Tarefa
                  </label>
                  <textarea
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    placeholder="O que precisa ser feito?"
                    rows={4}
                    required
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {
                        value: 'campanhas',
                        label: 'Campanhas',
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                        ),
                        color: 'bg-purple-100 text-purple-800 border-purple-200'
                      },

                      {
                        value: 'criadores',
                        label: 'Criadores',
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        ),
                        color: 'bg-green-100 text-green-800 border-green-200'
                      },
                      {
                        value: 'outros',
                        label: 'Outros',
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        ),
                        color: 'bg-gray-100 text-gray-800 border-gray-200'
                      }
                    ].filter(category => !isBusinessUser || category.value !== 'negocios').map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                        className={`px-3 py-2 text-xs font-medium border rounded-lg transition-colors flex flex-col items-center space-y-1 ${
                          formData.category === category.value
                            ? category.color
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {category.icon}
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Atribuído a - apenas para admins */}
                {!isBusinessUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Atribuído a
                    </label>
                    <select
                      value={formData.assigned_to}
                      onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um usuário</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Prioridade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-800 border-green-200' },
                      { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                      { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800 border-red-200' }
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as Task['priority'] }))}
                        className={`px-3 py-2 text-sm font-medium border rounded-lg transition-all ${
                          formData.priority === priority.value
                            ? priority.color
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data e Hora */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário
                    </label>
                    <input
                      type="time"
                      value={formData.due_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="todo">A fazer</option>
                    <option value="in_progress">Em andamento</option>
                    <option value="review">Em revisão</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>

                {/* Botões - Mesmo estilo do modal de criação */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            ) : (
              /* Modo de Visualização */
              <div className="space-y-6">
                {/* Título e Status */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h3>
                  <div className="flex items-center space-x-3">
                    {/* Categoria */}
                    <span className={`px-3 py-1 text-sm font-medium border rounded-full flex items-center space-x-1 ${
                      task.business_name?.toLowerCase().includes('campanha') ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      task.business_name?.toLowerCase().includes('negócio') || task.business_name?.toLowerCase().includes('negocio') ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      task.business_name?.toLowerCase().includes('criador') ? 'bg-green-100 text-green-800 border-green-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      <span>
                        {task.business_name?.toLowerCase().includes('campanha') ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                        ) : task.business_name?.toLowerCase().includes('negócio') || task.business_name?.toLowerCase().includes('negocio') ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        ) : task.business_name?.toLowerCase().includes('criador') ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        )}
                      </span>
                      <span>
                        {task.business_name?.toLowerCase().includes('campanha') ? 'Campanhas' :
                         task.business_name?.toLowerCase().includes('negócio') || task.business_name?.toLowerCase().includes('negocio') ? 'Negócios' :
                         task.business_name?.toLowerCase().includes('criador') ? 'Criadores' : 'Outros'}
                      </span>
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium border rounded-full ${getStatusColor(task.status)}`}>
                      {task.status === 'todo' ? 'A fazer' :
                       task.status === 'in_progress' ? 'Em andamento' :
                       task.status === 'review' ? 'Em revisão' : 'Concluído'}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium border rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'low' ? 'Baixa' :
                       task.priority === 'medium' ? 'Média' :
                       task.priority === 'high' || task.priority === 'urgent' ? 'Alta' : 'Média'}
                    </span>

                    {/* Indicador de sincronização com Google Calendar */}
                    {calendarSyncStatus?.isSynced && (
                      <span className="px-3 py-1 text-sm font-medium border border-green-200 bg-green-50 text-green-700 rounded-full flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 2v4" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                        <span>Agendado</span>
                      </span>
                    )}

                    {calendarSyncStatus?.syncError && (
                      <span className="px-3 py-1 text-sm font-medium border border-red-200 bg-red-50 text-red-700 rounded-full flex items-center space-x-1" title={calendarSyncStatus.syncError}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Erro sync</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                {task.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Descrição</h4>
                    <p className="text-gray-600">{task.description}</p>
                  </div>
                )}

                {/* Informações da Jornada */}
                {(task.business_name || task.journey_stage) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Jornada</h4>
                    <div className="space-y-1">
                      {task.business_name && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Empresa:</span> {task.business_name}
                          {task.campaign_month && ` - ${task.campaign_month}`}
                        </p>
                      )}
                      {task.journey_stage && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Estágio:</span> {task.journey_stage}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Atribuição e Datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Atribuição</h4>
                    <p className="text-sm text-gray-600">
                      {task.assigned_user ? task.assigned_user.full_name : 'Não atribuído'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vencimento</h4>
                    <p className="text-sm text-gray-600">{formatDate(task.due_date)}</p>
                  </div>
                </div>

                {/* Horas */}
                {(task.estimated_hours || task.actual_hours) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tempo</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Estimativa</p>
                        <p className="text-sm text-gray-600">{task.estimated_hours || 0}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tempo gasto</p>
                        <p className="text-sm text-gray-600">{task.actual_hours || 0}h</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Datas de criação e atualização */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Criado em:</span> {formatDate(task.created_at)}
                    </div>
                    <div>
                      <span className="font-medium">Atualizado em:</span> {formatDate(task.updated_at)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
