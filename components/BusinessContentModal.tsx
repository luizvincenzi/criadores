'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { ContentTypeIcon } from '@/components/icons/ContentTypeIcons';
import { PlatformIcon, platformNames } from '@/components/icons/PlatformIcons';

export interface BusinessSocialContent {
  id: string;
  title: string;
  description?: string;
  briefing?: string;
  content_type: 'post' | 'reels' | 'story';
  platforms: string[];
  scheduled_date: string;
  scheduled_time?: string;
  assigned_to?: string;
  assigned_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  is_executed: boolean;
  executed_at?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  business_id: string;
  strategist_id?: string;
}

interface BusinessContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  content?: BusinessSocialContent | null;
  selectedDate?: Date | null;
  businessId: string;
  strategistId?: string;
}

export default function BusinessContentModal({
  isOpen,
  onClose,
  onSave,
  content,
  selectedDate,
  businessId,
  strategistId
}: BusinessContentModalProps) {
  const { user: currentUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    briefing: '',
    content_type: 'post' as 'post' | 'reels' | 'story',
    platforms: [] as string[],
    scheduled_date: '',
    scheduled_time: '',
    is_executed: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (content) {
      // Edição: preencher com dados existentes
      setFormData({
        title: content.title,
        briefing: content.briefing || '',
        content_type: content.content_type,
        platforms: content.platforms,
        scheduled_date: content.scheduled_date,
        scheduled_time: content.scheduled_time || '',
        is_executed: content.is_executed
      });
    } else if (selectedDate) {
      // Novo: usar data selecionada
      setFormData(prev => ({
        ...prev,
        scheduled_date: format(selectedDate, 'yyyy-MM-dd')
      }));
    }
  }, [content, selectedDate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (formData.platforms.length === 0) {
      newErrors.platforms = 'Selecione pelo menos uma plataforma';
    }

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📝 [BUSINESS-CONTENT-MODAL] handleSubmit chamado');
    console.log('📝 formData:', formData);

    if (!validate()) {
      console.log('❌ Validação falhou');
      return;
    }

    setLoading(true);

    try {
      const url = content
        ? `/api/business-content/${content.id}`
        : '/api/business-content';

      const method = content ? 'PUT' : 'POST';

      console.log(`📤 Enviando ${method} para ${url}`);

      // 🔒 Payload com business_id e strategist_id
      const payload = {
        ...formData,
        business_id: businessId,
        strategist_id: strategistId || null,
        created_by: currentUser?.id || null
      };

      console.log('📤 Payload:', payload);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📥 Resposta:', data);

      if (data.success) {
        console.log('✅ Conteúdo salvo com sucesso!');
        onSave();
        onClose();
      } else {
        console.error('❌ Erro ao salvar:', data.error);
        alert(`Erro ao salvar: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar conteúdo:', error);
      alert('Erro ao salvar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!content) return;

    if (!confirm('Tem certeza que deseja deletar este conteúdo?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/business-content/${content.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      console.log('📥 Resposta:', data);

      if (data.success) {
        console.log('✅ Conteúdo deletado com sucesso!');
        onSave(); // Recarrega a lista
        onClose();
      } else {
        console.error('❌ Erro ao deletar:', data.error);
        alert(`Erro ao deletar: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar conteúdo:', error);
      alert('Erro ao deletar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {content ? 'Editar Conteúdo' : 'Novo Conteúdo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Tipo de Conteúdo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Conteúdo *
                </label>
                <div className="flex gap-2">
                  {(['post', 'reels', 'story'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, content_type: type }))}
                      className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
                        ${formData.content_type === type
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <ContentTypeIcon type={type} className="w-4 h-4" />
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Tutorial de edição de vídeo"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Briefing / Instruções */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Briefing / Instruções
                </label>
                <textarea
                  value={formData.briefing}
                  onChange={(e) => setFormData(prev => ({ ...prev, briefing: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Detalhes sobre como criar o conteúdo, referências, estilo, etc."
                />
              </div>

              {/* Plataformas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plataformas *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(platformNames).map(([key, name]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => togglePlatform(key)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                        ${formData.platforms.includes(key)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <PlatformIcon platform={key} className="w-5 h-5" />
                      <span className="text-sm">{name}</span>
                    </button>
                  ))}
                </div>
                {errors.platforms && (
                  <p className="mt-1 text-sm text-red-600">{errors.platforms}</p>
                )}
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.scheduled_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.scheduled_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduled_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 border border-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

