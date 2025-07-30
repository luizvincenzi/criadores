import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Função para obter usuário atual baseado no email do header
async function getCurrentUserFromRequest(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) return null;

    // Buscar usuário no banco de dados
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, organization_id')
      .eq('email', userEmail.toLowerCase())
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .single();

    if (error || !user) return null;

    return user;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
}

// GET - Buscar tarefas da jornada
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const userData = await getCurrentUserFromRequest(request);
    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não autenticado', tasks: [], total: 0 },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const businessName = searchParams.get('business_name');
    const campaignMonth = searchParams.get('campaign_month');
    const journeyStage = searchParams.get('journey_stage');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assigned_to');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('🔍 Buscando tarefas da jornada...', {
      businessName, campaignMonth, journeyStage, status, assignedTo, limit,
      userRole: userData.role
    });

    let query = supabase
      .from('jornada_tasks')
      .select(`
        id,
        business_name,
        campaign_month,
        journey_stage,
        title,
        description,
        task_type,
        status,
        priority,
        assigned_to,
        created_by,
        due_date,
        completed_at,
        estimated_hours,
        actual_hours,
        is_auto_generated,
        blocks_stage_progression,
        tags,
        metadata,
        created_at,
        updated_at,
        assigned_user:users!assigned_to(
          id,
          full_name,
          email,
          avatar_url,
          role
        ),
        created_user:users!created_by(
          id,
          full_name,
          email,
          role
        )
      `)
      .eq('organization_id', DEFAULT_ORG_ID);

    // Aplicar filtros de permissão baseados no role
    if (userData.role !== 'admin') {
      // Usuários não-admin só veem tarefas atribuídas a eles ou criadas por eles
      // IMPORTANTE: Incluir tarefas criadas por administradores e atribuídas ao usuário
      query = query.or(`assigned_to.eq.${userData.id},created_by.eq.${userData.id}`);
    }

    // Aplicar filtros
    if (businessName) {
      query = query.eq('business_name', businessName);
    }
    if (campaignMonth) {
      query = query.eq('campaign_month', campaignMonth);
    }
    if (journeyStage) {
      query = query.eq('journey_stage', journeyStage);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    const { data: tasks, error } = await query
      .order('journey_stage')
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar tarefas da jornada:', error);
      return NextResponse.json(
        {
          error: 'Erro ao buscar tarefas',
          details: error.message,
          tasks: [],
          total: 0
        },
        { status: 500 }
      );
    }

    console.log(`✅ ${tasks?.length || 0} tarefas da jornada encontradas para usuário ${userData.role}`);

    return NextResponse.json({
      tasks: tasks || [],
      total: tasks?.length || 0,
      userRole: userData.role
    });

  } catch (error) {
    console.error('❌ Erro interno ao buscar tarefas da jornada:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        tasks: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

// POST - Criar nova tarefa da jornada
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const userData = await getCurrentUserFromRequest(request);
    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📝 Criando tarefa da jornada:', body, 'por usuário', userData.role);

    // Verificar permissões de criação
    if (body.assigned_to && body.assigned_to !== userData.id && userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Você não tem permissão para criar tarefas para outros usuários' },
        { status: 403 }
      );
    }

    // Validação básica
    if (!body.business_name || !body.campaign_month || !body.journey_stage || !body.title) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: business_name, campaign_month, journey_stage, title' },
        { status: 400 }
      );
    }

    const taskData = {
      organization_id: DEFAULT_ORG_ID,
      campaign_id: body.campaign_id || null,
      business_id: body.business_id || null,
      business_name: body.business_name,
      campaign_month: body.campaign_month,
      journey_stage: body.journey_stage,
      title: body.title,
      description: body.description || null,
      task_type: body.task_type || 'custom',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      assigned_to: body.assigned_to || userData.id, // Se não especificado, atribui ao próprio usuário
      created_by: userData.id, // Sempre o usuário atual
      due_date: body.due_date || null,
      estimated_hours: body.estimated_hours || null,
      is_auto_generated: body.is_auto_generated || false,
      auto_trigger_stage: body.auto_trigger_stage || null,
      depends_on_task_id: body.depends_on_task_id || null,
      blocks_stage_progression: body.blocks_stage_progression || false,
      tags: body.tags || [],
      metadata: body.metadata || {}
    };

    const { data: task, error } = await supabase
      .from('jornada_tasks')
      .insert([taskData])
      .select(`
        id,
        business_name,
        campaign_month,
        journey_stage,
        title,
        description,
        task_type,
        status,
        priority,
        assigned_to,
        due_date,
        completed_at,
        is_auto_generated,
        blocks_stage_progression,
        created_at,
        updated_at,
        assigned_user:users!assigned_to(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('❌ Erro ao criar tarefa da jornada:', error);
      return NextResponse.json(
        { error: 'Erro ao criar tarefa', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Tarefa da jornada criada:', task.title);

    return NextResponse.json({
      task,
      message: 'Tarefa da jornada criada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro interno ao criar tarefa da jornada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar tarefa da jornada
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const userData = await getCurrentUserFromRequest(request);
    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    console.log('📝 Atualizando tarefa da jornada:', id, 'por usuário', userData.role);

    if (!id) {
      return NextResponse.json(
        { error: 'ID da tarefa é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a tarefa existe e se o usuário tem permissão para editá-la
    const { data: existingTask, error: taskError } = await supabase
      .from('jornada_tasks')
      .select('id, assigned_to, created_by')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (taskError || !existingTask) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões de edição
    const canEdit = userData.role === 'admin' ||
                   existingTask.assigned_to === userData.id ||
                   existingTask.created_by === userData.id;

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar esta tarefa' },
        { status: 403 }
      );
    }

    // Se está marcando como concluída, adicionar timestamp
    if (updateData.status === 'done' && !updateData.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    // Se está desmarcando como concluída, remover timestamp
    if (updateData.status !== 'done') {
      updateData.completed_at = null;
    }

    const { data: task, error } = await supabase
      .from('jornada_tasks')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .select(`
        id,
        business_name,
        campaign_month,
        journey_stage,
        title,
        description,
        task_type,
        status,
        priority,
        assigned_to,
        due_date,
        completed_at,
        is_auto_generated,
        blocks_stage_progression,
        created_at,
        updated_at,
        assigned_user:users!assigned_to(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar tarefa da jornada:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar tarefa', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Tarefa da jornada atualizada:', task.title);

    return NextResponse.json({
      task,
      message: 'Tarefa da jornada atualizada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro interno ao atualizar tarefa da jornada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar tarefa da jornada
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID da tarefa é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deletando tarefa da jornada:', id);

    const { error } = await supabase
      .from('jornada_tasks')
      .delete()
      .eq('id', id)
      .eq('organization_id', DEFAULT_ORG_ID);

    if (error) {
      console.error('❌ Erro ao deletar tarefa da jornada:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar tarefa', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Tarefa da jornada deletada');

    return NextResponse.json({
      message: 'Tarefa da jornada deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro interno ao deletar tarefa da jornada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
