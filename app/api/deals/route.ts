import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET - Buscar negócios (deals) com informações das empresas
export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Buscando negócios (deals)...');

    // Buscar businesses que representam negócios ativos
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        business_stage,
        priority,
        estimated_value,
        expected_close_date,
        current_stage_since,
        owner_user_id,
        custom_fields,
        created_at,
        updated_at
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .neq('is_won', true)
      .neq('is_lost', true)
      .neq('business_stage', 'Contrato assinado')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar negócios:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar negócios', details: error.message },
        { status: 500 }
      );
    }

    // Buscar informações dos proprietários
    const ownerIds = [...new Set(businesses.map(b => b.owner_user_id).filter(Boolean))];
    let ownersMap = new Map();

    if (ownerIds.length > 0) {
      const { data: owners, error: ownersError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', ownerIds);

      if (!ownersError && owners) {
        owners.forEach(owner => {
          ownersMap.set(owner.id, owner);
        });
      }
    }

    // Mapear para formato de deals
    const deals = businesses.map(business => {
      const owner = business.owner_user_id ? ownersMap.get(business.owner_user_id) : null;
      
      return {
        id: business.id,
        name: `Negócio com ${business.name}`,
        business_name: business.name,
        business_id: business.id,
        stage: business.business_stage || 'Leads próprios frios',
        priority: business.priority || 'Média',
        estimated_value: business.estimated_value || 0,
        expected_close_date: business.expected_close_date,
        owner_name: owner?.name || '',
        owner_email: owner?.email || '',
        current_stage_since: business.current_stage_since || business.created_at,
        created_at: business.created_at,
        plan: business.custom_fields?.plano_atual || 'Silver'
      };
    });

    console.log(`✅ ${deals.length} negócios encontrados`);

    return NextResponse.json({
      deals,
      total: deals.length
    });

  } catch (error) {
    console.error('❌ Erro interno ao buscar negócios:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar etapa de um negócio
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, stage, previous_stage } = body;

    console.log('🔄 Atualizando etapa do negócio:', { id, stage, previous_stage });

    if (!id || !stage) {
      return NextResponse.json(
        { error: 'ID e stage são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar o business atual primeiro
    const { data: currentBusiness, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentBusiness) {
      console.error('❌ Erro ao buscar negócio:', fetchError);
      return NextResponse.json(
        { error: 'Negócio não encontrado' },
        { status: 404 }
      );
    }

    // Calcular tempo na etapa anterior se mudou de etapa
    let timeInPreviousStage = null;
    if (previous_stage && currentBusiness.current_stage_since) {
      const stageStartTime = new Date(currentBusiness.current_stage_since);
      const now = new Date();
      timeInPreviousStage = Math.floor((now.getTime() - stageStartTime.getTime()) / (1000 * 60 * 60 * 24)); // dias
    }

    // Atualizar apenas os campos necessários, sem trigger
    const updateData = {
      business_stage: stage,
      current_stage_since: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Usar uma transação simples para evitar problemas com triggers
    const { error: updateError } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('❌ Erro ao atualizar negócio:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar negócio', details: updateError.message },
        { status: 500 }
      );
    } else {
      console.log('✅ Negócio atualizado com sucesso');
    }

    // Buscar o business atualizado
    const { data: finalBusiness } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    const updatedBusiness = finalBusiness || { ...currentBusiness, business_stage: stage };

    console.log('✅ Negócio atualizado:', updatedBusiness.name);

    // Log da mudança (sem depender de tabela business_activities)
    console.log('📊 Tracking da mudança:');
    console.log(`  - Negócio: ${updatedBusiness.name}`);
    console.log(`  - De: ${previous_stage || 'N/A'} → Para: ${stage}`);
    console.log(`  - Tempo na etapa anterior: ${timeInPreviousStage || 0} dias`);
    console.log(`  - Proprietário: ${updatedBusiness.owner_user_id || 'N/A'}`);
    console.log(`  - Timestamp: ${new Date().toISOString()}`);

    // Futuramente, quando a tabela business_activities estiver funcionando,
    // podemos reativar o código de inserção de atividades aqui

    // Buscar informações do proprietário para retorno
    let owner = null;
    if (updatedBusiness.owner_user_id) {
      const { data: ownerData } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', updatedBusiness.owner_user_id)
        .single();
      
      owner = ownerData;
    }

    // Retornar deal atualizado
    const updatedDeal = {
      id: updatedBusiness.id,
      name: `Negócio com ${updatedBusiness.name}`,
      business_name: updatedBusiness.name,
      business_id: updatedBusiness.id,
      stage: stage, // Usar o stage que foi passado na requisição
      priority: updatedBusiness.priority || 'Média',
      estimated_value: updatedBusiness.estimated_value || 0,
      expected_close_date: updatedBusiness.expected_close_date,
      owner_name: owner?.name || '',
      owner_email: owner?.email || '',
      current_stage_since: new Date().toISOString(), // Usar timestamp atual
      created_at: updatedBusiness.created_at,
      plan: updatedBusiness.custom_fields?.plano_atual || 'Silver'
    };

    return NextResponse.json({
      success: true,
      deal: updatedDeal,
      message: `Negócio "${updatedBusiness.name}" atualizado para etapa "${stage}"`,
      tracking: {
        previous_stage,
        new_stage: stage,
        time_in_previous_stage_days: timeInPreviousStage,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro interno ao atualizar negócio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo negócio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Criando novo negócio:', body);

    const businessData = {
      organization_id: DEFAULT_ORG_ID,
      name: body.business_name,
      business_stage: body.stage || 'Leads próprios frios',
      priority: body.priority || 'Média',
      estimated_value: parseFloat(body.estimated_value) || 0,
      expected_close_date: body.expected_close_date || null,
      owner_user_id: body.owner_user_id || null,
      contact_info: {
        primary_contact: body.contact_name || '',
        email: body.contact_email || '',
        phone: body.contact_phone || ''
      },
      custom_fields: {
        plano_atual: body.plan || 'Silver'
      },
      is_active: true
    };

    const { data: business, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar negócio:', error);
      return NextResponse.json(
        { error: 'Erro ao criar negócio', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Negócio criado:', business.name);

    // Buscar informações do proprietário
    let owner = null;
    if (business.owner_user_id) {
      const { data: ownerData } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', business.owner_user_id)
        .single();
      
      owner = ownerData;
    }

    // Retornar deal criado
    const newDeal = {
      id: business.id,
      name: `Negócio com ${business.name}`,
      business_name: business.name,
      business_id: business.id,
      stage: business.business_stage,
      priority: business.priority || 'Média',
      estimated_value: business.estimated_value || 0,
      expected_close_date: business.expected_close_date,
      owner_name: owner?.name || '',
      owner_email: owner?.email || '',
      current_stage_since: business.current_stage_since,
      created_at: business.created_at,
      plan: business.custom_fields?.plano_atual || 'Silver'
    };

    return NextResponse.json({
      deal: newDeal,
      message: 'Negócio criado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro interno ao criar negócio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
