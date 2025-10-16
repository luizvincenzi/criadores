'use client';

import React, { useRef, useEffect } from 'react';
import { format, addDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialContent } from './BusinessContentPlanningView';
import { ContentTypeIcon } from '@/components/icons/ContentTypeIcons';
import { PlatformIcon } from '@/components/icons/PlatformIcons';

interface MobileStrategistContentWeek7DaysProps {
  weekStart: Date;
  contents: SocialContent[];
  loading: boolean;
  onAddContent: (date: Date) => void;
  onEditContent: (content: SocialContent) => void;
}

export default function MobileStrategistContentWeek7Days({
  weekStart,
  contents,
  loading,
  onAddContent,
  onEditContent
}: MobileStrategistContentWeek7DaysProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayColumnRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para o dia de hoje
  useEffect(() => {
    if (todayColumnRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const todayColumn = todayColumnRef.current;

      const containerWidth = container.offsetWidth;
      const columnLeft = todayColumn.offsetLeft;
      const columnWidth = todayColumn.offsetWidth;

      const scrollPosition = columnLeft - (containerWidth / 2) + (columnWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }, [weekStart]);

  // Gerar array de 7 dias
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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
      {/* Scroll horizontal de 7 dias - SEM PADDING LATERAL */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden px-1 py-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div className="flex gap-1 h-full" style={{ minWidth: 'max-content' }}>
          {weekDays.map((day, index) => {
            const dayContents = getContentsForDay(day);
            const isCurrentDay = isToday(day);
            const dayName = format(day, 'EEE', { locale: ptBR }).toUpperCase();
            const dayNumber = format(day, 'd');

            return (
              <div
                key={index}
                ref={isCurrentDay ? todayColumnRef : null}
                className="flex flex-col flex-shrink-0"
                style={{ width: '100px', scrollSnapAlign: 'start' }}
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
                  className={`flex-1 border-l border-r border-b rounded-b-lg p-1.5 space-y-1.5 overflow-y-auto ${
                    isCurrentDay ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  }`}
                  onClick={() => onAddContent(day)}
                  style={{ minHeight: '400px' }}
                >
                  {dayContents.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                      Vazio
                    </div>
                  ) : (
                    dayContents.map(content => (
                      <MobileContentCard7Days
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

      {/* Indicador de scroll */}
      <div className="px-4 py-2 bg-gray-50 border-t text-center text-xs text-gray-500">
        Deslize para ver mais dias
      </div>
    </div>
  );
}

// Card de conteúdo ultra-compacto para 7 dias
function MobileContentCard7Days({ content, onClick }: { content: SocialContent; onClick: (e: React.MouseEvent) => void }) {
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
      className={`relative ${typeConfig.bg} ${typeConfig.border} border rounded-lg p-1.5 cursor-pointer active:scale-95 transition-transform ${
        content.is_executed ? 'opacity-60' : ''
      }`}
    >
      {/* Checkmark - Canto superior direito */}
      <button
        onClick={handleCheckmarkClick}
        className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${
          content.is_executed
            ? 'bg-green-500 text-white'
            : 'bg-white text-gray-400 border border-gray-300 hover:border-green-500 hover:text-green-500'
        }`}
        aria-label={content.is_executed ? 'Marcar como não executado' : 'Marcar como executado'}
      >
        {content.is_executed ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Tipo */}
      <div className="flex items-center justify-center mb-1">
        <ContentTypeIcon type={content.content_type} size={14} />
      </div>

      {/* Horário */}
      {content.scheduled_time && (
        <div className="text-xs text-center text-gray-600 font-medium mb-1">
          {content.scheduled_time.substring(0, 5)}
        </div>
      )}

      {/* Plataformas */}
      <div className="flex items-center justify-center gap-0.5 flex-wrap">
        {content.platforms.slice(0, 2).map(platform => (
          <span
            key={platform}
            className="inline-flex items-center"
            title={platform}
          >
            <PlatformIcon platform={platform} size={8} className="text-gray-500" />
          </span>
        ))}
        {content.platforms.length > 2 && (
          <span className="text-xs text-gray-500">+</span>
        )}
      </div>

      {/* Status executado */}
      {content.is_executed && (
        <div className="mt-1 pt-1 border-t border-gray-200 text-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
        </div>
      )}
    </div>
  );
}

