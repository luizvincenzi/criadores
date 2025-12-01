'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Calendar, Video, Image as ImageIcon, Disc, Check, BarChart2, Info, Plus, Minus } from 'lucide-react';

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
    reels: {
      label: 'Reels',
      subtitle: 'Vídeo Curto',
      icon: Video,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      selectedClass: 'bg-green-500 text-white border-green-600',
      stepperBg: 'bg-green-500 hover:bg-green-600',
      feedbackBg: 'bg-green-50/80 border-green-100/50 text-green-700',
      emptyBg: 'bg-green-50/50 border-green-200 text-green-700/70'
    },
    story: {
      label: 'Stories',
      subtitle: 'Conteúdo Efêmero',
      icon: Disc,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      selectedClass: 'bg-amber-500 text-white border-amber-600',
      stepperBg: 'bg-amber-500 hover:bg-amber-600',
      feedbackBg: 'bg-amber-50/80 border-amber-100/50 text-amber-700',
      emptyBg: 'bg-amber-50/50 border-amber-200 text-amber-700/70'
    },
    post: {
      label: 'Posts',
      subtitle: 'Feed / Carrossel',
      icon: ImageIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      selectedClass: 'bg-blue-500 text-white border-blue-600',
      stepperBg: 'bg-blue-500 hover:bg-blue-600',
      feedbackBg: 'bg-blue-50/80 border-blue-100/50 text-blue-700',
      emptyBg: 'bg-blue-50/50 border-blue-200 text-blue-700/70'
    }
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

  // Componente de Seleção de Dia (Estilo iOS Calendar)
  const DaySelector = ({
    day,
    date,
    isSelected,
    colorClass,
    onClick,
    disabled
  }: {
    day: string;
    date: string;
    isSelected: boolean;
    colorClass: string;
    onClick: () => void;
    disabled: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled && !isSelected}
      className={`
        flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border transition-all duration-300 w-full aspect-square
        ${isSelected
          ? `${colorClass} shadow-lg scale-105 ring-1 ring-offset-2 ring-offset-white/50`
          : 'bg-white/40 border-slate-200/60 text-slate-400 hover:bg-white/80 hover:border-slate-300'}
        ${disabled && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider mb-1">{day}</span>
      <span className={`text-lg sm:text-xl font-semibold ${isSelected ? 'font-bold' : ''}`}>{date}</span>
    </button>
  );

  // Componente de Stepper (Quantidade)
  const QuantityStepper = ({
    value,
    onChange,
    colorBase
  }: {
    value: number;
    onChange: (v: number) => void;
    colorBase: string;
  }) => (
    <div className="flex items-center gap-2 sm:gap-3 bg-white/60 p-1.5 rounded-xl border border-slate-200/50 shadow-sm">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-6 text-center font-semibold text-slate-700">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className={`w-8 h-8 flex items-center justify-center rounded-lg text-white shadow-sm transition-transform active:scale-95 ${colorBase}`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 font-sans text-[#1D1D1F]">
      {/* Backdrop com blur */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Container Principal - Glassmorphism */}
      <div className="
        relative w-full max-w-6xl h-[90vh] lg:h-[85vh] flex flex-col lg:flex-row
        bg-white/80 backdrop-blur-3xl
        border border-white/40 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]
        rounded-[32px] overflow-hidden z-10
      ">

        {/* LADO ESQUERDO: Canvas de Planejamento */}
        <div className="flex-1 flex flex-col min-w-0 bg-white/30 relative">

          {/* Header */}
          <header className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 border-b border-black/5 flex-shrink-0 backdrop-blur-md z-10 sticky top-0">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-500" />
                Planejamento Semanal
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                {format(weekStart, 'd MMM', { locale: ptBR })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: ptBR })}
              </p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8">

            {/* Cards de Tipos de Conteúdo */}
            {plans.map((plan) => {
              const config = contentTypeConfig[plan.content_type];
              const IconComponent = config.icon;

              return (
                <div
                  key={plan.content_type}
                  className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-4 sm:p-6 shadow-sm transition-all hover:shadow-md group"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${config.iconBg} flex items-center justify-center ${config.iconColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{config.label}</h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{config.subtitle}</p>
                      </div>
                    </div>
                    <QuantityStepper
                      value={plan.quantity}
                      onChange={(v) => handleQuantityChange(plan.content_type, v)}
                      colorBase={config.stepperBg}
                    />
                  </div>

                  {/* Grid de Dias */}
                  {plan.quantity > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                        Selecione {plan.quantity} {plan.quantity === 1 ? 'dia' : 'dias'}:
                      </p>
                      <div className="grid grid-cols-7 gap-2 sm:gap-3">
                        {weekDays.map((day) => (
                          <DaySelector
                            key={`${plan.content_type}-${day.index}`}
                            day={day.label}
                            date={format(day.date, 'd')}
                            isSelected={plan.days.includes(day.index)}
                            colorClass={config.selectedClass}
                            onClick={() => handleDayToggle(plan.content_type, day.index)}
                            disabled={plan.days.length >= plan.quantity}
                          />
                        ))}
                      </div>
                      {/* Mensagem de Feedback */}
                      {plan.days.length === plan.quantity && plan.quantity > 0 && (
                        <div className={`flex items-center gap-2 text-xs font-medium p-2 rounded-lg border ${config.feedbackBg}`}>
                          <Check className="w-3 h-3" />
                          Limite atingido: {plan.quantity} dia(s) selecionado(s)
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`p-4 rounded-xl border border-dashed text-center ${config.emptyBg}`}>
                      <span className="text-sm font-medium">Nenhum {config.label.toLowerCase()} planejado para esta semana</span>
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        {/* LADO DIREITO: Sidebar de Resumo */}
        <div className="
          w-full lg:w-[320px] flex-shrink-0 bg-slate-50/80 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-white/50
          flex flex-col shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.02)]
        ">

          <header className="h-16 sm:h-20 flex items-center justify-between px-6 border-b border-black/5 flex-shrink-0">
            <div className="flex items-center gap-2 text-slate-800">
              <BarChart2 className="w-5 h-5 text-slate-500" />
              <span className="font-semibold text-sm">Resumo</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </header>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">

            {/* Cartões de Resumo */}
            <div className="space-y-4">
              {plans.map(plan => {
                const config = contentTypeConfig[plan.content_type];
                const dotColor = plan.content_type === 'reels' ? 'bg-green-500'
                  : plan.content_type === 'story' ? 'bg-amber-500' : 'bg-blue-500';

                return (
                  <div key={`summary-${plan.content_type}`} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                      <span className="text-sm font-medium text-slate-600">{config.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-slate-900">{plan.quantity}</span>
                      <span className="text-xs text-slate-400 font-medium">un</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divisor de Total */}
            <div className="my-4 border-t border-dashed border-slate-200"></div>

            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Semanal</span>
              <span className="text-2xl font-bold text-slate-900">
                {getTotalPlanned()}
              </span>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700/80 leading-relaxed">
                {getTotalPlanned() >= 3
                  ? 'Você está dentro da meta recomendada de 3 conteúdos semanais para crescimento orgânico.'
                  : 'Recomendamos pelo menos 3 conteúdos semanais para crescimento orgânico.'}
              </p>
            </div>

          </div>

          {/* Ações de Rodapé */}
          <div className="p-6 bg-white/40 border-t border-white/50 backdrop-blur-xl space-y-3">
            <button
              onClick={handleSave}
              disabled={getTotalPlanned() === 0 || plans.some(p => p.quantity > 0 && p.days.length === 0)}
              className="w-full py-3.5 rounded-2xl bg-[#007AFF] hover:bg-[#006ee6] text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {existingContents.length > 0 ? 'Salvar Alterações' : 'Salvar Planejamento'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

