'use client';

import React, { useState } from 'react';
import { CampaignJourneyData } from '@/app/actions/sheetsActions';
import CampaignJourneyModal from './CampaignJourneyModal';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CampaignJourneyKanbanProps {
  campaigns: CampaignJourneyData[];
  onRefresh: () => void;
}

// Componente para coluna droppable
function DroppableColumn({
  id,
  children,
  className
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        ${className}
        ${isOver ? 'border-blue-400 bg-blue-50/30 shadow-lg scale-[1.02]' : ''}
        transition-all duration-200
      `}
    >
      {children}
    </div>
  );
}

// Componente para card arrastável
function SortableCampaignCard({
  campaign,
  onClick
}: {
  campaign: CampaignJourneyData;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: campaign.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-grab compact-card
        hover:shadow-lg hover:border-gray-300 transition-all duration-200 transform
        ${isDragging ? 'opacity-60 rotate-1 scale-105 shadow-xl border-blue-300 z-50' : 'hover:scale-[1.02]'}
        active:scale-95 active:shadow-sm
      `}
    >
      {/* Header Compacto */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm truncate flex-1 mr-2">
          {campaign.businessName}
        </h4>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
          {campaign.mes}
        </span>
      </div>

      {/* Informações Compactas */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        <span className="flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {campaign.totalCampanhas}
        </span>
        <span className="flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {campaign.quantidadeCriadores}
        </span>
        {campaign.businessData?.planoAtual && (
          <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 truncate max-w-16">
            {campaign.businessData.planoAtual}
          </span>
        )}
      </div>

      {/* Botão Compacto */}
      <button className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors py-1 border-t border-gray-100">
        Ver Detalhes →
      </button>
    </div>
  );
}

export default function CampaignJourneyKanban({ campaigns, onRefresh }: CampaignJourneyKanbanProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignJourneyData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Distância mínima para iniciar o drag
        delay: 100,   // Pequeno delay para evitar drags acidentais
        tolerance: 5, // Tolerância para movimento
      },
    })
  );

  // Agrupar campanhas por estágio
  const stages = [
    {
      id: 'Reunião Briefing',
      title: 'Reunião Briefing',
      icon: (
        <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
      ),
      color: 'bg-white border-gray-200 shadow-sm'
    },
    {
      id: 'Agendamentos',
      title: 'Agendamentos',
      icon: (
        <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
      ),
      color: 'bg-white border-gray-200 shadow-sm'
    },
    {
      id: 'Entrega Final',
      title: 'Entrega Final',
      icon: (
        <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
      ),
      color: 'bg-white border-gray-200 shadow-sm'
    }
  ];

  const getCampaignsByStage = (stageId: string) => {
    return campaigns.filter(campaign => campaign.journeyStage === stageId);
  };

  const handleCampaignClick = (campaign: CampaignJourneyData) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCampaign(null);
    setIsModalOpen(false);
  };

  const handleStatusUpdate = () => {
    // Recarregar dados após atualização
    onRefresh();
    handleCloseModal();
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDragging(false);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar a campanha que foi movida
    const activeCampaign = campaigns.find(c => c.id === activeId);
    if (!activeCampaign) return;

    // Determinar o novo status baseado na coluna de destino
    let newStatus = '';

    console.log('🎯 Drag & Drop Debug:', { activeId, overId, activeCampaign: activeCampaign.businessName });

    // Verificar se foi dropado em uma coluna ou em um card dentro da coluna
    const stageIds = ['Reunião Briefing', 'Agendamentos', 'Entrega Final'];

    if (stageIds.includes(overId)) {
      // Dropado diretamente na coluna
      newStatus = overId;
      console.log('✅ Dropado na coluna:', newStatus);
    } else {
      // Dropado em um card, encontrar a coluna do card
      const targetCampaign = campaigns.find(c => c.id === overId);
      if (targetCampaign) {
        newStatus = targetCampaign.journeyStage;
        console.log('✅ Dropado em card, coluna:', newStatus);
      } else {
        console.log('❌ Não foi possível determinar a coluna de destino');
        return;
      }
    }

    // Se o status não mudou, não fazer nada
    if (!newStatus || newStatus === activeCampaign.journeyStage) return;

    try {
      console.log(`🔄 Movendo campanha via drag&drop: ${activeCampaign.businessName} - ${activeCampaign.mes}: ${activeCampaign.journeyStage} → ${newStatus}`);

      const response = await fetch('/api/update-campaign-status-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: activeCampaign.businessName,
          mes: activeCampaign.mes,
          oldStatus: activeCampaign.journeyStage,
          newStatus: newStatus,
          user: 'Drag&Drop'
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Status atualizado via drag&drop e audit_log');

        // Aguardar um pouco para garantir que o audit_log foi processado
        setTimeout(() => {
          onRefresh(); // Recarregar dados
        }, 1000);
      } else {
        console.error('❌ Erro ao atualizar status via drag&drop:', result.error);
        alert(`❌ Erro ao mover campanha: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erro no drag&drop:', error);
      alert('❌ Erro ao mover campanha. Tente novamente.');
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stages.map((stage) => {
          const stageCampaigns = getCampaignsByStage(stage.id);

          return (
            <DroppableColumn
              key={stage.id}
              id={stage.id}
              className={`${stage.color} rounded-2xl border-2 border-dashed border-gray-300 p-6 min-h-[400px] transition-all duration-200 hover:border-gray-400 hover:shadow-md`}
            >
              <SortableContext
                items={stageCampaigns.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {/* Header da Coluna */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {stage.icon}
                    <h3 className="font-semibold text-gray-900 text-base">{stage.title}</h3>
                  </div>
                  <span className="bg-gray-100 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 min-w-[2rem] text-center">
                    {stageCampaigns.length}
                  </span>
                </div>

                {/* Cards das Campanhas */}
                <div className="space-y-2">
                  {stageCampaigns.map((campaign) => (
                    <SortableCampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onClick={() => handleCampaignClick(campaign)}
                    />
                  ))}

                  {/* Estado vazio da coluna */}
                  {stageCampaigns.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <div className="mb-4 opacity-50">{stage.icon}</div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Nenhuma campanha</p>
                      <p className="text-xs text-gray-400">Arraste campanhas para cá</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DroppableColumn>
          );
        })}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white rounded-xl p-4 shadow-2xl border-2 border-blue-300 opacity-95 transform rotate-2 scale-105 compact-card ring-4 ring-blue-100">
              {(() => {
                const activeCampaign = campaigns.find(c => c.id === activeId);
                return activeCampaign ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm truncate flex-1 mr-2">
                        {activeCampaign.businessName}
                      </h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-blue-500 text-white">
                        {activeCampaign.mes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {activeCampaign.totalCampanhas}
                      </span>
                      <span className="text-blue-600 font-medium">Movendo...</span>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal de Detalhes da Campanha */}
      <CampaignJourneyModal
        campaign={selectedCampaign}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
}
