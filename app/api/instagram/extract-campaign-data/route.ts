import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { instagramAPI } from '@/lib/instagram-api';

// API para extrair dados reais do Instagram baseado nos links da tabela campaign_creators
export async function POST(request: NextRequest) {
  try {
    console.log('📱 Instagram Extract: Iniciando extração de dados de campanhas');

    const { campaignId, businessId } = await request.json();
    
    // 👑 USUÁRIOS ADMINISTRADORES: Acesso total
    const userEmail = request.headers.get('x-user-email');
    const isAdmin = ['luizvincenzi@gmail.com'].includes(userEmail || '');
    
    console.log('📊 Instagram Extract: Parâmetros recebidos', {
      campaignId,
      businessId,
      userEmail,
      isAdmin
    });

    const supabase = createClient();

    // 1. Buscar criadores da campanha com links do Instagram
    const { data: campaignCreators, error: creatorsError } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        campaign_id,
        creator_id,
        video_instagram_link,
        video_tiktok_link,
        deliverables,
        performance_data,
        creators(id, name, social_media)
      `)
      .eq('campaign_id', campaignId)
      .neq('status', 'Removido')
      .not('video_instagram_link', 'is', null);

    if (creatorsError) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return NextResponse.json(
        { error: 'Erro ao buscar criadores da campanha' },
        { status: 500 }
      );
    }

    console.log(`📋 Encontrados ${campaignCreators?.length || 0} criadores com links do Instagram`);

    if (!campaignCreators || campaignCreators.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum criador com links do Instagram encontrado',
        data: []
      });
    }

    // 2. Verificar se há conexão Instagram ativa para o business
    const { data: connection, error: connectionError } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single();

    if (connectionError || !connection) {
      console.log('⚠️ Nenhuma conexão Instagram ativa encontrada para o business');
      return NextResponse.json({
        success: false,
        error: 'Conecte uma conta Instagram primeiro',
        needsConnection: true
      }, { status: 400 });
    }

    // 3. Extrair dados de cada post do Instagram
    const extractedData = [];
    let successCount = 0;
    let errorCount = 0;

    for (const creator of campaignCreators) {
      try {
        console.log(`🔍 Processando criador: ${creator.creators.name}`);
        
        if (!creator.video_instagram_link) {
          console.log(`⚠️ Criador ${creator.creators.name} não tem link do Instagram`);
          continue;
        }

        // Extrair ID do post do link do Instagram
        const postId = extractInstagramPostId(creator.video_instagram_link);
        
        if (!postId) {
          console.log(`❌ Não foi possível extrair ID do post: ${creator.video_instagram_link}`);
          errorCount++;
          continue;
        }

        console.log(`📱 Extraindo dados do post: ${postId}`);

        // Buscar dados do post via Instagram API
        const postData = await instagramAPI.getMediaById(postId, connection.access_token);
        
        if (postData) {
          // Buscar insights do post
          const insights = await instagramAPI.getMediaInsights(postId, connection.access_token);
          
          // Atualizar performance_data na tabela campaign_creators
          const updatedPerformanceData = {
            reach: insights?.reach || 0,
            impressions: insights?.impressions || 0,
            engagement: insights?.engagement || 0,
            likes: postData.like_count || 0,
            comments: postData.comments_count || 0,
            saves: insights?.saves || 0,
            shares: insights?.shares || 0,
            last_updated: new Date().toISOString()
          };

          // Atualizar no banco de dados
          const { error: updateError } = await supabase
            .from('campaign_creators')
            .update({
              performance_data: updatedPerformanceData,
              updated_at: new Date().toISOString()
            })
            .eq('id', creator.id);

          if (updateError) {
            console.error(`❌ Erro ao atualizar dados do criador ${creator.creators.name}:`, updateError);
            errorCount++;
          } else {
            console.log(`✅ Dados atualizados para ${creator.creators.name}`);
            successCount++;
            
            extractedData.push({
              creatorId: creator.creator_id,
              creatorName: creator.creators.name,
              postId,
              postUrl: creator.video_instagram_link,
              data: {
                ...postData,
                insights: updatedPerformanceData
              }
            });
          }
        } else {
          console.log(`❌ Não foi possível obter dados do post: ${postId}`);
          errorCount++;
        }

      } catch (error) {
        console.error(`❌ Erro ao processar criador ${creator.creators.name}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Instagram Extract: Processamento concluído`, {
      total: campaignCreators.length,
      success: successCount,
      errors: errorCount
    });

    return NextResponse.json({
      success: true,
      message: `Dados extraídos com sucesso: ${successCount} posts processados`,
      data: extractedData,
      summary: {
        total: campaignCreators.length,
        success: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('❌ Instagram Extract Error:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Função para extrair ID do post do link do Instagram
function extractInstagramPostId(url: string): string | null {
  try {
    // Padrões de URL do Instagram:
    // https://www.instagram.com/p/POST_ID/
    // https://instagram.com/p/POST_ID/
    // https://www.instagram.com/reel/POST_ID/
    // https://instagram.com/reel/POST_ID/
    
    const patterns = [
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/tv\/([A-Za-z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao extrair ID do post:', error);
    return null;
  }
}

// GET para listar campanhas com links do Instagram
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    
    const supabase = createClient();

    // Buscar campanhas que têm criadores com links do Instagram
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        status,
        created_at,
        campaign_creators!inner(
          id,
          video_instagram_link,
          creators(name)
        )
      `)
      .eq('business_id', businessId)
      .not('campaign_creators.video_instagram_link', 'is', null);

    if (error) {
      console.error('❌ Erro ao buscar campanhas:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar campanhas' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || []
    });

  } catch (error) {
    console.error('❌ Erro ao listar campanhas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
