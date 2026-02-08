'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { BusinessSocialContent } from '../BusinessContentModal';
import { contentTypeConfig, ContentTypeIcon } from '@/components/icons/ContentTypeIcons';
import { PlatformIcon } from '@/components/icons/PlatformIcons';
import { Video, Image as ImageIcon, Clock, Circle, CheckCircle2 } from 'lucide-react';

type SocialContent = BusinessSocialContent;

interface ContentCardProps {
  content: SocialContent;
  onEdit: () => void;
  onToggleExecuted: (isExecuted: boolean) => void;
  isDragging?: boolean;
}

export default function ContentCard({
  content,
  onEdit,
  onToggleExecuted,
  isDragging = false
}: ContentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingActive,
  } = useDraggable({
    id: content.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const typeConfig = contentTypeConfig[content.content_type];
  const isExecuted = content.is_executed;

  // Apple-style type colors
  const typeColors = {
    reels: { bg: 'bg-green-500/10', text: 'text-green-700', icon: Video },
    story: { bg: 'bg-amber-500/10', text: 'text-amber-700', icon: ImageIcon },
    post: { bg: 'bg-slate-500/10', text: 'text-slate-700', icon: ImageIcon },
  };

  const currentType = typeColors[content.content_type] || typeColors.post;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group/card cursor-grab active:cursor-grabbing"
    >
      <div
        className={`
          p-3 md:p-4 rounded-[24px] border transition-all duration-300
          ${isExecuted
            ? 'bg-slate-50 border-slate-100 opacity-60'
            : 'bg-white border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1'}
          ${isDraggingActive ? 'opacity-40 scale-95' : ''}
          ${isDragging ? 'shadow-xl scale-105 opacity-90' : ''}
        `}
      >
        {/* Header: Tag + Check Button */}
        <div className="flex justify-between items-start mb-3">
          <div
            className={`px-2 md:px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${currentType.bg} ${currentType.text}`}
          >
            {content.content_type === 'reels' ? (
              <Video className="w-3 h-3" />
            ) : (
              <ImageIcon className="w-3 h-3" />
            )}
            {typeConfig.label}
          </div>

          {/* Check Button - Apple Style */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExecuted(!isExecuted);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-slate-300 hover:text-green-500 transition-colors focus:outline-none"
            title={isExecuted ? 'Marcar como pendente' : 'Marcar como executado'}
          >
            {isExecuted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-100" />
            ) : (
              <Circle className="w-5 h-5 hover:stroke-2" />
            )}
          </button>
        </div>

        {/* Title */}
        <h4
          className={`text-sm md:text-[15px] font-medium text-[#1d1d1f] mb-2 leading-snug transition-all line-clamp-2 ${
            isExecuted ? 'line-through text-slate-400' : ''
          }`}
        >
          {content.title}
        </h4>

        {/* Footer: Time + Platforms */}
        <div
          className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-2 border-t border-slate-100"
        >
          {content.scheduled_time && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {content.scheduled_time.substring(0, 5)}
            </div>
          )}

          {/* Platform Icons */}
          <div className="flex items-center gap-1 ml-auto">
            {content.platforms.slice(0, 2).map(platform => (
              <span key={platform} className="text-slate-400">
                <PlatformIcon platform={platform} size={12} />
              </span>
            ))}
            {content.platforms.length > 2 && (
              <span className="text-[10px] text-slate-400">+{content.platforms.length - 2}</span>
            )}
          </div>
        </div>

        {/* Ver Detalhes - Appears on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEdit();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-full mt-3 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover/card:opacity-100"
        >
          Detalhes
        </button>
      </div>
    </div>
  );
}

