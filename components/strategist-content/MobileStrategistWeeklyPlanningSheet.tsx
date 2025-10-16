'use client';

import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomSheet from '../BottomSheet';

interface MobileStrategistWeeklyPlanningSheetProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: Date;
  onSave: (plans: WeeklyPlan[]) => void;
  existingContents?: any[];
}

interface WeeklyPlan {
  content_type: 'post' | 'reels' | 'story';
  quantity: number;
  days: number[];
}

export default function MobileStrategistWeeklyPlanningSheet({
  isOpen,
  onClose,
  weekStart,
  onSave,
  existingContents = []
}: MobileStrategistWeeklyPlanningSheetProps) {
  const [plans, setPlans] = useState<WeeklyPlan[]>([
    { content_type: 'reels', quantity: 2, days: [] },
    { content_type: 'story', quantity: 2, days: [] },
    { content_type: 'post', quantity: 3, days: [] }
  ]);

  const weekDays = Array.from({ length: 7 }, (_, i) => ({
    date: addDays(weekStart, i),
    dayOfWeek: i,
    label: format(addDays(weekStart, i), 'EEE', { locale: ptBR }).toUpperCase(),
    number: format(addDays(weekStart, i), 'd')
  }));

  const toggleDay = (contentType: 'post' | 'reels' | 'story', dayIndex: number) => {
    setPlans(prev => prev.map(plan => {
      if (plan.content_type !== contentType) return plan;

      const newDays = plan.days.includes(dayIndex)
        ? plan.days.filter(d => d !== dayIndex)
        : [...plan.days, dayIndex].sort();

      // Limitar ao máximo da quantidade
      if (newDays.length > plan.quantity) {
        return plan;
      }

      return { ...plan, days: newDays };
    }));
  };

  const updateQuantity = (contentType: 'post' | 'reels' | 'story', delta: number) => {
    setPlans(prev => prev.map(plan => {
      if (plan.content_type !== contentType) return plan;
      
      const newQuantity = Math.max(0, Math.min(14, plan.quantity + delta));
      
      // Ajustar dias selecionados se necessário
      const newDays = plan.days.length > newQuantity
        ? plan.days.slice(0, newQuantity)
        : plan.days;

      return { ...plan, quantity: newQuantity, days: newDays };
    }));
  };

  const handleSave = () => {
    onSave(plans);
    onClose();
  };

  const typeConfig = {
    reels: { label: 'Reels', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    story: { label: 'Stories', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    post: { label: 'Posts', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[90, 95]}
      defaultSnap={1}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Planejamento Semanal</h2>
            <p className="text-sm text-gray-600">
              {format(weekStart, 'd MMM', { locale: ptBR })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: ptBR })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {plans.map((plan) => {
            const config = typeConfig[plan.content_type];
            const selectedCount = plan.days.length;
            const isComplete = selectedCount === plan.quantity;

            return (
              <div key={plan.content_type} className={`border-b border-gray-200 p-4 ${config.bg}`}>
                {/* Header do tipo */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${config.color}`}>
                      {config.label}
                    </span>
                    {isComplete && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* Controle de quantidade */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(plan.content_type, -1)}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg font-bold text-gray-700 active:scale-95 transition-transform"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center">
                      {plan.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(plan.content_type, 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg font-bold text-gray-700 active:scale-95 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Contador de seleção */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Selecione {plan.quantity} {plan.quantity === 1 ? 'dia' : 'dias'}
                    </span>
                    <span className={`font-semibold ${selectedCount === plan.quantity ? 'text-green-600' : 'text-gray-900'}`}>
                      {selectedCount}/{plan.quantity}
                    </span>
                  </div>
                  {/* Barra de progresso */}
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${selectedCount === plan.quantity ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${(selectedCount / plan.quantity) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Grid de dias - SEM PADDING LATERAL */}
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day) => {
                    const isSelected = plan.days.includes(day.dayOfWeek);
                    const canSelect = !isSelected && selectedCount < plan.quantity;

                    return (
                      <button
                        key={day.dayOfWeek}
                        onClick={() => toggleDay(plan.content_type, day.dayOfWeek)}
                        disabled={!isSelected && !canSelect}
                        className={`
                          aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                          transition-all active:scale-95
                          ${isSelected
                            ? `${config.border} bg-white shadow-md`
                            : canSelect
                            ? 'border-gray-200 bg-white hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          }
                        `}
                      >
                        <div className={`text-xs font-semibold ${isSelected ? config.color : 'text-gray-500'}`}>
                          {day.label}
                        </div>
                        <div className={`text-lg font-bold ${isSelected ? config.color : 'text-gray-400'}`}>
                          {day.number}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1">
                            <svg className={`w-4 h-4 ${config.color}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200 space-y-2 flex-shrink-0">
          <button
            onClick={handleSave}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold text-base active:scale-95 transition-transform shadow-lg"
          >
            Salvar Planejamento
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium text-base active:scale-95 transition-transform"
          >
            Cancelar
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

