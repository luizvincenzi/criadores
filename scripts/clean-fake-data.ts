import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanFakeData() {
  console.log('🧹 Iniciando limpeza de dados fake...');

  try {
    // 1. Remover posts fake do Instagram
    console.log('📱 Removendo posts fake do Instagram...');
    const { error: postsError } = await supabase
      .from('instagram_posts')
      .delete()
      .like('caption', '%fake%')
      .or('caption.like.%teste%,caption.like.%demo%,caption.like.%example%');

    if (postsError) {
      console.error('❌ Erro ao remover posts fake:', postsError);
    } else {
      console.log('✅ Posts fake removidos');
    }

    // 2. Remover menções fake do Instagram
    console.log('📱 Removendo menções fake do Instagram...');
    const { error: mentionsError } = await supabase
      .from('instagram_mentions')
      .delete()
      .like('caption', '%fake%')
      .or('caption.like.%teste%,caption.like.%demo%,caption.like.%example%');

    if (mentionsError) {
      console.error('❌ Erro ao remover menções fake:', mentionsError);
    } else {
      console.log('✅ Menções fake removidas');
    }

    // 3. Limpar performance_data fake dos campaign_creators
    console.log('📊 Limpando dados de performance fake...');
    const { error: performanceError } = await supabase
      .from('campaign_creators')
      .update({
        performance_data: {
          reach: 0,
          saves: 0,
          clicks: 0,
          shares: 0,
          engagement: 0,
          impressions: 0
        }
      })
      .neq('performance_data', '{"reach": 0, "saves": 0, "clicks": 0, "shares": 0, "engagement": 0, "impressions": 0}');

    if (performanceError) {
      console.error('❌ Erro ao limpar dados de performance:', performanceError);
    } else {
      console.log('✅ Dados de performance limpos');
    }

    // 4. Verificar campanhas com dados fake
    console.log('📋 Verificando campanhas...');
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, description')
      .or('title.like.%fake%,title.like.%teste%,title.like.%demo%,description.like.%fake%,description.like.%teste%,description.like.%demo%');

    if (campaignsError) {
      console.error('❌ Erro ao verificar campanhas:', campaignsError);
    } else {
      console.log(`📋 Encontradas ${campaigns?.length || 0} campanhas com dados fake`);
      if (campaigns && campaigns.length > 0) {
        console.log('⚠️ Campanhas com dados fake encontradas:');
        campaigns.forEach(campaign => {
          console.log(`  - ${campaign.title} (${campaign.id})`);
        });
        console.log('💡 Execute manualmente a remoção se necessário');
      }
    }

    // 5. Verificar criadores com dados fake
    console.log('👥 Verificando criadores...');
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('id, name, contact_info')
      .or('name.like.%fake%,name.like.%teste%,name.like.%demo%');

    if (creatorsError) {
      console.error('❌ Erro ao verificar criadores:', creatorsError);
    } else {
      console.log(`👥 Encontrados ${creators?.length || 0} criadores com dados fake`);
      if (creators && creators.length > 0) {
        console.log('⚠️ Criadores com dados fake encontrados:');
        creators.forEach(creator => {
          console.log(`  - ${creator.name} (${creator.id})`);
        });
        console.log('💡 Execute manualmente a remoção se necessário');
      }
    }

    // 6. Verificar businesses com dados fake
    console.log('🏢 Verificando businesses...');
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('id, name, description')
      .or('name.like.%fake%,name.like.%teste%,name.like.%demo%,description.like.%fake%,description.like.%teste%,description.like.%demo%');

    if (businessesError) {
      console.error('❌ Erro ao verificar businesses:', businessesError);
    } else {
      console.log(`🏢 Encontrados ${businesses?.length || 0} businesses com dados fake`);
      if (businesses && businesses.length > 0) {
        console.log('⚠️ Businesses com dados fake encontrados:');
        businesses.forEach(business => {
          console.log(`  - ${business.name} (${business.id})`);
        });
        console.log('💡 Execute manualmente a remoção se necessário');
      }
    }

    // 7. Resetar dados de performance para zero
    console.log('🔄 Resetando todos os dados de performance para zero...');
    const { error: resetError } = await supabase
      .from('campaign_creators')
      .update({
        performance_data: {
          reach: 0,
          saves: 0,
          clicks: 0,
          shares: 0,
          engagement: 0,
          impressions: 0,
          last_updated: null
        },
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Atualizar todos

    if (resetError) {
      console.error('❌ Erro ao resetar dados de performance:', resetError);
    } else {
      console.log('✅ Todos os dados de performance resetados para zero');
    }

    console.log('🎉 Limpeza de dados fake concluída!');
    console.log('');
    console.log('📋 RESUMO:');
    console.log('✅ Posts fake do Instagram removidos');
    console.log('✅ Menções fake do Instagram removidas');
    console.log('✅ Dados de performance resetados para zero');
    console.log('✅ Sistema pronto para dados reais do Instagram');
    console.log('');
    console.log('🔗 PRÓXIMOS PASSOS:');
    console.log('1. Configure o Meta Business conforme o guia');
    console.log('2. Conecte uma conta Instagram real');
    console.log('3. Adicione links reais do Instagram na tabela campaign_creators');
    console.log('4. Use a página /instagram-data para extrair dados reais');

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanFakeData();
}

export { cleanFakeData };
