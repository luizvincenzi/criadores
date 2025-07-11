'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Business } from '@/store/businessStore';

interface SimpleBusinessCardProps {
  business: Business;
  onClick: () => void;
}

export default function SimpleBusinessCard({ business, onClick }: SimpleBusinessCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: business.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-xl border-2 border-gray-200 p-6 cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1
        ${isDragging ? 'opacity-60 rotate-2 scale-105 shadow-xl z-50 border-blue-400' : ''}
        min-h-[140px] shadow-sm
      `}
    >
      {/* Nome do Business */}
      <div className="mb-4">
        <h4 className="font-bold text-gray-900 text-base leading-tight">
          {business.businessName}
        </h4>
      </div>

      {/* Categoria */}
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          {business.journeyStage || business.categoria || 'Sem categoria'}
        </span>
      </div>

      {/* Plano */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1 font-medium">Plano:</div>
        <div className="text-sm font-semibold text-gray-800">
          {business.currentPlan || business.plano || 'Não definido'}
        </div>
      </div>

      {/* Botão Ver Detalhes */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="w-full mt-auto px-4 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-semibold hover:shadow-sm"
      >
        Ver Detalhes
      </button>
    </div>
  );
}
