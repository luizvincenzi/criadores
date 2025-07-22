import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Buscar dados de relatórios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'last6months';

    console.log(`📊 Gerando relatórios para período: ${period} (Supabase apenas)`);

    // Usar apenas Supabase agora
    const reportData = await generateSupabaseReports(period);

    console.log('✅ Relatórios gerados com sucesso');

    return NextResponse.json({
      success: true,
      data: reportData,
      source: 'supabase',
      period,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao gerar relatórios:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Gerar relatórios do Supabase
async function generateSupabaseReports(period: string) {
  console.log('📊 Gerando relatórios do Supabase...');

  try {
    // Buscar dados básicos com joins para informações completas
    const [businessesResult, creatorsResult, campaignsResult, campaignCreatorsResult] = await Promise.all([
      supabase.from('businesses').select(`
        id,
        name,
        status,
        business_stage,
        estimated_value,
        contract_creators_count,
        owner_user_id,
        priority,
        custom_fields,
        contact_info,
        address,
        created_at,
        updated_at
      `),
      supabase.from('creators').select('*'),
      supabase.from('campaigns').select(`
        *,
        business:businesses(name, category_id),
        campaign_creators(creator_id, creators(nome, cidade, seguidores_instagram))
      `),
      supabase.from('campaign_creators').select(`
        *,
        creator:creators(nome, cidade, seguidores_instagram),
        campaign:campaigns(month, status, created_at)
      `)
    ]);

    const businesses = businessesResult.data || [];
    const creators = creatorsResult.data || [];
    const campaigns = campaignsResult.data || [];
    const campaignCreators = campaignCreatorsResult.data || [];

    console.log('📊 Dados brutos do Supabase:', {
      businesses: businesses.length,
      creators: creators.length,
      campaigns: campaigns.length,
      campaignCreators: campaignCreators.length
    });

    // Calcular estatísticas
    const totalBusinesses = businesses.length;
    const totalCreators = creators.length;
    const totalCampaigns = campaigns.length;

    // Status dos criadores (normalizar status)
    const creatorsByStatus = creators.reduce((acc: any, creator) => {
      let status = creator.status || creator.situacao || 'Não definido';

      // Normalizar status para os valores padrão
      if (status.toLowerCase().includes('ativo')) {
        status = 'Ativo';
      } else if (status.toLowerCase().includes('engajar') || status.toLowerCase().includes('precisa')) {
        status = 'Precisa engajar';
      } else if (status.toLowerCase().includes('não') && status.toLowerCase().includes('parceiro')) {
        status = 'Não parceiro';
      }

      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const creatorStatusArray = Object.entries(creatorsByStatus)
      .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
      .map(([status, count]: [string, any]) => ({
        status,
        count,
        percentage: totalCreators > 0 ? Math.round((count / totalCreators) * 100) : 0
      }));

    // Status das campanhas (normalizar status)
    const campaignsByStatus = campaigns.reduce((acc: any, campaign) => {
      let status = campaign.status || 'Reunião de briefing';

      // Normalizar status para os valores padrão
      if (status.toLowerCase().includes('briefing') || status.toLowerCase().includes('reunião')) {
        status = 'Reunião de briefing';
      } else if (status.toLowerCase().includes('agendamento')) {
        status = 'Agendamentos';
      } else if (status.toLowerCase().includes('entrega') && status.toLowerCase().includes('final')) {
        status = 'Entrega final';
      } else if (status.toLowerCase().includes('finalizado') || status.toLowerCase().includes('finalizada')) {
        status = 'Finalizado';
      }

      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const campaignStatusArray = Object.entries(campaignsByStatus)
      .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
      .map(([status, count]: [string, any]) => ({
        status,
        count,
        percentage: totalCampaigns > 0 ? Math.round((count / totalCampaigns) * 100) : 0
      }));

    // Campanhas ativas (não finalizadas)
    const activeCampaigns = campaigns.filter(c => 
      c.status !== 'Finalizado' && c.status !== 'FINALIZADA'
    ).length;

    const completedCampaigns = campaigns.filter(c => 
      c.status === 'Finalizado' || c.status === 'FINALIZADA'
    ).length;

    // Estatísticas mensais reais baseadas nas campanhas
    const monthlyStats = generateRealMonthlyStats(campaigns, period);

    // Top criadores baseado em número real de campanhas
    const creatorCampaignCount = campaignCreators.reduce((acc: any, cc) => {
      const creatorName = cc.creator?.nome || 'Nome não disponível';
      acc[creatorName] = (acc[creatorName] || 0) + 1;
      return acc;
    }, {});

    const topCreators = Object.entries(creatorCampaignCount)
      .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
      .slice(0, 5)
      .map(([name, campaignCount]: [string, any]) => {
        const creator = creators.find(c => c.nome === name);
        return {
          name,
          campaigns: campaignCount,
          followers: parseInt(creator?.seguidores_instagram) || 0,
          city: creator?.cidade || 'Cidade não informada'
        };
      });

    // Categorias de negócios reais
    const businessCategories = businesses.reduce((acc: any, business) => {
      const category = business.business_categories?.name ||
                     business.categoria ||
                     business.category ||
                     'Outros';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const businessCategoryArray = Object.entries(businessCategories)
      .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
      .map(([category, count]: [string, any]) => ({
        category,
        count,
        percentage: totalBusinesses > 0 ? Math.round((count / totalBusinesses) * 100) : 0
      }));

    const reportData = {
      totalBusinesses,
      totalCreators,
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      monthlyStats,
      creatorsByStatus: creatorStatusArray,
      campaignsByStatus: campaignStatusArray,
      topCreators,
      businessCategories: businessCategoryArray
    };

    console.log('📈 Relatório gerado:', {
      totalBusinesses,
      totalCreators,
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      creatorStatusCount: creatorStatusArray.length,
      campaignStatusCount: campaignStatusArray.length,
      topCreatorsCount: topCreators.length,
      businessCategoriesCount: businessCategoryArray.length
    });

    return reportData;

  } catch (error) {
    console.error('❌ Erro ao gerar relatórios do Supabase:', error);
    throw error;
  }
}

// Função removida - sistema agora usa apenas Supabase

// Gerar estatísticas mensais reais baseadas nas campanhas
function generateRealMonthlyStats(campaigns: any[], period: string) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentDate = new Date();

  let monthCount = 6; // padrão para últimos 6 meses

  switch (period) {
    case 'last30days':
      monthCount = 1;
      break;
    case 'last3months':
      monthCount = 3;
      break;
    case 'last6months':
      monthCount = 6;
      break;
    case 'lastyear':
      monthCount = 12;
      break;
  }

  // Agrupar campanhas por mês
  const campaignsByMonth = campaigns.reduce((acc: any, campaign) => {
    const campaignDate = new Date(campaign.created_at || campaign.start_date || Date.now());
    const monthKey = `${campaignDate.getFullYear()}-${campaignDate.getMonth()}`;

    if (!acc[monthKey]) {
      acc[monthKey] = {
        campaigns: 0,
        creators: new Set(),
        month: months[campaignDate.getMonth()]
      };
    }

    acc[monthKey].campaigns++;

    // Contar criadores únicos por mês (se houver dados de campaign_creators)
    if (campaign.campaign_creators) {
      campaign.campaign_creators.forEach((cc: any) => {
        if (cc.creators?.nome) {
          acc[monthKey].creators.add(cc.creators.nome);
        }
      });
    }

    return acc;
  }, {});

  // Gerar estatísticas para os últimos N meses
  const stats = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthKey = `${targetDate.getFullYear()}-${targetDate.getMonth()}`;
    const monthData = campaignsByMonth[monthKey];

    stats.push({
      month: months[targetDate.getMonth()],
      campaigns: monthData?.campaigns || 0,
      revenue: (monthData?.campaigns || 0) * 2500, // R$ 2.500 por campanha (estimativa)
      creators: monthData?.creators.size || 0
    });
  }

  return stats;
}
