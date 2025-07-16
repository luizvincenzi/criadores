import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  try {
    const { businessData, campaignName, selectedMonth, quantidadeCriadores, user } = await request.json();

    console.log('➕ Adicionando nova campanha via Supabase:', {
      businessName: businessData.nome,
      campaignName,
      selectedMonth,
      quantidadeCriadores
    });

    if (!businessData || !campaignName || !selectedMonth || !quantidadeCriadores) {
      return NextResponse.json({
        success: false,
        error: 'Dados obrigatórios: business, nome da campanha, mês e quantidade de criadores'
      });
    }

    // 🆔 OBTER BUSINESS_ID do Supabase
    console.log('🔄 Buscando business no Supabase...');
    let businessId = businessData.business_id;

    if (!businessId) {
      // Buscar business_id usando o nome no Supabase
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('name', businessData.nome)
        .eq('organization_id', DEFAULT_ORG_ID)
        .single();

      if (businessError || !business) {
        return NextResponse.json({
          success: false,
          error: `Business "${businessData.nome}" não encontrado no Supabase`
        });
      }
      businessId = business.id;
    }

    console.log('✅ Business ID obtido:', businessId);

    // Verificar se já existe campanha para este business neste mês
    const { data: existingCampaign, error: checkError } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('business_id', businessId)
      .eq('month', selectedMonth)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (existingCampaign) {
      return NextResponse.json({
        success: false,
        error: `Já existe uma campanha para este business no mês ${selectedMonth}: "${existingCampaign.title}"`
      });
    }

    // Criar campanha no Supabase
    const campaignData = {
      organization_id: DEFAULT_ORG_ID,
      business_id: businessId,
      title: campaignName,
      description: `Campanha ${campaignName} para ${businessData.nome}`,
      month: selectedMonth,
      status: 'Reunião de briefing',
      budget: 0,
      objectives: {
        primary: '',
        secondary: [],
        kpis: { reach: 0, engagement: 0, conversions: 0 }
      },
      deliverables: {
        posts: 1,
        stories: 3,
        reels: 1,
        events: 0,
        requirements: [],
        creators_count: parseInt(quantidadeCriadores)
      },
      briefing_details: {
        formatos: [],
        perfil_criador: '',
        objetivo_detalhado: '',
        comunicacao_secundaria: '',
        datas_gravacao: {
          data_inicio: null,
          data_fim: null,
          horarios_preferenciais: [],
          observacoes: ''
        },
        roteiro_video: {
          o_que_falar: '',
          historia: '',
          promocao_cta: '',
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

    console.log('✅ Campanha criada:', campaign.id);

    // Criar slots VAZIOS de criadores (campaign_creators)
    console.log(`🎯 Criando ${quantidadeCriadores} slots VAZIOS para criadores...`);
    const campaignCreatorSlots = [];
    for (let i = 0; i < parseInt(quantidadeCriadores); i++) {
      campaignCreatorSlots.push({
        campaign_id: campaign.id,
        creator_id: null, // SLOT VAZIO - será preenchido pelo usuário
        role: 'primary',
        status: 'Pendente',
        fee: 0,
        deliverables: {
          briefing_complete: 'Pendente',
          visit_datetime: null,
          guest_quantity: 0,
          visit_confirmed: 'Pendente',
          post_datetime: null,
          video_approved: 'Pendente',
          video_posted: 'Não',
          content_links: []
        }
      });
    }

    const { data: creatorSlots, error: slotsError } = await supabase
      .from('campaign_creators')
      .insert(campaignCreatorSlots)
      .select();

    if (slotsError) {
      console.error('❌ Erro ao criar slots vazios:', slotsError);
      // Não falhar a operação, apenas avisar
      console.log('⚠️ Campanha criada, mas slots vazios falharam');
    } else {
      console.log(`✅ ${creatorSlots.length} slots VAZIOS criados com sucesso`);
    }

    // Registrar no audit log
    try {
      await supabase
        .from('audit_log')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          entity_type: 'campaign',
          entity_id: campaign.id,
          entity_name: campaignName,
          action: 'create',
          user_email: user || 'sistema',
          details: {
            businessData: {
              nome: businessData.nome,
              categoria: businessData.categoria,
              responsavel: businessData.responsavel
            },
            campaignDetails: {
              name: campaignName,
              month: selectedMonth,
              quantidadeCriadores: parseInt(quantidadeCriadores)
            }
          }
        });
    } catch (auditError) {
      console.error('⚠️ Erro no audit log:', auditError);
      // Não falhar a operação principal
    }

    console.log('✅ Campanha criada com sucesso!');

    return NextResponse.json({
      success: true,
      message: `Campanha "${campaignName}" criada com sucesso!`,
      data: {
        campaignName,
        businessName: businessData.nome,
        month: selectedMonth,
        quantidadeCriadores: parseInt(quantidadeCriadores),
        campaignId: campaign.id,
        rowsCreated: parseInt(quantidadeCriadores)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar campanha:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao criar campanha'
    });
  }
}

// Função auxiliar para converter nome do mês para número
function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
    'janeiro': 1, 'jan': 1,
    'fevereiro': 2, 'fev': 2,
    'março': 3, 'mar': 3,
    'abril': 4, 'abr': 4,
    'maio': 5, 'mai': 5,
    'junho': 6, 'jun': 6,
    'julho': 7, 'jul': 7,
    'agosto': 8, 'ago': 8,
    'setembro': 9, 'set': 9,
    'outubro': 10, 'out': 10,
    'novembro': 11, 'nov': 11,
    'dezembro': 12, 'dez': 12
  };

  return months[monthName.toLowerCase()] || 1;
}
