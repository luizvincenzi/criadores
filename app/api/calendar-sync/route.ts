import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createTaskCalendarEvent, updateTaskCalendarEvent, deleteTaskCalendarEvent } from '@/app/actions/calendarActions';

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

// POST - Sincronizar tarefa com Google Calendar
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
    const { taskId, action } = body; // action: 'create', 'update', 'delete'

    if (!taskId) {
      return NextResponse.json(
        { error: 'ID da tarefa é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`📅 Sincronizando tarefa ${taskId} com Google Calendar - Ação: ${action}`);

    // Buscar tarefa
    const { data: task, error: taskError } = await supabase
      .from('jornada_tasks')
      .select(`
        id,
        title,
        description,
        due_date,
        priority,
        business_name,
        campaign_month,
        calendar_event_id,
        calendar_synced,
        assigned_user:users!assigned_to(
          id,
          full_name,
          email
        )
      `)
      .eq('id', taskId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (taskError || !task) {
      console.error('❌ Erro ao buscar tarefa:', taskError);
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    let result;
    let updateData: any = {
      calendar_last_sync: new Date().toISOString()
    };

    try {
      switch (action) {
        case 'create':
          if (!task.due_date) {
            return NextResponse.json(
              { error: 'Tarefa deve ter uma data de vencimento para ser agendada' },
              { status: 400 }
            );
          }

          if (task.calendar_event_id) {
            return NextResponse.json(
              { error: 'Tarefa já está sincronizada com o calendário' },
              { status: 400 }
            );
          }

          result = await createTaskCalendarEvent(task);
          updateData.calendar_event_id = result.eventId;
          updateData.calendar_synced = true;
          updateData.calendar_sync_error = null;
          break;

        case 'update':
          if (!task.calendar_event_id) {
            return NextResponse.json(
              { error: 'Tarefa não está sincronizada com o calendário' },
              { status: 400 }
            );
          }

          if (!task.due_date) {
            // Se não tem due_date, remover do calendário
            await deleteTaskCalendarEvent(task.calendar_event_id);
            updateData.calendar_event_id = null;
            updateData.calendar_synced = false;
            updateData.calendar_sync_error = null;
            result = { success: true, message: 'Agendamento removido (tarefa sem data)' };
          } else {
            result = await updateTaskCalendarEvent(task.calendar_event_id, task);
            updateData.calendar_synced = true;
            updateData.calendar_sync_error = null;
          }
          break;

        case 'delete':
          if (!task.calendar_event_id) {
            return NextResponse.json(
              { error: 'Tarefa não está sincronizada com o calendário' },
              { status: 400 }
            );
          }

          result = await deleteTaskCalendarEvent(task.calendar_event_id);
          updateData.calendar_event_id = null;
          updateData.calendar_synced = false;
          updateData.calendar_sync_error = null;
          break;

        default:
          return NextResponse.json(
            { error: 'Ação inválida. Use: create, update ou delete' },
            { status: 400 }
          );
      }

      // Atualizar tarefa com dados de sincronização
      const { error: updateError } = await supabase
        .from('jornada_tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('organization_id', DEFAULT_ORG_ID);

      if (updateError) {
        console.error('❌ Erro ao atualizar dados de sincronização:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar dados de sincronização' },
          { status: 500 }
        );
      }

      console.log(`✅ Tarefa ${taskId} sincronizada com sucesso - ${action}`);

      return NextResponse.json({
        success: true,
        message: result.message,
        eventId: result.eventId || null,
        action
      });

    } catch (calendarError: any) {
      console.error('❌ Erro na sincronização com Google Calendar:', calendarError);

      // Salvar erro na tarefa
      await supabase
        .from('jornada_tasks')
        .update({
          calendar_sync_error: calendarError.message,
          calendar_last_sync: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('organization_id', DEFAULT_ORG_ID);

      return NextResponse.json(
        { 
          error: 'Erro na sincronização com Google Calendar',
          details: calendarError.message 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Erro interno na sincronização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Verificar status de sincronização de uma tarefa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'ID da tarefa é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const userData = await getCurrentUserFromRequest(request);
    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Buscar status de sincronização
    const { data: task, error } = await supabase
      .from('jornada_tasks')
      .select('calendar_event_id, calendar_synced, calendar_sync_error, calendar_last_sync, due_date')
      .eq('id', taskId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (error || !task) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      taskId,
      isSynced: task.calendar_synced,
      eventId: task.calendar_event_id,
      lastSync: task.calendar_last_sync,
      syncError: task.calendar_sync_error,
      hasDueDate: !!task.due_date,
      canSync: !!task.due_date
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status de sincronização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
