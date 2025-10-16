'use client';

import React from 'react';

interface ContentStatsWidgetProps {
  stats: {
    planned: number;
    executed: number;
    pending: number;
    completionRate: number;
  };
  compact?: boolean;
}

export default function ContentStatsWidget({ stats, compact = false }: ContentStatsWidgetProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        {/* Gráfico de Desempenho */}
        <div className="flex items-center gap-2 mb-3">
          <button className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded">
            Por tipo
          </button>
          <button className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded">
            Por mês
          </button>
        </div>

        {/* Círculo de Progresso */}
        <div className="flex items-center justify-center py-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.completionRate / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{stats.completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Estatísticas Compactas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Planejadas</span>
            <span className="font-semibold text-gray-900">{stats.planned}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Realizadas</span>
            <span className="font-semibold text-green-600">{stats.executed}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Pendentes</span>
            <span className="font-semibold text-orange-600">{stats.pending}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Planejadas */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <span className="text-lg">📅</span>
        <div>
          <div className="text-xs text-blue-600 font-medium">Planejadas</div>
          <div className="text-lg font-bold text-blue-900">{stats.planned}</div>
        </div>
      </div>

      {/* Realizadas */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <span className="text-lg">✅</span>
        <div>
          <div className="text-xs text-green-600 font-medium">Realizadas</div>
          <div className="text-lg font-bold text-green-900">{stats.executed}</div>
        </div>
      </div>

      {/* Pendentes */}
      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
        <span className="text-lg">⏳</span>
        <div>
          <div className="text-xs text-orange-600 font-medium">Pendentes</div>
          <div className="text-lg font-bold text-orange-900">{stats.pending}</div>
        </div>
      </div>

      {/* Taxa de Conclusão */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <span className="text-lg">📊</span>
        <div>
          <div className="text-xs text-green-600 font-medium">Conclusão</div>
          <div className="text-lg font-bold text-green-900">{stats.completionRate}%</div>
        </div>
      </div>
    </div>
  );
}

