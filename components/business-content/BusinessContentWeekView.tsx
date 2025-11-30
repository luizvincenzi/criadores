'use client';

import React from 'react';
import { format, addDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors, DragStartEvent } from '@dnd-kit/core';
import BusinessContentCard from './BusinessContentCard';
import BusinessDroppableDay from './BusinessDroppableDay';
import { BusinessSocialContent } from '../BusinessContentModal';

type SocialContent = BusinessSocialContent;

interface ContentWeekViewProps {
  weekStart: Date;
  contents: SocialContent[];
  loading: boolean;
  onAddContent: (date: Date) => void;
  onEditContent: (content: SocialContent) => void;
  onMoveContent: (contentId: string, newDate: Date) => void;
  onToggleExecuted: (contentId: string, isExecuted: boolean) => void;
}

export default function ContentWeekView({
  weekStart,
  contents,
  loading,
  onAddContent,
  onEditContent,
  onMoveContent,
  onToggleExecuted
}: ContentWeekViewProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const todayColumnRef = React.useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        delay: 0,
        tolerance: 5,
      },
    })
  );

  // Auto-scroll para o dia de hoje
  React.useEffect(() => {
    if (todayColumnRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const todayColumn = todayColumnRef.current;
      const containerWidth = container.offsetWidth;
      const columnLeft = todayColumn.offsetLeft;
      const columnWidth = todayColumn.offsetWidth;
      const scrollPosition = columnLeft - (containerWidth / 2) + (columnWidth / 2);
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  }, [weekStart]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getContentsForDay = (date: Date) => {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    return contents.filter(content => {
      if (!content.scheduled_date || typeof content.scheduled_date !== 'string') return false;
      const contentDateStr = content.scheduled_date.includes('T')
        ? content.scheduled_date.split('T')[0]
        : content.scheduled_date;
      return contentDateStr === targetDateStr;
    }).sort((a, b) => {
      if (a.scheduled_time && b.scheduled_time) {
        return a.scheduled_time.localeCompare(b.scheduled_time);
      }
      return 0;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over) {
      const draggedContent = contents.find(c => c.id === active.id);
      if (draggedContent) {
        const targetDayIndex = weekDays.findIndex(day =>
          format(day, 'yyyy-MM-dd') === over.id
        );
        if (targetDayIndex !== -1) {
          const targetDate = weekDays[targetDayIndex];
          if (!isSameDay(new Date(draggedContent.scheduled_date), targetDate)) {
            onMoveContent(draggedContent.id, targetDate);
          }
        }
      }
    }
    setActiveId(null);
  };

  const handleDragCancel = () => setActiveId(null);

  const activeContent = activeId ? contents.find(c => c.id === activeId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f5f5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* Apple Calendar Week View */}
      <div
        ref={scrollContainerRef}
        className="h-full overflow-auto px-4 md:px-8 pb-8 pt-4 md:pt-6 flex items-stretch gap-3 md:gap-4 snap-x snap-mandatory bg-[#f5f5f5]"
      >
        {weekDays.map((day) => {
          const dayContents = getContentsForDay(day);
          const dayId = format(day, 'yyyy-MM-dd');
          const isCurrentDay = isToday(day);
          const dayShort = format(day, 'EEE', { locale: ptBR }).toUpperCase().substring(0, 3);

          return (
            <div
              key={dayId}
              ref={isCurrentDay ? todayColumnRef : null}
              className="snap-center flex-shrink-0 w-[85vw] md:w-[220px] flex flex-col group"
            >
              {/* Floating Date Header - Apple Style */}
              <div className={`mb-3 flex-shrink-0 flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                isCurrentDay
                  ? 'bg-blue-600 shadow-md shadow-blue-500/20 translate-y-1'
                  : 'bg-transparent'
              }`}>
                <span className={`text-xs font-bold uppercase tracking-widest ${
                  isCurrentDay ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {dayShort}
                </span>
                <span className={`text-xl font-light tracking-tight ${
                  isCurrentDay ? 'text-white font-medium' : 'text-[#1d1d1f]'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Day Column - White Background with Apple Styling */}
              <div className="flex-1 flex flex-col">
                <BusinessDroppableDay
                  id={dayId}
                  date={day}
                  contents={dayContents}
                  onAddContent={() => onAddContent(day)}
                  onEditContent={onEditContent}
                  onToggleExecuted={onToggleExecuted}
                  isToday={isCurrentDay}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeContent ? (
          <div className="opacity-90 scale-105">
            <BusinessContentCard
              content={activeContent}
              onEdit={() => {}}
              onToggleExecuted={() => {}}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

