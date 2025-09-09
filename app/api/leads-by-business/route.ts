import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/leads-by-business
 * Buscar leads filtrados por business_id do usuário logado
 * 
 * Query params:
 * - business_id: ID da empresa (obrigatório)
 * - status: Filtrar por status do lead
 * - limit: Limite de resultados (padrão: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('📊 [LEADS BY BUSINESS] Buscando leads para business:', businessId);

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

    if (businessError) {
      console.error('❌ [LEADS BY BUSINESS] Erro ao validar business:', businessError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao validar empresa'
      }, { status: 500 });
    }

    if (!businesses || businesses.length === 0) {
      console.error('❌ [LEADS BY BUSINESS] Business não encontrado:', businessId);
      return NextResponse.json({
        success: false,
        error: 'Empresa não encontrada'
      }, { status: 404 });
    }

    const business = businesses[0];

    if (!business.is_active) {
      console.error('❌ [LEADS BY BUSINESS] Business inativo:', businessId);
      return NextResponse.json({
        success: false,
        error: 'Empresa inativa'
      }, { status: 403 });
    }

    // Buscar leads da empresa
    // NOTA: Assumindo que leads estão relacionados via business_id
    // Se a estrutura for diferente, ajustar conforme necessário
    let query = supabase
      .from('leads')
      .select(`
        id,
        name,
        email,
        phone,
        source,
        status,
        notes,
        business_id,
        assigned_to,
        created_at,
        updated_at,
        custom_fields,
        assigned_user:users!assigned_to(id, full_name, email)
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Aplicar filtro de status se fornecido
    if (status) {
      query = query.eq('status', status);
    }

    const { data: leads, error: leadsError } = await query;

    if (leadsError) {
      console.error('❌ [LEADS BY BUSINESS] Erro ao buscar leads:', leadsError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar leads'
      }, { status: 500 });
    }

    // Enriquecer dados dos leads
    const enrichedLeads = (leads || []).map(lead => ({
      ...lead,
      // Adicionar campos calculados se necessário
      days_since_created: Math.floor(
        (new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
      assigned_user_name: lead.assigned_user?.full_name || 'Não atribuído'
    }));

    console.log(`✅ [LEADS BY BUSINESS] ${enrichedLeads.length} leads encontrados para ${business.name}`);

    return NextResponse.json({
      success: true,
      data: enrichedLeads,
      count: enrichedLeads.length,
      business: {
        id: business.id,
        name: business.name,
        is_active: business.is_active
      },
      filters: {
        organization_id: DEFAULT_ORG_ID,
        business_id: businessId,
        status: status || 'all',
        limit: limit
      },
      security: {
        filtered_by: 'business_id',
        access_level: 'business_isolated'
      }
    });

  } catch (error) {
    console.error('❌ [LEADS BY BUSINESS] Erro interno:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * POST /api/leads-by-business
 * Criar novo lead para a empresa
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, name, email, phone, source, notes, assigned_to } = body;

    console.log('📝 [LEADS BY BUSINESS] Criando novo lead:', { business_id, name, email });

    if (!business_id || !name || !email) {
      return NextResponse.json({
        success: false,
        error: 'Business ID, nome e email são obrigatórios'
      }, { status: 400 });
    }

    // Validar se o business existe
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, is_active')
      .eq('id', business_id)
      .eq('organization_id', DEFAULT_ORG_ID);

    if (businessError || !businesses || businesses.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Empresa não encontrada'
      }, { status: 404 });
    }

    if (!businesses[0].is_active) {
      return NextResponse.json({
        success: false,
        error: 'Empresa inativa'
      }, { status: 403 });
    }

    // Criar o lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([{
        organization_id: DEFAULT_ORG_ID,
        business_id,
        name,
        email,
        phone,
        source: source || 'manual',
        status: 'new',
        notes,
        assigned_to,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (leadError) {
      console.error('❌ [LEADS BY BUSINESS] Erro ao criar lead:', leadError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar lead'
      }, { status: 500 });
    }

    console.log('✅ [LEADS BY BUSINESS] Lead criado com sucesso:', lead.id);

    return NextResponse.json({
      success: true,
      data: lead,
      message: 'Lead criado com sucesso'
    });

  } catch (error) {
    console.error('❌ [LEADS BY BUSINESS] Erro interno ao criar lead:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
