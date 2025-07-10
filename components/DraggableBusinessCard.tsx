'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Business {
  id: number;
  businessName: string;
  journeyStage: string;
  nextAction: string;
  contactDate: string;
  value: number;
  description: string;
  creators: any[];
  campaigns: any[];
}

interface DraggableBusinessCardProps {
  business: Business;
  onClick: () => void;
  isDragging?: boolean;
}

export default function DraggableBusinessCard({ 
  business, 
  onClick, 
  isDragging = false 
}: DraggableBusinessCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: business.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-surface-container rounded-lg p-4 transition-all duration-200 cursor-grab active:cursor-grabbing
        border-l-4 border-primary hover:shadow-md
        ${isSortableDragging ? 'shadow-lg scale-105 rotate-2' : ''}
        ${isDragging ? 'opacity-50' : ''}
      `}
      onClick={(e) => {
        // Só chama onClick se não estiver arrastando
        if (!isSortableDragging) {
          onClick();
        }
      }}
    >
      {/* Header com nome do negócio */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-on-surface flex-1 mr-2">
          {business.businessName}
        </h4>
        
        {/* Indicador de drag */}
        <div className="text-on-surface-variant opacity-50">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="3" cy="3" r="1"/>
            <circle cx="8" cy="3" r="1"/>
            <circle cx="13" cy="3" r="1"/>
            <circle cx="3" cy="8" r="1"/>
            <circle cx="8" cy="8" r="1"/>
            <circle cx="13" cy="8" r="1"/>
            <circle cx="3" cy="13" r="1"/>
            <circle cx="8" cy="13" r="1"/>
            <circle cx="13" cy="13" r="1"/>
          </svg>
        </div>
      </div>
      
      {/* Próxima ação */}
      <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">
        {business.nextAction}
      </p>
      
      {/* Influenciadores */}
      <div className="flex items-center mb-3">
        <span className="text-xs text-on-surface-variant mr-2">👥</span>
        <span className="text-sm font-medium text-secondary">
          {business.creators.length} influenciador{business.creators.length !== 1 ? 'es' : ''}
        </span>
      </div>
      
      {/* Footer com data e valor */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-on-surface-variant">
          {new Date(business.contactDate).toLocaleDateString('pt-BR')}
        </span>
        <span className="font-bold text-primary">
          R$ {(business.value / 1000).toFixed(0)}K
        </span>
      </div>
      
      {/* Indicador de clique para detalhes */}
      <div className="mt-2 text-xs text-on-surface-variant opacity-70">
        Arraste para mover • Clique para detalhes
      </div>
    </div>
  );
}

// Componente para o overlay durante o drag
export function BusinessCardOverlay({ business }: { business: Business }) {
  return (
    <div className="bg-surface-container rounded-lg p-4 shadow-2xl border-l-4 border-primary rotate-3 scale-105">
      <h4 className="font-semibold text-on-surface mb-2">
        {business.businessName}
      </h4>
      <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">
        {business.nextAction}
      </p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-on-surface-variant">
          👥 {business.creators.length} influenciador{business.creators.length !== 1 ? 'es' : ''}
        </span>
        <span className="font-bold text-primary">
          R$ {(business.value / 1000).toFixed(0)}K
        </span>
      </div>
    </div>
  );
}
