'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import ContentCard from './ContentCard';
import { SocialContent } from './ContentPlanningView';

interface DroppableDayProps {
  id: string;
  date: Date;
  contents: SocialContent[];
  onAddContent: () => void;
  onEditContent: (content: SocialContent) => void;
  onToggleExecuted: (contentId: string, isExecuted: boolean) => void;
}

export default function DroppableDay({
  id,
  date,
  contents,
  onAddContent,
  onEditContent,
  onToggleExecuted
}: DroppableDayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-white rounded-b-lg min-h-[calc(100vh-200px)]
        ${isOver ? 'bg-blue-50' : ''}
        transition-colors duration-200
      `}
    >
      <div className="p-2 space-y-2">
        {contents.map(content => (
          <ContentCard
            key={content.id}
            content={content}
            onEdit={() => onEditContent(content)}
            onToggleExecuted={(isExecuted) => onToggleExecuted(content.id, isExecuted)}
          />
        ))}

        {/* Botão Adicionar - Compacto */}
        <button
          onClick={onAddContent}
          className="
            w-full py-2 px-3 border-2 border-dashed border-gray-300
            rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400
            hover:bg-gray-50 transition-all duration-200
            flex items-center justify-center gap-1.5 text-xs font-medium
          "
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Adicionar
        </button>
      </div>
    </div>
  );
}

