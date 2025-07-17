import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCampaignBySeoUrl } from '@/lib/campaign-url-system';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seoUrl = searchParams.get('url');

    if (!seoUrl) {
      return NextResponse.json({
        success: false,
        error: 'URL SEO é obrigatória'
      }, { status: 400 });
    }

    console.log('🚀 [SEO API] Processando URL:', seoUrl);

    // ETAPA 1: Buscar campanha usando sistema híbrido
    const campaignData = await getCampaignBySeoUrl(seoUrl);

    if (!campaignData) {
      console.log('❌ [SEO API] Campanha não encontrada para URL:', seoUrl);
      return NextResponse.json({
        success: false,
        error: 'Campanha não encontrada',
        debug: { seoUrl }
      }, { status: 404 });
    }

    console.log('✅ [SEO API] Campanha encontrada:', {
      campaignId: campaignData.campaignId,
      businessName: campaignData.businessName,
      campaignTitle: campaignData.campaignTitle
    });

    // ETAPA 2: Buscar criadores da campanha
    const { data: campaignCreators, error: creatorsError } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        role,
        status,
        fee,
        payment_status,
        deliverables,
        performance_data,
        video_instagram_link,
        video_tiktok_link,
        assigned_at,
        creators!inner(
          id,
          name,
          status,
          social_media,
          contact_info,
          profile_info
        )
      `)
      .eq('campaign_id', campaignData.campaignId)
      .neq('status', 'Removido')
      .eq('organization_id', DEFAULT_ORG_ID)
      .order('assigned_at', { ascending: true });

    if (creatorsError) {
      console.error('❌ [SEO API] Erro ao buscar criadores:', creatorsError);
      return NextResponse.json({
        success: false,
        error: 'Erro interno ao buscar criadores'
      }, { status: 500 });
    }

    // ETAPA 3: Processar criadores
    const validCreators = (campaignCreators || [])
      .filter(cc => cc.creators && cc.creators.name && cc.creators.name !== '[SLOT VAZIO]')
      .map(cc => ({
        id: cc.creators.id,
        name: cc.creators.name,
        instagram_handle: cc.creators.social_media?.instagram?.username || '',
        followers_count: cc.creators.social_media?.instagram?.followers || 0,
        city: cc.creators.profile_info?.location?.city || '',
        status: cc.creators.status,
        social_media: cc.creators.social_media || {},
        contact_info: cc.creators.contact_info || {},
        profile_info: cc.creators.profile_info || {},
        campaign_data: {
          role: cc.role,
          status: cc.status,
          fee: cc.fee,
          payment_status: cc.payment_status,
          deliverables: cc.deliverables || {},
          performance_data: cc.performance_data || {},
          video_instagram_link: cc.video_instagram_link,
          video_tiktok_link: cc.video_tiktok_link,
          assigned_at: cc.assigned_at
        }
      }));

    console.log('✅ [SEO API] Criadores processados:', validCreators.length);

    // ETAPA 4: Buscar dados completos da campanha incluindo briefing_details
    const { data: fullCampaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        description,
        month,
        status,
        budget,
        start_date,
        end_date,
        objectives,
        deliverables,
        briefing_details,
        created_at,
        business:businesses(
          id,
          name,
          contact_info,
          address
        )
      `)
      .eq('id', campaignData.campaignId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (campaignError) {
      console.error('❌ [SEO API] Erro ao buscar dados completos da campanha:', campaignError);
      return NextResponse.json({
        success: false,
        error: 'Erro interno ao buscar dados da campanha'
      }, { status: 500 });
    }

    // ETAPA 5: Montar resposta final com dados de briefing
    const landingPageData = {
      campaign: {
        id: campaignData.campaignId,
        title: campaignData.campaignTitle,
        description: fullCampaignData.description,
        month_year_id: campaignData.monthYearId,
        month: fullCampaignData.month,
        status: fullCampaignData.status,
        budget: fullCampaignData.budget,
        start_date: fullCampaignData.start_date,
        end_date: fullCampaignData.end_date,
        objectives: fullCampaignData.objectives,
        deliverables: fullCampaignData.deliverables,
        briefing_details: fullCampaignData.briefing_details,
        created_at: fullCampaignData.created_at,
        seo_url: campaignData.seoUrl
      },
      business: {
        id: campaignData.businessId,
        name: campaignData.businessName,
        contact_info: fullCampaignData.business?.contact_info,
        address: fullCampaignData.business?.address
      },
      stats: {
        totalCreators: validCreators.length,
        confirmedCreators: validCreators.filter(c => c.campaign_data.deliverables?.visit_confirmed === 'Confirmada').length,
        completedBriefings: validCreators.filter(c => c.campaign_data.deliverables?.briefing_complete === 'Sim').length,
        approvedVideos: validCreators.filter(c => c.campaign_data.deliverables?.video_approved === 'Aprovado').length,
        postedVideos: validCreators.filter(c => c.campaign_data.deliverables?.video_posted === 'Postado').length
      },
      metadata: {
        system: 'hybrid_seo_system',
        generated_at: new Date().toISOString(),
        seo_url: seoUrl,
        campaign_id: campaignData.campaignId,
        business_id: campaignData.businessId
      }
    };

    console.log('✅ [SEO API] Resposta montada com sucesso:', {
      campaignId: landingPageData.campaign.id,
      businessName: landingPageData.business.name,
      creatorsCount: landingPageData.stats?.totalCreators || 0,
      seoUrl: landingPageData.campaign.seo_url
    });

    return NextResponse.json({
      success: true,
      data: landingPageData
    });

  } catch (error) {
    console.error('❌ [SEO API] Erro geral:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
