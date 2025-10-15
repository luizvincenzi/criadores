import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 [Platform] Verificando usuário:', email);

    // Buscar usuário em platform_users
    const { data: platformUser, error } = await supabase
      .from('platform_users')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('email', email.toLowerCase())
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .single();

    if (error || !platformUser) {
      console.log('❌ [Platform] Usuário não encontrado:', email);
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo' },
        { status: 404 }
      );
    }

    console.log('✅ [Platform] Usuário encontrado:', email);

    // Retornar dados do usuário
    return NextResponse.json({
      success: true,
      user: {
        id: platformUser.id,
        email: platformUser.email,
        full_name: platformUser.full_name,
        role: platformUser.role,
        roles: platformUser.roles,
        business_id: platformUser.business_id,
        creator_id: platformUser.creator_id,
        managed_businesses: platformUser.managed_businesses || [],
        permissions: platformUser.permissions || [],
        is_active: platformUser.is_active,
        organization: platformUser.organization,
        platform: platformUser.platform
      }
    });

  } catch (error) {
    console.error('❌ [Platform] Erro na API de verificação de usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Manter compatibilidade com POST também
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 [Platform] Verificando usuário (POST):', email);

    // Buscar usuário em platform_users
    const { data: platformUser, error } = await supabase
      .from('platform_users')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('email', email.toLowerCase())
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .single();

    if (error || !platformUser) {
      console.log('❌ [Platform] Usuário não encontrado:', email);
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo' },
        { status: 404 }
      );
    }

    console.log('✅ [Platform] Usuário encontrado:', email);

    // Retornar dados do usuário
    return NextResponse.json({
      success: true,
      user: {
        id: platformUser.id,
        email: platformUser.email,
        full_name: platformUser.full_name,
        role: platformUser.role,
        roles: platformUser.roles,
        business_id: platformUser.business_id,
        creator_id: platformUser.creator_id,
        managed_businesses: platformUser.managed_businesses || [],
        permissions: platformUser.permissions || [],
        is_active: platformUser.is_active,
        organization: platformUser.organization,
        platform: platformUser.platform
      }
    });

  } catch (error) {
    console.error('❌ [Platform] Erro na API de verificação de usuário (POST):', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

