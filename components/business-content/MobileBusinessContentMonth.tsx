'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialContent } from './BusinessContentPlanningView';
import { ContentTypeIcon, contentTypeConfig } from '@/components/icons/ContentTypeIcons';
import { PlatformIcon } from '@/components/icons/PlatformIcons';

interface MobileBusinessContentMonthProps {
  monthStart: Date;
  contents: SocialContent[];
  loading: boolean;
  onAddContent: (date: Date) => void;
  onEditContent: (content: SocialContent) => void;
  onToggleExecuted?: (contentId: string, isExecuted: boolean) => void;
}

export default function MobileBusinessContentMonth({
  monthStart,
  contents,
  loading,
  onAddContent,
  onEditContent,
  onToggleExecuted
}: MobileBusinessContentMonthProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Gerar todos os dias do mês
  const monthEnd = endOfMonth(monthStart);
  const monthDays = eachDayOfInterval({ start: startOfMonth(monthStart), end: monthEnd });

  // Preencher dias para completar a grade
  const firstDayOfWeek = monthDays[0].getDay();
  const daysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  const calendarDays: Date[] = [];
  
  // Adicionar dias do mês anterior
  for (let i = daysToAdd; i > 0; i--) {
    const prevDay = new Date(monthDays[0]);
    prevDay.setDate(prevDay.getDate() - i);
    calendarDays.push(prevDay);
  }
  
  calendarDays.push(...monthDays);
  
  // Adicionar dias do próximo mês
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    const nextDay = new Date(monthEnd);
    nextDay.setDate(nextDay.getDate() + i);
    calendarDays.push(nextDay);
  }

  // Agrupar conteúdos por dia (comparação por string para evitar problemas de timezone)
  const getContentsForDay = (date: Date) => {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    return contents.filter(content => {
      if (!content.scheduled_date || typeof content.scheduled_date !== 'string') return false;
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

  const handleDayClick = (day: Date) => {
    if (selectedDay && isSameDay(selectedDay, day)) {
      setSelectedDay(null);
    } else {
      setSelectedDay(day);
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

  const selectedDayContents = selectedDay ? getContentsForDay(selectedDay) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Calendário - SEM PADDING LATERAL */}
      <div className="px-1 py-2">
        {/* Header dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => (
            <div key={index} className="text-center text-xs font-semibold text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Grade de dias */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayContents = getContentsForDay(day);
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isSelected = selectedDay && isSameDay(selectedDay, day);

            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square border rounded-lg p-1 flex flex-col items-center justify-center cursor-pointer
                  transition-all
                  ${isCurrentDay ? 'bg-blue-600 text-white border-blue-700 font-bold' : ''}
                  ${!isCurrentDay && isSelected ? 'bg-blue-50 border-blue-300' : ''}
                  ${!isCurrentDay && !isSelected && isCurrentMonth ? 'bg-white border-gray-200 hover:bg-gray-50' : ''}
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400 border-gray-100' : ''}
                `}
              >
                {/* Número do dia */}
                <div className={`text-xs ${isCurrentDay ? 'font-bold' : 'font-medium'}`}>
                  {format(day, 'd')}
                </div>

                {/* Indicadores de conteúdo */}
                {dayContents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayContents.slice(0, 3).map((content, idx) => {
                      const dotColor = {
                        reels: 'bg-green-500',
                        story: 'bg-yellow-500',
                        post: 'bg-blue-500'
                      }[content.content_type];

                      return (
                        <div
                          key={idx}
                          className={`w-1 h-1 rounded-full ${isCurrentDay ? 'bg-white' : dotColor}`}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Contador se mais de 3 */}
                {dayContents.length > 3 && (
                  <div className={`text-xs mt-0.5 ${isCurrentDay ? 'text-white' : 'text-gray-600'}`}>
                    +{dayContents.length - 3}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalhes do dia selecionado */}
      {selectedDay && (
        <div className="flex-1 border-t bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {format(selectedDay, "d 'de' MMMM", { locale: ptBR })}
              </div>
              <div className="text-xs text-gray-500">
                {selectedDayContents.length} conteúdo{selectedDayContents.length !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-3">
            {selectedDayContents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm mb-3">Nenhum conteúdo planejado</div>
                <button
                  onClick={() => onAddContent(selectedDay)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  Adicionar Conteúdo
                </button>
              </div>
            ) : (
              selectedDayContents.map(content => (
                <MobileContentCardMonth
                  key={content.id}
                  content={content}
                  onClick={() => onEditContent(content)}
                  onToggleExecuted={onToggleExecuted}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Mensagem quando nenhum dia selecionado */}
      {!selectedDay && (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Toque em um dia para ver os conteúdos
        </div>
      )}
    </div>
  );
}

// Card de conteúdo para visualização mensal
function MobileContentCardMonth({
  content,
  onClick,
  onToggleExecuted
}: {
  content: SocialContent;
  onClick: () => void;
  onToggleExecuted?: (contentId: string, isExecuted: boolean) => void;
}) {
  const typeConfig = contentTypeConfig[content.content_type];

  const handleCheckmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onToggleExecuted) {
      onToggleExecuted(content.id, !content.is_executed);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative ${typeConfig.bg} ${typeConfig.border} border rounded-lg p-3 cursor-pointer active:scale-95 transition-transform ${
        content.is_executed ? 'opacity-60' : ''
      }`}
    >
      {/* Checkmark - Canto superior direito */}
      <button
        onClick={handleCheckmarkClick}
        className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${
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
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ContentTypeIcon type={content.content_type} size={16} />
          <span className={`text-sm font-semibold ${typeConfig.text}`}>
            {typeConfig.label}
          </span>
        </div>
        {content.scheduled_time && (
          <span className="text-sm text-gray-600 font-medium">
            {content.scheduled_time.substring(0, 5)}
          </span>
        )}
      </div>

      {/* Título */}
      {content.title && (
        <div className="text-sm text-gray-700 font-medium mb-2">
          {content.title}
        </div>
      )}

      {/* Plataformas */}
      <div className="flex items-center gap-2 flex-wrap">
        {content.platforms.map(platform => (
          <span
            key={platform}
            className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full border border-gray-200"
          >
            <PlatformIcon platform={platform} size={12} className="text-gray-600" />
            <span className="text-gray-600">{platform}</span>
          </span>
        ))}
      </div>

      {/* Status */}
      {content.is_executed && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-green-600 font-medium">✓ Executado</span>
        </div>
      )}
    </div>
  );
}

