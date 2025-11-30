'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import ContentCard from './ContentCard';
import { SocialContent } from './ContentPlanningView';
import { Plus } from 'lucide-react';
import { isToday } from 'date-fns';

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

  const isTodayDate = isToday(date);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 rounded-[30px] p-2 flex flex-col transition-all relative min-h-[calc(100vh-240px)]
        ${isTodayDate
          ? 'bg-white border-2 border-blue-500/20 shadow-xl shadow-blue-500/5'
          : 'bg-white border border-white/50 shadow-sm hover:shadow-md'}
        ${isOver ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50/30' : ''}
      `}
    >
      {/* Ghost Add Button - Always visible on today or hover on others */}
      <button
        onClick={onAddContent}
        className={`
          absolute inset-x-4 top-2 h-10 border border-dashed rounded-xl flex items-center justify-center transition-all z-10
          ${isTodayDate
            ? 'border-blue-200 text-blue-400 hover:bg-blue-50'
            : 'border-gray-200 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-50'}
        `}
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Content Cards */}
      <div className="mt-14 flex flex-col gap-3 overflow-y-auto pr-1 h-full custom-scrollbar">
        {contents.map(content => (
          <ContentCard
            key={content.id}
            content={content}
            onEdit={() => onEditContent(content)}
            onToggleExecuted={(isExecuted) => onToggleExecuted(content.id, isExecuted)}
          />
        ))}

        {/* Empty State for Today */}
        {isTodayDate && contents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
            <span className="text-sm text-gray-400 font-medium">Nada por enquanto</span>
          </div>
        )}
      </div>
    </div>
  );
}

