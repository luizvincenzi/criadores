'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomSheet from '../BottomSheet';
import { SocialContent } from './StrategistContentPlanningView';

interface MobileStrategistContentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  content: SocialContent | null;
  initialDate: Date | null;
  businessId: string;
  strategistId: string;
}

export default function MobileStrategistContentSheet({
  isOpen,
  onClose,
  onSave,
  content,
  initialDate,
  businessId,
  strategistId
}: MobileStrategistContentSheetProps) {
  const getInitialFormData = () => ({
    title: '',
    description: '',
    briefing: '',
    content_type: 'post' as 'post' | 'reels' | 'story',
    platforms: [] as string[],
    scheduled_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : '',
    scheduled_time: '14:30',
    notes: ''
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (content) {
      setFormData({
        title: content.title || '',
        description: content.description || '',
        briefing: content.briefing || '',
        content_type: content.content_type,
        platforms: content.platforms || [],
        scheduled_date: content.scheduled_date.split('T')[0],
        scheduled_time: content.scheduled_time || '14:30',
        notes: content.notes || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        briefing: '',
        content_type: 'post',
        platforms: [],
        scheduled_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        scheduled_time: '14:30',
        notes: ''
      });
    }
  }, [isOpen, content, initialDate]);

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
      const url = content
        ? `/api/business-content/${content.id}`
        : '/api/business-content';

      const method = content ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        business_id: businessId,
        strategist_id: strategistId
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar conteúdo');
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
      const response = await fetch(`/api/business-content/${content.id}`, {
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

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const typeConfig = {
    post: {
      label: 'POST',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    reels: {
      label: 'REELS',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    story: {
      label: 'STORY',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const platformConfig = {
    Instagram: {
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: 'text-pink-600'
    },
    TikTok: {
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      color: 'text-gray-900'
    },
    YouTube: {
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      color: 'text-red-600'
    },
    Website: {
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      color: 'text-gray-600'
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[85, 95]}
      defaultSnap={1}
    >
      {/* iOS 26 Glass Background */}
      <div className="flex flex-col h-full bg-gradient-to-b from-blue-100/60 via-purple-50/40 to-white backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header - iOS Style */}
          <div className="flex-shrink-0 px-5 pt-4 pb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {content ? 'Editar Conteúdo' : 'Novo Conteúdo'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-gray-200/60 rounded-full text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5" style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* Content Type Selector - iOS Style */}
            <div className="flex gap-2 bg-gray-100/60 p-1.5 rounded-2xl">
              {(['post', 'reels', 'story'] as const).map(type => {
                const config = typeConfig[type];
                const isSelected = formData.content_type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, content_type: type }))}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {config.icon}
                    <span className="text-xs font-semibold">{config.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Title Input - Glass Card */}
            <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm p-4">
              <label className="block text-xs font-semibold text-gray-400 tracking-wider mb-2">
                TÍTULO DO POST
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-transparent text-gray-900 text-base placeholder-gray-400 focus:outline-none"
                placeholder="Ex: Lançamento Verão..."
                required
                autoComplete="off"
              />
            </div>

            {/* Date and Time - Glass Cards Side by Side */}
            <div className="grid grid-cols-2 gap-3">
              {/* Date Card - usando label como wrapper para tornar clicável */}
              <label className="block rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm p-4 cursor-pointer active:bg-white/90 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <span className="block text-xs font-semibold text-gray-400 tracking-wider mb-1">
                  DATA
                </span>
                <div className="flex items-center justify-between">
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    className="text-base font-semibold text-gray-900 bg-transparent border-none outline-none w-full cursor-pointer"
                    style={{ WebkitAppearance: 'none', colorScheme: 'light' }}
                    required
                  />
                </div>
              </label>

              {/* Time Card - usando label como wrapper para tornar clicável */}
              <label className="block rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm p-4 cursor-pointer active:bg-white/90 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <span className="block text-xs font-semibold text-gray-400 tracking-wider mb-1">
                  HORÁRIO
                </span>
                <div className="flex items-center justify-between">
                  <input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className="text-base font-semibold text-gray-900 bg-transparent border-none outline-none w-full cursor-pointer"
                    style={{ WebkitAppearance: 'none', colorScheme: 'light' }}
                  />
                </div>
              </label>
            </div>

            {/* Platforms - iOS Style Grid */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 tracking-wider mb-3">
                ONDE PUBLICAR?
              </label>
              <div className="flex gap-3">
                {['Instagram', 'TikTok', 'YouTube', 'Website'].map(platform => {
                  const isSelected = formData.platforms.includes(platform);
                  const config = platformConfig[platform as keyof typeof platformConfig];
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
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-white shadow-lg border-2 border-blue-500 ' + config.color
                          : 'bg-gray-100/60 text-gray-400'
                      }`}
                    >
                      {config.icon}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Briefing - Glass Card */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 tracking-wider mb-2">
                DETALHES
              </label>
              <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm p-4">
                <textarea
                  value={formData.briefing}
                  onChange={(e) => setFormData(prev => ({ ...prev, briefing: e.target.value }))}
                  className="w-full bg-transparent text-gray-900 text-base placeholder-gray-400 focus:outline-none resize-none"
                  placeholder="Escreva o briefing aqui..."
                  rows={4}
                />
              </div>
            </div>

            {/* Extra space */}
            <div className="h-4" />
          </div>

          {/* Footer - iOS Style */}
          <div className="flex-shrink-0 px-5 pb-6 pt-2 bg-gradient-to-t from-white via-white to-transparent">
            <div className="flex items-center gap-3">
              {content && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-full active:scale-95 transition-all disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-semibold text-base active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : content ? 'Salvar Alterações' : 'Criar Conteúdo'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </BottomSheet>
  );
}

