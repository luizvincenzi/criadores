import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * 🔒 VALIDAÇÃO DE SEGURANÇA PARA ACESSO DE ESTRATEGISTAS
 */
async function validateAdminAccess(request: NextRequest): Promise<{
  isValid: boolean;
  userRole: string | null;
  error?: string;
}> {
  try {
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');

    if (!userEmail) {
      return {
        isValid: false,
        userRole: null,
        error: 'Email do usuário não encontrado'
      };
    }

    // Apenas admins e managers podem gerenciar acesso de estrategistas
    if (!['admin', 'manager'].includes(userRole || '')) {
      return {
        isValid: false,
        userRole,
        error: 'Apenas administradores podem gerenciar acesso de estrategistas'
      };
    }

    return {
      isValid: true,
      userRole
    };
  } catch (error) {
    return {
      isValid: false,
      userRole: null,
      error: 'Erro na validação de acesso'
    };
  }
}

// GET - Listar acessos de estrategistas
export async function GET(request: NextRequest) {
  try {
    const validation = await validateAdminAccess(request);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const strategistId = searchParams.get('strategistId');
    const businessId = searchParams.get('businessId');
    const strategistEmail = searchParams.get('strategistEmail');

    console.log('🔍 [STRATEGIST ACCESS] Listando acessos:', {
      strategistId,
      businessId,
      strategistEmail
    });

    let query = supabase
      .from('strategist_business_view')
      .select('*');

    // Aplicar filtros
    if (strategistId) {
      query = query.eq('strategist_user_id', strategistId);
    }
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    if (strategistEmail) {
      query = query.eq('strategist_email', strategistEmail);
    }

    const { data: accesses, error } = await query
      .order('granted_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar acessos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar acessos de estrategistas' },
        { status: 500 }
      );
    }

    console.log(`✅ ${accesses?.length || 0} acessos encontrados`);

    return NextResponse.json({
      success: true,
      accesses: accesses || [],
      total: accesses?.length || 0
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Conceder acesso a estrategista
export async function POST(request: NextRequest) {
  try {
    const validation = await validateAdminAccess(request);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      strategistEmail,
      businessId,
      accessLevel = 'read_write',
      expiresAt = null,
      notes = null
    } = body;

    console.log('🔑 [STRATEGIST ACCESS] Concedendo acesso:', {
      strategistEmail,
      businessId,
      accessLevel,
      expiresAt
    });

    // Validação básica
    if (!strategistEmail || !businessId) {
      return NextResponse.json(
        { error: 'Email do estrategista e ID da empresa são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar ID do usuário que está concedendo o acesso
    const userEmail = request.headers.get('x-user-email');
    const { data: grantingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    // Usar função do banco para conceder acesso
    const { data: result, error } = await supabase
      .rpc('grant_strategist_access', {
        p_strategist_email: strategistEmail,
        p_business_id: businessId,
        p_access_level: accessLevel,
        p_granted_by_user_id: grantingUser?.id || null,
        p_expires_at: expiresAt,
        p_notes: notes
      });

    if (error) {
      console.error('❌ Erro ao conceder acesso:', error);
      return NextResponse.json(
        { error: 'Erro ao conceder acesso ao estrategista' },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    console.log('✅ Acesso concedido com sucesso:', result);

    return NextResponse.json({
      success: true,
      message: 'Acesso concedido com sucesso',
      data: result
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Revogar acesso de estrategista
export async function DELETE(request: NextRequest) {
  try {
    const validation = await validateAdminAccess(request);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const strategistEmail = searchParams.get('strategistEmail');
    const businessId = searchParams.get('businessId');

    console.log('🗑️ [STRATEGIST ACCESS] Revogando acesso:', {
      strategistEmail,
      businessId
    });

    if (!strategistEmail || !businessId) {
      return NextResponse.json(
        { error: 'Email do estrategista e ID da empresa são obrigatórios' },
        { status: 400 }
      );
    }

    // Usar função do banco para revogar acesso
    const { data: result, error } = await supabase
      .rpc('revoke_strategist_access', {
        p_strategist_email: strategistEmail,
        p_business_id: businessId
      });

    if (error) {
      console.error('❌ Erro ao revogar acesso:', error);
      return NextResponse.json(
        { error: 'Erro ao revogar acesso do estrategista' },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    console.log('✅ Acesso revogado com sucesso:', result);

    return NextResponse.json({
      success: true,
      message: 'Acesso revogado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar acesso de estrategista
export async function PUT(request: NextRequest) {
  try {
    const validation = await validateAdminAccess(request);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      accessId,
      accessLevel,
      permissions,
      expiresAt,
      notes
    } = body;

    console.log('✏️ [STRATEGIST ACCESS] Atualizando acesso:', {
      accessId,
      accessLevel,
      expiresAt
    });

    if (!accessId) {
      return NextResponse.json(
        { error: 'ID do acesso é obrigatório' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (accessLevel) updateData.access_level = accessLevel;
    if (permissions) updateData.permissions = permissions;
    if (expiresAt !== undefined) updateData.expires_at = expiresAt;
    if (notes !== undefined) updateData.notes = notes;

    const { data: updatedAccess, error } = await supabase
      .from('strategist_business_access')
      .update(updateData)
      .eq('id', accessId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar acesso:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar acesso do estrategista' },
        { status: 500 }
      );
    }

    console.log('✅ Acesso atualizado com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Acesso atualizado com sucesso',
      data: updatedAccess
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
