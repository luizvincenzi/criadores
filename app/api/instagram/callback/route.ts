import { NextRequest, NextResponse } from 'next/server';
import { instagramAPI } from '@/lib/instagram-api';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // businessId
    const error = searchParams.get('error');

    if (error) {
      console.error('❌ Instagram OAuth Error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?instagram_error=${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?instagram_error=missing_params`
      );
    }

    console.log('📱 Instagram: Processando callback para business:', state);

    // Trocar código por token de acesso
    const tokenResponse = await instagramAPI.exchangeCodeForToken(code);
    console.log('✅ Instagram: Token de acesso obtido');

    // Obter token de longa duração
    const longLivedToken = await instagramAPI.getLongLivedToken(tokenResponse.access_token);
    console.log('✅ Instagram: Token de longa duração obtido');

    // Obter perfil do usuário
    const userProfile = await instagramAPI.getUserProfile(longLivedToken.access_token);
    console.log('✅ Instagram: Perfil do usuário obtido:', userProfile.username);

    // Salvar dados no Supabase
    const supabase = createClient();
    
    const instagramData = {
      business_id: state,
      instagram_user_id: userProfile.id,
      username: userProfile.username,
      account_type: userProfile.account_type,
      access_token: longLivedToken.access_token,
      token_expires_at: longLivedToken.expires_in 
        ? new Date(Date.now() + longLivedToken.expires_in * 1000).toISOString()
        : null,
      connected_at: new Date().toISOString(),
      is_active: true,
      last_sync: new Date().toISOString()
    };

    // Verificar se já existe uma conexão para este business
    const { data: existingConnection } = await supabase
      .from('instagram_connections')
      .select('id')
      .eq('business_id', state)
      .single();

    if (existingConnection) {
      // Atualizar conexão existente
      const { error: updateError } = await supabase
        .from('instagram_connections')
        .update(instagramData)
        .eq('business_id', state);

      if (updateError) {
        console.error('❌ Erro ao atualizar conexão Instagram:', updateError);
        throw updateError;
      }
    } else {
      // Criar nova conexão
      const { error: insertError } = await supabase
        .from('instagram_connections')
        .insert(instagramData);

      if (insertError) {
        console.error('❌ Erro ao salvar conexão Instagram:', insertError);
        throw insertError;
      }
    }

    console.log('✅ Instagram: Conexão salva no banco de dados');

    // Fazer primeira sincronização de dados
    try {
      await syncInstagramData(state, longLivedToken.access_token);
      console.log('✅ Instagram: Primeira sincronização concluída');
    } catch (syncError) {
      console.error('⚠️ Erro na primeira sincronização:', syncError);
      // Não falhar o processo por causa da sincronização
    }

    // Redirecionar de volta para o dashboard com sucesso
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?instagram_success=true`
    );

  } catch (error) {
    console.error('❌ Instagram Callback Error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?instagram_error=callback_failed`
    );
  }
}

// Função para sincronizar dados do Instagram
async function syncInstagramData(businessId: string, accessToken: string) {
  const supabase = createClient();

  try {
    // Obter mídia recente do usuário
    const media = await instagramAPI.getUserMedia(accessToken, 50);
    console.log(`📊 Instagram: ${media.length} posts encontrados`);

    // Processar cada post
    for (const post of media) {
      try {
        // Obter insights do post (se disponível)
        const insights = await instagramAPI.getMediaInsights(post.id, accessToken);

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
        } else {
          // Inserir novo post
          await supabase
            .from('instagram_posts')
            .insert(postData);
        }

      } catch (postError) {
        console.error(`❌ Erro ao processar post ${post.id}:`, postError);
        // Continuar com os outros posts
      }
    }

    console.log('✅ Instagram: Sincronização de posts concluída');

  } catch (error) {
    console.error('❌ Erro na sincronização Instagram:', error);
    throw error;
  }
}
