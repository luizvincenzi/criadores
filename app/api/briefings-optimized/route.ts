import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET - Listar briefings usando tabelas existentes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const month = searchParams.get('month');
    const status = searchParams.get('status');

    const supabase = createClient();

    // Buscar briefings nas business_notes com note_type='briefing'
    let query = supabase
      .from('business_notes')
      .select(`
        id,
        business_id,
        content,
        attachments,
        created_at,
        updated_at,
        businesses!inner(
          id,
          name,
          contact_info
        )
      `)
      .eq('note_type', 'briefing');

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data: briefingNotes, error: notesError } = await query
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('❌ Erro ao buscar briefings:', notesError);
      return NextResponse.json(
        { error: 'Erro ao buscar briefings', details: notesError.message },
        { status: 500 }
      );
    }

    // Buscar performance scores para cada briefing
    const briefingsWithPerformance = await Promise.all(
      (briefingNotes || []).map(async (note) => {
        const briefingData = note.attachments?.briefing_data;
        if (!briefingData) return null;

        // Buscar performance score
        const { data: performance } = await supabase
          .from('briefing_performance_checklist')
          .select('performance_score, checklist_items')
          .eq('business_id', note.business_id)
          .eq('reference_month', briefingData.reference_month)
          .single();

        // Buscar tarefas relacionadas
        const { data: tasks } = await supabase
          .from('business_tasks')
          .select('id, title, status, priority, due_date')
          .eq('business_id', note.business_id)
          .eq('task_type', 'briefing');

        const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];
        const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

        return {
          id: note.id,
          businessId: note.business_id,
          businessName: note.businesses.name,
          refCode: briefingData.ref_code,
          referenceMonth: briefingData.reference_month,
          meetingDate: briefingData.meeting_date,
          status: 'completed', // Derivado da existência da nota
          performanceScore: performance?.performance_score || 0,
          campaigns: briefingData.executive_summary?.month_campaigns || [],
          nextStep: briefingData.executive_summary?.next_step || '',
          totalTasks: tasks?.length || 0,
          pendingTasks: pendingTasks.length,
          completedTasks: completedTasks.length,
          createdAt: note.created_at,
          updatedAt: note.updated_at
        };
      })
    );

    const validBriefings = briefingsWithPerformance.filter(Boolean);

    // Aplicar filtros
    let filteredBriefings = validBriefings;

    if (month) {
      filteredBriefings = filteredBriefings.filter(b => 
        b.referenceMonth.toLowerCase().includes(month.toLowerCase())
      );
    }

    if (status) {
      filteredBriefings = filteredBriefings.filter(b => b.status === status);
    }

    console.log(`✅ ${filteredBriefings.length} briefings encontrados`);

    return NextResponse.json({
      briefings: filteredBriefings,
      total: filteredBriefings.length
    });

  } catch (error) {
    console.error('❌ Erro geral ao buscar briefings:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo briefing usando tabelas existentes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      referenceMonth,
      meetingDate,
      briefingData,
      tasks = [],
      checklist = []
    } = body;

    if (!businessId || !referenceMonth || !meetingDate || !briefingData) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: businessId, referenceMonth, meetingDate, briefingData' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Gerar ref_code
    const refCode = `BRF-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;

    // 1. Criar nota do briefing
    const { data: briefingNote, error: noteError } = await supabase
      .from('business_notes')
      .insert([{
        business_id: businessId,
        user_id: null,
        content: `Briefing Mensal - ${referenceMonth}`,
        note_type: 'briefing',
        attachments: {
          briefing_data: {
            ref_code: refCode,
            reference_month: referenceMonth,
            meeting_date: meetingDate,
            ...briefingData
          }
        }
      }])
      .select()
      .single();

    if (noteError) {
      console.error('❌ Erro ao criar nota do briefing:', noteError);
      return NextResponse.json(
        { error: 'Erro ao criar briefing', details: noteError.message },
        { status: 500 }
      );
    }

    // 2. Criar checklist de performance
    if (checklist.length > 0) {
      const checklistItems = {};
      checklist.forEach((item, index) => {
        checklistItems[`item_${index + 1}`] = {
          description: item.description,
          checked: item.checked || false,
          evidence: item.evidence || ''
        };
      });

      const { error: checklistError } = await supabase
        .from('briefing_performance_checklist')
        .insert([{
          business_id: businessId,
          organization_id: DEFAULT_ORG_ID,
          reference_month: referenceMonth,
          meeting_date: meetingDate,
          checklist_items: checklistItems
        }]);

      if (checklistError) {
        console.error('❌ Erro ao criar checklist:', checklistError);
        // Não falhar por causa do checklist
      }
    }

    // 3. Criar tarefas relacionadas
    if (tasks.length > 0) {
      const taskInserts = tasks.map(task => ({
        business_id: businessId,
        assigned_to_user_id: task.assignedTo || null,
        created_by_user_id: null,
        title: task.title,
        description: task.description || '',
        task_type: 'briefing',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.dueDate || null
      }));

      const { error: tasksError } = await supabase
        .from('business_tasks')
        .insert(taskInserts);

      if (tasksError) {
        console.error('❌ Erro ao criar tarefas:', tasksError);
        // Não falhar por causa das tarefas
      }
    }

    console.log(`✅ Briefing criado: ${refCode}`);

    return NextResponse.json({
      id: briefingNote.id,
      refCode,
      message: 'Briefing criado com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erro geral ao criar briefing:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar briefing existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, briefingData, tasks, checklist } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do briefing é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Atualizar nota do briefing
    if (briefingData) {
      const { error: updateError } = await supabase
        .from('business_notes')
        .update({
          attachments: { briefing_data: briefingData },
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('note_type', 'briefing');

      if (updateError) {
        console.error('❌ Erro ao atualizar briefing:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar briefing', details: updateError.message },
          { status: 500 }
        );
      }
    }

    // Atualizar checklist se fornecido
    if (checklist && briefingData?.reference_month) {
      const { data: note } = await supabase
        .from('business_notes')
        .select('business_id')
        .eq('id', id)
        .single();

      if (note) {
        const checklistItems = {};
        checklist.forEach((item, index) => {
          checklistItems[`item_${index + 1}`] = {
            description: item.description,
            checked: item.checked || false,
            evidence: item.evidence || ''
          };
        });

        await supabase
          .from('briefing_performance_checklist')
          .upsert({
            business_id: note.business_id,
            organization_id: DEFAULT_ORG_ID,
            reference_month: briefingData.reference_month,
            meeting_date: briefingData.meeting_date,
            checklist_items: checklistItems
          });
      }
    }

    console.log(`✅ Briefing atualizado: ${id}`);

    return NextResponse.json({
      message: 'Briefing atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro geral ao atualizar briefing:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover briefing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do briefing é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Buscar dados do briefing para limpeza
    const { data: note } = await supabase
      .from('business_notes')
      .select('business_id, attachments')
      .eq('id', id)
      .eq('note_type', 'briefing')
      .single();

    if (!note) {
      return NextResponse.json(
        { error: 'Briefing não encontrado' },
        { status: 404 }
      );
    }

    const referenceMonth = note.attachments?.briefing_data?.reference_month;

    // Remover nota do briefing
    const { error: deleteError } = await supabase
      .from('business_notes')
      .delete()
      .eq('id', id)
      .eq('note_type', 'briefing');

    if (deleteError) {
      console.error('❌ Erro ao remover briefing:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao remover briefing', details: deleteError.message },
        { status: 500 }
      );
    }

    // Remover checklist relacionado
    if (referenceMonth) {
      await supabase
        .from('briefing_performance_checklist')
        .delete()
        .eq('business_id', note.business_id)
        .eq('reference_month', referenceMonth);
    }

    // Remover tarefas relacionadas
    await supabase
      .from('business_tasks')
      .delete()
      .eq('business_id', note.business_id)
      .eq('task_type', 'briefing');

    console.log(`✅ Briefing removido: ${id}`);

    return NextResponse.json({
      message: 'Briefing removido com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro geral ao remover briefing:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
