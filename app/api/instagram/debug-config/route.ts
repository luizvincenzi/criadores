import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/config';

// API para debug da configuração do Instagram
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Instagram Debug Config: Verificando configurações');

    // Verificar se é administrador
    const userEmail = request.headers.get('x-user-email');
    const isAdmin = ['luizvincenzi@gmail.com'].includes(userEmail || '');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    // Verificar variáveis de ambiente
    const envVars = {
      INSTAGRAM_APP_ID: process.env.INSTAGRAM_APP_ID,
      INSTAGRAM_APP_SECRET: process.env.INSTAGRAM_APP_SECRET ? '***CONFIGURADO***' : undefined,
      INSTAGRAM_REDIRECT_URI: process.env.INSTAGRAM_REDIRECT_URI,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    };

    // Verificar configuração centralizada
    const appConfig = {
      BASE_URL: APP_CONFIG.BASE_URL,
      APP_URL: APP_CONFIG.APP_URL,
      INSTAGRAM: {
        APP_ID: APP_CONFIG.INSTAGRAM.APP_ID,
        APP_SECRET: APP_CONFIG.INSTAGRAM.APP_SECRET ? '***CONFIGURADO***' : undefined,
        REDIRECT_URI: APP_CONFIG.INSTAGRAM.REDIRECT_URI,
      },
      CLIENT_BUSINESS_ID: APP_CONFIG.CLIENT_BUSINESS_ID,
      ADMIN_EMAILS: APP_CONFIG.ADMIN_EMAILS,
    };

    // Verificar se todas as configurações necessárias estão presentes
    const missingConfigs = [];
    
    if (!process.env.INSTAGRAM_APP_ID) missingConfigs.push('INSTAGRAM_APP_ID');
    if (!process.env.INSTAGRAM_APP_SECRET) missingConfigs.push('INSTAGRAM_APP_SECRET');
    if (!process.env.INSTAGRAM_REDIRECT_URI) missingConfigs.push('INSTAGRAM_REDIRECT_URI');

    // URLs para Meta Business
    const metaBusinessUrls = {
      appDashboard: `https://developers.facebook.com/apps/${APP_CONFIG.INSTAGRAM.APP_ID}/`,
      instagramBasic: `https://developers.facebook.com/apps/${APP_CONFIG.INSTAGRAM.APP_ID}/instagram-basic-display/`,
      webhooks: `https://developers.facebook.com/apps/${APP_CONFIG.INSTAGRAM.APP_ID}/webhooks/`,
      appReview: `https://developers.facebook.com/apps/${APP_CONFIG.INSTAGRAM.APP_ID}/app-review/`,
    };

    // Gerar URL de teste do Instagram
    const testAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${APP_CONFIG.INSTAGRAM.APP_ID}&redirect_uri=${encodeURIComponent(APP_CONFIG.INSTAGRAM.REDIRECT_URI)}&scope=user_profile,user_media&response_type=code&state=test`;

    console.log('✅ Instagram Debug Config: Configurações verificadas', {
      hasAppId: !!APP_CONFIG.INSTAGRAM.APP_ID,
      hasAppSecret: !!APP_CONFIG.INSTAGRAM.APP_SECRET,
      hasRedirectUri: !!APP_CONFIG.INSTAGRAM.REDIRECT_URI,
      missingConfigs: missingConfigs.length,
      userEmail,
      isAdmin
    });

    return NextResponse.json({
      success: true,
      message: 'Configurações do Instagram verificadas',
      data: {
        envVars,
        appConfig,
        missingConfigs,
        metaBusinessUrls,
        testAuthUrl,
        status: {
          configured: missingConfigs.length === 0,
          missingCount: missingConfigs.length,
          readyForConnection: missingConfigs.length === 0
        },
        instructions: {
          step1: 'Configure as variáveis de ambiente no .env.local',
          step2: 'Verifique o Meta Business Dashboard',
          step3: 'Teste a URL de autorização',
          step4: 'Configure webhooks se necessário'
        }
      }
    });

  } catch (error) {
    console.error('❌ Instagram Debug Config Error:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// POST para testar conexão
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Instagram Debug Config: Testando conexão');

    // Verificar se é administrador
    const userEmail = request.headers.get('x-user-email');
    const isAdmin = ['luizvincenzi@gmail.com'].includes(userEmail || '');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem testar.' },
        { status: 403 }
      );
    }

    const { testType } = await request.json();

    if (testType === 'api_connection') {
      // Testar conexão com a API do Instagram
      try {
        const testUrl = 'https://graph.instagram.com/me?fields=id,username&access_token=test';
        const response = await fetch(testUrl);
        const data = await response.json();

        return NextResponse.json({
          success: false,
          message: 'Teste de API realizado (esperado falhar sem token válido)',
          data: {
            status: response.status,
            response: data,
            note: 'Este teste é esperado falhar sem um token de acesso válido'
          }
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'Erro na conexão com API do Instagram',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Tipo de teste não reconhecido',
      availableTests: ['api_connection']
    });

  } catch (error) {
    console.error('❌ Instagram Debug Config Test Error:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
