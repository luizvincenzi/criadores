'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialContent } from './ContentPlanningView';
import { ContentTypeIcon } from '@/components/icons/ContentTypeIcons';

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
  const daysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Ajustar para segunda-feira
  
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
  const remainingDays = 42 - calendarDays.length; // 6 semanas x 7 dias
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

  const contentTypeConfig = {
    reels: { color: 'bg-green-100 text-green-700' },
    story: { color: 'bg-yellow-100 text-yellow-700' },
    post: { color: 'bg-blue-100 text-blue-700' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conteúdos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header dos dias da semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7 gap-2 flex-1 overflow-y-auto">
        {calendarDays.map((day, index) => {
          const dayContents = getContentsForDay(day);
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={index}
              className={`
                border rounded-lg p-2 min-h-[100px] flex flex-col
                ${isCurrentDay ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
                ${!isCurrentMonth ? 'opacity-40' : ''}
                hover:shadow-md transition-shadow cursor-pointer
              `}
              onClick={() => onAddContent(day)}
            >
              {/* Número do dia */}
              <div className={`
                text-sm font-semibold mb-1
                ${isCurrentDay ? 'text-blue-700' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              `}>
                {format(day, 'd')}
              </div>

              {/* Conteúdos do dia */}
              <div className="space-y-1 flex-1 overflow-y-auto">
                {dayContents.slice(0, 3).map((content) => {
                  const config = contentTypeConfig[content.content_type];
                  
                  return (
                    <div
                      key={content.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditContent(content);
                      }}
                      className={`
                        ${config.color} rounded px-1.5 py-0.5 text-xs truncate
                        hover:opacity-80 transition-opacity flex items-center gap-1
                      `}
                      title={content.title}
                    >
                      <ContentTypeIcon type={content.content_type} className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{content.title}</span>
                    </div>
                  );
                })}
                
                {/* Indicador de mais conteúdos */}
                {dayContents.length > 3 && (
                  <div className="text-xs text-gray-500 font-medium">
                    +{dayContents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

