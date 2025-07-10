'use client';

import React, { useState } from 'react';
import { getData, updateBusinessStage } from '@/app/actions/sheetsActions';
import { transformData } from '@/lib/utils';
import BusinessDetailModal from '@/components/BusinessDetailModal';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import DraggableBusinessCard, { BusinessCardOverlay } from '@/components/DraggableBusinessCard';
import DroppableColumn from '@/components/DroppableColumn';
import { useToast } from '@/components/Toast';

// Dados de exemplo para demonstração (serão substituídos pelos dados do Google Sheets)
const mockBusinesses = [
  {
    id: 1,
    businessName: 'Loja de Roupas Fashion',
    journeyStage: 'Agendamentos',
    nextAction: 'Agendar sessões de fotos com influenciadores',
    contactDate: '2024-01-15',
    value: 15000,
    description: 'Campanha de verão focada em roupas casuais para jovens de 18-30 anos',
    influencers: [
      { name: 'Ana Silva', username: 'anasilva', followers: 125000, engagementRate: 4.2 },
      { name: 'Carlos Santos', username: 'carlossantos', followers: 89000, engagementRate: 6.8 }
    ],
    campaigns: [
      { title: 'Campanha Verão 2024', status: 'Ativa', startDate: '2024-01-15', endDate: '2024-03-15' }
    ]
  },
  {
    id: 2,
    businessName: 'Restaurante Gourmet',
    journeyStage: 'Reunião Briefing',
    nextAction: 'Definir estratégia de conteúdo gastronômico',
    contactDate: '2024-01-10',
    value: 8000,
    description: 'Divulgação de pratos especiais e experiência gastronômica única',
    influencers: [
      { name: 'Maria Oliveira', username: 'mariaoliveira', followers: 234000, engagementRate: 3.1 }
    ],
    campaigns: []
  },
  {
    id: 3,
    businessName: 'Academia Fitness Plus',
    journeyStage: 'Entrega Final',
    nextAction: 'Finalizar edição dos vídeos de treino',
    contactDate: '2024-01-20',
    value: 25000,
    description: 'Campanha de motivação fitness com foco em resultados reais',
    influencers: [
      { name: 'João Fitness', username: 'joaofitness', followers: 156000, engagementRate: 5.4 },
      { name: 'Carla Strong', username: 'carlastrong', followers: 98000, engagementRate: 7.2 },
      { name: 'Pedro Muscle', username: 'pedromuscle', followers: 67000, engagementRate: 4.8 }
    ],
    campaigns: [
      { title: 'Transformação 90 Dias', status: 'Ativa', startDate: '2024-01-01', endDate: '2024-03-31' }
    ]
  },
  {
    id: 4,
    businessName: 'Clínica de Estética',
    journeyStage: 'Reunião Briefing',
    nextAction: 'Alinhar diretrizes de comunicação sobre procedimentos',
    contactDate: '2024-01-12',
    value: 12000,
    description: 'Divulgação de tratamentos estéticos com foco em naturalidade',
    influencers: [
      { name: 'Bella Beauty', username: 'bellabeauty', followers: 189000, engagementRate: 6.1 }
    ],
    campaigns: []
  },
  {
    id: 5,
    businessName: 'Loja de Eletrônicos',
    journeyStage: 'Agendamentos',
    nextAction: 'Coordenar reviews de produtos com tech influencers',
    contactDate: '2024-01-08',
    value: 18000,
    description: 'Reviews autênticos de gadgets e eletrônicos inovadores',
    influencers: [
      { name: 'Tech Master', username: 'techmaster', followers: 145000, engagementRate: 5.9 },
      { name: 'Gamer Pro', username: 'gamerpro', followers: 203000, engagementRate: 4.5 }
    ],
    campaigns: [
      { title: 'Tech Reviews 2024', status: 'Planejamento', startDate: '2024-02-01', endDate: '2024-04-30' }
    ]
  }
];

// Definir as fases da jornada (3 fases principais)
const journeyStages = [
  { id: 'Reunião Briefing', label: 'Reunião Briefing', color: 'bg-blue-100 text-blue-800', icon: '📋' },
  { id: 'Agendamentos', label: 'Agendamentos', color: 'bg-yellow-100 text-yellow-800', icon: '📅' },
  { id: 'Entrega Final', label: 'Entrega Final', color: 'bg-green-100 text-green-800', icon: '✅' }
];

