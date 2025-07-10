import React from 'react';
import { getData } from '@/app/actions/sheetsActions';
import { transformData } from '@/lib/utils';
import CampaignCard from '@/components/CampaignCard';

// Dados de campanhas extraídos dos negócios (integração completa)
const getAllCampaigns = () => {
  const mockBusinesses = [
    {
      businessName: 'Loja de Roupas Fashion',
      campaigns: [
        {
          title: 'Campanha Verão 2024',
          status: 'Ativa',
          startDate: '2024-01-15',
          endDate: '2024-03-15',
          brief: 'Campanha focada em roupas casuais para jovens de 18-30 anos com influenciadores de moda'
        }
      ]
    },
    {
      businessName: 'Academia Fitness Plus',
      campaigns: [
        {
          title: 'Transformação 90 Dias',
          status: 'Ativa',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          brief: 'Campanha de motivação fitness com foco em resultados reais e transformações corporais'
        }
      ]
    },
    {
      businessName: 'Loja de Eletrônicos',
      campaigns: [
        {
          title: 'Tech Reviews 2024',
          status: 'Planejamento',
          startDate: '2024-02-01',
          endDate: '2024-04-30',
          brief: 'Reviews autênticos de gadgets e eletrônicos inovadores com tech influencers'
        }
      ]
    }
  ];

  // Extrair todas as campanhas de todos os negócios
  const allCampaigns = mockBusinesses.flatMap(business =>
    business.campaigns.map(campaign => ({
      campaignTitle: campaign.title,
      brief: campaign.brief,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: campaign.status,
      businessName: business.businessName
    }))
  );

  return allCampaigns;
};

const mockCampaigns = getAllCampaigns();

export default async function CampaignsPage() {
  let campaigns = mockCampaigns;

  // Tenta buscar dados do Google Sheets, mas usa dados mock se falhar
  try {
    const rawData = await getData('Campaigns');
    if (rawData && rawData.length > 0) {
      const transformedData = transformData(rawData);

      // Mapeia os dados transformados para o formato esperado pelo componente
      campaigns = transformedData.map((item: any) => ({
        campaignTitle: item.campaignTitle || item.Título || item['Título da Campanha'] || 'Campanha sem título',
        brief: item.brief || item.Briefing || item.Descrição || 'Descrição não informada',
        startDate: item.startDate || item.Início || item['Data de Início'] || new Date().toISOString().split('T')[0],
        endDate: item.endDate || item.Fim || item['Data de Fim'] || new Date().toISOString().split('T')[0],
        status: item.status || item.Status || item.Situação || 'Planejamento'
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
              <p className="text-2xl font-bold text-on-surface">{campaigns.length}</p>
            </div>
            <div className="text-2xl">📢</div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Ativas</p>
              <p className="text-2xl font-bold text-green-600">
                {campaigns.filter(c => c.status === 'Ativa').length}
              </p>
            </div>
            <div className="text-2xl">🚀</div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Planejamento</p>
              <p className="text-2xl font-bold text-blue-600">
                {campaigns.filter(c => c.status === 'Planejamento').length}
              </p>
            </div>
            <div className="text-2xl">📋</div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Em Aprovação</p>
              <p className="text-2xl font-bold text-yellow-600">
                {campaigns.filter(c => c.status === 'Em Aprovação').length}
              </p>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign, index) => (
          <CampaignCard
            key={index}
            campaignTitle={campaign.campaignTitle}
            brief={campaign.brief}
            startDate={campaign.startDate}
            endDate={campaign.endDate}
            status={campaign.status}
            businessName={campaign.businessName}
          />
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-medium text-on-surface mb-2">
            Nenhuma campanha encontrada
          </h3>
          <p className="text-on-surface-variant mb-6">
            Configure o Google Sheets para ver os dados das campanhas.
          </p>
          <button className="btn-primary">
            <span className="mr-2">➕</span>
            Criar Primeira Campanha
          </button>
        </div>
      )}
    </div>
  );
}
