import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCreatorsToCampaigns() {
  console.log('👥 Adicionando criadores às campanhas...');

  try {
    // 1. Buscar campanhas que têm dados de visualizações
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, results')
      .not('results', 'is', null)
      .limit(5);

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`✅ ${campaigns?.length || 0} campanhas encontradas`);

    // 2. Buscar criadores ativos
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('id, name, profile_info')
      .eq('status', 'Ativo')
      .limit(10);

    if (creatorsError) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return;
    }

    console.log(`✅ ${creators?.length || 0} criadores encontrados`);

    // 3. Associar criadores às campanhas
    for (let i = 0; i < (campaigns?.length || 0); i++) {
      const campaign = campaigns![i];
      const campaignViews = campaign.results?.total_views || 0;
      
      // Selecionar 2-3 criadores aleatórios para cada campanha
      const numCreators = Math.floor(Math.random() * 2) + 2; // 2 ou 3 criadores
      const selectedCreators = creators?.slice(i * 2, i * 2 + numCreators) || [];
      
      console.log(`\n🔄 Processando campanha: ${campaign.title}`);
      
      for (let j = 0; j < selectedCreators.length; j++) {
        const creator = selectedCreators[j];
        
        // Distribuir visualizações entre os criadores
        const creatorViews = Math.floor(campaignViews / selectedCreators.length) + 
                           Math.floor(Math.random() * 500); // Adicionar variação
        
        const campaignCreatorData = {
          campaign_id: campaign.id,
          creator_id: creator.id,
          role: 'primary',
          fee: 600 + (j * 200),
          status: 'Confirmado',
          deliverables: {
            briefing_complete: 'Concluído',
            visit_datetime: new Date().toISOString(),
            guest_quantity: 2,
            visit_confirmed: 'Confirmado',
            post_datetime: new Date().toISOString(),
            video_approved: 'Aprovado',
            video_posted: 'Sim',
            content_links: [`https://instagram.com/p/exemplo${i}${j}`],
            // Dados de visualizações
            total_views: creatorViews,
            post_views: Math.floor(creatorViews * 0.4),
            story_views: Math.floor(creatorViews * 0.3),
            reel_views: Math.floor(creatorViews * 0.3),
            engagement_rate: (Math.random() * 4 + 2).toFixed(2),
            reach: Math.floor(creatorViews * 1.3),
            impressions: Math.floor(creatorViews * 1.8),
            likes: Math.floor(creatorViews * 0.05),
            comments: Math.floor(creatorViews * 0.01),
            shares: Math.floor(creatorViews * 0.005)
          }
        };

        // Verificar se já existe relacionamento
        const { data: existing } = await supabase
          .from('campaign_creators')
          .select('id')
          .eq('campaign_id', campaign.id)
          .eq('creator_id', creator.id)
          .single();

        if (!existing) {
          const { error: ccError } = await supabase
            .from('campaign_creators')
            .insert(campaignCreatorData);

          if (ccError) {
            console.error(`❌ Erro ao associar ${creator.name}:`, ccError);
          } else {
            console.log(`  ✅ ${creator.name}: ${creatorViews.toLocaleString('pt-BR')} views`);
          }
        } else {
          console.log(`  ⚠️ ${creator.name}: já associado`);
        }
      }
    }

    // 4. Verificar resultado
    const { data: verification } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        deliverables,
        creator:creators(name),
        campaign:campaigns(title)
      `)
      .limit(5);

    console.log('\n📊 Verificação dos relacionamentos criados:');
    verification?.forEach((cc, index) => {
      const views = cc.deliverables?.total_views || 0;
      console.log(`  ${index + 1}. ${cc.creator?.name} em "${cc.campaign?.title}": ${views.toLocaleString('pt-BR')} views`);
    });

    console.log('\n🎉 Criadores adicionados às campanhas com sucesso!');
    console.log('🔄 Recarregue a página para ver o ranking de criadores');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addCreatorsToCampaigns();
}

export { addCreatorsToCampaigns };
