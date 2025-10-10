'use client';

import React from 'react';

interface ContentStats {
  total: number;
  executed: number;
  pending: number;
  byType: {
    post: number;
    reels: number;
    story: number;
  };
  byPlatform: Record<string, number>;
}

interface ContentStatsWidgetProps {
  stats: ContentStats;
  compact?: boolean;
}

export default function ContentStatsWidget({ stats, compact = false }: ContentStatsWidgetProps) {
  const executionRate = stats.total > 0 ? Math.round((stats.executed / stats.total) * 100) : 0;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total</span>
          <span className="font-semibold text-gray-900">{stats.total}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Executados</span>
          <span className="font-semibold text-green-600">{stats.executed}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Pendentes</span>
          <span className="font-semibold text-orange-600">{stats.pending}</span>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Taxa de execução</span>
            <span className="font-semibold text-blue-600">{executionRate}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Estatísticas</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total de conteúdos</span>
          <span className="text-lg font-bold text-gray-900">{stats.total}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Executados</span>
          <span className="text-lg font-bold text-green-600">{stats.executed}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Pendentes</span>
          <span className="text-lg font-bold text-orange-600">{stats.pending}</span>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Taxa de execução</span>
            <span className="text-lg font-bold text-blue-600">{executionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${executionRate}%` }}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Por tipo</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Posts</span>
              <span className="font-medium text-blue-700">{stats.byType.post}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Reels</span>
              <span className="font-medium text-purple-700">{stats.byType.reels}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Stories</span>
              <span className="font-medium text-pink-700">{stats.byType.story}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

