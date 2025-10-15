'use client';

import React, { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialContent } from './ContentPlanningView';

interface MobileContentSummaryProps {
  contents: SocialContent[];
  weekStart: Date;
  viewMode?: '3days' | '7days' | 'month';
}

export default function MobileContentSummary({ contents, weekStart, viewMode = '7days' }: MobileContentSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtrar conteúdos pelo período correto
  const filteredContents = useMemo(() => {
    let periodStart: Date;
    let periodEnd: Date;

    if (viewMode === 'month') {
      // Para mês: do dia 1 até o último dia do mês
      periodStart = startOfMonth(weekStart);
      periodEnd = endOfMonth(weekStart);
    } else {
      // Para 3 dias e 7 dias: sempre considera semana completa (segunda a domingo)
      periodStart = startOfWeek(weekStart, { weekStartsOn: 1 });
      periodEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    }

    return contents.filter(content => {
      const dateStr = content.scheduled_date.includes('T')
        ? content.scheduled_date.split('T')[0]
        : content.scheduled_date;

      const [year, month, day] = dateStr.split('-').map(Number);
      const contentDate = new Date(year, month - 1, day);

      return isWithinInterval(contentDate, { start: periodStart, end: periodEnd });
    });
  }, [contents, weekStart, viewMode]);

  // Calcular estatísticas com conteúdos filtrados
  const stats = {
    total: filteredContents.length,
    executed: filteredContents.filter(c => c.is_executed).length,
    pending: filteredContents.filter(c => !c.is_executed).length,
    reels: filteredContents.filter(c => c.content_type === 'reels').length,
    stories: filteredContents.filter(c => c.content_type === 'story').length,
    posts: filteredContents.filter(c => c.content_type === 'post').length,
    completionRate: filteredContents.length > 0
      ? Math.round((filteredContents.filter(c => c.is_executed).length / filteredContents.length) * 100)
      : 0
  };

  // Agrupar por dia da semana (usando conteúdos filtrados)
  const contentsByDay: { [key: string]: { count: number; order: number } } = {};

  filteredContents.forEach(content => {
    const dateStr = content.scheduled_date.includes('T')
      ? content.scheduled_date.split('T')[0]
      : content.scheduled_date;
    
    const [year, month, day] = dateStr.split('-').map(Number);
    const contentDate = new Date(year, month - 1, day);
    const dayName = format(contentDate, 'EEEE', { locale: ptBR });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
    const dayOfWeek = contentDate.getDay();
    const order = dayOfWeek === 0 ? 7 : dayOfWeek;

    if (!contentsByDay[capitalizedDay]) {
      contentsByDay[capitalizedDay] = { count: 0, order };
    }
    contentsByDay[capitalizedDay].count++;
  });

  const sortedDays = Object.entries(contentsByDay)
    .sort(([, a], [, b]) => a.order - b.order);

  return (
    <div className="">
      {/* Header Compacto - Sempre Visível - OTIMIZADO */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2.5 flex items-center justify-between active:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {/* Badge circular com total */}
          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-blue-600">{stats.total}</span>
          </div>

          {/* Info compacta */}
          <div>
            <div className="text-sm font-semibold text-gray-900 text-left">
              {stats.total} {stats.total === 1 ? 'conteúdo' : 'conteúdos'}
            </div>
            <div className="text-xs text-gray-500 text-left">
              {stats.executed} executado{stats.executed !== 1 ? 's' : ''} • {stats.pending} pendente{stats.pending !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Circular Progress - MAIOR E MAIS VISÍVEL */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg className="w-12 h-12 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - stats.completionRate / 100)}`}
                className={`transition-all duration-500 ${
                  stats.completionRate >= 80 ? 'text-green-500' :
                  stats.completionRate >= 50 ? 'text-blue-500' :
                  stats.completionRate >= 25 ? 'text-yellow-500' :
                  'text-orange-500'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold ${
                stats.completionRate >= 80 ? 'text-green-600' :
                stats.completionRate >= 50 ? 'text-blue-600' :
                stats.completionRate >= 25 ? 'text-yellow-600' :
                'text-orange-600'
              }`}>
                {stats.completionRate}%
              </span>
            </div>
          </div>

          {/* Seta */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* Por Tipo */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Por Tipo</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-green-700">{stats.reels}</div>
                <div className="text-xs text-green-600">Reels</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-yellow-700">{stats.stories}</div>
                <div className="text-xs text-yellow-600">Stories</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-blue-700">{stats.posts}</div>
                <div className="text-xs text-blue-600">Posts</div>
              </div>
            </div>
          </div>

          {/* Por Dia */}
          {sortedDays.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Por Dia</h3>
              <div className="space-y-1">
                {sortedDays.map(([day, { count }]) => (
                  <div key={day} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">{day}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estatísticas */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Planejadas</span>
                <span className="text-sm font-semibold text-gray-900">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Realizadas</span>
                <span className="text-sm font-semibold text-green-600">{stats.executed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pendentes</span>
                <span className="text-sm font-semibold text-orange-600">{stats.pending}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Taxa de Conclusão</span>
                  <span className="text-lg font-bold text-blue-600">{stats.completionRate}%</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

