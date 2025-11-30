'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ContentWeekView from '../content/ContentWeekView';
import ContentMonthView from '../content/ContentMonthView';
import ContentModal from '../ContentModal';
import ContentStatsWidget from '../content/ContentStatsWidget';
import WeeklyPlanningModal from '../content/WeeklyPlanningModal';
import { ContentTypeIcon } from '@/components/icons/ContentTypeIcons';
import BusinessSelector from './BusinessSelector';
import MobileStrategistContentView from './MobileStrategistContentView';

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
  has_strategist: boolean;
  strategist_id: string;
}

interface StrategistContentPlanningViewProps {
  businesses: Business[];
  strategistId: string;
}

export default function StrategistContentPlanningView({ businesses, strategistId }: StrategistContentPlanningViewProps) {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    businesses.length > 0 ? businesses[0].id : null
  );
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

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

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
    if (selectedBusinessId) {
      loadContents();
    }
  }, [selectedBusinessId, currentWeekStart, currentMonthStart, viewMode]);

  const loadContents = async () => {
    if (!selectedBusinessId) return;

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

      console.log('🔍 Carregando conteúdos do strategist:', {
        businessId: selectedBusinessId,
        strategistId,
        mode: viewMode,
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
      });

      const response = await fetch(
        `/api/business-content?business_id=${selectedBusinessId}&start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}`
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
    if (!selectedBusinessId) return;

    try {
      // Criar todos os conteúdos do planejamento
      const promises = plans.map(content =>
        fetch('/api/business-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...content,
            business_id: selectedBusinessId,
            strategist_id: strategistId
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

  const handleSelectBusiness = (businessId: string) => {
    setSelectedBusinessId(businessId);
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
  if (isMobile && selectedBusinessId) {
    return (
      <MobileStrategistContentView
        contents={contents}
        loading={loading}
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        onSelectBusiness={handleSelectBusiness}
        onRefresh={loadContents}
        onSaveContent={handleSaveContent}
        onSaveWeeklyPlanning={handleSaveWeeklyPlanning}
        businessId={selectedBusinessId}
        strategistId={strategistId}
      />
    );
  }

  // 🖥️ DESKTOP VIEW
  return (
    <div className="flex flex-col md:flex-row bg-[#f5f5f5] h-screen overflow-hidden">
      {/* Sidebar Esquerda - Ferramentas de Planejamento */}
      <div className="w-full md:w-56 bg-[#f5f5f5] flex flex-col flex-shrink-0 overflow-y-auto">
        {/* Header da Sidebar */}
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight" style={{ fontFamily: 'Onest, sans-serif' }}>Programação de conteúdo</h2>
          </div>

          {/* Business Selector */}
          <div className="mb-4">
            <BusinessSelector
              businesses={businesses}
              selectedBusinessId={selectedBusinessId}
              onSelectBusiness={handleSelectBusiness}
            />
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
          <ContentStatsWidget stats={weekStats} compact />
        </div>
      </div>

      {/* Área Principal - Calendário com estilo Apple */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f5f5f5]">
        {/* Header Apple Style */}
        <div className="flex-shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-8 md:py-5 gap-3 md:gap-4 bg-[#f5f5f5]">

          {/* Left: Date & Nav */}
          <div className="flex items-center w-full md:w-auto gap-3 md:gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest pl-0.5">Calendário</span>
              <div className="flex items-center gap-2 md:gap-3">
                <h1 className="text-lg md:text-2xl font-semibold text-[#1d1d1f] tracking-tight whitespace-nowrap capitalize">
                  {viewMode === 'week' ? weekLabel : monthLabel}
                </h1>

                {/* Navigation Arrows */}
                <div className="flex gap-0.5 ml-1">
                  <button
                    onClick={viewMode === 'week' ? handlePreviousWeek : handlePreviousMonth}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                  <button
                    onClick={viewMode === 'week' ? handleNextWeek : handleNextMonth}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>

                {/* Button: Go to Today */}
                <button
                  onClick={handleToday}
                  className="ml-1 md:ml-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-semibold text-[#1d1d1f] transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Hoje</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: View Switcher (Dynamic Island style) */}
          <div className="self-center md:self-auto bg-gray-200/80 p-1 rounded-full w-full md:w-auto flex justify-center max-w-[280px] md:max-w-none">
            <div className="flex relative w-full md:w-auto">
              <button
                onClick={() => setViewMode('week')}
                className={`flex-1 md:flex-none px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-300 ${
                  viewMode === 'week'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="18"></rect>
                  <rect x="14" y="3" width="7" height="18"></rect>
                </svg>
                <span>Semana</span>
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`flex-1 md:flex-none px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-300 ${
                  viewMode === 'month'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Mês</span>
              </button>
            </div>
          </div>
        </div>

        {/* Week/Month View - Full height */}
        <div className="flex-1 overflow-hidden relative bg-[#f5f5f5]">
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
      {isModalOpen && selectedBusinessId && (
        <ContentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          content={selectedContent}
          initialDate={selectedDate}
          onSave={handleSaveContent}
          businessId={selectedBusinessId}
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

