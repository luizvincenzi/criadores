'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useBusinessStore, Business } from '@/store/businessStore';
import KanbanColumn from './KanbanColumn';
import SimpleKanbanCard from './SimpleKanbanCard';

const KANBAN_STAGES = [
  {
    id: 'Reunião Briefing',
    title: 'Reunião Briefing',
    icon: '📋',
    color: 'bg-blue-100 text-blue-800',
    description: 'Definindo estratégias e objetivos'
  },
  {
    id: 'Agendamentos',
    title: 'Agendamentos',
    icon: '📅',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Coordenando cronogramas'
  },
  {
    id: 'Entrega Final',
    title: 'Entrega Final',
    icon: '✅',
    color: 'bg-green-100 text-green-800',
    description: 'Finalizando projetos'
  }
] as const;

interface KanbanBoardProps {
  className?: string;
}

export default function KanbanBoard({ className }: KanbanBoardProps) {
  const { businesses, moveBusinessStage, getBusinessesByStage } = useBusinessStore();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [draggedBusiness, setDraggedBusiness] = React.useState<Business | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const businessId = active.id as string;
    setActiveId(businessId);

    const business = businesses.find(b => b.id === businessId);
    if (business) {
      setDraggedBusiness(business);
      console.log(`🎯 DRAG START: ${business.businessName} (ID: ${businessId})`);
    } else {
      console.error(`❌ DRAG START: Negócio não encontrado para ID: ${businessId}`);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const businessId = active.id as string;

    console.log(`🎯 DRAG END:`, {
      businessId,
      overId: over?.id || 'null',
      overData: over?.data?.current,
      activeData: active?.data?.current
    });

    // Limpa estados de drag
    setActiveId(null);
    setDraggedBusiness(null);

    // Se não foi solto em lugar válido, cancela
    if (!over) {
      console.log('❌ DRAG CANCELADO: Não foi solto em área válida');
      return;
    }

    const newStage = over.id as string;
    console.log(`🎯 TENTANDO MOVER PARA: ${newStage}`);

    // Verifica se o estágio é válido para o Kanban
    const validStages = KANBAN_STAGES.map(stage => stage.id);
    console.log(`🔍 ESTÁGIOS VÁLIDOS:`, validStages);

    if (!validStages.includes(newStage)) {
      console.log(`❌ ESTÁGIO INVÁLIDO: ${newStage}`);
      return;
    }

    // Encontra o negócio atual
    const currentBusiness = businesses.find(b => b.id === businessId);
    if (!currentBusiness) {
      console.log(`❌ NEGÓCIO NÃO ENCONTRADO: ${businessId}`);
      console.log(`📋 NEGÓCIOS DISPONÍVEIS:`, businesses.map(b => ({ id: b.id, name: b.businessName })));
      return;
    }

    if (currentBusiness.journeyStage === newStage) {
      console.log(`ℹ️ NEGÓCIO JÁ ESTÁ NO ESTÁGIO: ${newStage}`);
      return;
    }

    // Move o negócio para o novo estágio
    try {
      console.log(`🚀 EXECUTANDO MOVIMENTO:`, {
        business: currentBusiness.businessName,
        from: currentBusiness.journeyStage,
        to: newStage
      });

      moveBusinessStage(businessId, newStage as Business['journeyStage']);
      console.log(`✅ SUCESSO! Negócio movido para "${newStage}"`);
    } catch (error) {
      console.error('❌ ERRO AO MOVER NEGÓCIO:', error);
    }
  };

  const getTotalValue = (stage: string) => {
    return getBusinessesByStage(stage as Business['journeyStage'])
      .reduce((total, business) => total + business.value, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={className}>
      {/* Kanban Board Clean */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={businesses.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {KANBAN_STAGES.map((stage) => {
              const stageBusinesses = getBusinessesByStage(stage.id as Business['journeyStage']);

              return (
                <KanbanColumn
                  key={stage.id}
                  id={stage.id}
                  title={stage.title}
                  icon={stage.icon}
                  color={stage.color}
                  description={stage.description}
                  count={stageBusinesses.length}
                  totalValue={getTotalValue(stage.id)}
                >
                  {stageBusinesses.map((business) => (
                    <SimpleKanbanCard
                      key={business.id}
                      business={business}
                    />
                  ))}

                  {stageBusinesses.length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                      <div className="text-2xl mb-2">📭</div>
                      <p className="text-xs">Arraste cards aqui</p>
                    </div>
                  )}
                </KanbanColumn>
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {draggedBusiness && (
            <div className="transform rotate-2 scale-105 opacity-90">
              <SimpleKanbanCard business={draggedBusiness} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
