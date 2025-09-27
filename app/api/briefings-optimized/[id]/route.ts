import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Função para calcular score de performance
function calculateBriefingScore(checklistItems: any): number {
  if (!checklistItems || typeof checklistItems !== 'object') return 0;
  
  const items = Object.values(checklistItems);
  const totalItems = items.length;
  const completedItems = items.filter((item: any) => item?.checked === true).length;
  
  if (totalItems === 0) return 0;
  return Math.round((completedItems / totalItems) * 100);
}

// GET - Buscar briefing específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: briefingId } = await params;

    // Buscar briefing na tabela business_notes
    const { data: briefingNote, error: briefingError } = await supabase
      .from('business_notes')
      .select(`
        *,
        businesses!inner(id, name)
      `)
      .eq('id', briefingId)
      .eq('note_type', 'briefing')
      .single();

    if (briefingError) {
      console.error('Erro ao buscar briefing:', briefingError);
      return NextResponse.json(
        { error: 'Briefing não encontrado' },
        { status: 404 }
      );
    }

    if (!briefingNote) {
      return NextResponse.json(
        { error: 'Briefing não encontrado' },
        { status: 404 }
      );
    }

    // Buscar tarefas relacionadas ao briefing
    const { data: tasks, error: tasksError } = await supabase
      .from('business_tasks')
      .select('*')
      .eq('business_id', briefingNote.business_id)
      .eq('task_type', 'briefing');

    if (tasksError) {
      console.error('Erro ao buscar tarefas:', tasksError);
    }

    // Extrair dados do briefing
    const briefingData = briefingNote.attachments?.briefing_data || {};
    const performanceData = briefingData.performance || {};
    
    // Calcular score se não existir
    let performanceScore = performanceData.performance_score || 0;
    if (performanceData.checklist_items && performanceScore === 0) {
      performanceScore = calculateBriefingScore(performanceData.checklist_items);
    }

    // Organizar tarefas por tipo
    const internalTasks = tasks?.filter(task => 
      task.description?.includes('crIAdores') || 
      task.description?.includes('Equipe') ||
      task.description?.includes('interno')
    ) || [];
    
    const clientTasks = tasks?.filter(task => 
      task.description?.includes('Cliente') || 
      task.description?.includes('cliente') ||
      !internalTasks.includes(task)
    ) || [];

    // Formatar resposta completa
    const briefingDetails = {
      id: briefingNote.id,
      businessId: briefingNote.business_id,
      businessName: briefingNote.businesses?.name || 'N/A',
      
      // Dados básicos
      refCode: briefingData.ref_code || 'N/A',
      referenceMonth: briefingData.reference_month || 'N/A',
      meetingDate: briefingData.meeting_date || briefingNote.created_at?.split('T')[0],
      
      // Participantes
      participants: briefingData.participants || {
        criadores: [],
        client: []
      },
      
      // Resumo executivo
      executiveSummary: briefingData.executive_summary || {
        month_campaigns: [],
        next_step: '',
        identified_needs: []
      },
      
      // Contexto da campanha
      campaignContext: briefingData.campaign_context || {
        objective: '',
        strategy: '',
        pillars: ''
      },
      
      // Performance
      performance: {
        score: performanceScore,
        checklist: performanceData.checklist_items || {},
        totalItems: Object.keys(performanceData.checklist_items || {}).length,
        completedItems: Object.values(performanceData.checklist_items || {})
          .filter((item: any) => item?.checked === true).length
      },
      
      // Tarefas
      tasks: {
        internal: internalTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date,
          assignedTo: task.assigned_to_user_id,
          createdAt: task.created_at
        })),
        client: clientTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date,
          assignedTo: task.assigned_to_user_id,
          createdAt: task.created_at
        })),
        total: tasks?.length || 0,
        pending: tasks?.filter(task => task.status === 'pending').length || 0,
        inProgress: tasks?.filter(task => task.status === 'in_progress').length || 0,
        completed: tasks?.filter(task => task.status === 'completed').length || 0
      },
      
      // Metadados
      status: briefingData.status || 'completed',
      createdAt: briefingNote.created_at,
      updatedAt: briefingNote.updated_at
    };

    return NextResponse.json({ briefing: briefingDetails });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar briefing específico
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: briefingId } = await params;
    const body = await request.json();

    // Buscar briefing atual
    const { data: currentBriefing, error: fetchError } = await supabase
      .from('business_notes')
      .select('*')
      .eq('id', briefingId)
      .eq('note_type', 'briefing')
      .single();

    if (fetchError || !currentBriefing) {
      return NextResponse.json(
        { error: 'Briefing não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar dados do briefing
    const currentAttachments = currentBriefing.attachments || {};
    const currentBriefingData = currentAttachments.briefing_data || {};
    
    // Merge dos dados
    const updatedBriefingData = {
      ...currentBriefingData,
      ...body.briefingData
    };

    // Recalcular score se checklist foi atualizado
    if (body.briefingData?.performance?.checklist_items) {
      const newScore = calculateBriefingScore(body.briefingData.performance.checklist_items);
      updatedBriefingData.performance = {
        ...updatedBriefingData.performance,
        ...body.briefingData.performance,
        performance_score: newScore
      };
    }

    const updatedAttachments = {
      ...currentAttachments,
      briefing_data: updatedBriefingData
    };

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from('business_notes')
      .update({
        content: body.content || currentBriefing.content,
        attachments: updatedAttachments,
        updated_at: new Date().toISOString()
      })
      .eq('id', briefingId);

    if (updateError) {
      console.error('Erro ao atualizar briefing:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar briefing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Briefing atualizado com sucesso',
      briefingId 
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover briefing específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: briefingId } = await params;

    // Buscar briefing para obter business_id
    const { data: briefing, error: fetchError } = await supabase
      .from('business_notes')
      .select('business_id')
      .eq('id', briefingId)
      .eq('note_type', 'briefing')
      .single();

    if (fetchError || !briefing) {
      return NextResponse.json(
        { error: 'Briefing não encontrado' },
        { status: 404 }
      );
    }

    // Remover tarefas relacionadas
    const { error: tasksError } = await supabase
      .from('business_tasks')
      .delete()
      .eq('business_id', briefing.business_id)
      .eq('task_type', 'briefing');

    if (tasksError) {
      console.error('Erro ao remover tarefas:', tasksError);
    }

    // Remover briefing
    const { error: deleteError } = await supabase
      .from('business_notes')
      .delete()
      .eq('id', briefingId);

    if (deleteError) {
      console.error('Erro ao remover briefing:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao remover briefing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Briefing removido com sucesso' 
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
