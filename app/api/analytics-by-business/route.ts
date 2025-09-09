import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/analytics-by-business
 * Buscar analytics filtrados por business_id do usuário logado
 * 
 * Query params:
 * - business_id: ID da empresa (obrigatório)
 * - period: Período de análise (last30days, last3months, last6months, lastyear)
 * - metrics: Métricas específicas (campaigns,creators,engagement,roi)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const period = searchParams.get('period') || 'last3months';
    const metrics = searchParams.get('metrics')?.split(',') || ['campaigns', 'creators', 'engagement', 'roi'];

    console.log('📊 [ANALYTICS BY BUSINESS] Buscando analytics para business:', businessId);

    if (!businessId) {
      return NextResponse.json({
        success: false,
        error: 'Business ID é obrigatório'
      }, { status: 400 });
    }

    // Validar se o business existe
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, is_active, created_at')
      .eq('id', businessId)
      .eq('organization_id', DEFAULT_ORG_ID);

    if (businessError) {
      console.error('❌ [ANALYTICS BY BUSINESS] Erro ao validar business:', businessError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao validar empresa'
      }, { status: 500 });
    }

    if (!businesses || businesses.length === 0) {
      console.error('❌ [ANALYTICS BY BUSINESS] Business não encontrado:', businessId);
      return NextResponse.json({
        success: false,
        error: 'Empresa não encontrada'
      }, { status: 404 });
    }

    const business = businesses[0];

    if (!business.is_active) {
      console.error('❌ [ANALYTICS BY BUSINESS] Business inativo:', businessId);
      return NextResponse.json({
        success: false,
        error: 'Empresa inativa'
      }, { status: 403 });
    }

    // Calcular data de início baseada no período
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'last30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'last3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'last6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'lastyear':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 3);
    }

    console.log('📅 [ANALYTICS BY BUSINESS] Período:', {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Buscar dados base para analytics
    const [campaignsResult, campaignCreatorsResult, leadsResult] = await Promise.all([
      // Campanhas da empresa no período
      supabase
        .from('campaigns')
        .select(`
          id,
          title,
          status,
          budget,
          spent_amount,
          start_date,
          end_date,
          created_at,
          results
        `)
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('business_id', businessId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),

      // Criadores das campanhas
      supabase
        .from('campaign_creators')
        .select(`
          campaign_id,
          creator_id,
          fee,
          status,
          deliverables,
          campaigns!inner(business_id),
          creators(name, social_media)
        `)
        .eq('campaigns.business_id', businessId),

      // Leads da empresa no período
      supabase
        .from('leads')
        .select('id, status, source, created_at')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('business_id', businessId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
    ]);

    const campaigns = campaignsResult.data || [];
    const campaignCreators = campaignCreatorsResult.data || [];
    const leads = leadsResult.data || [];

    // Calcular métricas
    const analytics = {
      business: {
        id: business.id,
        name: business.name,
        member_since: business.created_at
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        label: period
      },
      campaigns: {
        total: campaigns.length,
        active: campaigns.filter(c => c.status !== 'Finalizado').length,
        completed: campaigns.filter(c => c.status === 'Finalizado').length,
        total_budget: campaigns.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0),
        total_spent: campaigns.reduce((sum, c) => sum + (parseFloat(c.spent_amount) || 0), 0),
        by_status: campaigns.reduce((acc: any, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {}),
        monthly_distribution: generateMonthlyDistribution(campaigns, startDate, endDate)
      },
      creators: {
        total_unique: new Set(campaignCreators.map(cc => cc.creator_id)).size,
        total_collaborations: campaignCreators.length,
        average_fee: campaignCreators.length > 0 
          ? campaignCreators.reduce((sum, cc) => sum + (parseFloat(cc.fee) || 0), 0) / campaignCreators.length
          : 0,
        top_creators: getTopCreators(campaignCreators),
        by_status: campaignCreators.reduce((acc: any, cc) => {
          acc[cc.status] = (acc[cc.status] || 0) + 1;
          return acc;
        }, {})
      },
      leads: {
        total: leads.length,
        by_status: leads.reduce((acc: any, l) => {
          acc[l.status] = (acc[l.status] || 0) + 1;
          return acc;
        }, {}),
        by_source: leads.reduce((acc: any, l) => {
          acc[l.source] = (acc[l.source] || 0) + 1;
          return acc;
        }, {}),
        conversion_rate: leads.length > 0 
          ? (leads.filter(l => l.status === 'converted').length / leads.length) * 100
          : 0
      },
      engagement: {
        // Métricas de engajamento baseadas nos resultados das campanhas
        total_views: campaigns.reduce((sum, c) => {
          const results = c.results || {};
          return sum + (parseInt(results.views) || 0);
        }, 0),
        total_likes: campaigns.reduce((sum, c) => {
          const results = c.results || {};
          return sum + (parseInt(results.likes) || 0);
        }, 0),
        total_comments: campaigns.reduce((sum, c) => {
          const results = c.results || {};
          return sum + (parseInt(results.comments) || 0);
        }, 0),
        average_engagement_rate: calculateAverageEngagementRate(campaigns)
      },
      roi: {
        total_investment: campaigns.reduce((sum, c) => sum + (parseFloat(c.spent_amount) || 0), 0),
        estimated_return: campaigns.reduce((sum, c) => {
          const results = c.results || {};
          const views = parseInt(results.views) || 0;
          return sum + (views * 0.01); // R$ 0,01 por visualização (estimativa)
        }, 0),
        roi_percentage: 0 // Será calculado abaixo
      }
    };

    // Calcular ROI percentage
    if (analytics.roi.total_investment > 0) {
      analytics.roi.roi_percentage = 
        ((analytics.roi.estimated_return - analytics.roi.total_investment) / analytics.roi.total_investment) * 100;
    }

    console.log(`✅ [ANALYTICS BY BUSINESS] Analytics gerados para ${business.name}:`, {
      campaigns: analytics.campaigns.total,
      creators: analytics.creators.total_unique,
      leads: analytics.leads.total,
      period: period
    });

    return NextResponse.json({
      success: true,
      data: analytics,
      filters: {
        organization_id: DEFAULT_ORG_ID,
        business_id: businessId,
        period: period,
        metrics: metrics
      },
      security: {
        filtered_by: 'business_id',
        access_level: 'business_isolated'
      }
    });

  } catch (error) {
    console.error('❌ [ANALYTICS BY BUSINESS] Erro interno:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Funções auxiliares
function generateMonthlyDistribution(campaigns: any[], startDate: Date, endDate: Date) {
  const months: any = {};
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    months[monthKey] = 0;
    current.setMonth(current.getMonth() + 1);
  }
  
  campaigns.forEach(campaign => {
    const date = new Date(campaign.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (months.hasOwnProperty(monthKey)) {
      months[monthKey]++;
    }
  });
  
  return months;
}

function getTopCreators(campaignCreators: any[]) {
  const creatorStats: any = {};
  
  campaignCreators.forEach(cc => {
    const creatorId = cc.creator_id;
    if (!creatorStats[creatorId]) {
      creatorStats[creatorId] = {
        id: creatorId,
        name: cc.creators?.name || 'Nome não disponível',
        campaigns: 0,
        total_fee: 0
      };
    }
    creatorStats[creatorId].campaigns++;
    creatorStats[creatorId].total_fee += parseFloat(cc.fee) || 0;
  });
  
  return Object.values(creatorStats)
    .sort((a: any, b: any) => b.campaigns - a.campaigns)
    .slice(0, 5);
}

function calculateAverageEngagementRate(campaigns: any[]) {
  const campaignsWithResults = campaigns.filter(c => c.results && c.results.views);
  
  if (campaignsWithResults.length === 0) return 0;
  
  const totalEngagementRate = campaignsWithResults.reduce((sum, c) => {
    const results = c.results;
    const views = parseInt(results.views) || 0;
    const likes = parseInt(results.likes) || 0;
    const comments = parseInt(results.comments) || 0;
    
    if (views === 0) return sum;
    
    const engagementRate = ((likes + comments) / views) * 100;
    return sum + engagementRate;
  }, 0);
  
  return totalEngagementRate / campaignsWithResults.length;
}
