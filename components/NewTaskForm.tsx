'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

interface NewTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

interface Business {
  id: string;
  name: string;
}

interface Campaign {
  id: string;
  title: string;
  month: string;
  business_id: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

export function NewTaskForm({ isOpen, onClose, onTaskCreated }: NewTaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'custom',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    assigned_to: '',
    business_id: '',
    campaign_id: '',
    journey_stage: '',
    estimated_hours: ''
  });

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { authenticatedFetch } = useAuthenticatedFetch();

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadBusinesses();
      loadUsers();
    }
  }, [isOpen]);

  // Carregar campanhas quando business for selecionado
  useEffect(() => {
    if (formData.business_id) {
      loadCampaigns(formData.business_id);
    } else {
      setCampaigns([]);
    }
  }, [formData.business_id]);

  const loadBusinesses = async () => {
    try {
      const response = await authenticatedFetch('/api/businesses');
      const data = await response.json();
      if (data.businesses) {
        setBusinesses(data.businesses);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const loadCampaigns = async (businessId: string) => {
    try {
      const response = await authenticatedFetch(`/api/campaigns?business_id=${businessId}`);
      const data = await response.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await authenticatedFetch('/api/users');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Buscar dados da empresa e campanha selecionadas
      const selectedBusiness = businesses.find(b => b.id === formData.business_id);
      const selectedCampaign = campaigns.find(c => c.id === formData.campaign_id);

      const taskData = {
        title: formData.title,
        description: formData.description || null,
        task_type: formData.task_type,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to || null,
        created_by: user?.id || '00000000-0000-0000-0000-000000000001',
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
        
        // Dados específicos da jornada
        business_name: selectedBusiness?.name || 'Tarefa Geral',
        campaign_month: selectedCampaign?.month || new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        journey_stage: formData.journey_stage || 'Reunião de briefing',
        business_id: formData.business_id || null,
        campaign_id: formData.campaign_id || null,
        
        is_auto_generated: false,
        blocks_stage_progression: false
      };

      const response = await authenticatedFetch('/api/jornada-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        onTaskCreated();
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        console.error('Erro ao criar tarefa:', error);
        alert('Erro ao criar tarefa: ' + (error.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      alert('Erro ao criar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      task_type: 'custom',
      priority: 'medium',
      status: 'todo',
      due_date: '',
      assigned_to: '',
      business_id: '',
      campaign_id: '',
      journey_stage: '',
      estimated_hours: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-60"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-70 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Nova Tarefa</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o título da tarefa"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva a tarefa"
                rows={3}
              />
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <select
                value={formData.business_id}
                onChange={(e) => handleInputChange('business_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma empresa</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Campanha */}
            {formData.business_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campanha
                </label>
                <select
                  value={formData.campaign_id}
                  onChange={(e) => handleInputChange('campaign_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma campanha</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.title} - {campaign.month}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Estágio da Jornada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estágio da Jornada
              </label>
              <select
                value={formData.journey_stage}
                onChange={(e) => handleInputChange('journey_stage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um estágio</option>
                <option value="Reunião de briefing">Reunião de briefing</option>
                <option value="Agendamentos">Agendamentos</option>
                <option value="Entrega final">Entrega final</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>

            {/* Prioridade e Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todo">A fazer</option>
                  <option value="in_progress">Em andamento</option>
                  <option value="review">Em revisão</option>
                  <option value="done">Concluído</option>
                </select>
              </div>
            </div>

            {/* Atribuído a */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Atribuído a
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Não atribuído</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Data de vencimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de vencimento
              </label>
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Estimativa de horas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimativa (horas)
              </label>
              <input
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 2"
                min="0"
                step="0.5"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Criando...' : 'Criar Tarefa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
