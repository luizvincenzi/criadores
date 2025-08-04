import { NextRequest, NextResponse } from 'next/server';
import { instagramAPI } from '@/lib/instagram-api';

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json();

    console.log('📱 Instagram Connect: Iniciando processo', {
      businessId,
      appId: process.env.INSTAGRAM_APP_ID,
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI
    });

    if (!businessId) {
      console.error('❌ Instagram Connect: Business ID não fornecido');
      return NextResponse.json(
        { error: 'Business ID é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar variáveis de ambiente
    if (!process.env.INSTAGRAM_APP_ID || !process.env.INSTAGRAM_APP_SECRET) {
      console.error('❌ Instagram Connect: Variáveis de ambiente não configuradas', {
        hasAppId: !!process.env.INSTAGRAM_APP_ID,
        hasAppSecret: !!process.env.INSTAGRAM_APP_SECRET,
        hasRedirectUri: !!process.env.INSTAGRAM_REDIRECT_URI
      });
      return NextResponse.json(
        { error: 'Configuração Instagram incompleta' },
        { status: 500 }
      );
    }

    // Gerar URL de autorização do Instagram
    const authUrl = instagramAPI.getAuthorizationUrl(businessId);

    console.log('✅ Instagram Connect: URL de autorização gerada', {
      businessId,
      authUrl: authUrl.substring(0, 100) + '...'
    });

    return NextResponse.json({
      success: true,
      authUrl,
      message: 'URL de autorização gerada com sucesso',
      debug: {
        appId: process.env.INSTAGRAM_APP_ID,
        redirectUri: process.env.INSTAGRAM_REDIRECT_URI
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
