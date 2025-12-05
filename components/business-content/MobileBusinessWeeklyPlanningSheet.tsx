'use client';

import React, { useState } from 'react';
import { format, addDays, getWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomSheet from '../BottomSheet';

interface MobileBusinessWeeklyPlanningSheetProps {
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

export default function MobileBusinessWeeklyPlanningSheet({
  isOpen,
  onClose,
  weekStart,
  onSave,
  existingContents = []
}: MobileBusinessWeeklyPlanningSheetProps) {
  const [plans, setPlans] = useState<WeeklyPlan[]>([
    { content_type: 'reels', quantity: 1, days: [] },
    { content_type: 'story', quantity: 0, days: [] },
    { content_type: 'post', quantity: 2, days: [] }
  ]);

  const weekNumber = getWeek(weekStart);
  const monthName = format(weekStart, 'MMM', { locale: ptBR }).toUpperCase();

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

  // Calcula total de dias definidos e porcentagem
  const totalDaysDefined = plans.reduce((acc, plan) => acc + plan.days.length, 0);
  const totalDaysRequired = plans.reduce((acc, plan) => acc + plan.quantity, 0);
  const progressPercentage = totalDaysRequired > 0 ? Math.round((totalDaysDefined / totalDaysRequired) * 100) : 0;

  const typeConfig = {
    reels: {
      label: 'Reels',
      subtitle: 'VÍDEO CURTO',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      ),
      selectedBg: 'bg-green-500',
      selectedText: 'text-white'
    },
    story: {
      label: 'Stories',
      subtitle: '24H',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      selectedBg: 'bg-orange-500',
      selectedText: 'text-white'
    },
    post: {
      label: 'Posts',
      subtitle: 'FEED',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ),
      selectedBg: 'bg-blue-600',
      selectedText: 'text-white'
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[90, 95]}
      defaultSnap={1}
    >
      {/* iOS 26 Glass Background */}
      <div className="flex flex-col h-full bg-gradient-to-b from-blue-50/80 via-white/90 to-white backdrop-blur-xl">
        {/* Header - iOS Style */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs font-semibold text-gray-400 tracking-wider">SEMANA {weekNumber}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-2xl font-bold text-gray-900">Planejamento</h2>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                {monthName}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Status Card - Glass Effect */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-wider">STATUS DA SEMANA</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalDaysDefined} <span className="text-base font-normal text-gray-500">/ {totalDaysRequired} dias definidos</span>
                </p>
              </div>
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle cx="28" cy="28" r="24" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                  <circle
                    cx="28" cy="28" r="24"
                    stroke="#3B82F6"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${progressPercentage * 1.5} 150`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">{progressPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Type Cards */}
          {plans.map((plan) => {
            const config = typeConfig[plan.content_type];
            const selectedCount = plan.days.length;
            const isComplete = selectedCount === plan.quantity && plan.quantity > 0;

            return (
              <div key={plan.content_type} className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm overflow-hidden">
                {/* Type Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {config.icon}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{config.label}</h3>
                      <p className="text-xs text-gray-500 font-medium">{config.subtitle}</p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(plan.content_type, -1)}
                      className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-xl text-gray-600 font-bold active:scale-95 transition-all"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-lg font-bold text-gray-900">
                      {plan.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(plan.content_type, 1)}
                      className="w-9 h-9 flex items-center justify-center bg-blue-500 rounded-xl text-white font-bold active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Days Selection */}
                {plan.quantity > 0 && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-400 tracking-wider">
                        SELECIONE {plan.quantity} {plan.quantity === 1 ? 'DIA' : 'DIAS'}
                      </p>
                      {isComplete && (
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          Completo
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {weekDays.map((day) => {
                        const isSelected = plan.days.includes(day.dayOfWeek);
                        const canSelect = !isSelected && selectedCount < plan.quantity;

                        return (
                          <button
                            key={day.dayOfWeek}
                            onClick={() => toggleDay(plan.content_type, day.dayOfWeek)}
                            disabled={!isSelected && !canSelect}
                            className={`
                              aspect-square rounded-xl flex flex-col items-center justify-center transition-all active:scale-95
                              ${isSelected
                                ? `${config.selectedBg} shadow-lg`
                                : canSelect
                                ? 'bg-gray-100 hover:bg-gray-200'
                                : 'bg-gray-50 opacity-40'
                              }
                            `}
                          >
                            <span className={`text-[10px] font-semibold ${isSelected ? config.selectedText : 'text-gray-500'}`}>
                              {day.label}
                            </span>
                            <span className={`text-lg font-bold ${isSelected ? config.selectedText : 'text-gray-700'}`}>
                              {day.number}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {plan.quantity === 0 && (
                  <div className="px-4 pb-4">
                    <div className="py-3 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">
                      Nenhum {plan.content_type === 'story' ? 'story planejado' : `${config.label.toLowerCase().slice(0, -1)} planejado`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer - iOS Style */}
        <div className="px-4 pb-6 pt-2 flex-shrink-0 bg-gradient-to-t from-white via-white to-transparent">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-blue-500 text-white rounded-2xl font-semibold text-base active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Salvar Planejamento
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

