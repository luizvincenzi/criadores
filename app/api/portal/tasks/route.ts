import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'portal-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verificar token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Buscar tarefas baseado no tipo de usuário
    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_date,
        completed_at,
        assigned_to,
        created_at,
        updated_at
      `);

    if (decoded.userType === 'empresa') {
      // Para empresas: buscar tarefas relacionadas aos seus negócios/campanhas
      const businessId = decoded.entityId;
      
      // Buscar tarefas que mencionam o nome da empresa ou são relacionadas às campanhas
      const { data: business } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', businessId)
        .single();

      if (business) {
        query = query.or(`title.ilike.%${business.name}%,description.ilike.%${business.name}%`);
      }
    } else if (decoded.userType === 'criador') {
      // Para criadores: buscar tarefas atribuídas a eles
      const creatorId = decoded.entityId;
      
      // Buscar tarefas onde o criador é mencionado ou atribuído
      const { data: creator } = await supabase
        .from('creators')
        .select('name')
        .eq('id', creatorId)
        .single();

      if (creator) {
        query = query.or(`title.ilike.%${creator.name}%,description.ilike.%${creator.name}%,assigned_to.eq.${creatorId}`);
      }
    }

    // Aplicar filtro de status se fornecido
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Ordenar por data de criação (mais recentes primeiro)
    query = query.order('created_at', { ascending: false });

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Erro ao buscar tarefas do portal:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar tarefas' },
        { status: 500 }
      );
    }

    // Transformar tarefas para o formato esperado pelo portal
    const transformedTasks = tasks?.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority || 'medium',
      due_date: task.due_date,
      completed_at: task.completed_at,
      assigned_to: task.assigned_to,
      created_at: task.created_at,
      updated_at: task.updated_at,
      // Adicionar campos específicos do portal
      business_name: decoded.userType === 'empresa' ? 'Suas campanhas' : 'Trabalhos',
      campaign_name: null
    })) || [];

    return NextResponse.json({
      success: true,
      tasks: transformedTasks
    });

  } catch (error) {
    console.error('❌ Erro na API de tarefas do portal:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
