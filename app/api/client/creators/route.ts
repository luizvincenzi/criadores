import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/auth-types';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * 🔒 VALIDAÇÃO DE SEGURANÇA PARA CRIADORES
 * Garante que apenas criadores das campanhas da empresa sejam acessados
 */
async function validateCreatorAccess(request: NextRequest): Promise<{
  isValid: boolean;
  businessId: string | null;
  userRole: UserRole | null;
  error?: string;
}> {
  try {
    const clientBusinessId = request.headers.get('x-client-business-id') || 
                            process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID;

    if (!clientBusinessId) {
      return {
        isValid: false,
        businessId: null,
        userRole: null,
        error: 'Business ID não configurado'
      };
    }

    // Validar se o business existe
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, organization_id, is_active')
      .eq('id', clientBusinessId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .single();

    if (businessError || !business) {
      return {
        isValid: false,
        businessId: null,
        userRole: null,
        error: 'Empresa não encontrada ou inativa'
      };
    }

    return {
      isValid: true,
      businessId: clientBusinessId,
      userRole: UserRole.BUSINESS,
      error: undefined
    };

  } catch (error) {
    console.error('🔒 [SECURITY] Erro na validação de criadores:', error);
    return {
      isValid: false,
      businessId: null,
      userRole: null,
      error: 'Erro interno de validação'
    };
  }
}

/**
 * GET /api/client/creators
 * 🎯 Buscar criadores EXCLUSIVAMENTE das campanhas da empresa logada
 * 
 * ESTRATÉGIA DE SEGURANÇA:
 * 1. Buscar campanhas da empresa
 * 2. Buscar criadores apenas dessas campanhas
 * 3. Validação dupla de propriedade
 * 4. Filtros múltiplos de segurança
 */
export async function GET(request: NextRequest) {
  try {
    console.log('👥 [CLIENT CREATORS] Iniciando busca de criadores...');

    // 🔒 VALIDAÇÃO DE SEGURANÇA OBRIGATÓRIA
    const validation = await validateCreatorAccess(request);
    if (!validation.isValid) {
      console.error('❌ [SECURITY] Acesso negado:', validation.error);
      return NextResponse.json({
        success: false,
        error: validation.error || 'Acesso não autorizado'
      }, { status: 403 });
    }

    const { businessId } = validation;

    // 🔒 ETAPA 1: Buscar campanhas da empresa (com filtros de segurança)
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, business_id, organization_id')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_id', businessId);

    if (campaignsError) {
      console.error('❌ [CLIENT CREATORS] Erro ao buscar campanhas:', campaignsError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar campanhas'
      }, { status: 500 });
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('📭 [CLIENT CREATORS] Nenhuma campanha encontrada para business:', businessId);
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Nenhuma campanha encontrada para esta empresa'
      });
    }

    // 🔒 VALIDAÇÃO ADICIONAL: Verificar se todas as campanhas pertencem ao business correto
    const validCampaignIds = campaigns
      .filter(campaign => {
        if (campaign.business_id !== businessId) {
          console.warn('⚠️ [SECURITY] Campanha com business_id incorreto removida:', campaign.id);
          return false;
        }
        return true;
      })
      .map(campaign => campaign.id);

    if (validCampaignIds.length === 0) {
      console.log('📭 [CLIENT CREATORS] Nenhuma campanha válida encontrada');
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Nenhuma campanha válida encontrada'
      });
    }

    // 🔒 ETAPA 2: Buscar criadores APENAS das campanhas validadas
    const { data: campaignCreators, error: creatorsError } = await supabase
      .from('campaign_creators')
      .select(`
        campaign_id,
        creator_id,
        role,
        fee,
        status,
        deliverables,
        video_links,
        created_at,
        campaigns:campaign_id (
          id,
          title,
          business_id
        ),
        creators:creator_id (
          id,
          name,
          contact_info,
          profile_info,
          social_media,
          status,
          notes,
          is_active,
          created_at,
          updated_at
        )
      `)
      .in('campaign_id', validCampaignIds);

    if (creatorsError) {
      console.error('❌ [CLIENT CREATORS] Erro ao buscar criadores:', creatorsError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar criadores'
      }, { status: 500 });
    }

    // 🔒 ETAPA 3: Validação final e agrupamento de dados
    const validatedCreators = (campaignCreators || []).filter(cc => {
      // Validar se a campanha realmente pertence ao business
      if (cc.campaigns?.business_id !== businessId) {
        console.warn('⚠️ [SECURITY] Criador de campanha com business_id incorreto removido:', cc.creator_id);
        return false;
      }
      return true;
    });

    // Agrupar criadores únicos com suas campanhas
    const creatorsMap = new Map();

    validatedCreators.forEach(cc => {
      const creatorId = cc.creator_id;
      
      if (!creatorsMap.has(creatorId)) {
        creatorsMap.set(creatorId, {
          id: cc.creators?.id,
          name: cc.creators?.name || 'Nome não disponível',
          contact_info: cc.creators?.contact_info || {},
          profile_info: cc.creators?.profile_info || {},
          social_media: cc.creators?.social_media || {},
          status: cc.creators?.status || 'active',
          notes: cc.creators?.notes || '',
          is_active: cc.creators?.is_active || true,
          created_at: cc.creators?.created_at,
          updated_at: cc.creators?.updated_at,
          campaigns: [],
          totalCampaigns: 0,
          totalFee: 0
        });
      }

      const creator = creatorsMap.get(creatorId);
      creator.campaigns.push({
        id: cc.campaign_id,
        title: cc.campaigns?.title || 'Título não disponível',
        role: cc.role,
        fee: cc.fee || 0,
        status: cc.status,
        deliverables: cc.deliverables || {},
        video_links: cc.video_links || [],
        created_at: cc.created_at
      });
      
      creator.totalCampaigns = creator.campaigns.length;
      creator.totalFee += (cc.fee || 0);
    });

    const creators = Array.from(creatorsMap.values());

    console.log(`✅ [CLIENT CREATORS] ${creators.length} criadores únicos encontrados para business ${businessId}`);

    return NextResponse.json({
      success: true,
      data: creators,
      count: creators.length,
      businessId: businessId,
      campaignsCount: validCampaignIds.length,
      security: {
        filters_applied: [
          'organization_id',
          'business_id', 
          'campaign_validation',
          'creator_campaign_mapping',
          'duplicate_validation'
        ],
        access_level: 'business_isolated',
        validation_passed: true
      }
    });

  } catch (error) {
    console.error('❌ [CLIENT CREATORS] Erro interno:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * GET /api/client/creators/[id]
 * 🎯 Buscar criador específico (apenas se estiver em campanhas da empresa)
 */
export async function GET_BY_ID(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: creatorId } = await params;
    
    // 🔒 VALIDAÇÃO DE SEGURANÇA OBRIGATÓRIA
    const validation = await validateCreatorAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error || 'Acesso não autorizado'
      }, { status: 403 });
    }

    const { businessId } = validation;

    // 🔒 Verificar se o criador está em alguma campanha da empresa
    const { data: campaignCreator, error } = await supabase
      .from('campaign_creators')
      .select(`
        creator_id,
        campaigns:campaign_id (
          business_id,
          organization_id
        )
      `)
      .eq('creator_id', creatorId)
      .limit(1)
      .single();

    if (error || !campaignCreator) {
      return NextResponse.json({
        success: false,
        error: 'Criador não encontrado ou não autorizado'
      }, { status: 404 });
    }

    // 🔒 Validar se a campanha pertence ao business correto
    if (campaignCreator.campaigns?.business_id !== businessId) {
      console.warn('⚠️ [SECURITY] Tentativa de acesso a criador não autorizado:', creatorId);
      return NextResponse.json({
        success: false,
        error: 'Acesso não autorizado a este criador'
      }, { status: 403 });
    }

    // Buscar dados completos do criador
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({
        success: false,
        error: 'Criador não encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: creator,
      businessId: businessId,
      security: {
        access_validated: true,
        business_ownership_confirmed: true
      }
    });

  } catch (error) {
    console.error('❌ [CLIENT CREATORS] Erro ao buscar criador:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
