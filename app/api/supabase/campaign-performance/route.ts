import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/supabase/campaign-performance
 * Buscar dados de performance de todas as campanhas para dashboard
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Buscando dados de performance das campanhas...');

    // Buscar campanhas com dados de performance
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        month,
        status,
        results,
        business:businesses(
          id,
          name
        ),
        campaign_creators(
          id,
          performance_data
        )
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return NextResponse.json({
        success: false,
        error: `Erro ao buscar campanhas: ${campaignsError.message}`
      }, { status: 500 });
    }

    console.log(`📋 Encontradas ${campaigns?.length || 0} campanhas`);

    // Processar dados de performance
    const performanceData = campaigns?.map(campaign => {
      // Somar performance de todos os criadores da campanha
      let totalImpressions = 0;
      let totalReach = 0;
      let totalEngagement = 0;
      let totalClicks = 0;
      let totalShares = 0;
      let totalSaves = 0;

      campaign.campaign_creators?.forEach(creator => {
        if (creator.performance_data) {
          totalImpressions += creator.performance_data.impressions || 0;
          totalReach += creator.performance_data.reach || 0;
          totalEngagement += creator.performance_data.engagement || 0;
          totalClicks += creator.performance_data.clicks || 0;
          totalShares += creator.performance_data.shares || 0;
          totalSaves += creator.performance_data.saves || 0;
        }
      });

      // Calcular visualizações totais (impressions + reach)
      const totalViews = totalImpressions + totalReach;

      return {
        id: campaign.id,
        title: campaign.title,
        month: campaign.month,
        status: campaign.status,
        business_name: campaign.business?.name || 'N/A',
        performance_data: {
          impressions: totalImpressions,
          reach: totalReach,
          engagement: totalEngagement,
          clicks: totalClicks,
          shares: totalShares,
          saves: totalSaves,
          total_views: totalViews
        },
        creators_count: campaign.campaign_creators?.length || 0
      };
    }) || [];

    // Calcular estatísticas gerais
    const totalViews = performanceData.reduce((sum, campaign) => 
      sum + (campaign.performance_data.total_views || 0), 0
    );

    const totalImpressions = performanceData.reduce((sum, campaign) => 
      sum + (campaign.performance_data.impressions || 0), 0
    );

    const totalReach = performanceData.reduce((sum, campaign) => 
      sum + (campaign.performance_data.reach || 0), 0
    );

    const totalEngagement = performanceData.reduce((sum, campaign) => 
      sum + (campaign.performance_data.engagement || 0), 0
    );

    // Ordenar por visualizações para ranking
    const topCampaigns = performanceData
      .filter(campaign => campaign.performance_data.total_views > 0)
      .sort((a, b) => b.performance_data.total_views - a.performance_data.total_views)
      .slice(0, 10); // Top 10

    console.log('📊 Estatísticas de performance calculadas:', {
      totalCampaigns: performanceData.length,
      totalViews,
      totalImpressions,
      totalReach,
      totalEngagement,
      topCampaignsCount: topCampaigns.length
    });

    return NextResponse.json({
      success: true,
      data: performanceData,
      summary: {
        total_campaigns: performanceData.length,
        total_views: totalViews,
        total_impressions: totalImpressions,
        total_reach: totalReach,
        total_engagement: totalEngagement,
        top_campaigns: topCampaigns
      }
    });

  } catch (error) {
    console.error('❌ Erro na API de performance:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
