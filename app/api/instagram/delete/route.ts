import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Rota para processar solicitações de exclusão de dados do Instagram
// Chamada pelo Meta quando usuário solicita exclusão de dados
export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Instagram Delete: Processando solicitação de exclusão');

    const body = await request.json();
    const { user_id, signed_request } = body;

    if (!user_id) {
      console.error('❌ Instagram Delete: User ID não fornecido');
      return NextResponse.json(
        { error: 'User ID é obrigatório' },
        { status: 400 }
      );
    }

    console.log('📱 Instagram Delete: Excluindo dados do usuário', { user_id });

    const supabase = createClient();

    // Gerar ID único para rastreamento da solicitação
    const deletionRequestId = `del_${Date.now()}_${user_id}`;

    // 1. Excluir posts do Instagram
    const { error: postsError } = await supabase
      .from('instagram_posts')
      .delete()
      .in('business_id', 
        supabase
          .from('instagram_connections')
          .select('business_id')
          .eq('instagram_user_id', user_id)
      );

    if (postsError) {
      console.error('❌ Erro ao excluir posts:', postsError);
    } else {
      console.log('✅ Posts do Instagram excluídos');
    }

    // 2. Excluir menções
    const { error: mentionsError } = await supabase
      .from('instagram_mentions')
      .delete()
      .in('business_id',
        supabase
          .from('instagram_connections')
          .select('business_id')
          .eq('instagram_user_id', user_id)
      );

    if (mentionsError) {
      console.error('❌ Erro ao excluir menções:', mentionsError);
    } else {
      console.log('✅ Menções do Instagram excluídas');
    }

    // 3. Excluir conexão Instagram
    const { error: connectionError } = await supabase
      .from('instagram_connections')
      .delete()
      .eq('instagram_user_id', user_id);

    if (connectionError) {
      console.error('❌ Erro ao excluir conexão:', connectionError);
      return NextResponse.json(
        { error: 'Erro ao processar exclusão' },
        { status: 500 }
      );
    }

    console.log('✅ Instagram Delete: Dados excluídos com sucesso');

    // Retornar URL de confirmação conforme exigido pelo Meta
    const confirmationUrl = `https://criadores.app/data-deletion-status?id=${deletionRequestId}`;

    return NextResponse.json({
      url: confirmationUrl,
      confirmation_code: deletionRequestId,
      message: 'Solicitação de exclusão processada com sucesso'
    });

  } catch (error) {
    console.error('❌ Instagram Delete Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Método GET para verificação
export async function GET() {
  return NextResponse.json({
    message: 'Instagram Data Deletion endpoint ativo',
    timestamp: new Date().toISOString(),
    info: 'Este endpoint processa solicitações de exclusão de dados do Instagram conforme LGPD/GDPR'
  });
}
