'use client';

import React, { useRef, useEffect, useState } from 'react';
import { format, addDays, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialContent } from './StrategistContentPlanningView';
import { ContentTypeIcon, contentTypeConfig } from '@/components/icons/ContentTypeIcons';

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
      container.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
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
      {/* Scroll horizontal dos dias */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div className="flex" style={{ minWidth: 'max-content' }}>
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
                style={{ width: 'calc(50vw - 8px)', scrollSnapAlign: 'start' }}
              >
                {/* Header do dia */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 tracking-wider">{dayName}</span>
                  <span className={`text-2xl font-bold ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
                    {dayNumber}
                  </span>
                </div>

                {/* Área de conteúdos do dia */}
                <div className="flex-1 px-3 py-3 space-y-3 min-h-[400px]">
                  {/* Botão Adicionar */}
                  <button
                    onClick={() => onAddContent(day)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-gray-300 hover:text-gray-500 active:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>

                  {/* Cards de conteúdo */}
                  {dayContents.map(content => (
                    <MobileContentCard
                      key={content.id}
                      content={content}
                      onClick={() => onEditContent(content)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Card de conteúdo no estilo da screenshot
function MobileContentCard({
  content,
  onClick
}: {
  content: SocialContent;
  onClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Cores para os badges
  const badgeColors: Record<string, { bg: string; text: string }> = {
    reels: { bg: 'bg-green-100', text: 'text-green-700' },
    post: { bg: 'bg-blue-100', text: 'text-blue-700' },
    story: { bg: 'bg-purple-100', text: 'text-purple-700' },
  };

  const badge = badgeColors[content.content_type] || badgeColors.post;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-4 cursor-pointer active:scale-[0.98] transition-transform shadow-sm ${
        content.is_executed ? 'opacity-60' : ''
      }`}
    >
      {/* Header: Badge + Menu */}
      <div className="flex items-start justify-between mb-3">
        {/* Badge de tipo */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badge.bg}`}>
          <ContentTypeIcon type={content.content_type} size={14} />
          <span className={`text-xs font-semibold ${badge.text} uppercase`}>
            {content.content_type === 'reels' ? 'Reels' : content.content_type === 'story' ? 'Story' : 'Post'}
          </span>
        </div>

        {/* Menu 3 pontos */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Título */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {content.title || 'Sem título'}
      </h3>

      {/* Horário */}
      {content.scheduled_time && (
        <div className="flex items-center gap-1.5 text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
            <path strokeLinecap="round" strokeWidth={1.5} d="M12 6v6l4 2" />
          </svg>
          <span className="text-sm">{content.scheduled_time.substring(0, 5)}</span>
        </div>
      )}

      {/* Status executado */}
      {content.is_executed && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Executado
          </span>
        </div>
      )}
    </div>
  );
}
