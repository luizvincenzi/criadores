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

  const weekLabel = `${format(currentWeekStart, 'd MMM', { locale: ptBR })} - ${format(addDays(currentWeekStart, 6), 'd MMM yyyy', { locale: ptBR })}`;
  const monthLabel = format(currentMonthStart, 'MMMM yyyy', { locale: ptBR });

  return (
    <div className="flex flex-col md:flex-row bg-[#f5f5f5] min-h-screen">
      {/* Sidebar Esquerda - Ferramentas de Planejamento */}
      <div className="w-full md:w-56 bg-[#f5f5f5] flex flex-col flex-shrink-0">
        {/* Header da Sidebar */}
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight" style={{ fontFamily: 'Onest, sans-serif' }}>Programação de conteúdo</h2>
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

              // Ordenar dias da semana
              const sortedDays = Object.entries(dayGroups)
                .sort(([, a], [, b]) => a.order - b.order);

              return (
                <div key={type} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ContentTypeIcon type={type as any} size={16} />
                    <span className={`text-sm font-semibold ${typeConfig?.color}`}>
                      {typeConfig?.label}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">{typeContents.length}</span>
                  </div>
                  <div className="space-y-1">
                    {sortedDays.map(([day, { count }]) => (
                      <div key={day} className="text-xs text-gray-600 flex justify-between">
                        <span>{day}</span>
                        <span className="text-gray-400">({count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estatísticas de Conteúdo */}
        <div className="px-4 pb-4 mt-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Estatística de conteúdo</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold text-gray-900">{contents.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Executados</span>
              <span className="font-semibold text-green-600">{contents.filter(c => c.is_executed).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pendentes</span>
              <span className="font-semibold text-orange-600">{contents.filter(c => !c.is_executed).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Área Principal - Calendário */}
      <div className="flex-1 bg-white">
        {/* Header com navegação */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Navegação de Data */}
            <div className="flex items-center gap-3">
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

            {/* Dropdown Menu */}
            {isViewDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    setViewMode('week');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
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
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
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
              loading={loading}
              onAddContent={handleAddContent}
              onEditContent={handleEditContent}
            />
          )}
        </div>
      </div>

      {/* Modal de Conteúdo Individual */}
      {isModalOpen && (
        <BusinessContentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          content={selectedContent}
          selectedDate={selectedDate}
          onSave={handleSaveContent}
          businessId={businessId}
          strategistId={strategistId}
        />
      )}

      {/* Modal de Planejamento Semanal */}
      {isWeeklyPlanningOpen && (
        <WeeklyPlanningModal
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

