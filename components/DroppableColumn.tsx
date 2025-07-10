'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableBusinessCard from './DraggableBusinessCard';

interface Business {
  id: number;
  businessName: string;
  journeyStage: string;
  nextAction: string;
  contactDate: string;
  value: number;
  description: string;
  influencers: any[];
  campaigns: any[];
}

interface DroppableColumnProps {
  id: string;
  title: string;
  icon: string;
  businesses: Business[];
  totalValue: number;
  onBusinessClick: (business: Business) => void;
  isUpdating?: boolean;
}

export default function DroppableColumn({
  id,
  title,
  icon,
  businesses,
  totalValue,
  onBusinessClick,
  isUpdating = false
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const businessIds = businesses.map(b => b.id.toString());

  return (
    <div
      ref={setNodeRef}
      className={`
        card-elevated p-6 min-h-96 transition-all duration-200
        ${isOver ? 'bg-primary-container border-2 border-primary border-dashed' : ''}
        ${isUpdating ? 'opacity-75' : ''}
      `}
    >
      {/* Header da coluna */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{icon}</span>
            <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
          </div>
          <span className="text-sm bg-surface-container px-3 py-1 rounded-full font-medium">
            {businesses.length}
          </span>
        </div>
        
        <div className="text-sm text-on-surface-variant">
          Total: R$ {(totalValue / 1000).toFixed(0)}K
        </div>
        
        {/* Indicador de drop zone */}
        {isOver && (
          <div className="mt-3 text-sm text-primary font-medium animate-pulse">
            ↓ Solte aqui para mover
          </div>
        )}
      </div>

      {/* Lista de negócios com contexto sortable */}
      <SortableContext items={businessIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {businesses.map((business) => (
            <DraggableBusinessCard
              key={business.id}
              business={business}
              onClick={() => onBusinessClick(business)}
            />
          ))}
          
          {businesses.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              <div className="text-4xl mb-3">{icon}</div>
              <p className="text-sm">Nenhum negócio nesta fase</p>
              <p className="text-xs mt-1 opacity-70">
                {isOver ? 'Solte aqui para adicionar' : 'Arraste projetos para cá'}
              </p>
            </div>
          )}
        </div>
      </SortableContext>
      
      {/* Loading indicator */}
      {isUpdating && (
        <div className="absolute inset-0 bg-surface bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2 text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            <span className="text-sm font-medium">Atualizando...</span>
          </div>
        </div>
      )}
    </div>
  );
}
