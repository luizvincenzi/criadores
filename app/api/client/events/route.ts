import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/client/events
 * Buscar eventos (sub-empresas) da empresa cliente logada
 * 
 * 🎯 CONCEITO: "Eventos" são projetos/campanhas específicos da empresa cliente
 * Exemplo: Empresa "Restaurante XYZ" → Eventos: "Inauguração", "Aniversário", etc.
 */
export async function GET(request: NextRequest) {
  try {
    // 🔒 FILTRO CLIENTE: Obter business_id da empresa logada
    const clientBusinessId = request.headers.get('x-client-business-id') || 
                            process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID;
    
    if (!clientBusinessId) {
      return NextResponse.json({
        success: false,
        error: 'ID da empresa cliente não configurado'
      }, { status: 400 });
    }

    console.log('🎉 [CLIENT EVENTS] Buscando eventos para empresa:', clientBusinessId);

    // 🎯 ESTRATÉGIA: Usar tabela 'businesses' com filtro por parent_business_id
    // Eventos são "sub-empresas" da empresa principal
    let query = supabase
      .from('businesses')
      .select(`
        id,
        name,
        contact_info,
        address,
        status,
        business_stage,
        estimated_value,
        priority,
        tags,
        custom_fields,
        is_active,
        created_at,
        updated_at,
        apresentacao_empresa
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true);

    // 🔄 OPÇÃO A: Filtrar por parent_business_id (se implementado)
    // query = query.eq('parent_business_id', clientBusinessId);

    // 🔄 OPÇÃO B: Filtrar por tag específica (implementação atual)
    query = query.contains('tags', [clientBusinessId]);

    // 🔄 OPÇÃO C: Filtrar por custom_field (fallback)
    // query = query.eq('custom_fields->parent_company_id', clientBusinessId);

    const { data, error } = await query.order('name');

    if (error) {
      console.error('❌ [CLIENT EVENTS] Erro ao buscar eventos:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log(`✅ [CLIENT EVENTS] ${data?.length || 0} eventos encontrados`);

    // 🎨 Mapear para formato de "eventos"
    const events = (data || []).map(business => ({
      id: business.id,
      name: business.name,
      description: business.apresentacao_empresa || business.custom_fields?.description || '',
      status: business.status || 'Planejamento',
      category: business.tags?.[1] || business.custom_fields?.categoria || 'Geral',
      startDate: business.custom_fields?.start_date || null,
      endDate: business.custom_fields?.end_date || null,
      budget: business.estimated_value || 0,
      responsible: business.custom_fields?.responsavel || '',
      location: business.address?.city || '',
      priority: business.priority || 'Média',
      created_at: business.created_at,
      updated_at: business.updated_at,
      // Campos extras para compatibilidade
      businessId: business.id,
      businessName: business.name,
      cidade: business.address?.city || '',
      whatsapp: business.contact_info?.whatsapp || '',
      instagram: business.contact_info?.instagram || ''
    }));

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
      source: 'supabase_filtered',
      clientBusinessId
    });

  } catch (error) {
    console.error('❌ [CLIENT EVENTS] Erro interno:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

/**
 * POST /api/client/events
 * Criar novo evento para a empresa cliente
 */
export async function POST(request: NextRequest) {
  try {
    const clientBusinessId = request.headers.get('x-client-business-id') || 
                            process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID;
    
    if (!clientBusinessId) {
      return NextResponse.json({
        success: false,
        error: 'ID da empresa cliente não configurado'
      }, { status: 400 });
    }

    const body = await request.json();
    console.log('➕ [CLIENT EVENTS] Criando evento:', body);

    // 🎯 Criar "evento" como sub-empresa
    const eventData = {
      organization_id: DEFAULT_ORG_ID,
      name: body.name,
      status: body.status || 'Planejamento',
      contact_info: {
        primary_contact: body.responsible || '',
        whatsapp: body.whatsapp || '',
        instagram: body.instagram || '',
        email: body.email || '',
        phone: body.phone || ''
      },
      address: {
        street: '',
        city: body.location || '',
        state: '',
        zip_code: '',
        country: 'Brasil'
      },
      business_stage: 'Evento',
      estimated_value: parseFloat(body.budget) || 0,
      priority: body.priority || 'Média',
      tags: [clientBusinessId, body.category || 'Geral'], // Tag com ID da empresa pai
      custom_fields: {
        description: body.description || '',
        categoria: body.category || 'Geral',
        responsavel: body.responsible || '',
        start_date: body.startDate || null,
        end_date: body.endDate || null,
        parent_company_id: clientBusinessId,
        event_type: 'client_event'
      },
      apresentacao_empresa: body.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('businesses')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error('❌ [CLIENT EVENTS] Erro ao criar evento:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ [CLIENT EVENTS] Evento criado:', data);

    // Mapear resposta
    const event = {
      id: data.id,
      name: data.name,
      description: data.apresentacao_empresa || '',
      status: data.status,
      category: data.tags?.[1] || 'Geral',
      budget: data.estimated_value,
      responsible: data.custom_fields?.responsavel || '',
      location: data.address?.city || '',
      priority: data.priority,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return NextResponse.json({
      success: true,
      data: event,
      message: `Evento "${event.name}" criado com sucesso`
    });

  } catch (error) {
    console.error('❌ [CLIENT EVENTS] Erro ao criar evento:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}

/**
 * PUT /api/client/events
 * Atualizar evento existente
 */
export async function PUT(request: NextRequest) {
  try {
    const clientBusinessId = request.headers.get('x-client-business-id') || 
                            process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID;
    
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID do evento é obrigatório'
      }, { status: 400 });
    }

    console.log('🔄 [CLIENT EVENTS] Atualizando evento:', id, updateData);

    // Preparar dados de atualização
    const updateFields: any = {
      updated_at: new Date().toISOString()
    };

    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.priority) updateFields.priority = updateData.priority;
    if (updateData.budget !== undefined) updateFields.estimated_value = parseFloat(updateData.budget) || 0;
    if (updateData.description !== undefined) updateFields.apresentacao_empresa = updateData.description;

    // Atualizar campos aninhados
    if (updateData.location || updateData.responsible || updateData.category) {
      // Buscar dados atuais primeiro
      const { data: currentData } = await supabase
        .from('businesses')
        .select('address, contact_info, custom_fields, tags')
        .eq('id', id)
        .single();

      if (currentData) {
        if (updateData.location) {
          updateFields.address = {
            ...currentData.address,
            city: updateData.location
          };
        }

        if (updateData.responsible) {
          updateFields.contact_info = {
            ...currentData.contact_info,
            primary_contact: updateData.responsible
          };
        }

        if (updateData.category) {
          updateFields.tags = [clientBusinessId, updateData.category];
        }

        if (updateData.responsible || updateData.startDate || updateData.endDate) {
          updateFields.custom_fields = {
            ...currentData.custom_fields,
            ...(updateData.responsible && { responsavel: updateData.responsible }),
            ...(updateData.startDate && { start_date: updateData.startDate }),
            ...(updateData.endDate && { end_date: updateData.endDate }),
            ...(updateData.category && { categoria: updateData.category })
          };
        }
      }
    }

    const { data, error } = await supabase
      .from('businesses')
      .update(updateFields)
      .eq('id', id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) {
      console.error('❌ [CLIENT EVENTS] Erro ao atualizar evento:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ [CLIENT EVENTS] Evento atualizado:', data);

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        description: data.apresentacao_empresa || '',
        status: data.status,
        category: data.tags?.[1] || 'Geral',
        budget: data.estimated_value,
        priority: data.priority,
        updated_at: data.updated_at
      },
      message: 'Evento atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ [CLIENT EVENTS] Erro ao atualizar evento:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}
