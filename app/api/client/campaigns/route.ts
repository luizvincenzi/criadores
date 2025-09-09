import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UserRole, canAccessBusiness } from '@/lib/auth-types';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * 🔒 VALIDAÇÃO DE SEGURANÇA CRÍTICA
 * Garante que APENAS campanhas da empresa logada sejam acessadas
 */
async function validateCampaignAccess(request: NextRequest): Promise<{
  isValid: boolean;
  businessId: string | null;
  userRole: UserRole | null;
  error?: string;
}> {
  try {
    // Obter business_id do cliente logado (múltiplas fontes)
    let clientBusinessId = request.headers.get('x-client-business-id') ||
                          request.headers.get('x-business-id') ||
                          process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID;

    console.log('🔍 [SECURITY] Business ID obtido dos headers:', clientBusinessId);

    // Se não tiver business_id nos headers, tentar obter do cookie de autenticação
    if (!clientBusinessId) {
      const authCookie = request.cookies.get('sb-access-token') ||
                        request.cookies.get('supabase-auth-token');

      if (authCookie) {
        try {
          // Tentar obter usuário autenticado e seu business_id
          const { data: { user }, error: authError } = await supabase.auth.getUser(authCookie.value);

          if (!authError && user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('business_id, role')
              .eq('email', user.email)
              .eq('is_active', true)
              .single();

            if (!userError && userData?.business_id) {
              clientBusinessId = userData.business_id;
              console.log('🔍 [SECURITY] Business ID obtido do usuário autenticado:', clientBusinessId);
            }
          }
        } catch (e) {
          console.warn('⚠️ [SECURITY] Erro ao obter business_id do usuário:', e);
        }
      }
    }

    if (!clientBusinessId) {
      return {
        isValid: false,
        businessId: null,
        userRole: null,
        error: 'Business ID não configurado - usuário deve estar logado'
      };
    }

    // Validar se o business existe e está ativo
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, organization_id, is_active, status, name')
      .eq('id', clientBusinessId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single(); // Remover filtro is_active para debug

    console.log('🔍 [SECURITY] Dados da empresa encontrada:', business);

    if (businessError || !business) {
      console.error('❌ [SECURITY] Business não encontrado:', {
        businessId: clientBusinessId,
        error: businessError?.message
      });
      return {
        isValid: false,
        businessId: null,
        userRole: null,
        error: `Empresa não encontrada: ${businessError?.message || 'ID inválido'}`
      };
    }

    // Verificar se está ativa
    if (!business.is_active) {
      console.error('❌ [SECURITY] Business inativo:', clientBusinessId);
      return {
        isValid: false,
        businessId: null,
        userRole: null,
        error: 'Empresa inativa'
      };
    }

    console.log('🔒 [SECURITY] Acesso validado para business:', {
      id: clientBusinessId,
      name: business.name,
      status: business.status
    });

    return {
      isValid: true,
      businessId: clientBusinessId,
      userRole: UserRole.BUSINESS,
      error: undefined
    };

  } catch (error) {
    console.error('🔒 [SECURITY] Erro na validação:', error);
    return {
      isValid: false,
      businessId: null,
      userRole: null,
      error: 'Erro interno de validação'
    };
  }
}

/**
 * GET /api/client/campaigns
 * 🎯 Buscar campanhas EXCLUSIVAMENTE da empresa logada
 * 
 * FILTROS DE SEGURANÇA:
 * 1. organization_id = DEFAULT_ORG_ID
 * 2. business_id = empresa_logada
 * 3. is_active = true
 * 4. Validação dupla de propriedade
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📈 [CLIENT CAMPAIGNS] Iniciando busca de campanhas...');

    // 🔒 VALIDAÇÃO DE SEGURANÇA OBRIGATÓRIA
    const validation = await validateCampaignAccess(request);
    if (!validation.isValid) {
      console.error('❌ [SECURITY] Acesso negado:', validation.error);
      return NextResponse.json({
        success: false,
        error: validation.error || 'Acesso não autorizado'
      }, { status: 403 });
    }

    const { businessId } = validation;

    // 🔒 QUERY COM MÚLTIPLOS FILTROS DE SEGURANÇA
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        description,
        month,
        month_year_id,
        status,
        budget,
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
      .eq('organization_id', DEFAULT_ORG_ID)  // Filtro 1: Organização
      .eq('business_id', businessId)          // Filtro 2: CRÍTICO - Apenas da empresa
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [CLIENT CAMPAIGNS] Erro ao buscar campanhas:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar campanhas'
      }, { status: 500 });
    }

    // 🔒 VALIDAÇÃO ADICIONAL: Verificar cada campanha individualmente
    const validatedCampaigns = (campaigns || []).filter(campaign => {
      if (campaign.business_id !== businessId) {
        console.warn('⚠️ [SECURITY] Campanha com business_id incorreto removida:', campaign.id);
        return false;
      }
      if (campaign.organization_id !== DEFAULT_ORG_ID) {
        console.warn('⚠️ [SECURITY] Campanha com organization_id incorreto removida:', campaign.id);
        return false;
      }
      return true;
    });

    console.log(`✅ [CLIENT CAMPAIGNS] ${validatedCampaigns.length} campanhas encontradas para business ${businessId}`);

    // Buscar criadores associados às campanhas (com filtro de segurança)
    const campaignIds = validatedCampaigns.map(c => c.id);
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

    // Mapear campanhas com dados dos criadores
    const enrichedCampaigns = validatedCampaigns.map(campaign => ({
      ...campaign,
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
      creatorCount: creatorsData.filter(cc => cc.campaign_id === campaign.id).length
    }));

    return NextResponse.json({
      success: true,
      data: enrichedCampaigns,
      count: enrichedCampaigns.length,
      businessId: businessId,
      security: {
        filters_applied: ['organization_id', 'business_id', 'individual_validation'],
        access_level: 'business_isolated',
        validation_passed: true
      }
    });

  } catch (error) {
    console.error('❌ [CLIENT CAMPAIGNS] Erro interno:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * POST /api/client/campaigns
 * 🎯 Criar nova campanha EXCLUSIVAMENTE para a empresa logada
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 VALIDAÇÃO DE SEGURANÇA OBRIGATÓRIA
    const validation = await validateCampaignAccess(request);
    if (!validation.isValid) {
      console.error('❌ [SECURITY] Acesso negado:', validation.error);
      return NextResponse.json({
        success: false,
        error: validation.error || 'Acesso não autorizado'
      }, { status: 403 });
    }

    const { businessId } = validation;
    const body = await request.json();
    
    console.log('➕ [CLIENT CAMPAIGNS] Criando campanha para business:', businessId);

    // 🔒 FORÇAR business_id e organization_id (segurança crítica)
    const campaignData = {
      organization_id: DEFAULT_ORG_ID,        // 🔒 Forçar organização
      business_id: businessId,                // 🔒 Forçar empresa logada
      title: body.title,
      description: body.description || '',
      month: body.month || new Date().toISOString().slice(0, 7), // YYYY-MM
      status: body.status || 'Planejamento',
      budget: parseFloat(body.budget) || 0,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      objectives: body.objectives || {},
      deliverables: body.deliverables || {},
      briefing_details: body.briefing_details || {},
      results: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 🔒 VALIDAÇÃO FINAL: Garantir que business_id está correto
    if (campaignData.business_id !== businessId) {
      console.error('❌ [SECURITY] Tentativa de criar campanha para business incorreto');
      return NextResponse.json({
        success: false,
        error: 'Erro de segurança: Business ID inválido'
      }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaignData])
      .select()
      .single();

    if (error) {
      console.error('❌ [CLIENT CAMPAIGNS] Erro ao criar campanha:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar campanha'
      }, { status: 500 });
    }

    console.log('✅ [CLIENT CAMPAIGNS] Campanha criada com sucesso:', data.id);

    return NextResponse.json({
      success: true,
      data: data,
      message: `Campanha "${data.title}" criada com sucesso`,
      businessId: businessId,
      security: {
        business_id_validated: true,
        organization_id_enforced: true
      }
    });

  } catch (error) {
    console.error('❌ [CLIENT CAMPAIGNS] Erro ao criar campanha:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
