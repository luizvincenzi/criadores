'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialContent } from './BusinessContentPlanningView';
import MobileBusinessContentWeek3Days from './MobileBusinessContentWeek3Days';
import MobileBusinessContentWeek7Days from './MobileBusinessContentWeek7Days';
import MobileBusinessContentMonth from './MobileBusinessContentMonth';
import MobileBusinessContentSheet from './MobileBusinessContentSheet';
import MobileBusinessWeeklyPlanningSheet from './MobileBusinessWeeklyPlanningSheet';
import MobileBusinessContentSummary from './MobileBusinessContentSummary';

interface MobileBusinessContentViewProps {
  contents: SocialContent[];
  loading: boolean;
  businessName: string;
  onRefresh: () => void;
  onSaveContent: () => void;
  onSaveWeeklyPlanning: (plans: any[]) => void;
  businessId: string;
}

type ViewMode = '3days' | '7days' | 'month';

export default function MobileBusinessContentView({
  contents,
  loading,
  businessName,
  onRefresh,
  onSaveContent,
  onSaveWeeklyPlanning,
  businessId
}: MobileBusinessContentViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('3days');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
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

  const handleToday = () => {
    if (viewMode === 'month') {
      setCurrentMonthStart(startOfMonth(new Date()));
    } else {
      setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
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

  // Labels de período
  const getperiodLabel = () => {
    if (viewMode === 'month') {
      return format(currentMonthStart, 'MMMM yyyy', { locale: ptBR });
    } else {
      const weekEnd = addWeeks(currentWeekStart, 1);
      weekEnd.setDate(weekEnd.getDate() - 1);
      return `${format(currentWeekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM yyyy', { locale: ptBR })}`;
    }
  };

  const getViewModeLabel = () => {
    switch (viewMode) {
      case '3days': return '3 Dias';
      case '7days': return '7 Dias';
      case 'month': return 'Mês';
    }
  };

  return (
    <div className="md:hidden flex flex-col min-h-screen">
      {/* Header Sticky - OTIMIZADO */}
      <div className="sticky top-0 left-0 right-0 z-30 bg-white shadow-sm">
        {/* Business Name */}
        <div className="px-3 py-3 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">{businessName}</h1>
        </div>

        {/* Linha única: Título + Navegação + Visualização */}
        <div className="px-3 py-2 flex items-center justify-between gap-2">
          {/* Período */}
          <div className="text-sm font-semibold text-gray-900">
            {getperiodLabel()}
          </div>

          {/* Navegação compacta */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Período anterior"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleToday}
              className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hoje
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Próximo período"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dropdown de Visualização compacto */}
          <div className="relative">
            <button
              onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
              className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>{getViewModeLabel()}</span>
              <svg
                className={`w-3 h-3 transition-transform ${isViewDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isViewDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsViewDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      setViewMode('3days');
                      setIsViewDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                      viewMode === '3days' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    3 Dias
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('7days');
                      setIsViewDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                      viewMode === '7days' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    7 Dias
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('month');
                      setIsViewDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                      viewMode === 'month' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Mês
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Resumo Expansível - TODAS as visualizações */}
      <MobileStrategistContentSummary
        contents={contents}
        weekStart={viewMode === 'month' ? currentMonthStart : currentWeekStart}
        viewMode={viewMode}
      />

      {/* Área de Conteúdo - com padding bottom para footer fixo */}
      <div className="flex-1 pb-20">
        {viewMode === '3days' && (
          <MobileStrategistContentWeek3Days
            weekStart={currentWeekStart}
            contents={contents}
            loading={loading}
            onAddContent={handleAddContent}
            onEditContent={handleEditContent}
          />
        )}

        {viewMode === '7days' && (
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

      {/* Footer Fixo - 2 BOTÕES */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-2 shadow-lg">
        <div className="grid grid-cols-2 gap-2">
          {/* Botão Planejamento */}
          <button
            onClick={() => setIsPlanningModalOpen(true)}
            className="py-2.5 px-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Planejar</span>
          </button>

          {/* Botão Adicionar */}
          <button
            onClick={() => handleAddContent()}
            className="py-2.5 px-2 bg-blue-600 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Adicionar</span>
          </button>
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

