'use client';

import React, { useState } from 'react';
import { format, addDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialContent } from './StrategistContentPlanningView';
import { ContentTypeIcon } from '@/components/icons/ContentTypeIcons';
import { PlatformIcon } from '@/components/icons/PlatformIcons';

interface MobileStrategistContentWeek3DaysProps {
  weekStart: Date;
  contents: SocialContent[];
  loading: boolean;
  onAddContent: (date: Date) => void;
  onEditContent: (content: SocialContent) => void;
}

export default function MobileStrategistContentWeek3Days({
  weekStart,
  contents,
  loading,
  onAddContent,
  onEditContent
}: MobileStrategistContentWeek3DaysProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // Gerar array de 7 dias
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Pegar 3 dias a partir do índice atual
  const visibleDays = weekDays.slice(currentDayIndex, currentDayIndex + 3);

  // Agrupar conteúdos por dia
  const getContentsForDay = (date: Date) => {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    return contents.filter(content => {
      if (!content.scheduled_date) return false;
      const contentDateStr = content.scheduled_date.includes('T')
        ? content.scheduled_date.split('T')[0]
        : content.scheduled_date;
      return contentDateStr === targetDateStr;
    }).sort((a, b) => {
      if (a.scheduled_time && b.scheduled_time) {
        return a.scheduled_time.localeCompare(b.scheduled_time);
      }
      return 0;
    });
  };

  // Navegação entre grupos de 3 dias
  const canGoPrevious = currentDayIndex > 0;
  const canGoNext = currentDayIndex + 3 < 7;

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentDayIndex(Math.max(0, currentDayIndex - 3));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentDayIndex(Math.min(4, currentDayIndex + 3));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Navegação entre grupos de 3 dias */}
      <div className="px-4 py-2 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={`p-2 rounded-lg transition-colors ${
            canGoPrevious ? 'text-gray-700 hover:bg-gray-200' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-sm text-gray-600">
          Dias {currentDayIndex + 1}-{Math.min(currentDayIndex + 3, 7)} de 7
        </div>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`p-2 rounded-lg transition-colors ${
            canGoNext ? 'text-gray-700 hover:bg-gray-200' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Grid de 3 dias - SEM PADDING LATERAL */}
      <div className="grid grid-cols-3 gap-1 px-1 py-2 flex-1 overflow-y-auto">
        {visibleDays.map((day, index) => {
          const dayContents = getContentsForDay(day);
          const isCurrentDay = isToday(day);
          const dayName = format(day, 'EEE', { locale: ptBR }).toUpperCase();
          const dayNumber = format(day, 'd');

          return (
            <div
              key={index}
              className="flex flex-col"
            >
              {/* Header do dia */}
              <div
                className={`text-center py-2 rounded-t-lg border-b-2 ${
                  isCurrentDay
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <div className="text-xs font-semibold">{dayName}</div>
                <div className="text-lg font-bold">{dayNumber}</div>
              </div>

              {/* Conteúdos do dia */}
              <div
                className={`flex-1 border-l border-r border-b rounded-b-lg p-2 space-y-2 min-h-[300px] ${
                  isCurrentDay ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
                onClick={() => onAddContent(day)}
              >
                {dayContents.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                    Vazio
                  </div>
                ) : (
                  dayContents.map(content => (
                    <MobileContentCard
                      key={content.id}
                      content={content}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditContent(content);
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Card de conteúdo compacto
function MobileContentCard({ content, onClick }: { content: SocialContent; onClick: (e: React.MouseEvent) => void }) {
  const typeConfig = {
    reels: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    story: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    post: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' }
  }[content.content_type];

  const handleCheckmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const response = await fetch('/api/content-calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: content.id,
          is_executed: !content.is_executed,
          executed_at: !content.is_executed ? new Date().toISOString() : null
        })
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative ${typeConfig.bg} ${typeConfig.border} border rounded-lg p-2 cursor-pointer active:scale-95 transition-transform ${
        content.is_executed ? 'opacity-60' : ''
      }`}
    >
      {/* Checkmark - Canto superior direito */}
      <button
        onClick={handleCheckmarkClick}
        className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${
          content.is_executed
            ? 'bg-green-500 text-white'
            : 'bg-white text-gray-400 border-2 border-gray-300 hover:border-green-500 hover:text-green-500'
        }`}
        aria-label={content.is_executed ? 'Marcar como não executado' : 'Marcar como executado'}
      >
        {content.is_executed ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Tipo e horário */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <ContentTypeIcon type={content.content_type} size={12} />
          <span className={`text-xs font-semibold ${typeConfig.text}`}>
            {content.content_type === 'reels' ? 'Reels' : content.content_type === 'story' ? 'Story' : 'Post'}
          </span>
        </div>
        {content.scheduled_time && (
          <span className="text-xs text-gray-600">
            {content.scheduled_time.substring(0, 5)}
          </span>
        )}
      </div>

      {/* Título */}
      {content.title && (
        <div className="text-xs text-gray-700 font-medium mb-1 line-clamp-2">
          {content.title}
        </div>
      )}

      {/* Plataformas */}
      <div className="flex items-center gap-1 flex-wrap">
        {content.platforms.slice(0, 3).map(platform => (
          <span
            key={platform}
            className="inline-flex items-center"
            title={platform}
          >
            <PlatformIcon platform={platform} size={10} className="text-gray-500" />
          </span>
        ))}
        {content.platforms.length > 3 && (
          <span className="text-xs text-gray-500">+{content.platforms.length - 3}</span>
        )}
      </div>

      {/* Status executado */}
      {content.is_executed && (
        <div className="mt-1 pt-1 border-t border-gray-200">
          <span className="text-xs text-green-600 font-medium">✓ Executado</span>
        </div>
      )}
    </div>
  );
}

