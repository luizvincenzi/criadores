'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { SocialContent } from './ContentPlanningView';
import { useAuthStore } from '@/store/authStore';
import { ContentTypeIcon } from '@/components/icons/ContentTypeIcons';
import { PlatformIcon, platformNames } from '@/components/icons/PlatformIcons';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  content?: SocialContent | null;
  initialDate?: Date | null;
  businessId?: string;
  strategistId?: string; // ID do strategist para contexto de strategist
}

interface User {
  id: string;
  full_name: string;
  role?: string; // Para identificar se é owner ou strategist
}

export default function ContentModal({
  isOpen,
  onClose,
  onSave,
  content,
  initialDate,
  businessId,
  strategistId
}: ContentModalProps) {
  const { user: currentUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    briefing: '',
    content_type: 'post' as 'post' | 'reels' | 'story',
    platforms: [] as string[],
    scheduled_date: '',
    scheduled_time: '',
    assigned_to: '',
    is_executed: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUsers();
  }, [businessId, strategistId]);

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
        assigned_to: content.assigned_to || '',
        is_executed: content.is_executed
      });
    } else if (initialDate) {
      // Novo: usar data inicial, SEM atribuir responsável automaticamente
      setFormData(prev => ({
        ...prev,
        scheduled_date: format(initialDate, 'yyyy-MM-dd'),
        assigned_to: '' // Deixar vazio para o usuário escolher
      }));
    }
  }, [content, initialDate, currentUser]);

  const loadUsers = async () => {
    try {
      // Se for contexto de business owner (apenas businessId, sem strategistId)
      if (businessId && !strategistId) {
        console.log('🔍 Carregando responsáveis para business owner:', { businessId });

        const responsibleUsers: User[] = [];

        // 1. Buscar platform_users relacionados a esse business_id
        const platformUsersResponse = await fetch(`/api/platform/users?business_id=${businessId}&active=true`);
        const platformUsersData = await platformUsersResponse.json();

        if (platformUsersData.success && platformUsersData.users) {
          // Adicionar todos os platform_users do business (owners, creators, etc)
          platformUsersData.users.forEach((user: any) => {
            let roleLabel = '';
            if (user.role === 'business_owner') roleLabel = ' (Dono)';
            else if (user.role === 'creator') roleLabel = ' (Criador)';
            else if (user.role === 'marketing_strategist') roleLabel = ' (Estrategista)';

            responsibleUsers.push({
              id: user.id,
              full_name: `${user.full_name}${roleLabel}`,
              role: user.role
            });
          });
        }

        // 2. Buscar strategist relacionado ao business (se houver)
        const businessResponse = await fetch(`/api/supabase/businesses/${businessId}`);
        const businessData = await businessResponse.json();

        if (businessData.success && businessData.business?.strategist_id) {
          const strategistId = businessData.business.strategist_id;

          // Verificar se o strategist já não está na lista
          const strategistExists = responsibleUsers.some(u => u.id === strategistId);

          if (!strategistExists) {
            const strategistResponse = await fetch(`/api/platform/users/${strategistId}`);
            const strategistData = await strategistResponse.json();

            if (strategistData.success && strategistData.user) {
              responsibleUsers.push({
                id: strategistData.user.id,
                full_name: `${strategistData.user.full_name} (Estrategista)`,
                role: 'marketing_strategist'
              });
            }
          }
        }

        console.log('✅ Responsáveis carregados para business owner:', responsibleUsers);
        setUsers(responsibleUsers);
      }
      // Se for contexto de strategist (businessId E strategistId fornecidos)
      else if (businessId && strategistId) {
        console.log('🔍 Carregando responsáveis para strategist:', { businessId, strategistId });

        const responsibleUsers: User[] = [];

        // 1. Buscar dados do business para pegar o owner
        const businessResponse = await fetch(`/api/supabase/businesses/${businessId}`);
        const businessData = await businessResponse.json();

        if (businessData.success && businessData.business) {
          const business = businessData.business;

          // Buscar platform_user do business owner
          if (business.platform_owner_email) {
            const ownerResponse = await fetch(`/api/platform/users?email=${encodeURIComponent(business.platform_owner_email)}`);
            const ownerData = await ownerResponse.json();

            if (ownerData.success && ownerData.user) {
              responsibleUsers.push({
                id: ownerData.user.id,
                full_name: `${business.platform_owner_name || ownerData.user.full_name} (Dono)`,
                role: 'business_owner'
              });
            }
          }
        }

        // 2. Buscar dados da strategist
        const strategistResponse = await fetch(`/api/platform/users/${strategistId}`);
        const strategistData = await strategistResponse.json();

        if (strategistData.success && strategistData.user) {
          responsibleUsers.push({
            id: strategistData.user.id,
            full_name: `${strategistData.user.full_name} (Estrategista)`,
            role: 'marketing_strategist'
          });
        }

        console.log('✅ Responsáveis carregados para strategist:', responsibleUsers);
        setUsers(responsibleUsers);
      } else {
        // Contexto normal (CRM interno): buscar usuários da tabela users (admin, vendas, ops, manager)
        const roles = 'admin,vendas,ops,manager';
        const response = await fetch(`/api/users?roles=${roles}&active=true`);
        const data = await response.json();

        if (data.users) {
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

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

    console.log('📝 handleSubmit chamado');
    console.log('📝 formData:', formData);

    if (!validate()) {
      console.log('❌ Validação falhou');
      return;
    }

    setLoading(true);

    try {
      // 🔑 Determinar qual API usar baseado no contexto
      // Se tiver businessId, usar /api/business-content (business owners e strategists)
      // Caso contrário, usar /api/content-calendar (CRM interno)
      const isBusinessContext = !!businessId;

      const url = content
        ? (isBusinessContext ? `/api/business-content/${content.id}` : `/api/content-calendar/${content.id}`)
        : (isBusinessContext ? '/api/business-content' : '/api/content-calendar');

      const method = content ? 'PUT' : 'POST';

      console.log(`📤 Enviando ${method} para ${url}`);
      console.log('📤 Contexto: ${isBusinessContext ? 'Business' : 'CRM Interno'}`);
      console.log('📤 Dados:', formData);

      // 🔒 Adicionar business_id se fornecido (para business owners e strategists)
      const payload = businessId
        ? { ...formData, business_id: businessId }
        : formData;

      console.log('📤 Payload final:', payload);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📥 Resposta:', data);

      if (data.success) {
        console.log('✅ Conteúdo salvo com sucesso!');

        // Se for criação de novo conteúdo E tiver usuário atribuído
        if (!content && formData.assigned_to && data.content) {
          console.log('📧 Enviando email e criando evento no Google Calendar...');

          // Buscar dados do usuário atribuído
          const userResponse = await fetch(`/api/users/${formData.assigned_to}`);
          const userData = await userResponse.json();

          if (userData.success && userData.user) {
            const user = userData.user;

            // Enviar email em paralelo com criação do evento
            Promise.all([
              // Enviar email
              fetch('/api/email/send-content-assignment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userEmail: user.email,
                  userName: user.full_name,
                  contentType: formData.content_type,
                  contentTitle: formData.title,
                  scheduledDate: formData.scheduled_date,
                  scheduledTime: formData.scheduled_time,
                  platforms: formData.platforms,
                  briefing: formData.briefing,
                })
              }),

              // Criar evento no Google Calendar
              fetch('/api/google-calendar/create-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contentId: data.content.id,
                  contentType: formData.content_type,
                  contentTitle: formData.title,
                  scheduledDate: formData.scheduled_date,
                  scheduledTime: formData.scheduled_time,
                  platforms: formData.platforms,
                  briefing: formData.briefing,
                  userEmail: user.email,
                })
              })
            ]).then(([emailRes, calendarRes]) => {
              console.log('✅ Email e Google Calendar processados');
            }).catch(err => {
              console.error('⚠️ Erro ao enviar notificações (não crítico):', err);
            });
          }
        }

        onSave();
      } else {
        console.error('❌ Erro ao salvar:', data.error);
        alert(`Erro ao salvar conteúdo: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert('Erro ao salvar conteúdo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!content?.id) return;

    const confirmDelete = window.confirm('Tem certeza que deseja deletar este conteúdo?');
    if (!confirmDelete) return;

    setLoading(true);

    try {
      console.log(`🗑️ Deletando conteúdo ID: ${content.id}`);

      // 🔑 Determinar qual API usar baseado no contexto
      const isBusinessContext = !!businessId;
      const url = isBusinessContext
        ? `/api/business-content/${content.id}`
        : `/api/content-calendar/${content.id}`;

      console.log(`🗑️ URL: ${url} (contexto: ${isBusinessContext ? 'Business' : 'CRM'})`);

      const response = await fetch(url, {
        method: 'DELETE'
      });

      const data = await response.json();
      console.log('📥 Resposta:', data);

      if (data.success) {
        console.log('✅ Conteúdo deletado com sucesso!');
        onSave(); // Recarrega a lista
      } else {
        console.error('❌ Erro ao deletar:', data.error);
        alert(`Erro ao deletar conteúdo: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      alert('Erro ao deletar conteúdo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col z-10">
        {/* Header FIXO */}
        <div className="flex-shrink-0 bg-[#f5f5f5] px-6 py-4 flex items-center justify-between rounded-t-2xl border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Onest, sans-serif' }}>
            Conteúdo
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-lg"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Form - Layout em 2 colunas */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* COLUNA 1 */}
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
                          flex-1 py-2 px-3 rounded-lg border-2 font-medium transition-all text-sm
                          ${formData.content_type === type
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        <ContentTypeIcon type={type} className="w-4 h-4" />
                        <span className="ml-2">
                          {type === 'post' && 'Post'}
                          {type === 'reels' && 'Reels'}
                          {type === 'story' && 'Story'}
                        </span>
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
                    className={`
                      w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.title ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="Ex: Tutorial de edição de vídeo"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Data e Hora */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                      className={`
                        w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${errors.scheduled_date ? 'border-red-500' : 'border-gray-300'}
                      `}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Responsável */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável
                  </label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* COLUNA 2 */}
              <div className="space-y-4">
                {/* Plataformas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plataformas *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['instagram', 'tiktok', 'youtube', 'kwai'] as const).map(platformId => (
                      <button
                        key={platformId}
                        type="button"
                        onClick={() => handlePlatformToggle(platformId)}
                        className={`
                          py-2 px-3 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 text-sm
                          ${formData.platforms.includes(platformId)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        <PlatformIcon platform={platformId} className="w-4 h-4" />
                        <span>{platformNames[platformId]}</span>
                      </button>
                    ))}
                  </div>
                  {errors.platforms && (
                    <p className="mt-1 text-sm text-red-600">{errors.platforms}</p>
                  )}
                </div>

                {/* Briefing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Briefing / Instruções
                  </label>
                  <textarea
                    value={formData.briefing}
                    onChange={(e) => setFormData(prev => ({ ...prev, briefing: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Detalhes sobre como criar o conteúdo, referências, estilo, etc."
                  />
                </div>

                {/* Marcar como executado (só aparece em edição) */}
                {content && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="is_executed"
                      checked={formData.is_executed}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_executed: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_executed" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Marcar como executado
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer FIXO */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            {content && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Deletando...' : '🗑️ Deletar'}
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

