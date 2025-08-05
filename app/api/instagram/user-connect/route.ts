import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { instagramAPI } from '@/lib/instagram-api';
import { APP_CONFIG } from '@/lib/config';

// API para usuários conectarem suas próprias contas do Instagram
export async function POST(request: NextRequest) {
  try {
    console.log('📱 Instagram User Connect: Iniciando conexão de usuário');

    const { businessId } = await request.json();
    
    // Obter email do usuário
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email do usuário não encontrado' },
        { status: 401 }
      );
    }

    console.log('📱 Instagram User Connect: Processo iniciado', {
      businessId,
      userEmail
    });

    const supabase = createClient();

    // 1. Verificar se o business existe e o usuário tem acesso
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, organization_id')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      console.error('❌ Business não encontrado:', businessError);
      return NextResponse.json(
        { error: 'Business não encontrado ou sem acesso' },
        { status: 404 }
      );
    }

    // 2. Verificar se já existe uma conexão Instagram ativa para este business
    const { data: existingConnection, error: connectionError } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single();

    if (existingConnection) {
      console.log('⚠️ Conexão Instagram já existe para este business');
      return NextResponse.json({
        success: false,
        error: 'Este business já possui uma conta Instagram conectada',
        existing: {
          username: existingConnection.username,
          connected_at: existingConnection.connected_at,
          account_type: existingConnection.account_type
        }
      }, { status: 400 });
    }

    // 3. Verificar configuração do Instagram API
    if (!APP_CONFIG.INSTAGRAM.APP_ID || !APP_CONFIG.INSTAGRAM.APP_SECRET) {
      console.error('❌ Instagram API não configurado');
      return NextResponse.json(
        { 
          error: 'Instagram API não configurado. Entre em contato com o administrador.',
          needsSetup: true
        },
        { status: 500 }
      );
    }

    // 4. Gerar URL de autorização do Instagram
    const authUrl = instagramAPI.getAuthorizationUrl(businessId);

    console.log('✅ Instagram User Connect: URL de autorização gerada', {
      businessId,
      businessName: business.name,
      userEmail,
      authUrl: authUrl.substring(0, 100) + '...'
    });

    // 5. Registrar tentativa de conexão (opcional, para auditoria)
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        table_name: 'instagram_connections',
        operation: 'CONNECT_ATTEMPT',
        record_id: businessId,
        old_values: null,
        new_values: {
          business_id: businessId,
          user_email: userEmail,
          timestamp: new Date().toISOString()
        },
        user_email: userEmail,
        organization_id: business.organization_id
      });

    if (logError) {
      console.warn('⚠️ Erro ao registrar log de auditoria:', logError);
    }

    return NextResponse.json({
      success: true,
      authUrl,
      message: 'URL de autorização gerada com sucesso',
      business: {
        id: business.id,
        name: business.name
      },
      instructions: [
        'Você será redirecionado para o Instagram',
        'Faça login na conta que deseja conectar',
        'Autorize o acesso aos dados da conta',
        'Você será redirecionado de volta para o sistema'
      ]
    });

  } catch (error) {
    console.error('❌ Instagram User Connect Error:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// GET para verificar status da conexão
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID é obrigatório' },
        { status: 400 }
      );
    }

    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email do usuário não encontrado' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Verificar conexão existente
    const { data: connection, error: connectionError } = await supabase
      .from('instagram_connections')
      .select(`
        id,
        instagram_user_id,
        username,
        account_type,
        connected_at,
        last_sync,
        is_active,
        token_expires_at
      `)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single();

    if (connectionError && connectionError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar conexão:', connectionError);
      return NextResponse.json(
        { error: 'Erro ao verificar conexão' },
        { status: 500 }
      );
    }

    const isConnected = !!connection;
    const needsReconnection = connection && connection.token_expires_at && 
                             new Date(connection.token_expires_at) < new Date();

    return NextResponse.json({
      success: true,
      connected: isConnected,
      needsReconnection,
      connection: connection ? {
        username: connection.username,
        account_type: connection.account_type,
        connected_at: connection.connected_at,
        last_sync: connection.last_sync,
        expires_at: connection.token_expires_at
      } : null,
      message: isConnected 
        ? (needsReconnection ? 'Conexão expirada, reconexão necessária' : 'Instagram conectado')
        : 'Instagram não conectado'
    });

  } catch (error) {
    console.error('❌ Instagram Connection Status Error:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// DELETE para desconectar Instagram
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID é obrigatório' },
        { status: 400 }
      );
    }

    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email do usuário não encontrado' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Desativar conexão
    const { error: disconnectError } = await supabase
      .from('instagram_connections')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('business_id', businessId);

    if (disconnectError) {
      console.error('❌ Erro ao desconectar Instagram:', disconnectError);
      return NextResponse.json(
        { error: 'Erro ao desconectar Instagram' },
        { status: 500 }
      );
    }

    console.log('✅ Instagram desconectado com sucesso', {
      businessId,
      userEmail
    });

    return NextResponse.json({
      success: true,
      message: 'Instagram desconectado com sucesso'
    });

  } catch (error) {
    console.error('❌ Instagram Disconnect Error:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