export default function JornadaPage() {
  const [businesses, setBusinesses] = useState(mockBusinesses);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast, ToastComponent } = useToast();

  // Configurar sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Mínimo de 8px de movimento para ativar o drag
      },
    })
  );

  // Carregar dados do Google Sheets
  React.useEffect(() => {
    async function loadData() {
      try {
        const rawData = await getData('Businesses');
        if (rawData && rawData.length > 0) {
          const transformedData = transformData(rawData);

          // Mapeia os dados transformados para o formato esperado pelo componente
          const businessesData = transformedData.map((item: any) => ({
            id: item.id || Math.random(),
            businessName: item.businessName || item.Nome || item['Nome do Negócio'] || 'Negócio não informado',
            journeyStage: item.journeyStage || item.Estágio || item['Estágio da Jornada'] || 'Reunião Briefing',
            nextAction: item.nextAction || item.Ação || item['Próxima Ação'] || 'Definir próxima ação',
            contactDate: item.contactDate || item.Data || item['Data de Contato'] || new Date().toISOString().split('T')[0],
            value: parseInt(item.value || item.Valor || item['Valor do Negócio'] || '0'),
            description: item.description || item.Descrição || 'Descrição não informada',
            influencers: JSON.parse(item.influencers || '[]'),
            campaigns: JSON.parse(item.campaigns || '[]')
          }));
          setBusinesses(businessesData);
        }
      } catch (error) {
        console.log('Usando dados de exemplo - Google Sheets não configurado ainda');
      }
    }

    loadData();
  }, []);

  const handleBusinessClick = (business: any) => {
    setSelectedBusiness(business);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBusiness(null);
  };

  // Função chamada quando o drag inicia
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Função chamada quando o drag termina
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const businessId = active.id as string;
    const newStage = over.id as string;

    // Encontra o negócio que está sendo movido
    const business = businesses.find(b => b.id.toString() === businessId);
    if (!business || business.journeyStage === newStage) return;

    // Atualiza o estado local imediatamente para feedback visual
    setBusinesses(prev =>
      prev.map(b =>
        b.id.toString() === businessId
          ? { ...b, journeyStage: newStage }
          : b
      )
    );

    // Atualiza no banco de dados
    setIsUpdating(true);
    try {
      await updateBusinessStage(businessId, newStage);
      console.log(`Negócio ${business.businessName} movido para ${newStage}`);

      // Notificação de sucesso
      showToast(`${business.businessName} movido para ${newStage}`, 'success');

    } catch (error) {
      console.error('Erro ao atualizar estágio:', error);

      // Reverte a mudança local em caso de erro
      setBusinesses(prev =>
        prev.map(b =>
          b.id.toString() === businessId
            ? { ...b, journeyStage: business.journeyStage }
            : b
        )
      );

      // Notificação de erro
      showToast('Erro ao mover negócio. Tente novamente.', 'error');

    } finally {
      setIsUpdating(false);
    }
  };

  // Encontra o negócio que está sendo arrastado para o overlay
  const activeBusiness = activeId ? businesses.find(b => b.id.toString() === activeId) : null;



  // Agrupar negócios por fase da jornada
  const businessesByStage = journeyStages.map(stage => ({
    ...stage,
    businesses: businesses.filter(business => business.journeyStage === stage.id),
    totalValue: businesses
      .filter(business => business.journeyStage === stage.id)
      .reduce((sum, business) => sum + business.value, 0)
  }));

  return (
    <div className="space-y-6">
      {/* Header com estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Total de Negócios</p>
              <p className="text-2xl font-bold text-on-surface">{businesses.length}</p>
            </div>
            <div className="text-2xl">🏢</div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Valor Total</p>
              <p className="text-2xl font-bold text-primary">
                R$ {(businesses.reduce((sum, b) => sum + b.value, 0) / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Em Fechamento</p>
              <p className="text-2xl font-bold text-green-600">
                {businesses.filter(b => b.journeyStage === 'Fechamento').length}
              </p>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
        </div>
        
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Taxa Conversão</p>
              <p className="text-2xl font-bold text-secondary">
                {businesses.length > 0 ? Math.round((businesses.filter(b => b.journeyStage === 'Pós-venda').length / businesses.length) * 100) : 0}%
              </p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>
      </div>

      {/* Kanban da Jornada com Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {businessesByStage.map((stage) => (
            <DroppableColumn
              key={stage.id}
              id={stage.id}
              title={stage.label}
              icon={stage.icon}
              businesses={stage.businesses}
              totalValue={stage.totalValue}
              onBusinessClick={handleBusinessClick}
              isUpdating={isUpdating}
            />
          ))}
        </div>

        {/* Overlay para mostrar o item sendo arrastado */}
        <DragOverlay>
          {activeBusiness ? (
            <BusinessCardOverlay business={activeBusiness} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal de Detalhes */}
      <BusinessDetailModal
        business={selectedBusiness}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Toast Notifications */}
      <ToastComponent />
    </div>
  );
}
