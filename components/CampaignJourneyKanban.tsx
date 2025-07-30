'use client';

import React, { useState } from 'react';
import CampaignJourneyModal from './CampaignJourneyModal';

// Tipo local para dados da jornada de campanhas
interface CampaignJourneyData {
  id: string;
  businessName: string;
  businessId: string;
  mes: string;
  journeyStage: string;
  totalCampanhas: number;
  quantidadeCriadores: number;
  criadores: any[];
  campanhas: any[];
}
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
        ${isOver ? 'bg-blue-50/50 shadow-lg scale-[1.02] ring-2 ring-blue-200' : ''}
        transition-all duration-200
      `}
    >
      {children}
    </div>
  );
}

// Função para formatar a data de YYYYMM para "Mmm YY"
function formatMonthYear(monthYear: string): string {
  if (!monthYear || monthYear.length !== 6) return monthYear;

  const year = monthYear.substring(0, 4);
  const month = monthYear.substring(4, 6);

  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const monthIndex = parseInt(month) - 1;
  const shortYear = year.substring(2, 4);

  if (monthIndex >= 0 && monthIndex < 12) {
    return `${monthNames[monthIndex]} ${shortYear}`;
  }

  return monthYear;
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
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 compact-card
        hover:shadow-md hover:border-gray-300 transition-all duration-200 transform
        ${isDragging ? 'opacity-60 rotate-1 scale-105 shadow-xl border-blue-300 z-50' : 'hover:scale-[1.01]'}
        active:scale-95 active:shadow-sm select-none w-full
      `}
    >
      {/* Área Draggable */}
      <div
        {...listeners}
        className="p-3 cursor-grab active:cursor-grabbing"
      >
        {/* Drag Handle Visual */}
        <div className="flex items-center justify-center mb-1 opacity-20 hover:opacity-50 transition-opacity">
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm6-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
          </svg>
        </div>

        {/* Header Compacto */}
        <div className="flex items-start justify-between mb-1.5">
          <h4 className="font-semibold text-gray-900 text-sm truncate flex-1 mr-2 leading-tight">
            {campaign.businessName}
          </h4>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap flex-shrink-0">
            {formatMonthYear(campaign.mes)}
          </span>
        </div>

        {/* Informações Compactas */}
        <div className="flex items-center justify-center text-xs text-gray-600 mb-2">


            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {campaign.quantidadeCriadores} criadores
            </span>


        </div>
      </div>

      {/* Botão Compacto - Fora da área de drag */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick(); // Chama a função de abrir modal
        }}
        onMouseDown={(e) => {
          e.stopPropagation(); // Previne o início do drag
        }}
        onPointerDown={(e) => {
          e.stopPropagation(); // Previne o início do drag em dispositivos touch
        }}
        className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors py-1.5 border-t border-gray-100 cursor-pointer hover:bg-blue-50 rounded-b-lg bg-white"
      >
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

  // Debug: Log das campanhas recebidas
  console.log('🎯 CampaignJourneyKanban recebeu:', {
    totalCampaigns: campaigns.length,
    campaigns: campaigns.map(c => ({
      id: c.id,
      businessName: c.businessName,
      mes: c.mes,
      journeyStage: c.journeyStage
    }))
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Distância mínima para iniciar o drag
        delay: 100,   // Delay para evitar conflitos com clicks
        tolerance: 5, // Tolerância para movimento
      },
    })
  );

  // Agrupar campanhas por estágio (sem Finalizado)
  const stages = [
    {
      id: 'Reunião de briefing',
      title: 'Reunião de briefing',
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
      id: 'Entrega final',
      title: 'Entrega final',
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

  // Contar campanhas finalizadas
  const finalizadasCount = campaigns.filter(campaign => campaign.journeyStage === 'Finalizado').length;

  const getCampaignsByStage = (stageId: string) => {
    console.log(`🔍 Filtrando campanhas para stage: "${stageId}"`);
    const filtered = campaigns.filter(campaign => {
      const match = campaign.journeyStage === stageId;
      console.log(`📊 Campanha ${campaign.businessName}: stage="${campaign.journeyStage}" === "${stageId}" = ${match}`);
      return match;
    });
    console.log(`✅ ${filtered.length} campanhas encontradas para stage "${stageId}"`);
    return filtered;
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

    console.log('🎯 Drag & Drop Debug:', {
      activeId,
      overId,
      activeCampaign: {
        businessName: activeCampaign.businessName,
        currentStage: activeCampaign.journeyStage,
        mes: activeCampaign.mes
      }
    });

    // Verificar se foi dropado em uma coluna ou em um card dentro da coluna
    const stageIds = ['Reunião de briefing', 'Agendamentos', 'Entrega final'];

    console.log('🔍 Verificando destino:', {
      overId,
      overIdType: typeof overId,
      stageIds,
      isDirectColumn: stageIds.includes(overId)
    });

    if (stageIds.includes(overId)) {
      // Dropado diretamente na coluna
      newStatus = overId;
      console.log('✅ Dropado na coluna:', { newStatus, type: typeof newStatus });
    } else {
      // Dropado em um card, encontrar a coluna do card
      const targetCampaign = campaigns.find(c => c.id === overId);
      console.log('🔍 Procurando campanha alvo:', {
        overId,
        targetCampaign: targetCampaign ? {
          id: targetCampaign.id,
          businessName: targetCampaign.businessName,
          journeyStage: targetCampaign.journeyStage
        } : null
      });

      if (targetCampaign) {
        newStatus = targetCampaign.journeyStage;
        console.log('✅ Dropado em card, coluna:', { newStatus, type: typeof newStatus });
      } else {
        console.log('❌ Não foi possível determinar a coluna de destino');
        return;
      }
    }

    console.log('🎯 Status determinado:', {
      newStatus,
      newStatusType: typeof newStatus,
      newStatusValue: JSON.stringify(newStatus),
      currentStatus: activeCampaign.journeyStage,
      isEqual: newStatus === activeCampaign.journeyStage
    });

    // Se o status não mudou, não fazer nada
    if (!newStatus || newStatus === activeCampaign.journeyStage) {
      console.log('⏭️ Não há mudança de status, cancelando');
      return;
    }

    try {
      console.log(`🔄 Movendo campanha via drag&drop: ${activeCampaign.businessName} - ${activeCampaign.mes}: ${activeCampaign.journeyStage} → ${newStatus}`);

      const requestBody = {
        businessName: activeCampaign.businessName,
        mes: activeCampaign.mes,
        newStatus: newStatus,
        userEmail: 'Drag&Drop'
      };

      console.log('📤 Enviando request:', {
        url: '/api/supabase/campaigns/status',
        method: 'PUT',
        body: requestBody,
        bodyStringified: JSON.stringify(requestBody)
      });

      const response = await fetch('/api/supabase/campaigns/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
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
        {/* Contador de Campanhas Finalizadas */}
        {finalizadasCount > 0 && (
          <div className="mb-4 bg-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-gray-500 rounded-xl flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">{finalizadasCount}</div>
                <div className="text-sm text-gray-600">Campanhas Finalizadas</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {stages.map((stage) => {
          const stageCampaigns = getCampaignsByStage(stage.id);

          return (
            <DroppableColumn
              key={stage.id}
              id={stage.id}
              className={`${stage.color} rounded-xl p-4 min-h-[350px] transition-all duration-200 hover:shadow-md`}
            >
              <SortableContext
                items={stageCampaigns.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {/* Header da Coluna */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {stage.icon}
                    <h3 className="font-semibold text-gray-900 text-sm">{stage.title}</h3>
                  </div>
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-semibold text-gray-700 min-w-[1.5rem] text-center">
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
                    <div className="text-center py-8 text-gray-400">
                      <div className="mb-3 opacity-50">{stage.icon}</div>
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
            <div className="bg-white rounded-lg p-3 shadow-2xl border-2 border-blue-300 opacity-95 transform rotate-2 scale-105 compact-card ring-4 ring-blue-100">
              {(() => {
                const activeCampaign = campaigns.find(c => c.id === activeId);
                return activeCampaign ? (
                  <>
                    {/* Drag Handle Visual */}
                    <div className="flex items-center justify-center mb-1 opacity-60">
                      <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm6-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                      </svg>
                    </div>

                    <div className="flex items-start justify-between mb-1.5">
                      <h4 className="font-semibold text-gray-900 text-sm truncate flex-1 mr-2 leading-tight">
                        {activeCampaign.businessName}
                      </h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-500 text-white flex-shrink-0">
                        {formatMonthYear(activeCampaign.mes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {activeCampaign.totalCampanhas}
                      </span>
                      <span className="text-blue-600 font-medium flex items-center">
                        <svg className="w-3 h-3 mr-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Movendo...
                      </span>
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
