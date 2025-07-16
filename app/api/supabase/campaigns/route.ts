import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/supabase/campaigns
 * Buscar todas as campanhas da organização
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const status = searchParams.get('status');
    const month = searchParams.get('month');

    console.log('📊 Buscando campanhas do Supabase...');

    let query = supabase
      .from('campaigns')
      .select(`
        id,
        title,
        description,
        month,
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
        business:businesses(
          id,
          name,
          contact_info,
          address,
          category_id,
          current_plan_id
        ),
        campaign_creators(
          id,
          role,
          status,
          fee,
          deliverables,
          creator:creators(
            id,
            name,
            social_media,
            contact_info,
            profile_info,
            status
          )
        )
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true);

    // Aplicar filtros se fornecidos
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (month) {
      query = query.eq('month', month);
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar campanhas:', error);
      return NextResponse.json(
        { success: false, error: `Erro ao buscar campanhas: ${error.message}` },
        { status: 500 }
      );
    }

    // Transformar dados para formato compatível
    const transformedCampaigns = campaigns?.map(campaign => ({
      id: campaign.id,
      nome: campaign.title,
      businessName: campaign.business?.name || '',
      businessId: campaign.business?.id || '',
      mes: campaign.month,
      status: campaign.status,
      orcamento: campaign.budget || 0,
      gastos: campaign.spent_amount || 0,
      dataInicio: campaign.start_date,
      dataFim: campaign.end_date,
      descricao: campaign.description || '',
      objetivos: campaign.objectives,
      entregaveis: campaign.deliverables,
      briefing_details: campaign.briefing_details,
      resultados: campaign.results,
      criadores: campaign.campaign_creators?.map(cc => ({
        id: cc.creator?.id,
        nome: cc.creator?.name,
        role: cc.role,
        status: cc.status,
        fee: cc.fee,
        deliverables: cc.deliverables,
        instagram: cc.creator?.social_media?.instagram?.username || '',
        seguidores: cc.creator?.social_media?.instagram?.followers || 0,
        whatsapp: cc.creator?.contact_info?.whatsapp || '',
        cidade: cc.creator?.profile_info?.location?.city || ''
      })) || [],
      totalCriadores: campaign.campaign_creators?.length || 0,
      quantidadeCriadores: campaign.deliverables?.creators_count || 6,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at
    })) || [];

    // Função para ordenar campanhas por mês (atual primeiro) e depois por business
    const sortCampaigns = (campaigns: any[]) => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // 1-12
      const currentYear = currentDate.getFullYear();

      return campaigns.sort((a, b) => {
        // Extrair mês e ano das campanhas
        const getMonthYear = (monthStr: string) => {
          if (!monthStr) return { month: 0, year: 0 };

          // Formatos possíveis: "julho/2025", "07/2025", "julho 2025", etc.
          const monthNames = {
            'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4,
            'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
            'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
          };

          let month = 0;
          let year = currentYear;

          // Tentar extrair ano
          const yearMatch = monthStr.match(/(\d{4})/);
          if (yearMatch) {
            year = parseInt(yearMatch[1]);
          }

          // Tentar extrair mês por nome
          const lowerMonth = monthStr.toLowerCase();
          for (const [name, num] of Object.entries(monthNames)) {
            if (lowerMonth.includes(name)) {
              month = num;
              break;
            }
          }

          // Se não encontrou por nome, tentar por número
          if (month === 0) {
            const monthMatch = monthStr.match(/(\d{1,2})/);
            if (monthMatch) {
              month = parseInt(monthMatch[1]);
            }
          }

          return { month, year };
        };

        const aMonthYear = getMonthYear(a.mes || '');
        const bMonthYear = getMonthYear(b.mes || '');

        // Calcular "distância" do mês atual (mês atual = 0, mês anterior = 1, etc.)
        const getMonthDistance = (monthYear: { month: number, year: number }) => {
          const totalMonths = monthYear.year * 12 + monthYear.month;
          const currentTotalMonths = currentYear * 12 + currentMonth;
          return currentTotalMonths - totalMonths;
        };

        const aDistance = getMonthDistance(aMonthYear);
        const bDistance = getMonthDistance(bMonthYear);

        // Ordenar por distância do mês atual (menor distância primeiro)
        if (aDistance !== bDistance) {
          return aDistance - bDistance;
        }

        // Se mesmo mês, ordenar alfabeticamente por business
        const aBusinessName = a.businessName || '';
        const bBusinessName = b.businessName || '';
        return aBusinessName.localeCompare(bBusinessName, 'pt-BR');
      });
    };

    // Aplicar ordenação personalizada
    const sortedCampaigns = sortCampaigns(transformedCampaigns);

    console.log(`✅ ${sortedCampaigns.length} campanhas encontradas e ordenadas por mês atual primeiro`);

    return NextResponse.json({
      success: true,
      data: sortedCampaigns,
      count: sortedCampaigns.length,
      source: 'supabase'
    });

  } catch (error: any) {
    console.error('❌ Erro na API de campanhas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/supabase/campaigns
 * Criar nova campanha
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🚀 Criando nova campanha:', body);

    // Converter month para month_year_id se necessário
    let monthYearId: number;

    if (body.month_year_id) {
      // Se month_year_id já foi enviado
      monthYearId = parseInt(body.month_year_id.toString());
    } else if (body.month) {
      // Converter month string para month_year_id
      if (typeof body.month === 'number' || /^\d{6}$/.test(body.month)) {
        monthYearId = parseInt(body.month.toString());
      } else if (/^\d{4}-\d{2}$/.test(body.month)) {
        // Formato "2025-07"
        const [year, month] = body.month.split('-').map(Number);
        monthYearId = year * 100 + month;
      } else {
        return NextResponse.json(
          { success: false, error: 'Formato de mês inválido. Use YYYYMM ou YYYY-MM' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: title, business_id, month ou month_year_id' },
        { status: 400 }
      );
    }

    // Validação do month_year_id
    if (!monthYearId || monthYearId < 202001 || monthYearId > 203012) {
      return NextResponse.json(
        { success: false, error: 'month_year_id inválido. Use formato YYYYMM (ex: 202507)' },
        { status: 400 }
      );
    }

    console.log('📅 Month processado:', { original: body.month, monthYearId });

    // Verificar se business existe
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', body.business_id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { success: false, error: 'Business não encontrado' },
        { status: 400 }
      );
    }

    // Verificar se já existe campanha para este business neste mês
    const { data: existingCampaign, error: checkError } = await supabase
      .from('campaigns')
      .select('id, title, month_year_id')
      .eq('business_id', body.business_id)
      .eq('month_year_id', monthYearId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (existingCampaign) {
      // Converter month_year_id para display
      const year = Math.floor(monthYearId / 100);
      const month = monthYearId % 100;
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthDisplay = `${monthNames[month - 1]} ${year}`;

      return NextResponse.json(
        {
          success: false,
          error: `Já existe uma campanha para ${business.name} em ${monthDisplay}: "${existingCampaign.title}"`
        },
        { status: 409 }
      );
    }

    // Validar dados obrigatórios
    if (!body.business_id || !body.title || !body.month) {
      return NextResponse.json(
        { success: false, error: 'Business ID, título e mês são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar se business existe
    const { data: businessExists } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', body.business_id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (!businessExists) {
      return NextResponse.json(
        { success: false, error: 'Business não encontrado' },
        { status: 404 }
      );
    }

    // Criar campanha
    const campaignData = {
      organization_id: DEFAULT_ORG_ID,
      business_id: body.business_id,
      title: body.title,
      description: body.description || '',
      month: body.month, // Manter para compatibilidade
      month_year_id: monthYearId, // Nova coluna principal
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      budget: body.budget || 0,
      status: body.status || 'Reunião de briefing',
      objectives: body.objectives || {
        primary: '',
        secondary: [],
        kpis: { reach: 0, engagement: 0, conversions: 0 }
      },
      deliverables: body.deliverables || {
        posts: 1,
        stories: 3,
        reels: 1,
        events: 0,
        requirements: [],
        creators_count: body.creators_count || body.quantidadeCriadores || 6
      },
      briefing_details: body.briefing_details || {
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
        },
        requisitos_tecnicos: {
          duracao_video: '',
          qualidade: '',
          formato_entrega: '',
          hashtags_obrigatorias: []
        }
      },
      // Buscar usuário real da organização
      created_by: (await supabase.from('users').select('id').eq('organization_id', DEFAULT_ORG_ID).limit(1).single()).data?.id || null,
      responsible_user_id: (await supabase.from('users').select('id').eq('organization_id', DEFAULT_ORG_ID).limit(1).single()).data?.id || null
    };

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();

    if (campaignError) {
      console.error('❌ Erro ao criar campanha:', campaignError);
      return NextResponse.json(
        { success: false, error: `Erro ao criar campanha: ${campaignError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Campanha criada com sucesso:', campaign.id);

    // Criar slots vazios para criadores baseado na quantidade solicitada
    if (body.quantidade_criadores && body.quantidade_criadores > 0) {
      console.log(`🎯 Criando ${body.quantidade_criadores} slots vazios para criadores...`);

      // Criar slots vazios (sem creator_id) para serem preenchidos posteriormente
      const emptySlots = [];
      for (let i = 0; i < body.quantidade_criadores; i++) {
        emptySlots.push({
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

      const { data: campaignCreators, error: creatorsError } = await supabase
        .from('campaign_creators')
        .insert(emptySlots)
        .select();

      if (creatorsError) {
        console.error('❌ Erro ao criar slots vazios:', creatorsError);
        // Não falhar a operação, apenas logar o erro
      } else {
        console.log(`✅ ${campaignCreators?.length || 0} relacionamentos criados com sucesso`);
      }
    }

    // Registrar no audit log
    try {
      await supabase
        .from('audit_log')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          entity_type: 'campaign',
          entity_id: campaign.id,
          action: 'CREATE',
          user_email: 'sistema@crm.com', // TODO: pegar usuário real
          old_values: {},
          new_values: {
            business_name: businessExists.name,
            campaign_title: campaign.title,
            month: campaign.month,
            creators_count: body.quantidade_criadores || 0
          },
          metadata: {
            source: 'campaign_modal',
            business_id: campaign.business_id,
            quantidade_criadores: body.quantidade_criadores || 0
          }
        });
    } catch (auditError) {
      console.error('⚠️ Erro ao registrar audit log:', auditError);
      // Não falhar a operação
    }

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        creators_associated: body.quantidade_criadores || 0,
        business_name: businessExists.name
      },
      message: `Campanha "${campaign.title}" criada com sucesso para ${businessExists.name} com ${body.quantidade_criadores || 0} criadores`
    });

  } catch (error: any) {
    console.error('❌ Erro ao criar campanha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/supabase/campaigns
 * Atualizar campanha existente
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 Atualizando campanha:', body);

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID da campanha é obrigatório' },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};
    
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.month) updateData.month = body.month;
    if (body.status) updateData.status = body.status;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.spent_amount !== undefined) updateData.spent_amount = body.spent_amount;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;
    if (body.objectives) updateData.objectives = body.objectives;
    if (body.deliverables) updateData.deliverables = body.deliverables;
    if (body.results) updateData.results = body.results;

    updateData.updated_at = new Date().toISOString();

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', body.id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar campanha:', error);
      return NextResponse.json(
        { success: false, error: `Erro ao atualizar campanha: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Campanha atualizada com sucesso');

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campanha atualizada com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao atualizar campanha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}
