// Configuração da fonte de dados - APENAS SUPABASE
// Sistema migrado completamente para Supabase

export const DATA_SOURCE = {
  current: 'supabase' as const,
  
  apis: {
    supabase: {
      businesses: '/api/supabase/businesses',
      creators: '/api/supabase/creators',
      campaigns: '/api/supabase/campaigns',
      creatorSlots: '/api/supabase/creator-slots',
      addCampaignCreator: '/api/supabase/campaign-creators/add',
      changeCampaignCreator: '/api/supabase/campaign-creators/change',
      removeCampaignCreator: '/api/supabase/campaign-creators/remove'
    }
  }
};

// Helper para obter URL da API
export function getApiUrl(endpoint: keyof typeof DATA_SOURCE.apis.supabase): string {
  const relativeUrl = DATA_SOURCE.apis.supabase[endpoint];

  // Se estamos no servidor (Node.js), usar URL absoluta
  const isServer = typeof window === 'undefined';
  if (isServer) {
    return `http://localhost:3001${relativeUrl}`;
  }

  return relativeUrl;
}

// Helper para verificar se está usando Supabase (sempre true agora)
export function isUsingSupabase(): boolean {
  return true;
}

// Helper para verificar se está usando Google Sheets (sempre false agora)
export function isUsingSheets(): boolean {
  return false;
}

// Função para buscar negócios do Supabase
export async function fetchBusinesses() {
  try {
    const response = await fetch(getApiUrl('businesses'));
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar negócios');
    }
    
    return data.data;
  } catch (error) {
    console.error('❌ Erro ao buscar negócios do Supabase:', error);
    throw error;
  }
}

// Função para buscar criadores do Supabase
export async function fetchCreators() {
  try {
    const response = await fetch(getApiUrl('creators'));
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar criadores');
    }
    
    return data.data;
  } catch (error) {
    console.error('❌ Erro ao buscar criadores do Supabase:', error);
    throw error;
  }
}

// Função para buscar campanhas do Supabase
export async function fetchCampaigns() {
  try {
    const response = await fetch(getApiUrl('campaigns'));
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar campanhas');
    }
    
    return data.data;
  } catch (error) {
    console.error('❌ Erro ao buscar campanhas do Supabase:', error);
    throw error;
  }
}

// Função para buscar jornada de campanhas do Supabase
export async function fetchCampaignJourney() {
  try {
    const campaigns = await fetchCampaigns();
    const businesses = await fetchBusinesses();

    // Transformar dados para formato de jornada
    return transformCampaignsToJourney(campaigns, businesses);
  } catch (error) {
    console.error('❌ Erro ao buscar jornada de campanhas do Supabase:', error);
    throw error;
  }
}

// Função auxiliar para transformar campanhas em formato de jornada
function transformCampaignsToJourney(campaigns: any[], businesses: any[]) {
  console.log('🔄 Transformando campanhas para jornada:', {
    totalCampaigns: campaigns.length,
    totalBusinesses: businesses.length
  });

  const businessMap = new Map(businesses.map(b => [b.id, b]));

  // Agrupar campanhas por business e mês
  const journeyMap = new Map();

  campaigns.forEach(campaign => {
    // Buscar business pelos dados que vêm da API
    const business = businessMap.get(campaign.businessId);
    if (!business) {
      console.log(`⚠️ Business não encontrado para campanha ${campaign.nome}:`, {
        campaignBusinessId: campaign.businessId,
        campaignBusinessName: campaign.businessName
      });
      return;
    }

    const key = `${campaign.businessName}-${campaign.mes}`;

    if (!journeyMap.has(key)) {
      journeyMap.set(key, {
        id: `journey_${campaign.id}`,
        businessName: campaign.businessName,
        businessId: campaign.businessId,
        mes: campaign.mes,
        journeyStage: campaign.status || 'Reunião de briefing',
        totalCampanhas: 0,
        quantidadeCriadores: campaign.totalCriadores || 0,
        criadores: campaign.criadores || [],
        campanhas: []
      });
    }

    const journeyItem = journeyMap.get(key);
    journeyItem.campanhas.push(campaign);
    journeyItem.totalCampanhas = journeyItem.campanhas.length;
  });

  const result = Array.from(journeyMap.values());
  console.log(`✅ ${result.length} itens de jornada criados:`, result.map(r => ({
    businessName: r.businessName,
    mes: r.mes,
    journeyStage: r.journeyStage,
    totalCampanhas: r.totalCampanhas
  })));

  return result;
}

export default {
  fetchBusinesses,
  fetchCreators,
  fetchCampaigns,
  fetchCampaignJourney,
  isUsingSupabase,
  isUsingSheets,
  getApiUrl
};
