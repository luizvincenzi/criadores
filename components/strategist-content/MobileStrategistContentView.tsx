'use client';

import React, { useState } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialContent } from './StrategistContentPlanningView';
import MobileStrategistContentWeek7Days from './MobileStrategistContentWeek7Days';
import MobileStrategistContentMonth from './MobileStrategistContentMonth';
import MobileStrategistContentSheet from './MobileStrategistContentSheet';
import MobileStrategistWeeklyPlanningSheet from './MobileStrategistWeeklyPlanningSheet';
import BusinessSelector from './BusinessSelector';
import { Business } from './BusinessSelector';

interface MobileStrategistContentViewProps {
  contents: SocialContent[];
  loading: boolean;
  businesses: Business[];
  selectedBusinessId: string | null;
  onSelectBusiness: (businessId: string) => void;
  onRefresh: () => void;
  onSaveContent: () => void;
  onSaveWeeklyPlanning: (plans: any[]) => void;
  businessId: string;
  strategistId: string;
}

type ViewMode = 'week' | 'month';

export default function MobileStrategistContentView({
  contents,
  loading,
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  onRefresh,
  onSaveContent,
  onSaveWeeklyPlanning,
  businessId,
  strategistId
}: MobileStrategistContentViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [currentMonthStart, setCurrentMonthStart] = useState<Date>(
    startOfMonth(new Date())
  );
  const [isContentSheetOpen, setIsContentSheetOpen] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SocialContent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Contar rascunhos (conteúdos sem data)
  const draftCount = contents.filter(c => !c.scheduled_date).length;

  // Navegação
  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentMonthStart(subMonths(currentMonthStart, 1));
    } else {
      setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentMonthStart(addMonths(currentMonthStart, 1));
    } else {
      setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    }
  };

  // Ações de conteúdo
  const handleAddContent = (date?: Date) => {
    setSelectedDate(date || new Date());
    setSelectedContent(null);
    setIsContentSheetOpen(true);
  };

  const handleEditContent = (content: SocialContent) => {
    setSelectedContent(content);
    setSelectedDate(null);
    setIsContentSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsContentSheetOpen(false);
    setSelectedContent(null);
    setSelectedDate(null);
  };

  const handleSaveSheet = async () => {
    await onSaveContent();
    handleCloseSheet();
  };

  // Label do período
  const getPeriodLabel = () => {
    if (viewMode === 'month') {
      const month = format(currentMonthStart, 'MMMM yyyy', { locale: ptBR });
      return month.charAt(0).toUpperCase() + month.slice(1);
    } else {
      const month = format(currentWeekStart, 'MMMM yyyy', { locale: ptBR });
      return month.charAt(0).toUpperCase() + month.slice(1);
    }
  };

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  return (
    <div className="md:hidden flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 z-30 bg-white">
        {/* Business Selector */}
        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
          <BusinessSelector
            businesses={businesses}
            selectedBusinessId={selectedBusinessId}
            onSelectBusiness={onSelectBusiness}
          />
        </div>

        {/* Top bar: CALENDÁRIO + Título + Navegação + Menu */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wider mb-0.5">CALENDÁRIO</p>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{getPeriodLabel()}</h1>
                <div className="flex items-center">
                  <button
                    onClick={handlePrevious}
                    className="p-1.5 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-full transition-colors"
                    aria-label="Período anterior"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1.5 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-full transition-colors"
                    aria-label="Próximo período"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Semana/Mês */}
        <div className="px-4 pb-3">
          <div className="flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Mês
            </button>
          </div>
        </div>
      </div>

      {/* Área de Conteúdo - com padding bottom para footer fixo */}
      <div className="flex-1 pb-20">
        {viewMode === 'week' && (
          <MobileStrategistContentWeek7Days
            weekStart={currentWeekStart}
            contents={contents}
            loading={loading}
            onAddContent={handleAddContent}
            onEditContent={handleEditContent}
          />
        )}

        {viewMode === 'month' && (
          <MobileStrategistContentMonth
            monthStart={currentMonthStart}
            contents={contents}
            loading={loading}
            onAddContent={handleAddContent}
            onEditContent={handleEditContent}
          />
        )}
      </div>

      {/* Footer Fixo - Design igual à screenshot */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 safe-area-inset-bottom">
        <div className="flex items-center justify-between">
          {/* Lado esquerdo: Sync + Rascunhos */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Sync</span>
            </div>
            {draftCount > 0 && (
              <>
                <div className="w-px h-4 bg-gray-200"></div>
                <span className="text-sm text-gray-600">{draftCount} Rascunhos</span>
              </>
            )}
          </div>

          {/* Lado direito: Planejar + Botão Adicionar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlanningModalOpen(true)}
              className="flex items-center gap-1.5 text-blue-600 active:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-sm font-medium">Planejar</span>
            </button>

            <button
              onClick={() => handleAddContent()}
              className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              aria-label="Adicionar conteúdo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Sheet */}
      {isContentSheetOpen && (
        <MobileStrategistContentSheet
          isOpen={isContentSheetOpen}
          onClose={handleCloseSheet}
          onSave={handleSaveSheet}
          content={selectedContent}
          initialDate={selectedDate}
          businessId={businessId}
          strategistId={strategistId}
        />
      )}

      {/* Planning Sheet - Mobile Optimized */}
      {isPlanningModalOpen && (
        <MobileStrategistWeeklyPlanningSheet
          isOpen={isPlanningModalOpen}
          onClose={() => setIsPlanningModalOpen(false)}
          weekStart={currentWeekStart}
          onSave={onSaveWeeklyPlanning}
          existingContents={contents}
        />
      )}
    </div>
  );
}

