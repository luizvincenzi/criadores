import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/campaigns-by-business
 * Buscar campanhas filtradas por business_id do usuário logado
 * 
 * Query params:
 * - business_id: ID da empresa (obrigatório)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    console.log('📊 [CAMPAIGNS BY BUSINESS] Buscando campanhas para business:', businessId);

    if (!businessId) {
      return NextResponse.json({
        success: false,
        error: 'Business ID é obrigatório'
      }, { status: 400 });
    }

    // Validar se o business existe
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, is_active')
      .eq('id', businessId)
      .eq('organization_id', DEFAULT_ORG_ID);

    console.log('🔍 [CAMPAIGNS BY BUSINESS] Businesses encontrados:', businesses?.length);

    if (businessError) {
      console.error('❌ [CAMPAIGNS BY BUSINESS] Erro na query:', businessError);
      return NextResponse.json({
        success: false,
        error: `Erro na consulta: ${businessError.message}`
      }, { status: 500 });
    }

    if (!businesses || businesses.length === 0) {
      console.error('❌ [CAMPAIGNS BY BUSINESS] Business não encontrado:', businessId);
      return NextResponse.json({
        success: false,
        error: 'Empresa não encontrada'
      }, { status: 404 });
    }

    if (businesses.length > 1) {
      console.warn('⚠️ [CAMPAIGNS BY BUSINESS] Múltiplas empresas encontradas:', businesses.length);
    }

    const business = businesses[0];

    if (!business.is_active) {
      console.error('❌ [CAMPAIGNS BY BUSINESS] Business inativo:', businessId);
      return NextResponse.json({
        success: false,
        error: 'Empresa inativa'
      }, { status: 403 });
    }

    // Buscar campanhas da empresa
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        description,
        month,
        month_year_id,
        status,
        budget,
        spent_amount,
        start_date,
        end_date,
        objectives,
        deliverables,
        briefing_details,
        results,
        created_at,
        updated_at,
        business_id,
        organization_id
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('❌ [CAMPAIGNS BY BUSINESS] Erro ao buscar campanhas:', campaignsError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar campanhas'
      }, { status: 500 });
    }

    // Buscar criadores das campanhas
    const campaignIds = campaigns.map(c => c.id);
    let creatorsData = [];

    if (campaignIds.length > 0) {
      const { data: campaignCreators } = await supabase
        .from('campaign_creators')
        .select(`
          campaign_id,
          creator_id,
          role,
          status,
          creators:creator_id (
            id,
            name,
            contact_info,
            social_media
          )
        `)
        .in('campaign_id', campaignIds);

      creatorsData = campaignCreators || [];
    }

    // Enriquecer campanhas com dados dos criadores
    const enrichedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      // Manter compatibilidade com interface existente
      name: campaign.title,
      businessName: business.name,
      businessId: campaign.business_id,
      campaign_date: campaign.start_date,
      totalCreators: creatorsData.filter(cc => cc.campaign_id === campaign.id).length,
      criadores: creatorsData
        .filter(cc => cc.campaign_id === campaign.id)
        .map(cc => cc.creators?.name || 'Nome não disponível'),
      creators: creatorsData
        .filter(cc => cc.campaign_id === campaign.id)
        .map(cc => ({
          id: cc.creator_id,
          name: cc.creators?.name || 'Nome não disponível',
          role: cc.role,
          status: cc.status,
          contact_info: cc.creators?.contact_info,
          social_media: cc.creators?.social_media
        })),
      // Dados mock para compatibilidade (podem ser calculados depois)
      totalVisualizacoes: 0,
      totalEngagement: 0,
      totalReach: 0,
      roi: 0
    }));

    console.log(`✅ [CAMPAIGNS BY BUSINESS] ${enrichedCampaigns.length} campanhas encontradas para ${business.name}`);

    return NextResponse.json({
      success: true,
      data: enrichedCampaigns,
      count: enrichedCampaigns.length,
      business: {
        id: business.id,
        name: business.name,
        is_active: business.is_active
      },
      filters: {
        organization_id: DEFAULT_ORG_ID,
        business_id: businessId
      }
    });

  } catch (error) {
    console.error('❌ [CAMPAIGNS BY BUSINESS] Erro interno:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
