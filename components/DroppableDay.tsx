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
    id: id
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] p-2 rounded-lg transition-colors ${
        isOver ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="space-y-2">
        {contents.map((content) => (
          <ContentCard
            key={content.id}
            content={content}
            onEdit={() => onEditContent(content)}
            onToggleExecuted={(isExecuted) => onToggleExecuted(content.id, isExecuted)}
          />
        ))}
        
        {contents.length === 0 && (
          <button
            onClick={onAddContent}
            className="w-full py-3 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-dashed border-gray-300"
          >
            + Adicionar conteúdo
          </button>
        )}
      </div>
    </div>
  );
}

