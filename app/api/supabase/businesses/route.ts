import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('id');

    console.log('🏢 Buscando negócios do Supabase...', { businessId });

    let query = supabase
      .from('businesses')
      .select(`
        id,
        organization_id,
        name,
        slug,
        category_id,
        current_plan_id,
        contact_info,
        address,
        contract_info,
        status,
        business_stage,
        estimated_value,
        contract_creators_count,
        owner_user_id,
        priority,
        current_stage_since,
        expected_close_date,
        responsible_user_id,
        tags,
        custom_fields,
        metrics,
        is_active,
        created_at,
        updated_at,
        apresentacao_empresa,
        owner_user:users!owner_user_id(id, full_name, email),
        responsible_user:users!responsible_user_id(id, full_name, email)
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true);

    if (businessId) {
      query = query.eq('id', businessId);
    } else {
      query = query.order('name');
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar negócios:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${data.length} negócios encontrados no Supabase`);

    // Buscar informações dos usuários (proprietários e responsáveis) separadamente
    const userIds = [...new Set([
      ...data.map(b => b.owner_user_id).filter(Boolean),
      ...data.map(b => b.responsible_user_id).filter(Boolean)
    ])];

    let usersMap = new Map();
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', userIds);

      if (!usersError && users) {
        users.forEach(user => {
          usersMap.set(user.id, user);
        });
      }
    }

    // Mapear para formato padronizado (usando apenas 'name')
    const businesses = data.map(business => ({
      id: business.id,
      name: business.name,                    // ✅ Campo padronizado
      nome: business.name,                    // 🔄 Compatibilidade temporária
      businessName: business.name,            // 🔄 Compatibilidade temporária
      categoria: business.tags?.[0] || '',
      planoAtual: business.custom_fields?.plano_atual || '',
      comercial: business.custom_fields?.comercial || '',
      nomeResponsavel: business.contact_info?.primary_contact || '',
      cidade: business.address?.city || '',
      whatsappResponsavel: business.contact_info?.whatsapp || '',
      prospeccao: business.status,
      responsavel: business.responsible_user?.full_name || '',
      instagram: business.contact_info?.instagram || '',
      grupoWhatsappCriado: business.custom_fields?.grupo_whatsapp_criado ? 'Sim' : 'Não',
      contratoAssinadoEnviado: business.contract_info?.signed ? 'Sim' : 'Não',
      dataAssinaturaContrato: business.contract_info?.signature_date || '',
      contratoValidoAte: business.contract_info?.valid_until || '',
      relatedFiles: business.contract_info?.files?.[0] || '',
      notes: business.custom_fields?.notes || '',
      businessStage: business.business_stage || 'Leads próprios frios',
      estimatedValue: business.estimated_value || 0,
      contractCreatorsCount: business.contract_creators_count || 0,
      ownerUserId: business.owner_user_id || null,
      ownerName: business.owner_user_id ? usersMap.get(business.owner_user_id)?.full_name || null : null,
      priority: business.priority || 'Média',
      apresentacao_empresa: business.apresentacao_empresa || '',
      apresentacaoEmpresa: business.apresentacao_empresa || '', // Compatibilidade
      custom_fields: business.custom_fields || {}
    }));

    return NextResponse.json({
      success: true,
      data: businesses,
      count: businesses.length,
      source: 'supabase'
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar se é uma atualização de status ou criação de novo negócio
    if (body.businessId && body.newStatus) {
      // Atualização de status
      const { businessId, newStatus, userEmail } = body;
      console.log(`🔄 Atualizando status do negócio ${businessId} para ${newStatus}`);

      const { data, error } = await supabase
        .from('businesses')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId)
        .eq('organization_id', DEFAULT_ORG_ID)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar status:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      console.log('✅ Status atualizado com sucesso no Supabase');
      return NextResponse.json({
        success: true,
        data,
        message: 'Status atualizado com sucesso'
      });
    } else {
      // Criação de novo negócio
      console.log('🆕 Criando novo negócio:', body);

      const businessData = {
        organization_id: DEFAULT_ORG_ID,
        name: body.nome || body.businessName,
        status: 'Reunião de briefing' as any,
        contact_info: {
          primary_contact: body.nomeResponsavel || '',
          whatsapp: body.whatsappResponsavel || '',
          instagram: body.instagram || '',
          email: '',
          phone: body.whatsappResponsavel || '',
          website: ''
        },
        address: {
          street: '',
          city: body.cidade || '',
          state: '',
          zip_code: '',
          country: 'Brasil'
        },
        contract_info: {
          signed: body.contratoAssinadoEnviado === 'Sim',
          signature_date: body.dataAssinaturaContrato || null,
          valid_until: body.contratoValidoAte || null,
          files: body.relatedFiles ? [body.relatedFiles] : [],
          terms: {}
        },
        business_stage: body.businessStage || 'Leads próprios frios',
        estimated_value: parseFloat(body.estimatedValue) || 0.00,
        contract_creators_count: parseInt(body.contractCreatorsCount) || 0,
        owner_user_id: body.ownerUserId || null,
        priority: body.priority || 'Média',
        custom_fields: {
          categoria: body.categoria || '',
          planoAtual: body.planoAtual || '',
          comercial: body.comercial || '',
          responsavel: body.responsavel || '',
          grupoWhatsappCriado: body.grupoWhatsappCriado || 'Não',
          notes: body.notes || '',
          apresentacaoEmpresa: body.apresentacaoEmpresa || ''
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('businesses')
        .insert([businessData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar negócio:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      console.log('✅ Negócio criado com sucesso no Supabase');
      return NextResponse.json({
        success: true,
        data,
        message: 'Negócio criado com sucesso'
      });
    }

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, ...updateData } = body;

    console.log(`🔄 Atualizando negócio ${id}:`, updateData);

    // Preparar dados para atualização
    const updateFields: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateFields.status = status;
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.description) updateFields.description = updateData.description;
    if (updateData.contact_info) updateFields.contact_info = updateData.contact_info;
    if (updateData.address) updateFields.address = updateData.address;
    if (updateData.custom_fields) updateFields.custom_fields = updateData.custom_fields;
    if (updateData.business_stage) updateFields.business_stage = updateData.business_stage;
    if (updateData.estimated_value !== undefined) updateFields.estimated_value = updateData.estimated_value;
    if (updateData.contract_creators_count !== undefined) updateFields.contract_creators_count = updateData.contract_creators_count;
    if (updateData.owner_user_id !== undefined) updateFields.owner_user_id = updateData.owner_user_id;
    if (updateData.priority) updateFields.priority = updateData.priority;

    // Atualizar apresentacao_empresa diretamente na tabela
    if (updateData.apresentacao_empresa !== undefined) {
      updateFields.apresentacao_empresa = updateData.apresentacao_empresa;
    }

    const { data, error } = await supabase
      .from('businesses')
      .update(updateFields)
      .eq('id', id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar negócio:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Negócio atualizado com sucesso no Supabase');

    return NextResponse.json({
      success: true,
      data,
      message: 'Negócio atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}


