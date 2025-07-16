import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API /api/add-campaign chamada (Supabase)');

    const body = await request.json();
    console.log('📝 Dados recebidos:', body);

    // Validação básica
    if (!body.campanha || !body.business || !body.influenciador || !body.status) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: campanha, business, influenciador, status' },
        { status: 400 }
      );
    }

    // Validar se Business existe no Supabase
    console.log(`🔍 Validando Business: "${body.business}"`);
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', body.business)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (businessError || !businessData) {
      return NextResponse.json(
        { success: false, error: `Business "${body.business}" não encontrado no sistema` },
        { status: 400 }
      );
    }

    // Validar se Creator existe no Supabase
    console.log(`🔍 Validando Creator: "${body.influenciador}"`);
    const { data: creatorData, error: creatorError } = await supabase
      .from('creators')
      .select('id, name')
      .eq('name', body.influenciador)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (creatorError || !creatorData) {
      return NextResponse.json(
        { success: false, error: `Creator "${body.influenciador}" não encontrado no sistema` },
        { status: 400 }
      );
    }

    console.log(`✅ Business encontrado: ID=${businessData.id}, Nome="${businessData.name}"`);
    console.log(`✅ Creator encontrado: ID=${creatorData.id}, Nome="${creatorData.name}"`);

    // Verificar se já existe campanha para este business e creator neste mês
    if (body.mes) {
      const { data: existingCampaign } = await supabase
        .from('campaigns')
        .select('id, title')
        .eq('business_id', businessData.id)
        .eq('month', body.mes)
        .eq('organization_id', DEFAULT_ORG_ID)
        .single();

      if (existingCampaign) {
        return NextResponse.json({
          success: false,
          error: `Já existe uma campanha para ${businessData.name} no mês ${body.mes}`
        });
      }
    }

    // Criar campanha no Supabase
    const campaignData = {
      organization_id: DEFAULT_ORG_ID,
      business_id: businessData.id,
      title: body.campanha,
      description: `Campanha ${body.campanha} para ${businessData.name}`,
      month: body.mes || '',
      status: body.status,
      budget: 0,
      objectives: {
        primary: body.objetivo || '',
        secondary: [body.comunicacaoSecundaria].filter(Boolean),
        kpis: { reach: 0, engagement: 0, conversions: 0 }
      },
      deliverables: {
        posts: 1,
        stories: 3,
        reels: 1,
        events: 0,
        requirements: [],
        creators_count: 1
      },
      briefing_details: {
        formatos: body.formato ? [body.formato] : [],
        perfil_criador: body.perfilCriador || '',
        objetivo_detalhado: body.objetivo || '',
        comunicacao_secundaria: body.comunicacaoSecundaria || '',
        datas_gravacao: {
          data_inicio: null,
          data_fim: null,
          horarios_preferenciais: body.datasHorariosGravacao ? [body.datasHorariosGravacao] : [],
          observacoes: ''
        },
        roteiro_video: {
          o_que_falar: body.oQuePrecisaSerFalado || '',
          historia: body.oQuePrecisaSerFalado || '',
          promocao_cta: body.promocaoCTA || '',
          tom_comunicacao: '',
          pontos_obrigatorios: []
        }
      }
    };

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();

    if (campaignError) {
      console.error('❌ Erro ao criar campanha:', campaignError);
      return NextResponse.json({
        success: false,
        error: `Erro ao criar campanha: ${campaignError.message}`
      });
    }

    // Criar relacionamento com o criador
    const campaignCreatorData = {
      campaign_id: campaign.id,
      creator_id: creatorData.id,
      role: 'primary',
      status: 'Ativo',
      fee: 0,
      deliverables: {
        briefing_complete: body.briefingCompleto || 'Pendente',
        visit_datetime: body.dataHoraVisita || null,
        guest_quantity: parseInt(body.quantidadeConvidados) || 0,
        visit_confirmed: body.visitaConfirmado || 'Pendente',
        post_datetime: body.dataHoraPostagem || null,
        video_approved: body.videoAprovado || 'Pendente',
        video_posted: body.videoPostado || 'Não',
        content_links: body.linkVideoInstagram ? [body.linkVideoInstagram] : []
      }
    };

    const { error: creatorError } = await supabase
      .from('campaign_creators')
      .insert(campaignCreatorData);

    if (creatorError) {
      console.error('❌ Erro ao criar relacionamento criador-campanha:', creatorError);
      // Não falhar a operação principal
    }

    console.log('✅ Campanha adicionada com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Campanha adicionada com sucesso!',
      data: {
        campanha: body.campanha,
        business: body.business,
        influenciador: body.influenciador,
        status: body.status,
        campaignId: campaign.id
      }
    });

  } catch (error: any) {
    console.error('❌ Erro na API add-campaign:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
