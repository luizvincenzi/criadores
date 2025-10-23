import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const businessId = searchParams.get('business_id');
    const active = searchParams.get('active');

    // Se tiver email, buscar por email (comportamento original)
    if (email) {
      console.log('🔍 [Platform API] Buscando usuário por email:', email);

      // Buscar usuário em platform_users
      const { data: platformUser, error } = await supabase
        .from('platform_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('organization_id', DEFAULT_ORG_ID)
        .single();

      if (error || !platformUser) {
        console.log('❌ [Platform API] Usuário não encontrado:', email);
        return NextResponse.json(
          { success: false, error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      console.log('✅ [Platform API] Usuário encontrado:', platformUser.email);

      return NextResponse.json({
        success: true,
        user: platformUser
      });
    }

    // Se tiver business_id, buscar todos os usuários desse business
    if (businessId) {
      console.log('🔍 [Platform API] Buscando usuários por business_id:', businessId);

      let query = supabase
        .from('platform_users')
        .select('*')
        .eq('business_id', businessId)
        .eq('organization_id', DEFAULT_ORG_ID);

      // Filtrar por is_active se fornecido
      if (active !== null && active !== undefined) {
        query = query.eq('is_active', active === 'true');
      }

      const { data: platformUsers, error } = await query.order('full_name');

      if (error) {
        console.error('❌ [Platform API] Erro ao buscar usuários:', error);
        return NextResponse.json(
          { success: false, error: 'Erro ao buscar usuários' },
          { status: 500 }
        );
      }

      console.log(`✅ [Platform API] ${platformUsers?.length || 0} usuários encontrados para business ${businessId}`);

      return NextResponse.json({
        success: true,
        users: platformUsers || [],
        total: platformUsers?.length || 0
      });
    }

    // Se não tiver nem email nem business_id
    return NextResponse.json(
      { success: false, error: 'Email ou business_id é obrigatório' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ [Platform API] Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}