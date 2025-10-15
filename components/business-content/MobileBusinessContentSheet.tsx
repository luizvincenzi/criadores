'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import BottomSheet from '../BottomSheet';
import { SocialContent } from './ContentPlanningView';

interface MobileContentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  content: SocialContent | null;
  initialDate: Date | null;
}

interface User {
  id: string;
  full_name: string;
}

export default function MobileContentSheet({
  isOpen,
  onClose,
  onSave,
  content,
  initialDate
}: MobileContentSheetProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    briefing: '',
    content_type: 'post' as 'post' | 'reels' | 'story',
    platforms: [] as string[],
    scheduled_date: '',
    scheduled_time: '',
    assigned_to: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Carregar usuários
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const roles = 'admin,vendas,ops,manager';
      const response = await fetch(`/api/users?roles=${roles}&active=true`);
      const data = await response.json();

      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        description: content.description || '',
        briefing: content.briefing || '',
        content_type: content.content_type,
        platforms: content.platforms || [],
        scheduled_date: content.scheduled_date.split('T')[0],
        scheduled_time: content.scheduled_time || '',
        assigned_to: content.assigned_to || '',
        notes: content.notes || ''
      });
    } else if (initialDate) {
      setFormData(prev => ({
        ...prev,
        scheduled_date: format(initialDate, 'yyyy-MM-dd')
      }));
    }
  }, [content, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Por favor, preencha o título');
      return;
    }

    if (!formData.scheduled_date) {
      alert('Por favor, selecione uma data');
      return;
    }

    if (formData.platforms.length === 0) {
      alert('Por favor, selecione pelo menos uma plataforma');
      return;
    }

    setLoading(true);

    try {
      // Verificar se houve mudança de responsável
      const previousAssignedTo = content?.assigned_to;
      const newAssignedTo = formData.assigned_to;
      const assignedToChanged = previousAssignedTo !== newAssignedTo;
      const isNewAssignment = !content && newAssignedTo; // Novo conteúdo com responsável

      const url = content
        ? `/api/content-calendar/${content.id}`
        : '/api/content-calendar';

      const method = content ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar conteúdo');
      }

      // 🔥 ENVIAR EMAIL SE HOUVER RESPONSÁVEL (NOVO OU ALTERADO)
      if ((isNewAssignment || assignedToChanged) && newAssignedTo) {
        console.log('📧 Enviando email de atribuição...');

        // Buscar dados do usuário
        const assignedUser = users.find(u => u.id === newAssignedTo);

        if (assignedUser) {
          try {
            const emailResponse = await fetch('/api/email/send-content-assignment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userEmail: assignedUser.id, // A API vai buscar o email pelo ID
                userName: assignedUser.full_name,
                contentType: formData.content_type,
                contentTitle: formData.title,
                scheduledDate: formData.scheduled_date,
                scheduledTime: formData.scheduled_time || '09:00',
                platforms: formData.platforms,
                briefing: formData.briefing || ''
              })
            });

            const emailData = await emailResponse.json();

            if (emailData.success) {
              console.log('✅ Email enviado com sucesso!');
            } else {
              console.error('❌ Erro ao enviar email:', emailData.error);
              // Não bloqueia o fluxo se o email falhar
            }
          } catch (emailError) {
            console.error('❌ Erro ao enviar email:', emailError);
            // Não bloqueia o fluxo se o email falhar
          }
        }
      }

      await onSave();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert(error.message || 'Erro ao salvar conteúdo');
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
      const response = await fetch(`/api/content-calendar/${content.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao deletar conteúdo');
      }

      await onSave();
    } catch (error: any) {
      console.error('Erro ao deletar:', error);
      alert(error.message || 'Erro ao deletar conteúdo');
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[90, 95]}
      defaultSnap={1}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {content ? 'Editar Conteúdo' : 'Novo Conteúdo'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Tipo de Conteúdo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Conteúdo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['post', 'reels', 'story'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, content_type: type }))}
                  className={`py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all ${
                    formData.content_type === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {type === 'post' ? 'Post' : type === 'reels' ? 'Reels' : 'Story'}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Post - 06/10"
              required
            />
          </div>

          {/* Briefing / Instruções */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Briefing / Instruções
            </label>
            <textarea
              value={formData.briefing}
              onChange={(e) => setFormData(prev => ({ ...prev, briefing: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva as instruções para criação do conteúdo..."
              rows={4}
            />
          </div>

          {/* Plataformas - Grid de Ícones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plataformas *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter'].map(platform => {
                const isSelected = formData.platforms.includes(platform);
                const icons = {
                  Instagram: '📷',
                  Facebook: '👥',
                  TikTok: '🎵',
                  YouTube: '▶️',
                  LinkedIn: '💼',
                  Twitter: '🐦'
                };

                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        platforms: isSelected
                          ? prev.platforms.filter(p => p !== platform)
                          : [...prev.platforms, platform]
                      }));
                    }}
                    className={`py-3 px-2 rounded-lg border-2 font-medium text-xs transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{icons[platform as keyof typeof icons]}</span>
                    <span>{platform}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data e Horário - Lado a Lado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Data *
              </label>
              <input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🕐 Horário
              </label>
              <input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Responsável - Select Melhorado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 Responsável
            </label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">Nenhum responsável</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              💡 Ao atribuir, um email será enviado automaticamente
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 space-y-2">
          {content && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Deletando...' : 'Deletar Conteúdo'}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : content ? 'Salvar Alterações' : 'Criar Conteúdo'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}

