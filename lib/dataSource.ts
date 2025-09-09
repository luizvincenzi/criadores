// Configuração da fonte de dados - SUPABASE OU MOCK
// Sistema migrado completamente para Supabase, com suporte a modo demo

const dataSourceFromEnv = process.env.NEXT_PUBLIC_DATA_SOURCE || 'supabase';

export const DATA_SOURCE = {
  current: dataSourceFromEnv as 'supabase' | 'mock',

  apis: {
    supabase: {
      businesses: '/api/supabase/businesses',
      creators: '/api/supabase/creators',
      campaigns: '/api/client/campaigns', // 🔒 Usar API com filtro de segurança
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

// Helper para verificar se está usando Supabase
export function isUsingSupabase(): boolean {
  return DATA_SOURCE.current === 'supabase';
}

// Helper para verificar se está usando modo mock
export function isUsingMock(): boolean {
  return DATA_SOURCE.current === 'mock';
}

// Helper para verificar se está usando Google Sheets (sempre false agora)
export function isUsingSheets(): boolean {
  return false;
}

// Dados mock para demonstração
const mockBusinesses = [
  {
    id: '1',
    name: 'Loja Fashion Trends',
    businessName: 'Loja Fashion Trends',
    categoria: 'Moda',
    plano: 'Gold',
    responsavel: 'Ana Silva',
    whatsapp: '(11) 99999-1111',
    email: 'ana@fashiontrends.com',
    business_stage: 'Leads próprios quentes',
    estimated_value: 25000,
    priority: 'Alta',
    journeyStage: 'Reunião Briefing',
    value: 25000,
    description: 'Campanha de verão para roupas femininas'
  },
  {
    id: '2',
    name: 'Restaurante Sabor & Arte',
    businessName: 'Restaurante Sabor & Arte',
    categoria: 'Alimentação',
    plano: 'Silver',
    responsavel: 'Carlos Santos',
    whatsapp: '(11) 99999-2222',
    email: 'carlos@saborarte.com',
    business_stage: 'Enviando proposta',
    estimated_value: 15000,
    priority: 'Média',
    journeyStage: 'Agendamentos',
    value: 15000,
    description: 'Marketing digital para novo cardápio'
  },
  {
    id: '3',
    name: 'Academia FitLife',
    businessName: 'Academia FitLife',
    categoria: 'Fitness',
    plano: 'Diamond',
    responsavel: 'Maria Oliveira',
    whatsapp: '(11) 99999-3333',
    email: 'maria@fitlife.com',
    business_stage: 'Follow up',
    estimated_value: 35000,
    priority: 'Alta',
    journeyStage: 'Entrega Final',
    value: 35000,
    description: 'Campanha de ano novo fitness'
  }
];

// Função para buscar negócios
export async function fetchBusinesses() {
  if (isUsingMock()) {
    console.log('🎭 Usando dados mock para businesses');
    return mockBusinesses;
  }

  try {
    const response = await fetch(getApiUrl('businesses'));
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar negócios');
    }

    return data.data;
  } catch (error) {
    console.error('❌ Erro ao buscar negócios do Supabase:', error);
    // Fallback para dados mock em caso de erro
    console.log('🔄 Usando dados mock como fallback');
    return mockBusinesses;
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

// Função para buscar campanhas do Supabase com filtro de segurança
export async function fetchCampaigns() {
  try {
    let apiUrl = getApiUrl('campaigns');
    let businessId: string | null = null;
    let userRole: string | null = null;

    // Obter dados do usuário logado se disponível
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth-storage');
      if (userStr) {
        try {
          const authData = JSON.parse(userStr);
          const user = authData?.state?.user;
          businessId = user?.business_id;
          userRole = user?.role;

          console.log('👤 Usuário logado:', {
            role: userRole,
            businessId: businessId
          });
        } catch (e) {
          console.warn('⚠️ Erro ao obter dados do usuário:', e);
        }
      }
    }

    // Para business_owner, usar API específica com business_id
    if (userRole === 'business_owner' && businessId) {
      apiUrl = `/api/campaigns-by-business?business_id=${businessId}`;
      console.log('🏢 Business owner detectado - usando API específica:', apiUrl);
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Erro na API de campanhas:', data.error);
      throw new Error(data.error || 'Erro ao buscar campanhas');
    }

    console.log(`✅ ${data.data.length} campanhas carregadas`);
    if (data.business) {
      console.log(`🏢 Empresa: ${data.business.name}`);
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
