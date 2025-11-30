'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { ContentTypeIcon } from '@/components/icons/ContentTypeIcons';
import { PlatformIcon, platformNames } from '@/components/icons/PlatformIcons';
import { Calendar, Clock, Trash2, X, Image as ImageIcon, Video, Disc, Link2, BarChart3 } from 'lucide-react';

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
    is_executed: false,
    post_link: '',
    audience_sentiment: '' as '' | 'positive' | 'neutral' | 'negative',
    observations: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (content) {
      // Edição: preencher com dados existentes
      const contentAny = content as any;
      setFormData({
        title: content.title,
        briefing: content.briefing || '',
        content_type: content.content_type,
        platforms: content.platforms,
        scheduled_date: content.scheduled_date,
        scheduled_time: content.scheduled_time || '',
        is_executed: content.is_executed,
        post_link: contentAny.post_link || '',
        audience_sentiment: contentAny.audience_sentiment || '',
        observations: contentAny.observations || ''
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

  // Mapeamento de ícones para tipos de conteúdo
  const contentTypeIcons = {
    post: ImageIcon,
    reels: Video,
    story: Disc
  };

  return (
    <div className="fixed inset-0 bg-[#f5f5f5]/95 flex items-center justify-center z-50 p-4 font-sans text-slate-900">

      {/* Main Modal Card - Glassmorphism Style */}
      <div className="relative w-full max-w-4xl overflow-hidden bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[2rem] transition-all duration-300 ease-out max-h-[90vh] flex flex-col">

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 border-b border-black/5 flex-shrink-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {content ? 'Editar Conteúdo' : 'Novo Conteúdo'}
          </h1>
          <button
            onClick={onClose}
            className="group p-2 rounded-full bg-slate-100/50 hover:bg-slate-200/80 transition-colors duration-200 outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <X className="w-5 h-5 text-slate-500 group-hover:text-slate-800" />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

              {/* Left Column */}
              <div className="lg:col-span-7 space-y-8">

                {/* Content Type - iOS Segmented Control Style */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">
                    Tipo de Conteúdo
                  </label>
                  <div className="flex p-1 bg-slate-100/80 rounded-2xl w-full">
                    {(['post', 'reels', 'story'] as const).map((type) => {
                      const isActive = formData.content_type === type;
                      const Icon = contentTypeIcons[type];
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, content_type: type }))}
                          className={`
                            flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                            transition-all duration-200
                            ${isActive
                              ? 'bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] scale-[1.02]'
                              : 'text-slate-500 hover:text-slate-700 hover:bg-black/5'}
                          `}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'opacity-70'}`} />
                          <span className="capitalize">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title Input */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`
                      w-full px-5 py-4 bg-white/50 border rounded-2xl
                      text-base font-medium text-slate-900 placeholder-slate-400
                      outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
                      transition-all shadow-sm
                      ${errors.title ? 'border-red-300' : 'border-slate-200/60'}
                    `}
                    placeholder="Ex: Lançamento de produto"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 pl-1">{errors.title}</p>
                  )}
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">
                      Data
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="date"
                        value={formData.scheduled_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                        className={`
                          w-full pl-12 pr-4 py-4 bg-white/50 border rounded-2xl
                          text-sm font-medium text-slate-900
                          outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
                          transition-all shadow-sm
                          ${errors.scheduled_date ? 'border-red-300' : 'border-slate-200/60'}
                        `}
                      />
                    </div>
                    {errors.scheduled_date && (
                      <p className="text-sm text-red-600 pl-1">{errors.scheduled_date}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">
                      Horário
                    </label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="time"
                        value={formData.scheduled_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                        className="
                          w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200/60 rounded-2xl
                          text-sm font-medium text-slate-900
                          outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
                          transition-all shadow-sm
                        "
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 space-y-8 flex flex-col">

                {/* Platforms */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">
                    Plataformas
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(platformNames).map(([key, name]) => {
                      const isSelected = formData.platforms.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => togglePlatform(key)}
                          className={`
                            group relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200
                            ${isSelected
                              ? 'bg-blue-50/50 border-blue-200 shadow-inner'
                              : 'bg-white/30 border-slate-200/50 hover:bg-white/60'}
                          `}
                        >
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center transition-colors
                            ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}
                          `}>
                            <PlatformIcon platform={key} className="w-4 h-4" />
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-slate-600'}`}>
                            {name}
                          </span>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.platforms && (
                    <p className="text-sm text-red-600 pl-1">{errors.platforms}</p>
                  )}
                </div>

                {/* Briefing Textarea */}
                <div className="space-y-3 flex-grow flex flex-col">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">
                    Briefing / Instruções
                  </label>
                  <textarea
                    value={formData.briefing}
                    onChange={(e) => setFormData(prev => ({ ...prev, briefing: e.target.value }))}
                    className="
                      flex-grow w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl
                      text-sm text-slate-700 leading-relaxed placeholder-slate-400
                      outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
                      transition-all shadow-inner resize-none min-h-[160px]
                    "
                    placeholder="Descreva os detalhes da criação, referências visuais, tom de voz e requisitos obrigatórios..."
                  />
                </div>

              </div>
            </div>

            {/* Seção de Análise Qualitativa - Aparece quando is_executed está ativo */}
            <div className={`
              border-t border-slate-100 overflow-hidden transition-all duration-300 ease-in-out
              ${formData.is_executed ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
            `}>
              <div className="p-8 space-y-6 bg-gradient-to-b from-green-50/30 to-transparent">

                {/* Link da Postagem */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">
                    <Link2 className="w-4 h-4" />
                    Link da Postagem
                  </label>
                  <input
                    type="url"
                    value={formData.post_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, post_link: e.target.value }))}
                    className="
                      w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl
                      text-sm font-medium text-slate-900 placeholder-slate-400
                      outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50
                      transition-all shadow-sm
                    "
                    placeholder="https://instagram.com/p/... ou https://tiktok.com/@..."
                  />
                  <p className="text-xs text-slate-400 pl-1">
                    Cole o link da postagem publicada (Instagram, TikTok, YouTube, etc.)
                  </p>
                </div>

                {/* Análise Qualitativa Card */}
                <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-semibold text-slate-800">Análise Qualitativa</h3>
                  </div>

                  {/* Sentimento Geral da Audiência */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">
                      Sentimento Geral da Audiência
                    </label>
                    <div className="flex p-1 bg-slate-100/80 rounded-2xl w-full">
                      {[
                        { id: 'positive', label: 'Positivo', emoji: '😊' },
                        { id: 'neutral', label: 'Neutro', emoji: '😐' },
                        { id: 'negative', label: 'Negativo', emoji: '😔' }
                      ].map((sentiment) => {
                        const isActive = formData.audience_sentiment === sentiment.id;
                        return (
                          <button
                            key={sentiment.id}
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              audience_sentiment: sentiment.id as 'positive' | 'neutral' | 'negative'
                            }))}
                            className={`
                              flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                              transition-all duration-200
                              ${isActive
                                ? 'bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-black/5'}
                            `}
                          >
                            <span className="text-lg">{sentiment.emoji}</span>
                            <span>{sentiment.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Observações e Insights */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">
                      Observações e Insights
                    </label>
                    <textarea
                      value={formData.observations}
                      onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                      className="
                        w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl
                        text-sm text-slate-700 leading-relaxed placeholder-slate-400
                        outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
                        transition-all shadow-inner resize-none min-h-[120px]
                      "
                      placeholder="Adicione observações sobre o desempenho, insights, aprendizados, etc..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer / Actions */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 flex-shrink-0">

            {/* Toggle Executed - iOS Switch Style */}
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.is_executed}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_executed: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`
                  w-12 h-7 rounded-full transition-colors duration-300 ease-in-out
                  ${formData.is_executed ? 'bg-green-500' : 'bg-slate-200 group-hover:bg-slate-300'}
                `}></div>
                <div className={`
                  absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300
                  ${formData.is_executed ? 'translate-x-5' : 'translate-x-0'}
                `}></div>
              </div>
              <span className={`text-sm font-medium transition-colors ${formData.is_executed ? 'text-green-700' : 'text-slate-500'}`}>
                Marcar como executado
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {content && (
                <>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100/80 transition-all duration-200 active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Deletar</span>
                  </button>
                  <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-8 py-3 rounded-2xl text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#006ee6] shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95 hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {content ? 'Salvar Alterações' : 'Criar Conteúdo'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

