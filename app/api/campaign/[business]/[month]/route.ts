import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCampaignBySeoUrl } from '@/lib/campaign-url-system';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ business: string; month: string }> }
) {
  try {
    const resolvedParams = await params;
    const businessSlug = decodeURIComponent(resolvedParams.business);
    const monthSlug = decodeURIComponent(resolvedParams.month);

    console.log('🚀 [HYBRID SYSTEM] Processando URL SEO-friendly:', { businessSlug, monthSlug });

    // Construir URL SEO completa no formato premium
    // Converter monthSlug (202507) para formato mes-ano (jul-2025)
    const year = Math.floor(parseInt(monthSlug) / 100);
    const month = parseInt(monthSlug) % 100;
    const monthNames = ['', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const monthName = monthNames[month] || 'jan';

    const seoUrl = `/campaign/${businessSlug}-${monthName}-${year}`;
    console.log('🔗 [HYBRID SYSTEM] URL SEO construída:', seoUrl);

    // ETAPA 1: Buscar campanha usando sistema híbrido (SEO URL → UUIDs)
    const campaignData = await getCampaignBySeoUrl(seoUrl);

    if (!campaignData) {
      console.log('❌ [HYBRID SYSTEM] Campanha não encontrada para URL:', seoUrl);

      // Tentar busca de fallback para debug
      console.log('🔍 [FALLBACK] Tentando busca de fallback...');

      return NextResponse.json({
        success: false,
        error: `Campanha não encontrada`,
        debug: {
          seoUrl,
          businessSlug,
          monthSlug,
          message: 'Verifique se a URL está correta. Formato esperado: /campaign/nome-empresa-mes-ano'
        }
      }, { status: 404 });
    }

    console.log('✅ [HYBRID SYSTEM] Campanha encontrada via UUIDs:', {
      campaignId: campaignData.campaignId,
      businessId: campaignData.businessId,
      businessName: campaignData.businessName,
      monthYearId: campaignData.monthYearId
    });

    // ETAPA 2: Buscar criadores da campanha usando UUID da campanha
    console.log('🔍 [HYBRID SYSTEM] Buscando criadores para campanha:', campaignData.campaignId);

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
      console.error('❌ [ERRO] Erro ao buscar criadores:', creatorsError);
      return NextResponse.json({
        success: false,
        error: 'Erro interno ao buscar criadores'
      }, { status: 500 });
    }

    // Filtrar criadores válidos (não vazios) com dados completos
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

    console.log('✅ [ETAPA 5] Criadores válidos encontrados:', validCreators.length);

    // ETAPA 3: Montar resposta final com dados do sistema híbrido
    const landingPageData = {
      campaign: {
        id: campaignData.campaignId,
        title: campaignData.campaignTitle,
        month_year_id: campaignData.monthYearId,
        seo_url: campaignData.seoUrl
      },
      business: {
        id: campaignData.businessId,
        name: campaignData.businessName
      },
      creators: validCreators,
      stats: {
        totalCreators: validCreators.length,
        confirmedCreators: validCreators.filter(c => c.campaign_data.deliverables?.visit_confirmed === 'Confirmada').length,
        completedBriefings: validCreators.filter(c => c.campaign_data.deliverables?.briefing_complete === 'Sim').length,
        approvedVideos: validCreators.filter(c => c.campaign_data.deliverables?.video_approved === 'Aprovado').length,
        postedVideos: validCreators.filter(c => c.campaign_data.deliverables?.video_posted === 'Postado').length
      }
    };

    console.log('✅ [HYBRID SYSTEM] Landing page montada com sucesso:', {
      campaignId: landingPageData.campaign.id,
      campaign: landingPageData.campaign.title,
      businessId: landingPageData.business.id,
      business: landingPageData.business.name,
      creators: landingPageData.creators.length,
      monthYearId: landingPageData.campaign.month_year_id,
      seoUrl: landingPageData.campaign.seo_url
    });

    return NextResponse.json({
      success: true,
      data: landingPageData
    });

  } catch (error) {
    console.error('❌ [ERRO GERAL] Erro na API de landing page atômica:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
