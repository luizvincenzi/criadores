import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🏢 [BUSINESS BY ID] Buscando empresa:', businessId);

    const supabase = createClient();

    // Buscar empresa específica
    const { data: business, error } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        slug,
        status,
        business_stage,
        estimated_value,
        priority,
        is_active,
        contact_info,
        address,
        contract_info,
        tags,
        custom_fields,
        metrics,
        owner_user_id,
        responsible_user_id,
        organization_id,
        created_at,
        updated_at
      `)
      .eq('id', businessId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (error) {
      console.error('❌ [BUSINESS BY ID] Erro ao buscar empresa:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Empresa não encontrada' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erro ao buscar empresa' },
        { status: 500 }
      );
    }

    if (!business) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Formatar dados para o dashboard
    const formattedBusiness = {
      id: business.id,
      name: business.name,
      slug: business.slug,
      status: business.status,
      business_stage: business.business_stage,
      estimated_value: business.estimated_value,
      priority: business.priority,
      is_active: business.is_active,
      
      // Informações de contato
      contact_info: business.contact_info || {},
      
      // Endereço formatado para o dashboard
      address: business.address?.city ? 
        `${business.address.city}, ${business.address.state || ''}`.trim().replace(/,$/, '') :
        'Endereço não informado',
      
      // Informações do contrato
      contract_info: business.contract_info || {},
      
      // Tags e campos customizados
      tags: business.tags || [],
      custom_fields: business.custom_fields || {},
      
      // Métricas
      metrics: business.metrics || {
        total_campaigns: 0,
        active_campaigns: 0,
        total_spent: 0,
        roi: 0
      },
      
      // Relacionamentos
      owner_user_id: business.owner_user_id,
      responsible_user_id: business.responsible_user_id,
      organization_id: business.organization_id,
      
      // Timestamps
      created_at: business.created_at,
      updated_at: business.updated_at
    };

    console.log('✅ [BUSINESS BY ID] Empresa encontrada:', {
      id: business.id,
      name: business.name,
      is_active: business.is_active,
      business_stage: business.business_stage
    });

    return NextResponse.json(formattedBusiness);

  } catch (error) {
    console.error('❌ [BUSINESS BY ID] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;
    const updates = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔄 [BUSINESS UPDATE] Atualizando empresa:', businessId, updates);

    const supabase = createClient();

    // Atualizar empresa
    const { data: business, error } = await supabase
      .from('businesses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) {
      console.error('❌ [BUSINESS UPDATE] Erro ao atualizar empresa:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar empresa' },
        { status: 500 }
      );
    }

    console.log('✅ [BUSINESS UPDATE] Empresa atualizada com sucesso');

    return NextResponse.json(business);

  } catch (error) {
    console.error('❌ [BUSINESS UPDATE] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
