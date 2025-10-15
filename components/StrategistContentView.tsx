'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ContentWeekView from './ContentWeekView';
import ContentMonthView from './ContentMonthView';
import BusinessContentModal, { BusinessSocialContent } from './BusinessContentModal';
import ContentStatsWidget from './ContentStatsWidget';
import WeeklyPlanningModal from './WeeklyPlanningModal';
import { ContentTypeIcon } from '@/components/icons/ContentTypeIcons';

// Usar interface do BusinessContentModal
type SocialContent = BusinessSocialContent;

interface StrategistContentViewProps {
  businessId: string;
  businessName: string;
  strategistId?: string;
}

export default function StrategistContentView({ businessId, businessName, strategistId }: StrategistContentViewProps) {
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

  useEffect(() => {
    loadContents();
  }, [currentWeekStart, currentMonthStart, viewMode, businessId]);

  const loadContents = async () => {
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

      console.log('🔍 [STRATEGIST] Carregando conteúdos:', {
        businessId,
        businessName,
        mode: viewMode,
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
      });

      // 🔒 USAR NOVA API: /api/business-content
      const response = await fetch(
        `/api/business-content?start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}&business_id=${businessId}`
      );

      const data = await response.json();

      console.log('📦 [STRATEGIST] Conteúdos recebidos:', data.contents?.length || 0);

      if (data.success) {
        setContents(data.contents || []);
      } else {
        console.error('❌ Erro ao carregar conteúdos:', data.error);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conteúdos:', error);
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

  const handleToday = () => {
    if (viewMode === 'week') {
      setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    } else {
      setCurrentMonthStart(startOfMonth(new Date()));
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonthStart(subMonths(currentMonthStart, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthStart(addMonths(currentMonthStart, 1));
  };

  const handleAddContent = (date: Date) => {
    setSelectedDate(date);
    setSelectedContent(null);
    setIsModalOpen(true);
  };

  const handleEditContent = (content: SocialContent) => {
    setSelectedContent(content);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleToggleExecuted = async (contentId: string, isExecuted: boolean) => {
    try {
      const response = await fetch(`/api/business-content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_executed: isExecuted,
          executed_at: isExecuted ? new Date().toISOString() : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadContents();
      } else {
        console.error('Erro ao atualizar execução:', data.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar execução:', error);
    }
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
    try {
      // Criar conteúdos em batch usando NOVA API
      const promises = plans.map(plan =>
        fetch('/api/business-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...plan,
            business_id: businessId, // 🔒 ASSOCIAR AO BUSINESS DO STRATEGIST
            status: 'planned',
            is_executed: false,
          }),
        })
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
      const dateString = format(newDate, 'yyyy-MM-dd');

      const response = await fetch(`/api/business-content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduled_date: dateString,
        }),
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

  const handleStatusChange = async (contentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/business-content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
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

  // Calcular estatísticas dos conteúdos
  const calculateStats = () => {
    const stats = {
      total: contents.length,
      executed: contents.filter(c => c.is_executed).length,
      pending: contents.filter(c => !c.is_executed).length,
      byType: {
        post: contents.filter(c => c.content_type === 'post').length,
        reels: contents.filter(c => c.content_type === 'reels').length,
        story: contents.filter(c => c.content_type === 'story').length,
      },
      byPlatform: {} as Record<string, number>
    };

    // Contar por plataforma
    contents.forEach(content => {
      content.platforms?.forEach(platform => {
        stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
      });
    });

    return stats;
  };

  return (
    <div className="space-y-6">
      {/* Header com informação do business */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conteúdo - {businessName}</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie o conteúdo do seu business</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Estrategista
            </span>
          </div>
        </div>
      </div>

      {/* Stats Widget */}
      <ContentStatsWidget stats={calculateStats()} />

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={viewMode === 'week' ? handlePreviousWeek : handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Anterior"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            <button
              onClick={handleToday}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
            >
              Hoje
            </button>

            <button
              onClick={viewMode === 'week' ? handleNextWeek : handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Próximo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <div className="ml-4 text-lg font-semibold text-gray-900">
              {viewMode === 'week' 
                ? `${format(currentWeekStart, 'd', { locale: ptBR })} - ${format(addDays(currentWeekStart, 6), "d 'de' MMMM yyyy", { locale: ptBR })}`
                : format(currentMonthStart, "MMMM 'de' yyyy", { locale: ptBR })
              }
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="relative">
              <button
                onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                {viewMode === 'week' ? 'Semana' : 'Mês'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {isViewDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => {
                      setViewMode('week');
                      setIsViewDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${viewMode === 'week' ? 'bg-gray-50 font-medium' : ''}`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('month');
                      setIsViewDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${viewMode === 'month' ? 'bg-gray-50 font-medium' : ''}`}
                  >
                    Mês
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsWeeklyPlanningOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Planejamento semanal
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : viewMode === 'week' ? (
        <ContentWeekView
          weekStart={currentWeekStart}
          contents={contents}
          loading={loading}
          onAddContent={handleAddContent}
          onEditContent={handleEditContent}
          onMoveContent={handleMoveContent}
          onToggleExecuted={handleToggleExecuted}
        />
      ) : (
        <ContentMonthView
          monthStart={currentMonthStart}
          contents={contents}
          onDateClick={handleAddContent}
          onContentClick={handleEditContent}
        />
      )}

      {/* Modals */}
      <BusinessContentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        content={selectedContent}
        selectedDate={selectedDate}
        onSave={handleSaveContent}
        businessId={businessId}
        strategistId={strategistId}
      />

      <WeeklyPlanningModal
        isOpen={isWeeklyPlanningOpen}
        onClose={() => setIsWeeklyPlanningOpen(false)}
        weekStart={currentWeekStart}
        onSave={handleSaveWeeklyPlanning}
      />
    </div>
  );
}

