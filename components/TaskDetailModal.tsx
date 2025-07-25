'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    title: '',
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
      setFormData({
        title: task.title,
        priority: task.priority,
        due_date: dueDate ? dueDate.toISOString().split('T')[0] : '',
        due_time: dueDate ? dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
        assigned_to: task.assigned_to || '',
        status: task.status
      });
      loadUsers();
    }
  }, [task, isOpen]);

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
        actual_hours: formData.actual_hours ? parseInt(formData.actual_hours) : null
      };

      const response = await fetch('/api/jornada-tasks', {
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
      const response = await fetch(`/api/jornada-tasks?id=${task.id}`, {
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
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
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
                    O que você precisa fazer?
                  </label>
                  <textarea
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Descreva sua tarefa..."
                    rows={3}
                    required
                  />
                </div>

                {/* Atribuído a */}
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

                {/* Prioridade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'low', label: 'Baixa', color: 'bg-gray-100 text-gray-700 border-gray-200' },
                      { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                      { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-700 border-red-200' }
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
                    <span className={`px-3 py-1 text-sm font-medium border rounded-full ${getStatusColor(task.status)}`}>
                      {task.status === 'todo' ? 'A fazer' :
                       task.status === 'in_progress' ? 'Em andamento' :
                       task.status === 'review' ? 'Em revisão' : 'Concluído'}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium border rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'low' ? 'Baixa' :
                       task.priority === 'medium' ? 'Média' :
                       task.priority === 'high' ? 'Alta' : 'Urgente'}
                    </span>
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
