'use client';

import React, { useState, useEffect } from 'react';
import AddBusinessModalNew from '@/components/AddBusinessModalNew';
import DealDetailsModalNew from '@/components/DealDetailsModalNew';
import Toast, { useToast } from '@/components/Toast';
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
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Deal {
  id: string;
  name: string;
  business_name: string;
  business_id: string;
  stage: string;
  priority: string;
  estimated_value: number;
  expected_close_date: string;
  owner_name: string;
  owner_email: string;
  current_stage_since: string;
  created_at: string;
  plan: string;
}

// Configuração das etapas do kanban
const KANBAN_STAGES = [
  {
    id: 'Leads próprios frios',
    title: 'Leads Frios',
    icon: (
      <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="m22 2-5 10-5-5-5 10"/>
        </svg>
      </div>
    ),
    color: 'bg-blue-50 border-blue-200',
    description: 'Novos leads para qualificação'
  },
  {
    id: 'Leads próprios quentes',
    title: 'Leads Quentes',
    icon: (
      <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      </div>
    ),
    color: 'bg-orange-50 border-orange-200',
    description: 'Leads qualificados e interessados'
  },
  {
    id: 'Leads indicados',
    title: 'Leads Indicados',
    icon: (
      <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="m22 2-5 10-5-5-5 10"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
    ),
    color: 'bg-purple-50 border-purple-200',
    description: 'Leads vindos de indicações'
  },
  {
    id: 'Enviando proposta',
    title: 'Enviando Proposta',
    icon: (
      <div className="w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      </div>
    ),
    color: 'bg-yellow-50 border-yellow-200',
    description: 'Proposta em elaboração/envio'
  },
  {
    id: 'Marcado reunião',
    title: 'Reunião Marcada',
    icon: (
      <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
    ),
    color: 'bg-indigo-50 border-indigo-200',
    description: 'Reunião agendada com cliente'
  },
  {
    id: 'Reunião realizada',
    title: 'Reunião Realizada',
    icon: (
      <div className="w-6 h-6 bg-teal-500 rounded-lg flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
          <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
          <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
          <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
        </svg>
      </div>
    ),
    color: 'bg-teal-50 border-teal-200',
    description: 'Reunião concluída, aguardando próximos passos'
  },
  {
    id: 'Follow up',
    title: 'Follow Up',
    icon: (
      <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </div>
    ),
    color: 'bg-green-50 border-green-200',
    description: 'Acompanhamento pós-reunião'
  }
];

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

// Componente para card draggable
function SortableDealCard({
  deal,
  onClick
}: {
  deal: Deal;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `deal-${deal.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Diamond': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-gray-200 p-3 cursor-pointer
        hover:shadow-md hover:border-gray-300 transition-all duration-200
        ${isDragging ? 'opacity-50 rotate-2 scale-105 shadow-lg z-50' : ''}
      `}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-end mb-2">
        <div className="w-4 h-4 opacity-30 hover:opacity-60 transition-opacity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm6-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
          </svg>
        </div>
      </div>

      {/* Header Compacto */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm truncate flex-1 mr-2 leading-tight">
          {deal.business_name}
        </h4>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getPriorityColor(deal.priority)} whitespace-nowrap flex-shrink-0`}>
          {deal.priority}
        </span>
      </div>

      {/* Valor */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-gray-900">
          {formatCurrency(deal.estimated_value)}
        </span>
        {deal.plan && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getPlanColor(deal.plan)}`}>
            {deal.plan}
          </span>
        )}
      </div>

      {/* Proprietário */}
      <div className="flex items-center text-xs text-gray-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span className="truncate">{deal.owner_name}</span>
      </div>
    </div>
  );
}

