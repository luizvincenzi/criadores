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
import { useBusinessStore, Business } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';
import SimpleBusinessCard from './SimpleBusinessCard';
import BusinessModal from './BusinessModal';

// Removido - agora usando SimpleBusinessCard

// Área de drop
function DroppableColumn({ 
  id, 
  children, 
  title, 
  icon, 
  count, 
  totalValue 
}: { 
  id: string; 
  children: React.ReactNode; 
  title: string; 
  icon: string; 
  count: number; 
  totalValue: number; 
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-white rounded-lg border border-gray-200 p-4 min-h-[70vh] transition-all duration-200 shadow-sm
        ${isOver ? 'bg-blue-50 ring-2 ring-blue-400 border-blue-300' : ''}
      `}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{icon}</span>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium border">
              {count}
            </span>
          </div>
        </div>
        
        {/* Valor total */}
        <div className="text-xs text-gray-500">
          Total: <span className="font-semibold text-gray-700">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {/* Cards container */}
      <div className="space-y-2">
        {children}
        {count === 0 && (
          <div className="text-center py-6 text-gray-400">
            <div className="text-2xl mb-2">📭</div>
            <p className="text-xs">Arraste cards aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal
export default function WorkingKanban() {
  const { businesses, moveBusinessStage, getBusinessesByStage } = useBusinessStore();
  const { user } = useAuthStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stages = [
    { id: 'Reunião Briefing', title: 'Reunião Briefing', icon: '📋' },
    { id: 'Agendamentos', title: 'Agendamentos', icon: '📅' },
    { id: 'Entrega Final', title: 'Entrega Final', icon: '✅' }
  ];

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

    console.log('🎯 DRAG END INICIADO:', {
      activeId: active.id,
      overId: over?.id,
      user: user ? `${user.name} (${user.id})` : 'NÃO AUTENTICADO'
    });

    setActiveId(null);

    if (!over) {
      console.log('❌ DRAG CANCELADO: Não foi solto em área válida');
      return;
    }

    const businessId = active.id as string;
    const newStage = over.id as string;

    console.log('🔍 DEBUG DRAG:', {
      businessId,
      newStage,
      availableStages: stages.map(s => s.id),
      isValidStage: stages.some(s => s.id === newStage)
    });

    // Verifica se é um stage válido
    const validStage = stages.find(s => s.id === newStage);
    if (!validStage) {
      console.log('❌ STAGE INVÁLIDO:', newStage);
      return;
    }

    // Encontra o negócio
    const business = businesses.find(b => b.id === businessId);
    if (!business) {
      console.error('❌ NEGÓCIO NÃO ENCONTRADO:', businessId);
      console.log('📋 NEGÓCIOS DISPONÍVEIS:', businesses.map(b => ({ id: b.id, name: b.businessName })));
      return;
    }

    if (business.journeyStage === newStage) {
      console.log('ℹ️ NEGÓCIO JÁ ESTÁ NESTE ESTÁGIO:', newStage);
      return;
    }

    // Move o negócio
    const oldStage = business.journeyStage;
    console.log(`🚀 MOVENDO NEGÓCIO:`, {
      business: business.businessName,
      from: oldStage,
      to: newStage,
      businessId
    });

    // Atualiza no store (que já registra o log internamente)
    moveBusinessStage(businessId, newStage as Business['journeyStage']);
    console.log('✅ NEGÓCIO MOVIDO E LOG REGISTRADO AUTOMATICAMENTE');

    console.log('✅ DRAG & DROP CONCLUÍDO!');
  };

  const getTotalValue = (stage: string) => {
    return getBusinessesByStage(stage as Business['journeyStage'])
      .reduce((total, business) => total + business.value, 0);
  };

  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBusiness(null);
  };

  const activeItem = activeId ? businesses.find(item => item.id === activeId) : null;

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map(stage => {
            const stageBusinesses = getBusinessesByStage(stage.id as Business['journeyStage']);
            
            return (
              <DroppableColumn
                key={stage.id}
                id={stage.id}
                title={stage.title}
                icon={stage.icon}
                count={stageBusinesses.length}
                totalValue={getTotalValue(stage.id)}
              >
                {stageBusinesses.map(business => (
                  <SimpleBusinessCard
                    key={business.id}
                    business={business}
                    onClick={() => handleBusinessClick(business)}
                  />
                ))}
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="transform rotate-2 scale-105 opacity-90">
              <SimpleBusinessCard
                business={activeItem}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal de Detalhes */}
      <BusinessModal
        business={selectedBusiness}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
