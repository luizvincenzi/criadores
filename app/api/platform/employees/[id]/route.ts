import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verifica se o requester é business_owner do mesmo business que o employee
 */
async function verifyOwnerAccess(requesterId: string | null, employeeId: string, crmKey: string | null): Promise<{ allowed: boolean; employee?: Record<string, unknown> }> {
  // CRM service key bypass
  if (crmKey === process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data: employee } = await supabase
      .from('platform_users')
      .select('*')
      .eq('id', employeeId)
      .eq('role', 'business_employee')
      .single();
    return { allowed: !!employee, employee: employee || undefined };
  }

  if (!requesterId) return { allowed: false };

  // Buscar o employee
  const { data: employee } = await supabase
    .from('platform_users')
    .select('*')
    .eq('id', employeeId)
    .eq('role', 'business_employee')
    .single();

  if (!employee) return { allowed: false };

  // Verificar se o requester é owner do mesmo business
  const { data: owner } = await supabase
    .from('platform_users')
    .select('id')
    .eq('id', requesterId)
    .eq('business_id', employee.business_id)
    .eq('role', 'business_owner')
    .eq('is_active', true)
    .single();

  return { allowed: !!owner, employee: employee || undefined };
}

/**
 * GET /api/platform/employees/[id]
 * Detalhes de um funcionário
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requester_id');
    const crmKey = request.headers.get('x-crm-service-key');

    const { allowed, employee } = await verifyOwnerAccess(requesterId, id, crmKey);
    if (!allowed || !employee) {
      return NextResponse.json(
        { success: false, error: 'Funcionário não encontrado ou sem permissão' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error('[Employee API] Erro GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/employees/[id]
 * Atualizar permissões, nome ou status do funcionário
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { permissions, full_name, is_active, requester_id } = body;
    const crmKey = request.headers.get('x-crm-service-key');

    const { allowed, employee } = await verifyOwnerAccess(requester_id, id, crmKey);
    if (!allowed || !employee) {
      return NextResponse.json(
        { success: false, error: 'Funcionário não encontrado ou sem permissão' },
        { status: 404 }
      );
    }

    // Montar update parcial
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (permissions !== undefined) updateData.permissions = permissions;
    if (full_name !== undefined) updateData.full_name = full_name.trim();
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updated, error } = await supabase
      .from('platform_users')
      .update(updateData)
      .eq('id', id)
      .eq('role', 'business_employee')
      .select()
      .single();

    if (error) {
      console.error('[Employee API] Erro PATCH:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar funcionário' },
        { status: 500 }
      );
    }

    console.log(`[Employee API] Funcionário ${id} atualizado`);

    return NextResponse.json({ success: true, employee: updated });
  } catch (error) {
    console.error('[Employee API] Erro PATCH:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/employees/[id]
 * Remover funcionário completamente
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requester_id');
    const crmKey = request.headers.get('x-crm-service-key');

    const { allowed, employee } = await verifyOwnerAccess(requesterId, id, crmKey);
    if (!allowed || !employee) {
      return NextResponse.json(
        { success: false, error: 'Funcionário não encontrado ou sem permissão' },
        { status: 404 }
      );
    }

    // Deletar tokens de ativação
    await supabase
      .from('activation_tokens')
      .delete()
      .eq('user_id', id);

    // Deletar o platform_user
    const { error } = await supabase
      .from('platform_users')
      .delete()
      .eq('id', id)
      .eq('role', 'business_employee');

    if (error) {
      console.error('[Employee API] Erro DELETE:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao remover funcionário' },
        { status: 500 }
      );
    }

    console.log(`[Employee API] Funcionário ${id} removido`);

    return NextResponse.json({ success: true, message: 'Funcionário removido com sucesso' });
  } catch (error) {
    console.error('[Employee API] Erro DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