export default function DealsPageNew() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/deals');
      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals || []);
      } else {
        console.error('Erro ao carregar negócios:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar negócios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDealsByStage = (stage: string) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getTotalValueByStage = (stage: string) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + deal.estimated_value, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Extrair o ID real do deal (remover prefixo "deal-")
    const activeId = active.id as string;
    const dealId = activeId.startsWith('deal-') ? activeId.replace('deal-', '') : activeId;

    const deal = deals.find(d => d.id === dealId);
    setDraggedDeal(deal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setDraggedDeal(null);

    if (!over) return;

    const activeId = active.id as string;
    let overId = over.id as string;

    // Extrair o ID real do deal (remover prefixo "deal-")
    const dealId = activeId.startsWith('deal-') ? activeId.replace('deal-', '') : activeId;

    // Se o over.id é um card (tem prefixo "deal-"), precisamos encontrar a coluna pai
    if (overId.startsWith('deal-')) {
      const overDealId = overId.replace('deal-', '');
      const overDeal = deals.find(d => d.id === overDealId);
      if (overDeal) {
        overId = overDeal.stage; // Usar a etapa do card como destino
      } else {
        console.error('❌ Deal de destino não encontrado:', overDealId);
        return;
      }
    }

    const newStage = overId;

    // Verificar se newStage é um nome de etapa válido
    const validStages = KANBAN_STAGES.map(s => s.id);
    if (!validStages.includes(newStage)) {
      console.error('❌ Etapa inválida:', newStage, 'Etapas válidas:', validStages);
      return;
    }

    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    // Atualização otimista
    const originalDeals = [...deals];
    setDeals(prevDeals =>
      prevDeals.map(d =>
        d.id === dealId ? { ...d, stage: newStage } : d
      )
    );

    setIsUpdating(true);

    try {
      const response = await fetch('/api/deals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: deal.business_id,
          stage: newStage,
          previous_stage: deal.stage
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao atualizar negócio no servidor:', errorText);
        setDeals(originalDeals);
        showToast('Erro ao atualizar negócio. A mudança foi revertida.', 'error');
      } else {
        const result = await response.json();
        showToast(`Negócio movido para "${newStage}"`, 'success');
      }
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      setDeals(originalDeals);
      showToast('Erro de conexão. A mudança foi revertida.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDetailsModalOpen(true);
  };

  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.estimated_value, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando negócios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header Limpo */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Pipeline de Vendas</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {totalDeals} negócios ativos • {formatCurrency(totalValue)} em oportunidades
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-6 py-2.5 text-sm rounded-full w-full sm:w-auto"
          >
            Nova Empresa
          </button>
        </div>
      </div>

      {/* Kanban Board com Scroll Horizontal Apenas */}
      <div>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto pb-4 kanban-scroll">
            <div className="flex gap-6 min-w-max px-2">
          {KANBAN_STAGES.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const stageValue = getTotalValueByStage(stage.id);

            return (
              <DroppableColumn
                key={stage.id}
                id={stage.id}
                className={`${stage.color} rounded-xl p-4 w-80 min-w-[280px] flex-shrink-0 transition-all duration-200 hover:shadow-md kanban-column-mobile`}
              >
                <SortableContext
                  items={stageDeals.map(d => `deal-${d.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {/* Header da Coluna */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {stage.icon}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{stage.title}</h3>
                        <p className="text-xs text-gray-600">{stage.description}</p>
                      </div>
                    </div>
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-semibold text-gray-700 min-w-[1.5rem] text-center shadow-sm">
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Valor Total da Coluna */}
                  <div className="bg-white/60 rounded-lg p-3 mb-4 border border-white/40">
                    <div className="text-xs text-gray-600 mb-1">Valor Total</div>
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(stageValue)}</div>
                  </div>

                  {/* Cards dos Negócios */}
                  <div className="space-y-3">
                    {stageDeals.map((deal) => (
                      <SortableDealCard
                        key={deal.id}
                        deal={deal}
                        onClick={() => handleDealClick(deal)}
                      />
                    ))}

                    {/* Estado vazio da coluna */}
                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <div className="mb-3 opacity-50">{stage.icon}</div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Nenhum negócio</p>
                        <p className="text-xs text-gray-400">Arraste negócios para cá</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DroppableColumn>
            );
          })}
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
          {draggedDeal && (
            <div className="transform rotate-2 scale-105 opacity-90">
              <SortableDealCard
                deal={draggedDeal}
                onClick={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">Atualizando negócio...</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddBusinessModalNew
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          loadDeals();
          setIsAddModalOpen(false);
        }}
      />

      <DealDetailsModalNew
        deal={selectedDeal}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDeal(null);
        }}
        onDealUpdate={(updatedDeal) => {
          setDeals(prevDeals =>
            prevDeals.map(deal =>
              deal.id === updatedDeal.id ? updatedDeal : deal
            )
          );
        }}
      />

      <Toast
        message={toast.message || ''}
        type={toast.type || 'info'}
        isVisible={toast.isVisible || false}
        onClose={hideToast}
      />
    </div>
  );
}
