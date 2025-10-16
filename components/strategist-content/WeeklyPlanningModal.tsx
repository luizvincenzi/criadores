'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ContentTypeIcon } from '@/components/icons/ContentTypeIcons';

interface SocialContent {
  id: string;
  content_type: 'post' | 'reels' | 'story';
  scheduled_date: string;
  [key: string]: any;
}

interface WeeklyPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: Date;
  onSave: (plans: WeeklyPlan[]) => void;
  existingContents?: SocialContent[]; // Conteúdos já planejados na semana
}

interface WeeklyPlan {
  content_type: 'post' | 'reels' | 'story';
  quantity: number;
  days: number[]; // 0-6 (Seg-Dom)
}

export default function WeeklyPlanningModal({
  isOpen,
  onClose,
  weekStart,
  onSave,
  existingContents = []
}: WeeklyPlanningModalProps) {
  const [plans, setPlans] = useState<WeeklyPlan[]>([
    { content_type: 'reels', quantity: 0, days: [] },
    { content_type: 'story', quantity: 0, days: [] },
    { content_type: 'post', quantity: 0, days: [] }
  ]);

  // Carregar dados existentes quando o modal abrir
  useEffect(() => {
    if (isOpen && existingContents.length > 0) {
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

      const newPlans = ['reels', 'story', 'post'].map(type => {
        const typeContents = existingContents.filter(c => c.content_type === type);
        const days: number[] = [];

        typeContents.forEach(content => {
          const contentDate = new Date(content.scheduled_date.split('T')[0]);
          const dayIndex = weekDays.findIndex(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const contentStr = format(contentDate, 'yyyy-MM-dd');
            return dayStr === contentStr;
          });

          if (dayIndex !== -1 && !days.includes(dayIndex)) {
            days.push(dayIndex);
          }
        });

        return {
          content_type: type as 'post' | 'reels' | 'story',
          quantity: typeContents.length,
          days: days.sort()
        };
      });

      setPlans(newPlans);
    }
  }, [isOpen, existingContents, weekStart]);

  if (!isOpen) return null;

  const weekDays = Array.from({ length: 7 }, (_, i) => ({
    index: i,
    date: addDays(weekStart, i),
    label: format(addDays(weekStart, i), 'EEE', { locale: ptBR }).toUpperCase()
  }));

  const contentTypeConfig = {
    reels: { label: 'Reels', color: 'text-green-600', bg: 'bg-green-50' },
    story: { label: 'Stories', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    post: { label: 'Posts', color: 'text-blue-600', bg: 'bg-blue-50' }
  };

  const handleQuantityChange = (type: 'post' | 'reels' | 'story', value: number) => {
    setPlans(prev => prev.map(p => 
      p.content_type === type ? { ...p, quantity: Math.max(0, value) } : p
    ));
  };

  const handleDayToggle = (type: 'post' | 'reels' | 'story', dayIndex: number) => {
    setPlans(prev => prev.map(p => {
      if (p.content_type !== type) return p;

      // Se está desmarcando, permite
      if (p.days.includes(dayIndex)) {
        return { ...p, days: p.days.filter(d => d !== dayIndex) };
      }

      // Se está marcando, verifica se já atingiu o limite
      if (p.days.length >= p.quantity) {
        return p; // Não permite marcar mais dias que a quantidade
      }

      const days = [...p.days, dayIndex].sort();
      return { ...p, days };
    }));
  };

  const handleSave = () => {
    const validPlans = plans.filter(p => p.quantity > 0 && p.days.length > 0);
    onSave(validPlans);
    onClose();
  };

  const getTotalPlanned = () => {
    return plans.reduce((sum, p) => sum + p.quantity, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col z-10">
        {/* Header FIXO */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Planejamento Semanal</h2>
            <p className="text-sm text-gray-600 mt-1">
              {format(weekStart, 'd MMM', { locale: ptBR })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: ptBR })}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {plans.map((plan) => {
            const config = contentTypeConfig[plan.content_type];
            
            return (
              <div key={plan.content_type} className={`${config.bg} border-2 border-gray-200 rounded-lg p-4`}>
                {/* Header do Tipo */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ContentTypeIcon type={plan.content_type} className="w-6 h-6" />
                    <span className={`text-lg font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  
                  {/* Quantidade */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Quantidade:</label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantityChange(plan.content_type, plan.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={plan.quantity}
                        onChange={(e) => handleQuantityChange(plan.content_type, parseInt(e.target.value) || 0)}
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => handleQuantityChange(plan.content_type, plan.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Seleção de Dias */}
                {plan.quantity > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Selecione até {plan.quantity} {plan.quantity === 1 ? 'dia' : 'dias'} ({plan.days.length}/{plan.quantity} selecionados):
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day) => {
                        const isSelected = plan.days.includes(day.index);
                        const canSelect = isSelected || plan.days.length < plan.quantity;

                        return (
                          <button
                            key={day.index}
                            onClick={() => handleDayToggle(plan.content_type, day.index)}
                            disabled={!canSelect}
                            className={`
                              p-3 rounded-lg border-2 transition-all
                              ${isSelected
                                ? 'bg-blue-500 border-blue-600 text-white'
                                : canSelect
                                  ? 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                              }
                            `}
                          >
                            <div className="text-xs font-medium">{day.label}</div>
                            <div className="text-lg font-bold">{format(day.date, 'd')}</div>
                          </button>
                        );
                      })}
                    </div>

                    {plan.quantity > 0 && plan.days.length === 0 && (
                      <p className="text-sm text-orange-600 mt-2">
                        ⚠️ Selecione pelo menos um dia para distribuir os {plan.quantity} {config.label.toLowerCase()}
                      </p>
                    )}

                    {plan.days.length === plan.quantity && (
                      <p className="text-sm text-green-600 mt-2">
                        ✅ Limite atingido: {plan.quantity} {plan.quantity === 1 ? 'dia selecionado' : 'dias selecionados'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Resumo */}
          {getTotalPlanned() > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📊 Resumo do Planejamento</h3>
              <div className="space-y-1 text-sm text-blue-800">
                {plans.filter(p => p.quantity > 0).map(p => {
                  const config = contentTypeConfig[p.content_type];
                  return (
                    <div key={p.content_type} className="flex items-center justify-between">
                      <span>{config.icon} {config.label}:</span>
                      <span className="font-semibold">{p.quantity} em {p.days.length} dias</span>
                    </div>
                  );
                })}
                <div className="border-t border-blue-300 pt-2 mt-2 flex items-center justify-between font-bold">
                  <span>Total:</span>
                  <span>{getTotalPlanned()} conteúdos</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer FIXO */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={getTotalPlanned() === 0 || plans.some(p => p.quantity > 0 && p.days.length === 0)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {existingContents.length > 0 ? 'Editar e Salvar' : `Criar ${getTotalPlanned()} Conteúdos`}
          </button>
        </div>
      </div>
    </div>
  );
}

