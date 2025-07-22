import React from 'react';

interface PlanBadgeProps {
  plan: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function PlanBadge({ plan, size = 'md', showIcon = true }: PlanBadgeProps) {
  const getPlanConfig = (planName: string) => {
    if (!planName) {
      return {
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: '📋',
        label: 'Não definido'
      };
    }

    const normalizedPlan = planName.toLowerCase();

    // Detectar tipo de plano baseado no nome (simplificado)
    if (normalizedPlan.includes('silver') || normalizedPlan === 'silver') {
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '🥈',
        label: 'Silver'
      };
    } else if (normalizedPlan.includes('gold') || normalizedPlan === 'gold') {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '🥇',
        label: 'Gold'
      };
    } else if (normalizedPlan.includes('diamond') || normalizedPlan === 'diamond') {
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '💎',
        label: 'Diamond'
      };
    } else if (normalizedPlan.includes('personalizado') || normalizedPlan === 'personalizado') {
      return {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '⭐',
        label: 'Personalizado'
      };
    } else {
      return {
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: '📋',
        label: planName || 'Não definido'
      };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const config = getPlanConfig(plan);
  const sizeClasses = getSizeClasses(size);

  return (
    <span className={`
      inline-flex items-center rounded-full border font-medium
      ${config.color} ${sizeClasses}
    `}>
      {showIcon && (
        <span className="mr-1">{config.icon}</span>
      )}
      {config.label}
    </span>
  );
}
