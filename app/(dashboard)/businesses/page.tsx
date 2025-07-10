import React from 'react';
import { getData } from '@/app/actions/sheetsActions';
import { transformData } from '@/lib/utils';
import BusinessCard from '@/components/BusinessCard';

// Dados de exemplo integrados (mesmos da página Jornada)
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

export default async function BusinessesPage() {
  let businesses = mockBusinesses;

  // Tenta buscar dados do Google Sheets, mas usa dados mock se falhar
  try {
    const rawData = await getData('Businesses');
    if (rawData && rawData.length > 0) {
      const transformedData = transformData(rawData);

      // Mapeia os dados transformados para o formato esperado pelo componente
      businesses = transformedData.map((item: any) => ({
        businessName: item.businessName || item.Nome || item['Nome do Negócio'] || 'Negócio não informado',
        journeyStage: item.journeyStage || item.Estágio || item['Estágio da Jornada'] || 'Agendamento',
        nextAction: item.nextAction || item.Ação || item['Próxima Ação'] || 'Definir próxima ação'
      }));
    }
  } catch (error) {
    console.log('Usando dados de exemplo - Google Sheets não configurado ainda');
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Total</p>
              <p className="text-2xl font-bold text-on-surface">{businesses.length}</p>
            </div>
            <div className="text-2xl">🏢</div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Em Agendamentos</p>
              <p className="text-2xl font-bold text-orange-600">
                {businesses.filter(b => b.journeyStage === 'Agendamentos').length}
              </p>
            </div>
            <div className="text-2xl">📅</div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Entrega Final</p>
              <p className="text-2xl font-bold text-green-600">
                {businesses.filter(b => b.journeyStage === 'Entrega Final').length}
              </p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Taxa Conversão</p>
              <p className="text-2xl font-bold text-primary">85%</p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>
      </div>

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((business, index) => (
          <BusinessCard
            key={index}
            businessName={business.businessName}
            journeyStage={business.journeyStage}
            nextAction={business.nextAction}
            influencersCount={business.influencers?.length || 0}
            value={business.value || 0}
          />
        ))}
      </div>

      {businesses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-medium text-on-surface mb-2">
            Nenhum negócio encontrado
          </h3>
          <p className="text-on-surface-variant mb-6">
            Configure o Google Sheets para ver os dados dos negócios.
          </p>
          <button className="btn-primary">
            <span className="mr-2">➕</span>
            Adicionar Primeiro Negócio
          </button>
        </div>
      )}
    </div>
  );
}
