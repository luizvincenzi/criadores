import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    console.log('🔍 [Platform API] Buscando usuário por ID:', userId);

    // Buscar usuário em platform_users
    const { data: platformUser, error } = await supabase
      .from('platform_users')
      .select('*')
      .eq('id', userId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (error || !platformUser) {
      console.log('❌ [Platform API] Usuário não encontrado:', userId);
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

  } catch (error) {
    console.error('❌ [Platform API] Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}