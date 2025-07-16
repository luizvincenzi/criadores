import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Buscar audit logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('📊 Buscando audit logs do Supabase...');

    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Erro ao buscar audit logs:', error);
      
      // Se a tabela não existe, retornar array vazio
      if (error.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'Tabela audit_log não existe ainda. Execute a migration 002_audit_logs.sql no Supabase Dashboard.'
        });
      }
      
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log(`✅ ${data?.length || 0} audit logs encontrados no Supabase`);

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || data?.length || 0,
      pagination: {
        limit,
        offset,
        hasMore: (data?.length || 0) === limit
      }
    });

  } catch (error) {
    console.error('❌ Erro na API de audit logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// POST - Criar novo audit log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 Criando audit log no Supabase...');

    // Validar campos obrigatórios
    const requiredFields = ['entity_type', 'entity_id', 'action'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Campo obrigatório: ${field}`
        }, { status: 400 });
      }
    }

    // Buscar organization_id (assumir que existe apenas uma por enquanto)
    const { data: organizations } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    if (!organizations || organizations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma organização encontrada'
      }, { status: 400 });
    }

    const auditLog = {
      organization_id: organizations[0].id,
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      entity_name: body.entity_name || null,
      action: body.action,
      field_name: body.field_name || null,
      old_value: body.old_value || null,
      new_value: body.new_value || null,
      user_id: body.user_id || null,
      user_email: body.user_email || 'sistema@crmcriadores.com',
      details: body.details || {},
      ip_address: body.ip_address || null,
      user_agent: body.user_agent || null
    };

    const { data, error } = await supabase
      .from('audit_log')
      .insert(auditLog)
      .select();

    if (error) {
      console.error('❌ Erro ao criar audit log:', error);

      // Se a tabela não existe, retornar mensagem específica
      if (error.message && error.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'Tabela audit_log não existe. Execute a migration 002_audit_logs.sql no Supabase Dashboard.',
          migration_needed: true
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: error.message || 'Erro desconhecido ao criar audit log'
      }, { status: 500 });
    }

    console.log('✅ Audit log criado:', data[0].id);

    return NextResponse.json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Erro na criação de audit log:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// PUT - Atualizar audit log (raramente usado)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID é obrigatório para atualização'
      }, { status: 400 });
    }

    console.log(`📝 Atualizando audit log ${id} no Supabase...`);

    const { data, error } = await supabase
      .from('audit_log')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Erro ao atualizar audit log:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Audit log não encontrado'
      }, { status: 404 });
    }

    console.log('✅ Audit log atualizado:', data[0].id);

    return NextResponse.json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Erro na atualização de audit log:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// DELETE - Remover audit log (raramente usado, logs são históricos)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID é obrigatório para remoção'
      }, { status: 400 });
    }

    console.log(`🗑️ Removendo audit log ${id} do Supabase...`);

    const { error } = await supabase
      .from('audit_log')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao remover audit log:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Audit log removido');

    return NextResponse.json({
      success: true,
      message: 'Audit log removido com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro na remoção de audit log:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
