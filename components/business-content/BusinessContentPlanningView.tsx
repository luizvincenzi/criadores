'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BusinessContentWeekView from './BusinessContentWeekView';
import BusinessContentMonthView from './BusinessContentMonthView';
import ContentModal from '../ContentModal';
import BusinessContentStatsWidget from './BusinessContentStatsWidget';
import BusinessWeeklyPlanningModal from './BusinessWeeklyPlanningModal';
import { ContentTypeIcon } from '@/components/icons/ContentTypeIcons';
import MobileBusinessContentView from './MobileBusinessContentView';

export interface SocialContent {
  id: string;
  title: string;
  description?: string;
  briefing?: string;
  content_type: 'post' | 'reels' | 'story';
  platforms: string[];
  scheduled_date: string;
  scheduled_time?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  is_executed: boolean;
  executed_at?: string;
  notes?: string;
  tags?: string[];
  business_id: string;
  strategist_id?: string;
  created_at: string;
  updated_at: string;
}

interface Business {
  id: string;
  name: string;
  is_active: boolean;
}

interface BusinessContentPlanningViewProps {
  businessId: string;
  businessName: string;
}

export default function BusinessContentPlanningView({ businessId, businessName }: BusinessContentPlanningViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Segunda-feira
  );
  const [currentMonthStart, setCurrentMonthStart] = useState<Date>(
    startOfMonth(new Date())
  );
  const [contents, setContents] = useState<SocialContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWeeklyPlanningOpen, setIsWeeklyPlanningOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SocialContent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (businessId) {
      loadContents();
    }
  }, [businessId, currentWeekStart, currentMonthStart, viewMode]);

  const loadContents = async () => {
    if (!businessId) return;

    try {
      setLoading(true);

      // Determinar período baseado no modo de visualização
      let startDate: Date;
      let endDate: Date;

      if (viewMode === 'week') {
        startDate = currentWeekStart;
        endDate = addDays(currentWeekStart, 6);
      } else {
        // Modo mês: carregar do primeiro ao último dia do mês
        startDate = currentMonthStart;
        endDate = addDays(addMonths(currentMonthStart, 1), -1);
      }

      console.log('🔍 Carregando conteúdos do business owner:', {
        businessId,
        mode: viewMode,
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
      });

      const response = await fetch(
        `/api/business-content?business_id=${businessId}&start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}`
      );

      const data = await response.json();

      console.log('📦 Conteúdos recebidos:', data.contents?.length || 0);

      if (data.success) {
        setContents(data.contents || []);
      } else {
        console.error('Erro ao carregar conteúdos:', data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handlePreviousMonth = () => {
    setCurrentMonthStart(subMonths(currentMonthStart, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthStart(addMonths(currentMonthStart, 1));
  };

  const handleToday = () => {
    if (viewMode === 'week') {
      setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    } else {
      setCurrentMonthStart(startOfMonth(new Date()));
    }
  };

  const handleAddContent = (date?: Date) => {
    setSelectedDate(date || null);
    setSelectedContent(null);
    setIsModalOpen(true);
  };

  const handleEditContent = (content: SocialContent) => {
    setSelectedContent(content);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
    setSelectedDate(null);
  };

  const handleSaveContent = async () => {
    await loadContents();
    handleCloseModal();
  };

  const handleSaveWeeklyPlanning = async (plans: any[]) => {
    if (!businessId) return;

    try {
      // Criar todos os conteúdos do planejamento
      const promises = plans.map(content =>
        fetch('/api/business-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...content,
            business_id: businessId
          })
        }).then(res => res.json())
      );

      await Promise.all(promises);

      // Recarregar conteúdos
      await loadContents();

      alert(`✅ Planejamento atualizado com sucesso!`);
    } catch (error) {
      console.error('Erro ao criar planejamento:', error);
      alert('Erro ao criar planejamento semanal');
    }
  };

  const handleMoveContent = async (contentId: string, newDate: Date) => {
    try {
      const response = await fetch(`/api/business-content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_date: format(newDate, 'yyyy-MM-dd')
        })
      });

      const data = await response.json();

      if (data.success) {
        await loadContents();
      } else {
        console.error('Erro ao mover conteúdo:', data.error);
      }
    } catch (error) {
      console.error('Erro ao mover conteúdo:', error);
    }
  };

  const handleToggleExecuted = async (contentId: string, isExecuted: boolean) => {
    try {
      const response = await fetch(`/api/business-content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_executed: isExecuted,
          status: isExecuted ? 'completed' : 'planned'
        })
      });

      const data = await response.json();

      if (data.success) {
        await loadContents();
      } else {
        console.error('Erro ao atualizar status:', data.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  // Calcular estatísticas da semana
  const weekStats = {
    planned: contents.length,
    executed: contents.filter(c => c.is_executed).length,
    pending: contents.filter(c => !c.is_executed).length,
    completionRate: contents.length > 0 
      ? Math.round((contents.filter(c => c.is_executed).length / contents.length) * 100)
      : 0
  };

  const weekLabel = `${format(currentWeekStart, 'd MMM', { locale: ptBR })} - ${format(addDays(currentWeekStart, 6), 'd MMM yyyy', { locale: ptBR })}`;
  const monthLabel = format(currentMonthStart, 'MMMM yyyy', { locale: ptBR });

  // Agrupar conteúdos por tipo e dia da semana
  const groupedContents = contents.reduce((acc, content) => {
    const type = content.content_type;
    if (!acc[type]) {
      acc[type] = {};
    }
    
    const date = new Date(content.scheduled_date);
    const dayName = format(date, 'EEEE', { locale: ptBR });
    
    if (!acc[type][dayName]) {
      acc[type][dayName] = [];
    }
    
    acc[type][dayName].push(content);
    return acc;
  }, {} as Record<string, Record<string, SocialContent[]>>);

  // 📱 MOBILE VIEW
  if (isMobile && businessId) {
    return (
      <MobileBusinessContentView
        contents={contents}
        loading={loading}
        businessName={businessName}
        onRefresh={loadContents}
        onSaveContent={handleSaveContent}
        onSaveWeeklyPlanning={handleSaveWeeklyPlanning}
        businessId={businessId}
      />
    );
  }

  // 🖥️ DESKTOP VIEW
  return (
    <div className="flex flex-col md:flex-row bg-[#f5f5f5] min-h-screen">
      {/* Sidebar Esquerda - Ferramentas de Planejamento */}
      <div className="w-full md:w-56 bg-[#f5f5f5] flex flex-col flex-shrink-0">
        {/* Header da Sidebar */}
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight" style={{ fontFamily: 'Onest, sans-serif' }}>Programação de conteúdo</h2>
            <p className="text-sm text-gray-600 mt-1">{businessName}</p>
          </div>

          {/* Botão de Planejamento Semanal */}
          <button
            onClick={() => setIsWeeklyPlanningOpen(true)}
            className="w-full px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg flex items-center justify-between hover:bg-gray-800 transition-colors"
          >
            <span>Planejado semanal</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>

        {/* Lista de Conteúdos Planejados */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase">Planejado semanal</h3>
            <button
              onClick={() => setIsWeeklyPlanningOpen(true)}
              className="text-blue-600 hover:text-blue-700 transition-colors"
              title="Editar planejamento semanal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>

          {/* Conteúdos agrupados por tipo */}
          <div className="space-y-3">
            {['reels', 'story', 'post'].map((type) => {
              const typeContents = contents.filter(c => c.content_type === type);
              if (typeContents.length === 0) return null;

              const typeConfig = {
                reels: { label: 'Reels', color: 'text-green-600' },
                story: { label: 'Story', color: 'text-yellow-600' },
                post: { label: 'Post', color: 'text-blue-600' }
              }[type];

              // Agrupar por dia da semana com ordem correta
              const dayGroups: { [key: string]: { count: number; order: number } } = {};
              typeContents.forEach(content => {
                const dateStr = content.scheduled_date.includes('T')
                  ? content.scheduled_date.split('T')[0]
                  : content.scheduled_date;

                const [year, month, day] = dateStr.split('-').map(Number);
                const contentDate = new Date(year, month - 1, day);

                const dayName = format(contentDate, 'EEEE', { locale: ptBR });
                const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
                const dayOfWeek = contentDate.getDay();
                const order = dayOfWeek === 0 ? 7 : dayOfWeek;

                if (!dayGroups[capitalizedDay]) {
                  dayGroups[capitalizedDay] = { count: 0, order };
                }
                dayGroups[capitalizedDay].count++;
              });

              const sortedDays = Object.entries(dayGroups)
                .sort(([, a], [, b]) => a.order - b.order);

              return (
                <div key={type} className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ContentTypeIcon type={type as 'post' | 'reels' | 'story'} className="w-4 h-4" />
                    <span className={`text-xs font-semibold ${typeConfig?.color}`}>
                      {typeConfig?.label}
                    </span>
                    <span className="ml-auto text-xs font-bold text-gray-700">{typeContents.length}</span>
                  </div>
                  <div className="pl-6 text-xs text-gray-600 space-y-0.5">
                    {sortedDays.map(([day, { count }]) => (
                      <div key={day}>
                        {day} {count > 1 && `(${count})`}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Estatística de conteúdo</h3>
          <BusinessContentStatsWidget stats={weekStats} compact />
        </div>
      </div>

      {/* Área Principal - Calendário */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Compacto */}
        <div className="bg-[#f5f5f5] px-3 md:px-6 py-2 flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={viewMode === 'week' ? handlePreviousWeek : handlePreviousMonth}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title={viewMode === 'week' ? 'Semana anterior' : 'Mês anterior'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>

              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Hoje
              </button>

              <button
                onClick={viewMode === 'week' ? handleNextWeek : handleNextMonth}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title={viewMode === 'week' ? 'Próxima semana' : 'Próximo mês'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>

            <div className="text-base font-semibold text-gray-900">
              {viewMode === 'week' ? weekLabel : monthLabel}
            </div>
          </div>

          {/* Dropdown de Visualização */}
          <div className="relative">
            <button
              onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
              className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors border-2 border-gray-300 flex items-center gap-2 min-w-[140px] justify-between"
            >
              <span>{viewMode === 'week' ? 'Semana' : 'Mês'}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform ${isViewDropdownOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {isViewDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    setViewMode('week');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                    viewMode === 'week' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => {
                    setViewMode('month');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                    viewMode === 'month' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                  }`}
                >
                  Mês
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Week/Month View */}
        <div className="flex-1">
          {viewMode === 'week' ? (
            <BusinessContentWeekView
              weekStart={currentWeekStart}
              contents={contents}
              loading={loading}
              onAddContent={handleAddContent}
              onEditContent={handleEditContent}
              onMoveContent={handleMoveContent}
              onToggleExecuted={handleToggleExecuted}
            />
          ) : (
            <BusinessContentMonthView
              monthStart={currentMonthStart}
              contents={contents}
              loading={loading}
              onAddContent={handleAddContent}
              onEditContent={handleEditContent}
            />
          )}
        </div>
      </div>

      {/* Modal de Conteúdo Individual */}
      {isModalOpen && businessId && (
        <ContentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          content={selectedContent}
          selectedDate={selectedDate}
          onSave={handleSaveContent}
          businessId={businessId}
        />
      )}

      {/* Modal de Planejamento Semanal */}
      {isWeeklyPlanningOpen && (
        <BusinessWeeklyPlanningModal
          isOpen={isWeeklyPlanningOpen}
          onClose={() => setIsWeeklyPlanningOpen(false)}
          weekStart={currentWeekStart}
          onSave={handleSaveWeeklyPlanning}
          existingContents={contents}
        />
      )}
    </div>
  );
}

