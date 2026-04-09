import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
const MAX_EMPLOYEES_PER_BUSINESS = 10;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Verifica se o requester é business_owner do business ou CRM staff
 */
async function verifyAccess(requesterId: string | null, businessId: string, crmKey: string | null): Promise<boolean> {
  // CRM service key bypass
  if (crmKey === process.env.SUPABASE_SERVICE_ROLE_KEY) return true;

  if (!requesterId) return false;

  const { data: owner } = await supabase
    .from('platform_users')
    .select('id, role, business_id')
    .eq('id', requesterId)
    .eq('business_id', businessId)
    .eq('role', 'business_owner')
    .eq('is_active', true)
    .single();

  return !!owner;
}

/**
 * GET /api/platform/employees?business_id=UUID
 * Lista funcionários de um business
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const requesterId = searchParams.get('requester_id');
    const includeInactive = searchParams.get('include_inactive') === 'true';
    const crmKey = request.headers.get('x-crm-service-key');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'business_id é obrigatório' },
        { status: 400 }
      );
    }

    const hasAccess = await verifyAccess(requesterId, businessId, crmKey);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para acessar funcionários deste business' },
        { status: 403 }
      );
    }

    let query = supabase
      .from('platform_users')
      .select('id, email, full_name, permissions, is_active, invitation_status, invited_by, last_login, created_at')
      .eq('business_id', businessId)
      .eq('role', 'business_employee')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: employees, error } = await query.order('full_name');

    if (error) {
      console.error('[Employees API] Erro ao listar:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar funcionários' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      employees: employees || [],
      total: employees?.length || 0,
      limit: MAX_EMPLOYEES_PER_BUSINESS
    });
  } catch (error) {
    console.error('[Employees API] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/employees
 * Criar e convidar um novo funcionário
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, email, full_name, permissions, requester_id } = body;
    const crmKey = request.headers.get('x-crm-service-key');

    // Validações
    if (!business_id || !email || !full_name) {
      return NextResponse.json(
        { success: false, error: 'business_id, email e full_name são obrigatórios' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verificar acesso
    const hasAccess = await verifyAccess(requester_id, business_id, crmKey);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para adicionar funcionários neste business' },
        { status: 403 }
      );
    }

    // Verificar limite de funcionários
    const { count } = await supabase
      .from('platform_users')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business_id)
      .eq('role', 'business_employee')
      .eq('is_active', true)
      .eq('organization_id', DEFAULT_ORG_ID);

    if ((count || 0) >= MAX_EMPLOYEES_PER_BUSINESS) {
      return NextResponse.json(
        { success: false, error: `Limite máximo de ${MAX_EMPLOYEES_PER_BUSINESS} funcionários atingido` },
        { status: 409 }
      );
    }

    // Verificar se email já existe neste business
    const { data: existing } = await supabase
      .from('platform_users')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('business_id', business_id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Já existe um usuário com este email nesta empresa' },
        { status: 409 }
      );
    }

    // Permissões padrão se não fornecidas
    const employeePermissions = permissions || {
      campaigns: { read: true, write: false, delete: false },
      conteudo: { read: true, write: false, delete: false },
      briefings: { read: false, write: false, delete: false },
      reports: { read: true, write: false, delete: false },
      tasks: { read: false, write: false, delete: false }
    };

    // Buscar nome do business
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', business_id)
      .single();

    // Criar registro em platform_users
    const { data: employee, error: createError } = await supabase
      .from('platform_users')
      .insert({
        organization_id: DEFAULT_ORG_ID,
        email: normalizedEmail,
        full_name: full_name.trim(),
        role: 'business_employee',
        roles: ['business_employee'],
        business_id: business_id,
        permissions: employeePermissions,
        preferences: { theme: 'light', language: 'pt-BR', notifications: { email: true, push: false, in_app: true } },
        is_active: true,
        invited_by: requester_id || null,
        invitation_status: 'pending',
        platform: 'client'
      })
      .select()
      .single();

    if (createError) {
      console.error('[Employees API] Erro ao criar:', createError);
      return NextResponse.json(
        { success: false, error: 'Erro ao criar funcionário' },
        { status: 500 }
      );
    }

    // Criar token de ativação
    const activationToken = uuidv4();
    await supabase
      .from('activation_tokens')
      .insert({
        email: normalizedEmail,
        token: activationToken,
        user_id: employee.id,
        expires_at: null // Token permanente
      });

    // Enviar convite via Supabase Auth
    try {
      await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
        redirectTo: 'https://www.criadores.app/auth/callback',
        data: {
          full_name: full_name.trim(),
          business_name: business?.name || '',
          business_id: business_id,
          role: 'business_employee',
          entity_type: 'business_employee',
          email_verified: true,
          invited_at: new Date().toISOString()
        }
      });
    } catch (inviteError) {
      console.error('[Employees API] Erro ao enviar convite:', inviteError);
      // Não falha a operação - o convite pode ser reenviado depois
    }

    console.log(`[Employees API] Funcionário criado: ${normalizedEmail} para business ${business_id}`);

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        email: employee.email,
        full_name: employee.full_name,
        permissions: employee.permissions,
        invitation_status: employee.invitation_status,
        is_active: employee.is_active,
        created_at: employee.created_at
      },
      activation_token: activationToken
    });
  } catch (error) {
    console.error('[Employees API] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
