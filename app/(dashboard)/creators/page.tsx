import React from 'react';
import { getData } from '@/app/actions/sheetsActions';
import { transformData } from '@/lib/utils';
import CreatorCard from '@/components/CreatorCard';

// Dados de criadores extraídos dos negócios (integração completa)
const getAllCreators = () => {
  const mockBusinesses = [
    {
      creators: [
        { name: 'Ana Silva', username: 'anasilva', followers: 125000, engagementRate: 4.2, businessName: 'Loja de Roupas Fashion' },
        { name: 'Carlos Santos', username: 'carlossantos', followers: 89000, engagementRate: 6.8, businessName: 'Loja de Roupas Fashion' }
      ]
    },
    {
      creators: [
        { name: 'Maria Oliveira', username: 'mariaoliveira', followers: 234000, engagementRate: 3.1, businessName: 'Restaurante Gourmet' }
      ]
    },
    {
      creators: [
        { name: 'João Fitness', username: 'joaofitness', followers: 156000, engagementRate: 5.4, businessName: 'Academia Fitness Plus' },
        { name: 'Carla Strong', username: 'carlastrong', followers: 98000, engagementRate: 7.2, businessName: 'Academia Fitness Plus' },
        { name: 'Pedro Muscle', username: 'pedromuscle', followers: 67000, engagementRate: 4.8, businessName: 'Academia Fitness Plus' }
      ]
    },
    {
      creators: [
        { name: 'Bella Beauty', username: 'bellabeauty', followers: 189000, engagementRate: 6.1, businessName: 'Clínica de Estética' }
      ]
    },
    {
      creators: [
        { name: 'Tech Master', username: 'techmaster', followers: 145000, engagementRate: 5.9, businessName: 'Loja de Eletrônicos' },
        { name: 'Gamer Pro', username: 'gamerpro', followers: 203000, engagementRate: 4.5, businessName: 'Loja de Eletrônicos' }
      ]
    }
  ];

  // Extrair todos os criadores de todos os negócios
  const allCreators = mockBusinesses.flatMap(business =>
    business.creators.map(creator => ({
      ...creator,
      avatarUrl: '/placeholder-avatar.svg'
    }))
  );

  return allCreators;
};

const mockCreators = getAllCreators();

export default async function CreatorsPage() {
  let creators = mockCreators;

  // Tenta buscar dados do Google Sheets, mas usa dados mock se falhar
  try {
    const rawData = await getData('Creators');
    if (rawData && rawData.length > 0) {
      const transformedData = transformData(rawData);

      // Mapeia os dados transformados para o formato esperado pelo componente
      creators = transformedData.map((item: any) => ({
        avatarUrl: item.avatarUrl || '/placeholder-avatar.svg',
        name: item.name || item.Nome || 'Nome não informado',
        username: item.username || item.Username || 'username',
        followers: parseInt(item.followers || item.Seguidores || '0'),
        engagementRate: parseFloat(item.engagementRate || item.Engajamento || '0'),
        businessName: item.businessName || item.Negocio || ''
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
              <p className="text-2xl font-bold text-on-surface">{creators.length}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Alto Engajamento</p>
              <p className="text-2xl font-bold text-green-600">
                {creators.filter(i => i.engagementRate >= 5).length}
              </p>
            </div>
            <div className="text-2xl">🔥</div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Seguidores Totais</p>
              <p className="text-2xl font-bold text-primary">
                {(creators.reduce((acc, i) => acc + i.followers, 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Engajamento Médio</p>
              <p className="text-2xl font-bold text-secondary">
                {(creators.reduce((acc, i) => acc + i.engagementRate, 0) / creators.length || 0).toFixed(1)}%
              </p>
            </div>
            <div className="text-2xl">⚡</div>
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creators.map((creator, index) => (
          <CreatorCard
            key={index}
            avatarUrl={creator.avatarUrl}
            name={creator.name}
            username={creator.username}
            followers={creator.followers}
            engagementRate={creator.engagementRate}
            businessName={creator.businessName}
          />
        ))}
      </div>

      {creators.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-medium text-on-surface mb-2">
            Nenhum criador encontrado
          </h3>
          <p className="text-on-surface-variant">
            Configure o Google Sheets para ver os dados dos criadores.
          </p>
        </div>
      )}
    </div>
  );
}
