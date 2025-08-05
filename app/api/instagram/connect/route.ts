import { NextRequest, NextResponse } from 'next/server';
import { instagramAPI } from '@/lib/instagram-api';
import { APP_CONFIG, isAdmin } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json();

    // 👑 USUÁRIOS ADMINISTRADORES: Acesso total
    const userEmail = request.headers.get('x-user-email');
    const userIsAdmin = isAdmin(userEmail || '');

    // Usar Business ID fornecido ou fallback para desenvolvimento
    const finalBusinessId = businessId ||
                           APP_CONFIG.CLIENT_BUSINESS_ID;

    console.log('📱 Instagram Connect: Iniciando processo', {
      businessId: finalBusinessId,
      originalBusinessId: businessId,
      isAdmin: userIsAdmin,
      userEmail,
      appId: APP_CONFIG.INSTAGRAM.APP_ID,
      redirectUri: APP_CONFIG.INSTAGRAM.REDIRECT_URI
    });

    if (!finalBusinessId && !userIsAdmin) {
      console.error('❌ Instagram Connect: Business ID não fornecido');
      return NextResponse.json(
        { error: 'Business ID é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar variáveis de ambiente
    if (!APP_CONFIG.INSTAGRAM.APP_ID || !APP_CONFIG.INSTAGRAM.APP_SECRET) {
      console.error('❌ Instagram Connect: Variáveis de ambiente não configuradas', {
        hasAppId: !!APP_CONFIG.INSTAGRAM.APP_ID,
        hasAppSecret: !!APP_CONFIG.INSTAGRAM.APP_SECRET,
        hasRedirectUri: !!APP_CONFIG.INSTAGRAM.REDIRECT_URI
      });
      return NextResponse.json(
        { error: 'Configuração Instagram incompleta' },
        { status: 500 }
      );
    }

    // Gerar URL de autorização do Instagram
    const authUrl = instagramAPI.getAuthorizationUrl(finalBusinessId);

    console.log('✅ Instagram Connect: URL de autorização gerada', {
      businessId: finalBusinessId,
      authUrl: authUrl.substring(0, 100) + '...'
    });

    return NextResponse.json({
      success: true,
      authUrl,
      message: 'URL de autorização gerada com sucesso',
      debug: {
        appId: APP_CONFIG.INSTAGRAM.APP_ID,
        redirectUri: APP_CONFIG.INSTAGRAM.REDIRECT_URI,
        baseUrl: APP_CONFIG.BASE_URL
      }
    });

  } catch (error) {
    console.error('❌ Instagram Connect Error:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
