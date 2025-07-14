'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Business } from '@/store/businessStore';
import Avatar from './ui/Avatar';

interface SimpleKanbanCardProps {
  business: Business;
}

export default function SimpleKanbanCard({ business }: SimpleKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: business.id,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing 
        transition-all duration-200 hover:shadow-md hover:border-blue-300 
        ${isDragging ? 'opacity-60 rotate-2 scale-105 shadow-lg z-50 border-blue-400' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Avatar
            size="sm"
            variant="circular"
            fallback={business.businessName}
            className="flex-shrink-0"
          />
          <h4 className="font-medium text-gray-900 text-sm truncate">
            {business.businessName}
          </h4>
        </div>
        
        {business.priority && (
          <span className={`
            w-2 h-2 rounded-full flex-shrink-0
            ${business.priority === 'high' ? 'bg-red-500' : 
              business.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}
          `} />
        )}
      </div>

      {/* Valor */}
      <div className="mb-2">
        <span className="text-lg font-bold text-gray-900">
          {formatCurrency(business.value)}
        </span>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span className="flex items-center space-x-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>{business.creators.length}</span>
        </span>
        <span>{business.lastUpdate}</span>
      </div>

      {/* Próxima ação */}
      <div className="text-xs text-gray-600 line-clamp-2 mb-3">
        {business.nextAction}
      </div>

      {/* Ações */}
      <div className="flex space-x-1">
        <button 
          className="flex-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Edit business:', business.id);
          }}
        >
          Editar
        </button>
        <button 
          className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
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
