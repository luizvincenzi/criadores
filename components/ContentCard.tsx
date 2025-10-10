'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { SocialContent } from './ContentPlanningView';
import { contentTypeConfig, ContentTypeIcon } from '@/components/icons/ContentTypeIcons';
import { PlatformIcon } from '@/components/icons/PlatformIcons';

interface ContentCardProps {
  content: SocialContent;
  onEdit: () => void;
  onToggleExecuted: (isExecuted: boolean) => void;
  isDragging?: boolean;
}

// Configuração movida para components/icons/ContentTypeIcons.tsx
// Ícones de plataforma movidos para components/icons/PlatformIcons.tsx

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        relative ${typeConfig.bg} rounded-lg p-2 shadow-sm
        hover:shadow-md transition-shadow duration-150
        ${isExecuted ? 'opacity-75' : ''}
        ${isDraggingActive ? 'opacity-40 scale-95' : ''}
        ${isDragging ? 'shadow-xl scale-105' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1.5 relative">
        <div
          {...listeners}
          className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing flex-1"
        >
          <ContentTypeIcon type={content.content_type} size={16} />
          <span className={`text-xs font-semibold ${typeConfig.text}`}>
            {typeConfig.label}
          </span>
        </div>

        {/* Status Indicator */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExecuted(!isExecuted);
          }}
          className={`
            w-4 h-4 rounded-full border-2 flex items-center justify-center
            transition-all duration-200 flex-shrink-0
            ${isExecuted
              ? 'bg-green-500 border-green-600'
              : 'bg-white border-gray-300 hover:border-gray-400'
            }
          `}
          title={isExecuted ? 'Marcar como pendente' : 'Marcar como executado'}
        >
          {isExecuted && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </button>
      </div>

      {/* Título - Área de drag */}
      <h4
        {...listeners}
        className="text-xs font-semibold text-gray-900 mb-1.5 line-clamp-2 cursor-grab active:cursor-grabbing"
      >
        {content.title}
      </h4>

      {/* Plataformas - Área de drag */}
      <div
        {...listeners}
        className="flex items-center gap-1 mb-1.5 flex-wrap cursor-grab active:cursor-grabbing"
      >
        {content.platforms.map(platform => (
          <span
            key={platform}
            className="text-xs bg-white px-1.5 py-0.5 rounded-full border border-gray-200 flex items-center gap-1"
            title={platform}
          >
            <PlatformIcon platform={platform} size={12} className="text-gray-600" />
          </span>
        ))}
      </div>

      {/* Footer - Responsável e Horário - Área de drag */}
      <div
        {...listeners}
        className="flex items-center justify-between text-xs text-gray-600 mb-2 cursor-grab active:cursor-grabbing"
      >
        {/* Horário */}
        {content.scheduled_time && (
          <div className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-xs">{content.scheduled_time.substring(0, 5)}</span>
          </div>
        )}

        {/* Responsável */}
        {content.assigned_user && (
          <div className="flex items-center gap-1 ml-auto" title={content.assigned_user.full_name}>
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-xs font-medium text-white">
              {content.assigned_user.full_name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Botão Ver Detalhes dentro do card */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onEdit();
        }}
        className="w-full py-1.5 px-2 bg-white/60 hover:bg-white border border-gray-300 text-gray-700 rounded text-xs font-medium transition-all flex items-center justify-center gap-1"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        Ver detalhes
      </button>
    </div>
  );
}

