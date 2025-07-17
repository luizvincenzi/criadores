import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { business: string; month: string } }
) {
  try {
    const businessSlug = decodeURIComponent(params.business);
    const monthSlug = decodeURIComponent(params.month);

    console.log('🔍 Buscando campanha:', { businessSlug, monthSlug });

    // Converter slug do business de volta para nome
    const businessName = businessSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Converter month slug para formato do banco
    const monthYear = monthSlug.replace(/(\d{4})(\d{2})/, '$1$2');

    console.log('🔍 Buscando por:', { businessName, monthYear });

    // Buscar business
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .ilike('name', `%${businessName}%`)
      .eq('organization_id', '00000000-0000-0000-0000-000000000001');

    if (businessError) {
      console.error('❌ Erro ao buscar business:', businessError);
      return NextResponse.json({ success: false, error: 'Erro ao buscar empresa' }, { status: 500 });
    }

    if (!businesses || businesses.length === 0) {
      console.log('❌ Business não encontrado:', businessName);
      return NextResponse.json({ success: false, error: 'Empresa não encontrada' }, { status: 404 });
    }

    const business = businesses[0];
    console.log('✅ Business encontrado:', business.name);

    // Buscar campanha
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        businesses!inner(*)
      `)
      .eq('business_id', business.id)
      .eq('month_year_id', parseInt(monthYear))
      .eq('organization_id', '00000000-0000-0000-0000-000000000001');

    if (campaignError) {
      console.error('❌ Erro ao buscar campanha:', campaignError);
      return NextResponse.json({ success: false, error: 'Erro ao buscar campanha' }, { status: 500 });
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('❌ Campanha não encontrada para:', { businessId: business.id, monthYear });
      return NextResponse.json({ success: false, error: 'Campanha não encontrada' }, { status: 404 });
    }

    const campaign = campaigns[0];
    console.log('✅ Campanha encontrada:', campaign.title);

    // Buscar criadores da campanha
    const { data: campaignCreators, error: creatorsError } = await supabase
      .from('campaign_creators')
      .select(`
        *,
        creators!inner(*)
      `)
      .eq('campaign_id', campaign.id)
      .neq('status', 'Removido')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001');

    if (creatorsError) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return NextResponse.json({ success: false, error: 'Erro ao buscar criadores' }, { status: 500 });
    }

    // Filtrar criadores válidos (não vazios)
    const validCreators = (campaignCreators || [])
      .filter(cc => cc.creators && cc.creators.name && cc.creators.name !== '[SLOT VAZIO]')
      .map(cc => ({
        id: cc.creators.id,
        name: cc.creators.name,
        status: cc.creators.status,
        social_media: cc.creators.social_media || {},
        contact_info: cc.creators.contact_info || {},
        profile_info: cc.creators.profile_info || {},
        deliverables: cc.deliverables || {}
      }));

    console.log('✅ Criadores encontrados:', validCreators.length);

    // Montar dados da landing page
    const landingPageData = {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        month: campaign.month,
        monthYear: campaign.month_year_id,
        quantidadeCriadores: campaign.quantidade_criadores,
        createdAt: campaign.created_at
      },
      business: {
        id: business.id,
        name: business.name,
        category: business.category,
        currentPlan: business.current_plan,
        commercial: business.commercial,
        whatsapp: business.contact_info?.whatsapp || '',
        email: business.contact_info?.email || '',
        city: business.location?.city || '',
        state: business.location?.state || '',
        responsavel: business.contact_info?.responsible_name || '',
        whatsappResponsavel: business.contact_info?.responsible_whatsapp || business.contact_info?.whatsapp || ''
      },
      creators: validCreators,
      stats: {
        totalCreators: validCreators.length,
        confirmedCreators: validCreators.filter(c => c.deliverables.visit_confirmed === 'Confirmada').length,
        completedBriefings: validCreators.filter(c => c.deliverables.briefing_complete === 'Sim').length,
        approvedVideos: validCreators.filter(c => c.deliverables.video_approved === 'Aprovado').length,
        postedVideos: validCreators.filter(c => c.deliverables.video_posted === 'Postado').length
      }
    };

    console.log('✅ Dados da landing page montados:', {
      campaign: landingPageData.campaign.title,
      business: landingPageData.business.name,
      creators: landingPageData.creators.length
    });

    return NextResponse.json({
      success: true,
      data: landingPageData
    });

  } catch (error) {
    console.error('❌ Erro geral na API:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
