'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialContent } from './ContentPlanningView';

interface ContentMonthViewProps {
  monthStart: Date;
  contents: SocialContent[];
  loading: boolean;
  onAddContent: (date: Date) => void;
  onEditContent: (content: SocialContent) => void;
}

export default function ContentMonthView({
  monthStart,
  contents,
  loading,
  onAddContent,
  onEditContent
}: ContentMonthViewProps) {
  // Gerar todos os dias do mês
  const monthEnd = endOfMonth(monthStart);
  const monthDays = eachDayOfInterval({ start: startOfMonth(monthStart), end: monthEnd });

  // Preencher dias para completar a grade (começar na segunda-feira)
  const firstDayOfWeek = monthDays[0].getDay();
  const daysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const calendarDays: Date[] = [];

  // Adicionar dias do mês anterior
  for (let i = daysToAdd; i > 0; i--) {
    const prevDay = new Date(monthDays[0]);
    prevDay.setDate(prevDay.getDate() - i);
    calendarDays.push(prevDay);
  }

  // Adicionar dias do mês atual
  calendarDays.push(...monthDays);

  // Adicionar dias do próximo mês para completar a grade
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
    });
  };

  const contentTypeColors = {
    reels: 'bg-green-500',
    story: 'bg-purple-500',
    post: 'bg-blue-500'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  // Agrupar por semanas
  const weeks: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="h-full flex flex-col bg-[#f5f5f5] overflow-hidden">
      {/* Header dos dias da semana - Apple Style */}
      <div className="grid grid-cols-7 bg-[#f5f5f5] px-4">
        {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((day) => (
          <div key={day} className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-3">
            {day}
          </div>
        ))}
      </div>

      {/* Grade de dias - Apple Style com cards brancos */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2 mb-2">
            {week.map((day, dayIndex) => {
              const dayContents = getContentsForDay(day);
              const isCurrentDay = isToday(day);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div
                  key={dayIndex}
                  className={`
                    relative p-2 md:p-3 flex flex-col cursor-pointer transition-all group
                    rounded-2xl min-h-[100px] md:min-h-[120px]
                    ${isCurrentMonth
                      ? 'bg-white shadow-sm hover:shadow-md'
                      : 'bg-gray-100/50'}
                    ${isCurrentDay ? 'ring-2 ring-blue-500/30' : ''}
                  `}
                  onClick={() => onAddContent(day)}
                >
                  {/* Número do dia - Apple Style */}
                  <div className="flex justify-end mb-2">
                    <span className={`
                      inline-flex items-center justify-center text-sm font-medium transition-all
                      ${isCurrentDay
                        ? 'w-7 h-7 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30'
                        : isCurrentMonth
                          ? 'text-gray-800'
                          : 'text-gray-300'
                      }
                    `}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Conteúdos do dia - Clean lines */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayContents.slice(0, 2).map((content) => {
                      const bgColor = contentTypeColors[content.content_type];

                      return (
                        <div
                          key={content.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditContent(content);
                          }}
                          className={`
                            flex items-center gap-1.5 px-2 py-1 rounded-md text-xs
                            hover:opacity-80 transition-opacity cursor-pointer
                            ${content.is_executed ? 'opacity-50' : ''}
                          `}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${bgColor}`}></span>
                          <span className={`truncate text-gray-700 ${content.is_executed ? 'line-through' : ''}`}>
                            {content.title}
                          </span>
                        </div>
                      );
                    })}

                    {/* Indicador de mais conteúdos */}
                    {dayContents.length > 2 && (
                      <div className="text-[10px] text-gray-400 font-medium pl-2">
                        +{dayContents.length - 2} mais
                      </div>
                    )}
                  </div>

                  {/* Hover indicator */}
                  {isCurrentMonth && (
                    <div className="absolute inset-x-2 bottom-2 h-6 border border-dashed border-gray-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-gray-400">+ Adicionar</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

