'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader } from './ui/Card';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  count: number;
  totalValue: number;
  children: React.ReactNode;
}

export default function KanbanColumn({
  id,
  title,
  icon,
  color,
  description,
  count,
  totalValue,
  children,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

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
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 min-h-[70vh] transition-all duration-200 shadow-sm',
        isOver && 'bg-blue-50 ring-2 ring-blue-400 border-blue-300'
      )}
    >
      {/* Header estilo CRM profissional */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{icon}</span>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium border">
              {count}
            </span>
          </div>
        </div>

        {/* Valor total compacto */}
        <div className="text-xs text-gray-500">
          Total: <span className="font-semibold text-gray-700">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {/* Cards container */}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
