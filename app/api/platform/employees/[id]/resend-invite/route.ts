import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
const MAX_RESENDS_PER_HOUR = 3;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Rate limit tracking em memória
const resendTracking = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const tracking = resendTracking.get(email);

  if (!tracking || now > tracking.resetAt) {
    resendTracking.set(email, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (tracking.count >= MAX_RESENDS_PER_HOUR) return false;

  tracking.count++;
  return true;
}

/**
 * POST /api/platform/employees/[id]/resend-invite
 * Reenviar convite para funcionário
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { requester_id } = body;
    const crmKey = request.headers.get('x-crm-service-key');

    // Buscar o employee
    const { data: employee, error: empError } = await supabase
      .from('platform_users')
      .select('*')
      .eq('id', id)
      .eq('role', 'business_employee')
      .single();

    if (empError || !employee) {
      return NextResponse.json(
        { success: false, error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar acesso
    const isCrm = crmKey === process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!isCrm) {
      const { data: owner } = await supabase
        .from('platform_users')
        .select('id')
        .eq('id', requester_id)
        .eq('business_id', employee.business_id)
        .eq('role', 'business_owner')
        .eq('is_active', true)
        .single();

      if (!owner) {
        return NextResponse.json(
          { success: false, error: 'Sem permissão' },
          { status: 403 }
        );
      }
    }

    // Verificar se já tem senha (já ativou)
    if (employee.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Este funcionário já ativou a conta' },
        { status: 400 }
      );
    }

    // Rate limit
    if (!checkRateLimit(employee.email)) {
      return NextResponse.json(
        { success: false, error: `Limite de ${MAX_RESENDS_PER_HOUR} reenvios por hora atingido` },
        { status: 429 }
      );
    }

    // Buscar business name
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', employee.business_id)
      .single();

    // Reenviar convite
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(employee.email, {
      redirectTo: 'https://www.criadores.app/auth/callback',
      data: {
        full_name: employee.full_name,
        business_name: business?.name || '',
        business_id: employee.business_id,
        role: 'business_employee',
        entity_type: 'business_employee',
        email_verified: true,
        invited_at: new Date().toISOString()
      }
    });

    if (inviteError) {
      console.error('[Resend Invite] Erro:', inviteError);
      return NextResponse.json(
        { success: false, error: 'Erro ao reenviar convite' },
        { status: 500 }
      );
    }

    console.log(`[Resend Invite] Convite reenviado para ${employee.email}`);

    return NextResponse.json({
      success: true,
      message: 'Convite reenviado com sucesso'
    });
  } catch (error) {
    console.error('[Resend Invite] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
