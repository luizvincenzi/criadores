'use client';

import React from 'react';
import { format, addDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors, DragStartEvent } from '@dnd-kit/core';
import ContentCard from './ContentCard';
import DroppableDay from './DroppableDay';
import { SocialContent } from './ContentPlanningView';

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
        distance: 3, // Reduzido de 8 para 3 - mais responsivo
        delay: 0,
        tolerance: 5,
      },
    })
  );

  // Auto-scroll para o dia de hoje quando o componente montar ou a semana mudar
  React.useEffect(() => {
    if (todayColumnRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const todayColumn = todayColumnRef.current;

      // Calcular a posição para centralizar a coluna de hoje
      const containerWidth = container.offsetWidth;
      const columnLeft = todayColumn.offsetLeft;
      const columnWidth = todayColumn.offsetWidth;

      // Centralizar a coluna de hoje
      const scrollPosition = columnLeft - (containerWidth / 2) + (columnWidth / 2);

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [weekStart]); // Re-executar quando a semana mudar

  // Gerar array de 7 dias (Segunda a Domingo)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Agrupar conteúdos por dia
  const getContentsForDay = (date: Date) => {
    const targetDateStr = format(date, 'yyyy-MM-dd');

    const dayContents = contents.filter(content => {
      // Validar se scheduled_date existe e é uma string
      if (!content.scheduled_date || typeof content.scheduled_date !== 'string') {
        console.warn('⚠️ Conteúdo sem data agendada válida:', content);
        return false;
      }

      // Usar apenas a parte da data (yyyy-MM-dd) para comparação
      const contentDateStr = content.scheduled_date.includes('T')
        ? content.scheduled_date.split('T')[0]
        : content.scheduled_date;
      const isSame = contentDateStr === targetDateStr;

      // Debug: log para verificar comparação de datas
      if (date.getDay() === 0) { // Apenas para domingos
        console.log('🔍 Verificando domingo:', {
          targetDate: targetDateStr,
          contentDate: contentDateStr,
          isSame,
          content: content.title,
          contentId: content.id
        });
      }

      return isSame;
    }).sort((a, b) => {
      // Ordenar por horário se disponível
      if (a.scheduled_time && b.scheduled_time) {
        return a.scheduled_time.localeCompare(b.scheduled_time);
      }
      return 0;
    });

    return dayContents;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      // Encontrar o conteúdo que foi arrastado
      const draggedContent = contents.find(c => c.id === active.id);

      if (draggedContent) {
        // O over.id é o ID do dia (formato: yyyy-MM-dd)
        const targetDayIndex = weekDays.findIndex(day =>
          format(day, 'yyyy-MM-dd') === over.id
        );

        if (targetDayIndex !== -1) {
          const targetDate = weekDays[targetDayIndex];
          // Só mover se for para um dia diferente
          if (!isSameDay(new Date(draggedContent.scheduled_date), targetDate)) {
            onMoveContent(draggedContent.id, targetDate);
          }
        }
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

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
      <div ref={scrollContainerRef} className="h-full overflow-x-auto overflow-y-hidden px-4 md:px-8 pb-8 pt-4 md:pt-6 flex gap-3 md:gap-4 snap-x snap-mandatory bg-[#f5f5f5]">
        {weekDays.map((day, index) => {
          const dayContents = getContentsForDay(day);
          const dayId = format(day, 'yyyy-MM-dd');
          const isCurrentDay = isToday(day);
          const dayShort = format(day, 'EEE', { locale: ptBR }).toUpperCase().substring(0, 3);

          return (
            <div
              key={dayId}
              ref={isCurrentDay ? todayColumnRef : null}
              className="snap-center flex-shrink-0 w-[85vw] md:w-[220px] flex flex-col h-full group"
            >
              {/* Floating Date Header - Apple Style */}
              <div className={`mb-3 flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
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

              {/* Coluna Droppable */}
              <div className="flex-1">
                <DroppableDay
                  id={dayId}
                  date={day}
                  contents={dayContents}
                  onAddContent={() => onAddContent(day)}
                  onEditContent={onEditContent}
                  onToggleExecuted={onToggleExecuted}
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
            <ContentCard
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

