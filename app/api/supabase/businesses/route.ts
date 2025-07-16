import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    console.log('🏢 Buscando negócios do Supabase...');

    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        responsible_user:users(full_name)
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Erro ao buscar negócios:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${data.length} negócios encontrados no Supabase`);

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
      notes: business.custom_fields?.notes || ''
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
        custom_fields: {
          categoria: body.categoria || '',
          planoAtual: body.planoAtual || '',
          comercial: body.comercial || '',
          responsavel: body.responsavel || '',
          grupoWhatsappCriado: body.grupoWhatsappCriado || 'Não',
          notes: body.notes || ''
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
