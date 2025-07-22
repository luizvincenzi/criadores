import React from 'react';

interface PriorityBadgeProps {
  priority: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function PriorityBadge({ priority, size = 'md', showIcon = true }: PriorityBadgeProps) {
  const getPriorityConfig = (priorityName: string) => {
    const normalizedPriority = priorityName?.toLowerCase() || '';
    
    switch (normalizedPriority) {
      case 'baixa':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '🟢',
          label: 'Baixa',
          dotColor: 'bg-green-500'
        };
      case 'média':
      case 'media':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '🟡',
          label: 'Média',
          dotColor: 'bg-yellow-500'
        };
      case 'alta':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '🔴',
          label: 'Alta',
          dotColor: 'bg-red-500'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: '⚪',
          label: priorityName || 'Não definida',
          dotColor: 'bg-gray-500'
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

  const config = getPriorityConfig(priority);
  const sizeClasses = getSizeClasses(size);

  return (
    <span className={`
      inline-flex items-center rounded-full border font-medium
      ${config.color} ${sizeClasses}
    `}>
      {showIcon && (
        <span className={`w-2 h-2 rounded-full mr-2 ${config.dotColor}`}></span>
      )}
      {config.label}
    </span>
  );
}
