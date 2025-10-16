'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BusinessContentWeekView from './BusinessContentWeekView';
import BusinessContentMonthView from './BusinessContentMonthView';
import BusinessContentModal, { BusinessSocialContent } from '../BusinessContentModal';
import BusinessWeeklyPlanningModal from './BusinessWeeklyPlanningModal';
import BusinessSelector, { Business } from './BusinessSelector';
import { ContentTypeIcon } from '@/components/icons/ContentTypeIcons';

type SocialContent = BusinessSocialContent;

interface BusinessContentPlanningViewProps {
  businesses: Business[];
  strategistId?: string;
  onBusinessChange?: (businessId: string) => void;
}

export default function BusinessContentPlanningView({
  businesses,
  strategistId,
  onBusinessChange
}: BusinessContentPlanningViewProps) {
  // Estado do business selecionado
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    businesses.length > 0 ? businesses[0].id : null
  );

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  // Estados de navegação
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [currentMonthStart, setCurrentMonthStart] = useState<Date>(
    startOfMonth(new Date())
  );
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

  // Estados de conteúdo
  const [contents, setContents] = useState<SocialContent[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWeeklyPlanningOpen, setIsWeeklyPlanningOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SocialContent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calcular estatísticas
  const stats = {
    total: contents.length,
    executed: contents.filter(c => c.is_executed).length,
    pending: contents.filter(c => !c.is_executed).length
  };

  // Carregar conteúdos quando business ou período mudar
  useEffect(() => {
    if (selectedBusinessId) {
      loadContents();
    }
  }, [currentWeekStart, currentMonthStart, viewMode, selectedBusinessId]);

  const loadContents = async () => {
    if (!selectedBusinessId) return;

    try {
      setLoading(true);

      let startDate: Date;
      let endDate: Date;

      if (viewMode === 'week') {
        startDate = currentWeekStart;
        endDate = addDays(currentWeekStart, 6);
      } else {
        startDate = currentMonthStart;
        endDate = addDays(addMonths(currentMonthStart, 1), -1);
      }

      const response = await fetch(
        `/api/business-content?start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}&business_id=${selectedBusinessId}`
      );

      const data = await response.json();

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

  const handleSelectBusiness = (businessId: string) => {
    setSelectedBusinessId(businessId);
    if (onBusinessChange) {
      onBusinessChange(businessId);
    }
  };

  const handlePreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const handlePreviousMonth = () => setCurrentMonthStart(subMonths(currentMonthStart, 1));
  const handleNextMonth = () => setCurrentMonthStart(addMonths(currentMonthStart, 1));

  const handleToday = () => {
    if (viewMode === 'week') {
      setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    } else {
      setCurrentMonthStart(startOfMonth(new Date()));
    }
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
    setSelectedDate(null);
  };

  const handleSaveContent = async () => {
    await loadContents();
    handleCloseModal();
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

      if (response.ok) {
        await loadContents();
      }
    } catch (error) {
      console.error('❌ Erro ao mover conteúdo:', error);
    }
  };

  const handleToggleExecuted = async (contentId: string, isExecuted: boolean) => {
    try {
      const response = await fetch(`/api/business-content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_executed: isExecuted })
      });

      if (response.ok) {
        await loadContents();
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
    }
  };

  const handleSaveWeeklyPlanning = async (weeklyContents: Partial<SocialContent>[]) => {
    try {
      for (const content of weeklyContents) {
        await fetch('/api/business-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...content,
            business_id: selectedBusinessId,
            strategist_id: strategistId
          })
        });
      }
      await loadContents();
      setIsWeeklyPlanningOpen(false);
    } catch (error) {
      console.error('❌ Erro ao salvar planejamento:', error);
    }
  };

  const weekLabel = `${format(currentWeekStart, 'd MMM', { locale: ptBR })} - ${format(addDays(currentWeekStart, 6), 'd MMM yyyy', { locale: ptBR })}`;
  const monthLabel = format(currentMonthStart, 'MMMM yyyy', { locale: ptBR });

  if (!selectedBusinessId || !selectedBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Selecione um business para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-[#f5f5f5] min-h-screen">
      {/* Sidebar Esquerda - Ferramentas de Planejamento - FIXO (HIDDEN ON MOBILE) */}
      <div className="hidden md:flex w-56 bg-[#f5f5f5] flex-col flex-shrink-0 sticky top-0 h-screen overflow-hidden">
        {/* Header da Sidebar */}
        <div className="p-4 flex-shrink-0">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight" style={{ fontFamily: 'Onest, sans-serif' }}>
              Programação de conteúdo
            </h2>
          </div>

          {/* NOVO: Business Selector */}
          <BusinessSelector
            businesses={businesses}
            selectedBusinessId={selectedBusinessId}
            onSelectBusiness={handleSelectBusiness}
          />

          {/* Botão de Planejamento Semanal */}
          <button
            onClick={() => setIsWeeklyPlanningOpen(true)}
            className="w-full px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg flex items-center justify-between hover:bg-gray-800 transition-colors mt-4"
          >
            <span>Planejado semanal</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>

        {/* Estatísticas - MOVIDO PARA CIMA */}
        <div className="px-4 pb-4 flex-shrink-0">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Estatística de conteúdo</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold text-gray-900">{stats.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Executados</span>
              <span className="font-semibold text-green-600">{stats.executed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pendentes</span>
              <span className="font-semibold text-orange-600">{stats.pending}</span>
            </div>
          </div>
        </div>

        {/* Lista de Conteúdos Planejados - COM SCROLL */}
        <div className="px-4 pb-4 flex-1 overflow-y-auto">
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
      </div>

      {/* Área Principal - Calendário */}
      <div className="flex-1 bg-[#f5f5f5]">
        {/* Header Mobile - APENAS MOBILE */}
        <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-bold text-gray-900">Conteúdo</h1>
              <BusinessSelector
                businesses={businesses}
                selectedBusinessId={selectedBusinessId}
                onSelectBusiness={handleSelectBusiness}
              />
            </div>

            {/* Navegação + Dropdown */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={viewMode === 'week' ? handlePreviousWeek : handlePreviousMonth}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>

                <button
                  onClick={handleToday}
                  className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  Hoje
                </button>

                <button
                  onClick={viewMode === 'week' ? handleNextWeek : handleNextMonth}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors border border-gray-300 flex items-center gap-1"
                >
                  <span>{viewMode === 'week' ? '3 Dias' : 'Mês'}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {isViewDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={() => {
                        setViewMode('week');
                        setIsViewDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                        viewMode === 'week' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      3 Dias
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('month');
                        setIsViewDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                        viewMode === 'month' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      Mês
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Label de período */}
            <div className="text-sm font-semibold text-gray-900 mt-2">
              {viewMode === 'week' ? weekLabel : monthLabel}
            </div>

            {/* Resumo de conteúdos */}
            <div className="mt-3 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {stats.total}
                </div>
                <span className="text-gray-600">{stats.total} conteúdo{stats.total !== 1 ? 's' : ''}</span>
              </div>
              <div className="text-gray-500">
                {stats.executed} executado{stats.executed !== 1 ? 's' : ''} • {stats.pending} pendente{stats.pending !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Header Desktop - APENAS DESKTOP */}
        <div className="hidden md:block border-b border-gray-200 px-6 py-4 bg-white">
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

            {/* Label de Data (Centro) */}
            <div className="text-base font-semibold text-gray-900">
              {viewMode === 'week' ? weekLabel : monthLabel}
            </div>

            {/* Dropdown de Visualização (Direita) */}
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
      {isModalOpen && (
        <BusinessContentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          content={selectedContent}
          selectedDate={selectedDate}
          onSave={handleSaveContent}
          businessId={selectedBusinessId}
          strategistId={strategistId}
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

      {/* Botão Flutuante "Adicionar" - APENAS MOBILE */}
      <button
        onClick={() => handleAddContent(new Date())}
        className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center"
        aria-label="Adicionar conteúdo"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );
}
