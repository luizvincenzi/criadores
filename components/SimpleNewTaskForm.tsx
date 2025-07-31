'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/authStore';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

interface SimpleNewTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function SimpleNewTaskForm({ isOpen, onClose, onTaskCreated }: SimpleNewTaskFormProps) {
  const { user } = useAuthStore();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Verificar se é usuário business (não admin)
  const isBusinessUser = user?.role !== 'admin';

  const [formData, setFormData] = useState({
    name: '',
    category: 'outros', // Nova categoria
    priority: 'medium', // Usar valor válido do enum
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }),
    assignedTo: user?.id || '',
    scheduleInCalendar: false
  });

  useEffect(() => {
    if (isOpen && !isBusinessUser) {
      loadUsers();
    }
  }, [isOpen, isBusinessUser]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users?active=true&limit=50');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      let combinedDateTime = null;
      if (formData.dueDate && formData.dueTime) {
        combinedDateTime = `${formData.dueDate}T${formData.dueTime}:00`;
      }

      const taskData = {
        title: formData.name,
        description: null,
        task_type: 'custom',
        priority: formData.priority,
        status: 'todo',
        due_date: combinedDateTime,
        assigned_to: isBusinessUser ? user?.id : (formData.assignedTo || user?.id),
        created_by: user?.id,
        estimated_hours: null,
        business_name: formData.category === 'campanhas' ? 'Campanhas' :
                      formData.category === 'criadores' ? 'Criadores' : 'Outros',
        campaign_month: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        journey_stage: 'Reunião de briefing', // Usar sempre um valor válido do enum
        business_id: null,
        campaign_id: null,
        is_auto_generated: false,
        blocks_stage_progression: false
      };

      const response = await fetch('/api/jornada-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      const result = await response.json();
      const createdTask = result.task;

      if (formData.scheduleInCalendar && createdTask?.id) {
        try {
          console.log('📅 Agendando tarefa no Google Calendar...');
          
          const calendarResponse = await authenticatedFetch('/api/calendar-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              taskId: createdTask.id,
              action: 'create'
            }),
          });

          if (calendarResponse.ok) {
            const calendarResult = await calendarResponse.json();
            console.log('✅ Tarefa agendada no Google Calendar:', calendarResult.message);
          } else {
            console.warn('⚠️ Erro ao agendar no Google Calendar, mas tarefa foi criada');
          }
        } catch (calendarError) {
          console.warn('⚠️ Erro ao agendar no Google Calendar:', calendarError);
        }
      }

      setFormData({
        name: '',
        category: 'outros',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        assignedTo: user?.id || '',
        scheduleInCalendar: false
      });

      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      alert('Erro ao criar tarefa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/60 z-[999999]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[9999999] p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Nova Tarefa</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nova Tarefa *</label>
              <textarea
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                placeholder="O que precisa ser feito?"
                required
                rows={4}
              />
            </div>

            {/* Categoria */}
            <div className="mb-4">
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
                    onClick={() => handleInputChange('category', category.value)}
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

            {/* Prioridade */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-800 border-green-200' },
                  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800 border-red-200' }
                ].map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => handleInputChange('priority', priority.value)}
                    className={`px-3 py-2 text-xs font-medium border rounded-lg transition-colors ${
                      formData.priority === priority.value
                        ? priority.color
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Campo Responsável - apenas para admins */}
            {!isBusinessUser && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um responsável</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => handleInputChange('dueTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {formData.dueDate && formData.dueTime && (
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="scheduleInCalendar"
                  checked={formData.scheduleInCalendar}
                  onChange={(e) => handleInputChange('scheduleInCalendar', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="scheduleInCalendar" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 2v4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 19h6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 16v6" />
                  </svg>
                  <span>Agendar no Google Calendar</span>
                </label>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Criando...' : 'Criar Tarefa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}
