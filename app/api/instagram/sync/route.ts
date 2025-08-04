import { NextRequest, NextResponse } from 'next/server';
import { instagramAPI } from '@/lib/instagram-api';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Buscar conexão Instagram do business
    const { data: connection, error: connectionError } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'Conexão Instagram não encontrada' },
        { status: 404 }
      );
    }

    console.log('📱 Instagram: Iniciando sincronização para business:', businessId);

    // Validar token
    const isTokenValid = await instagramAPI.validateToken(connection.access_token);
    if (!isTokenValid) {
      // Tentar renovar token
      try {
        const refreshedToken = await instagramAPI.refreshLongLivedToken(connection.access_token);
        
        // Atualizar token no banco
        await supabase
          .from('instagram_connections')
          .update({
            access_token: refreshedToken.access_token,
            token_expires_at: refreshedToken.expires_in 
              ? new Date(Date.now() + refreshedToken.expires_in * 1000).toISOString()
              : null,
            last_sync: new Date().toISOString()
          })
          .eq('business_id', businessId);

        connection.access_token = refreshedToken.access_token;
        console.log('✅ Instagram: Token renovado com sucesso');
      } catch (refreshError) {
        console.error('❌ Erro ao renovar token Instagram:', refreshError);
        return NextResponse.json(
          { error: 'Token Instagram expirado. Reconecte sua conta.' },
          { status: 401 }
        );
      }
    }

    // Obter dados atualizados do perfil
    const userProfile = await instagramAPI.getUserProfile(connection.access_token);
    
    // Obter mídia recente
    const media = await instagramAPI.getUserMedia(connection.access_token, 50);
    
    let postsProcessed = 0;
    let postsUpdated = 0;
    let postsCreated = 0;

    // Processar cada post
    for (const post of media) {
      try {
        // Obter insights do post
        const insights = await instagramAPI.getMediaInsights(post.id, connection.access_token);

        const postData = {
          business_id: businessId,
          instagram_media_id: post.id,
          media_type: post.media_type,
          media_url: post.media_url,
          permalink: post.permalink,
          caption: post.caption || '',
          timestamp: post.timestamp,
          likes_count: insights.likes || 0,
          comments_count: insights.comments || 0,
          impressions: insights.impressions || 0,
          reach: insights.reach || 0,
          engagement: insights.engagement || 0,
          shares: insights.shares || 0,
          saves: insights.saves || 0,
          synced_at: new Date().toISOString()
        };

        // Verificar se o post já existe
        const { data: existingPost } = await supabase
          .from('instagram_posts')
          .select('id')
          .eq('instagram_media_id', post.id)
          .single();

        if (existingPost) {
          // Atualizar post existente
          await supabase
            .from('instagram_posts')
            .update(postData)
            .eq('instagram_media_id', post.id);
          postsUpdated++;
        } else {
          // Inserir novo post
          await supabase
            .from('instagram_posts')
            .insert(postData);
          postsCreated++;
        }

        postsProcessed++;

      } catch (postError) {
        console.error(`❌ Erro ao processar post ${post.id}:`, postError);
      }
    }

    // Atualizar informações da conexão
    await supabase
      .from('instagram_connections')
      .update({
        username: userProfile.username,
        account_type: userProfile.account_type,
        last_sync: new Date().toISOString()
      })
      .eq('business_id', businessId);

    console.log('✅ Instagram: Sincronização concluída', {
      postsProcessed,
      postsCreated,
      postsUpdated
    });

    return NextResponse.json({
      success: true,
      message: 'Sincronização concluída com sucesso',
      stats: {
        postsProcessed,
        postsCreated,
        postsUpdated,
        username: userProfile.username,
        accountType: userProfile.account_type
      }
    });

  } catch (error) {
    console.error('❌ Instagram Sync Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
