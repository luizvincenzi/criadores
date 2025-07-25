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

  const [formData, setFormData] = useState({
    name: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0], // Data de hoje
    dueTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }), // Hora atual
    assignedTo: user?.id || ''
  });

  // Carregar usuários
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Definir usuário logado como padrão
  useEffect(() => {
    if (user && !formData.assignedTo) {
      setFormData(prev => ({
        ...prev,
        assignedTo: user.id
      }));
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const response = await authenticatedFetch('/api/users?active=true&limit=50');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Por favor, descreva a tarefa');
      return;
    }

    setIsLoading(true);

    try {
      const taskData = {
        title: formData.name.trim(),
        description: null,
        task_type: 'custom',
        priority: formData.priority,
        status: 'todo',
        due_date: formData.dueDate ? `${formData.dueDate}T${formData.dueTime}:00` : null,
        assigned_to: formData.assignedTo || null,
        created_by: user?.id || '00000000-0000-0000-0000-000000000002',
        estimated_hours: null,
        business_name: 'Tarefa Geral',
        campaign_month: 'julho de 2025',
        journey_stage: 'Reunião de briefing',
        business_id: null,
        campaign_id: null,
        is_auto_generated: false,
        blocks_stage_progression: false
      };

      const response = await authenticatedFetch('/api/jornada-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      // Reset form
      setFormData({
        name: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0], // Data de hoje
        dueTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }), // Hora atual
        assignedTo: user?.id || ''
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

  // Garantir que só renderiza no cliente
  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-[999999]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999999] p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Nova Tarefa</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Tarefa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                O que você precisa fazer?
              </label>
              <textarea
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
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
                    onClick={() => handleInputChange('priority', priority.value)}
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
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário
                </label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => handleInputChange('dueTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Botões */}
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
