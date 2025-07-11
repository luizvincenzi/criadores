'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
} from '@dnd-kit/core';

interface Item {
  id: string;
  content: string;
  status: string;
}

function DraggableItem({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-white border rounded-lg cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {item.content}
    </div>
  );
}

function DroppableArea({ id, children, title }: { id: string; children: React.ReactNode; title: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 bg-gray-50 rounded-lg min-h-[200px] ${
        isOver ? 'bg-blue-100 ring-2 ring-blue-300' : ''
      }`}
    >
      <h3 className="font-bold mb-3">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function SimpleDragTest() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', content: 'Item 1', status: 'todo' },
    { id: '2', content: 'Item 2', status: 'todo' },
    { id: '3', content: 'Item 3', status: 'doing' },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    console.log('🎯 Drag Start:', event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('🎯 Drag End:', { active: active.id, over: over?.id });
    
    setActiveId(null);

    if (!over) return;

    const itemId = active.id as string;
    const newStatus = over.id as string;

    setItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, status: newStatus }
          : item
      )
    );

    console.log('✅ Item movido:', { itemId, newStatus });
  };

  const getItemsByStatus = (status: string) => 
    items.filter(item => item.status === status);

  const activeItem = activeId ? items.find(item => item.id === activeId) : null;

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">🧪 Teste Simples de Drag & Drop</h2>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-4">
          <DroppableArea id="todo" title="To Do">
            {getItemsByStatus('todo').map(item => (
              <DraggableItem key={item.id} item={item} />
            ))}
          </DroppableArea>

          <DroppableArea id="doing" title="Doing">
            {getItemsByStatus('doing').map(item => (
              <DraggableItem key={item.id} item={item} />
            ))}
          </DroppableArea>

          <DroppableArea id="done" title="Done">
            {getItemsByStatus('done').map(item => (
              <DraggableItem key={item.id} item={item} />
            ))}
          </DroppableArea>
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="p-3 bg-white border rounded-lg shadow-lg">
              {activeItem.content}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
