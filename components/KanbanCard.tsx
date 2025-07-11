'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Business } from '@/store/businessStore';
import { Card, CardContent, CardHeader } from './ui/Card';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  business: Business;
  isDragging?: boolean;
}

export default function KanbanCard({ business, isDragging = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: business.id,
    data: {
      type: 'business',
      business,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-surface-container text-on-surface-variant';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return '🔥';
      case 'medium':
        return '⚡';
      case 'low':
        return '📝';
      default:
        return '📝';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md hover:border-primary/30 group',
        (isSortableDragging || isDragging) && 'opacity-60 rotate-2 scale-105 shadow-lg z-50 border-primary',
        isDragging && 'shadow-xl'
      )}
    >
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Avatar
            size="sm"
            variant="circular"
            src={business.avatar}
            fallback={business.businessName}
            className="flex-shrink-0"
          />
          <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-primary transition-colors">
            {business.businessName}
          </h4>
        </div>

        {business.priority && (
          <span className={cn(
            'w-2 h-2 rounded-full flex-shrink-0',
            business.priority === 'high' ? 'bg-red-500' :
            business.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
          )} />
        )}
      </div>

      {/* Valor em destaque */}
      <div className="mb-2">
        <span className="text-lg font-bold text-gray-900">
          {formatCurrency(business.value)}
        </span>
      </div>

      {/* Informações compactas */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span className="flex items-center space-x-1">
          <span>👥</span>
          <span>{business.creators.length}</span>
        </span>
        <span>{business.lastUpdate}</span>
      </div>

      {/* Próxima ação compacta */}
      <div className="text-xs text-gray-600 line-clamp-2 mb-3">
        {business.nextAction}
      </div>

      {/* Ações compactas */}
      <div className="flex space-x-1">
        <button
          className="flex-1 px-2 py-1 text-xs text-gray-600 hover:text-primary hover:bg-gray-50 rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Edit business:', business.id);
          }}
        >
          Editar
        </button>
        <button
          className="flex-1 px-2 py-1 text-xs bg-primary text-white hover:bg-primary/90 rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            console.log('View business:', business.id);
          }}
        >
          Ver
        </button>
      </div>
    </div>
  );
}
