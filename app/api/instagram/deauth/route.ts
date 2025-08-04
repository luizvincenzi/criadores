import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Rota para processar desautorização do Instagram
// Chamada pelo Meta quando usuário remove autorização
export async function POST(request: NextRequest) {
  try {
    console.log('🔓 Instagram Deauth: Processando desautorização');

    const body = await request.json();
    const { user_id, signed_request } = body;

    if (!user_id) {
      console.error('❌ Instagram Deauth: User ID não fornecido');
      return NextResponse.json(
        { error: 'User ID é obrigatório' },
        { status: 400 }
      );
    }

    console.log('📱 Instagram Deauth: Desautorizando usuário', { user_id });

    const supabase = createClient();

    // Desativar conexão Instagram do usuário
    const { error } = await supabase
      .from('instagram_connections')
      .update({
        is_active: false,
        deauthorized_at: new Date().toISOString(),
        access_token: null // Remover token por segurança
      })
      .eq('instagram_user_id', user_id);

    if (error) {
      console.error('❌ Erro ao desautorizar usuário:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }

    console.log('✅ Instagram Deauth: Usuário desautorizado com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Desautorização processada com sucesso'
    });

  } catch (error) {
    console.error('❌ Instagram Deauth Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Método GET para verificação
export async function GET() {
  return NextResponse.json({
    message: 'Instagram Deauth endpoint ativo',
    timestamp: new Date().toISOString()
  });
}
