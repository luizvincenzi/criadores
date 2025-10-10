'use client';

import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialContent } from './ContentPlanningView';

interface WeeklyPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: Date;
  onSave: (contents: Partial<SocialContent>[]) => void;
  existingContents: SocialContent[];
}

export default function WeeklyPlanningModal({
  isOpen,
  onClose,
  weekStart,
  onSave,
  existingContents
}: WeeklyPlanningModalProps) {
  const [planningData, setPlanningData] = useState({
    postsPerDay: 1,
    reelsPerWeek: 3,
    storiesPerDay: 2
  });

  if (!isOpen) return null;

  const handleSave = () => {
    const newContents: Partial<SocialContent>[] = [];
    
    // Gerar posts diários
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      for (let j = 0; j < planningData.postsPerDay; j++) {
        newContents.push({
          title: `Post ${format(day, 'dd/MM', { locale: ptBR })}`,
          content_type: 'post',
          scheduled_date: format(day, 'yyyy-MM-dd'),
          platforms: ['instagram'],
          is_executed: false
        });
      }
      
      // Stories
      for (let j = 0; j < planningData.storiesPerDay; j++) {
        newContents.push({
          title: `Story ${format(day, 'dd/MM', { locale: ptBR })}`,
          content_type: 'story',
          scheduled_date: format(day, 'yyyy-MM-dd'),
          platforms: ['instagram'],
          is_executed: false
        });
      }
    }
    
    // Distribuir reels pela semana
    const reelsDays = [1, 3, 5]; // Segunda, Quarta, Sexta
    for (let i = 0; i < Math.min(planningData.reelsPerWeek, reelsDays.length); i++) {
      const day = addDays(weekStart, reelsDays[i]);
      newContents.push({
        title: `Reels ${format(day, 'dd/MM', { locale: ptBR })}`,
        content_type: 'reels',
        scheduled_date: format(day, 'yyyy-MM-dd'),
        platforms: ['instagram'],
        is_executed: false
      });
    }

    onSave(newContents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Planejamento Semanal
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Semana de {format(weekStart, "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posts por dia
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={planningData.postsPerDay}
                onChange={(e) => setPlanningData({ ...planningData, postsPerDay: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reels por semana
              </label>
              <input
                type="number"
                min="0"
                max="7"
                value={planningData.reelsPerWeek}
                onChange={(e) => setPlanningData({ ...planningData, reelsPerWeek: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stories por dia
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={planningData.storiesPerDay}
                onChange={(e) => setPlanningData({ ...planningData, storiesPerDay: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Total estimado:</strong> {' '}
                {(planningData.postsPerDay * 7) + planningData.reelsPerWeek + (planningData.storiesPerDay * 7)} conteúdos
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Gerar Planejamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

