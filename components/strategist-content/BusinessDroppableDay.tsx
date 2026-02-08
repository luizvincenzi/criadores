'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import BusinessContentCard from './BusinessContentCard';
import { BusinessSocialContent } from '../BusinessContentModal';
import { Plus } from 'lucide-react';

type SocialContent = BusinessSocialContent;

interface DroppableDayProps {
  id: string;
  date: Date;
  contents: SocialContent[];
  onAddContent: () => void;
  onEditContent: (content: SocialContent) => void;
  onToggleExecuted: (contentId: string, isExecuted: boolean) => void;
  isToday?: boolean;
}

export default function DroppableDay({
  id,
  date,
  contents,
  onAddContent,
  onEditContent,
  onToggleExecuted,
  isToday = false
}: DroppableDayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        h-full min-h-[300px] rounded-[30px] p-2 flex flex-col transition-all relative
        ${isToday
          ? 'bg-white border border-slate-200 shadow-md'
          : 'bg-white border border-white/50 shadow-sm hover:shadow-md'}
        ${isOver ? 'ring-2 ring-slate-400 ring-opacity-50 bg-slate-50/30' : ''}
      `}
    >
      {/* Ghost Add Button - Always visible on today or hover on others */}
      <button
        onClick={onAddContent}
        className={`
          absolute inset-x-4 top-2 h-10 border border-dashed rounded-xl flex items-center justify-center transition-all z-10
          ${isToday
            ? 'border-slate-300 text-slate-400 hover:bg-slate-50'
            : 'border-slate-200 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-50'}
        `}
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Content Cards */}
      <div className="mt-14 flex flex-col gap-3 pr-1">
        {contents.map(content => (
          <BusinessContentCard
            key={content.id}
            content={content}
            onEdit={() => onEditContent(content)}
            onToggleExecuted={(isExecuted) => onToggleExecuted(content.id, isExecuted)}
          />
        ))}

        {/* Empty State for Today */}
        {isToday && contents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
            <span className="text-sm text-slate-400 font-medium">Nada por enquanto</span>
          </div>
        )}
      </div>
    </div>
  );
}

