import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// POST - Criar tarefas automáticas para uma jornada específica
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🤖 Criando tarefas automáticas da jornada:', body);

    const { 
      business_name, 
      campaign_month, 
      journey_stage, 
      business_id, 
      campaign_id, 
      created_by 
    } = body;

    // Validação básica
    if (!business_name || !campaign_month || !journey_stage) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: business_name, campaign_month, journey_stage' },
        { status: 400 }
      );
    }

    // Verificar se já existem tarefas automáticas para esta jornada/estágio
    const { data: existingTasks, error: checkError } = await supabase
      .from('jornada_tasks')
      .select('id')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_name', business_name)
      .eq('campaign_month', campaign_month)
      .eq('journey_stage', journey_stage)
      .eq('is_auto_generated', true);

    if (checkError) {
      console.error('❌ Erro ao verificar tarefas existentes:', checkError);
      return NextResponse.json(
        { error: 'Erro ao verificar tarefas existentes' },
        { status: 500 }
      );
    }

    if (existingTasks && existingTasks.length > 0) {
      console.log('⚠️ Tarefas automáticas já existem para esta jornada/estágio');
      return NextResponse.json({
        message: 'Tarefas automáticas já existem para esta jornada/estágio',
        existing_tasks_count: existingTasks.length,
        tasks_created: 0
      });
    }

    // Buscar usuário padrão se não fornecido
    let defaultUserId = created_by;
    if (!defaultUserId) {
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('role', 'admin')
        .limit(1)
        .single();
      
      defaultUserId = adminUser?.id || '00000000-0000-0000-0000-000000000001';
    }

    // Chamar função SQL para criar tarefas automáticas
    const { data: result, error } = await supabase.rpc('create_automatic_jornada_tasks', {
      p_business_name: business_name,
      p_campaign_month: campaign_month,
      p_journey_stage: journey_stage,
      p_organization_id: DEFAULT_ORG_ID,
      p_business_id: business_id || null,
      p_campaign_id: campaign_id || null,
      p_created_by: defaultUserId
    });

    if (error) {
      console.error('❌ Erro ao criar tarefas automáticas:', error);
      return NextResponse.json(
        { error: 'Erro ao criar tarefas automáticas', details: error.message },
        { status: 500 }
      );
    }

    const tasksCreated = result || 0;
    console.log(`✅ ${tasksCreated} tarefas automáticas criadas para ${business_name} - ${campaign_month} (${journey_stage})`);

    // Buscar as tarefas criadas para retornar
    const { data: createdTasks } = await supabase
      .from('jornada_tasks')
      .select(`
        id,
        title,
        description,
        task_type,
        status,
        priority,
        due_date,
        blocks_stage_progression,
        is_auto_generated
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_name', business_name)
      .eq('campaign_month', campaign_month)
      .eq('journey_stage', journey_stage)
      .eq('is_auto_generated', true)
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true, nullsFirst: false });

    return NextResponse.json({
      message: `${tasksCreated} tarefas automáticas criadas com sucesso`,
      tasks_created: tasksCreated,
      tasks: createdTasks || [],
      journey: {
        business_name,
        campaign_month,
        journey_stage
      }
    });

  } catch (error) {
    console.error('❌ Erro interno ao criar tarefas automáticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Verificar se pode avançar para próximo estágio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessName = searchParams.get('business_name');
    const campaignMonth = searchParams.get('campaign_month');
    const currentStage = searchParams.get('current_stage');

    console.log('🔍 Verificando se pode avançar estágio:', {
      businessName, campaignMonth, currentStage
    });

    if (!businessName || !campaignMonth || !currentStage) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: business_name, campaign_month, current_stage' },
        { status: 400 }
      );
    }

    // Chamar função SQL para verificar se pode avançar
    const { data: canProgress, error } = await supabase.rpc('can_progress_to_next_stage', {
      p_business_name: businessName,
      p_campaign_month: campaignMonth,
      p_current_stage: currentStage
    });

    if (error) {
      console.error('❌ Erro ao verificar progressão:', error);
      return NextResponse.json(
        { error: 'Erro ao verificar progressão', details: error.message },
        { status: 500 }
      );
    }

    // Buscar tarefas bloqueantes se não pode avançar
    let blockingTasks = [];
    if (!canProgress) {
      const { data: tasks } = await supabase
        .from('jornada_tasks')
        .select(`
          id,
          title,
          status,
          priority,
          due_date,
          assigned_to,
          assigned_user:users!assigned_to(full_name, email)
        `)
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('business_name', businessName)
        .eq('campaign_month', campaignMonth)
        .eq('journey_stage', currentStage)
        .eq('blocks_stage_progression', true)
        .neq('status', 'done')
        .order('priority', { ascending: false });

      blockingTasks = tasks || [];
    }

    console.log(`${canProgress ? '✅' : '❌'} Pode avançar: ${canProgress}`);

    return NextResponse.json({
      can_progress: canProgress,
      blocking_tasks_count: blockingTasks.length,
      blocking_tasks: blockingTasks,
      journey: {
        business_name: businessName,
        campaign_month: campaignMonth,
        current_stage: currentStage
      }
    });

  } catch (error) {
    console.error('❌ Erro interno ao verificar progressão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
