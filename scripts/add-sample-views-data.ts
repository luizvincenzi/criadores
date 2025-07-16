import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSampleViewsData() {
  console.log('📊 Adicionando dados de visualizações de exemplo...');

  try {
    // 1. Buscar campanhas existentes
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        month,
        campaign_creators(
          id,
          creator_id,
          deliverables
        )
      `);

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`✅ ${campaigns?.length || 0} campanhas encontradas`);

    // 2. Atualizar deliverables com dados de visualizações
    for (const campaign of campaigns || []) {
      console.log(`\n🔄 Processando campanha: ${campaign.title}`);
      
      for (const cc of campaign.campaign_creators || []) {
        // Gerar visualizações aleatórias baseadas no ID para consistência
        const hash = cc.id.split('-')[0];
        const baseViews = parseInt(hash, 16) % 3000 + 1000; // Entre 1000 e 4000
        
        const sampleViews = {
          ...cc.deliverables,
          total_views: baseViews,
          post_views: Math.floor(baseViews * 0.4),
          story_views: Math.floor(baseViews * 0.3),
          reel_views: Math.floor(baseViews * 0.3),
          engagement_rate: (Math.random() * 5 + 2).toFixed(2), // 2-7%
          reach: Math.floor(baseViews * 1.2),
          impressions: Math.floor(baseViews * 1.5)
        };

        // Atualizar no banco
        const { error: updateError } = await supabase
          .from('campaign_creators')
          .update({ deliverables: sampleViews })
          .eq('id', cc.id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar ${cc.id}:`, updateError);
        } else {
          console.log(`  ✅ Criador atualizado: ${sampleViews.total_views} views`);
        }
      }
    }

    // 3. Verificar resultado
    const { data: updatedCampaigns, error: verifyError } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        month,
        campaign_creators(
          deliverables
        )
      `)
      .limit(3);

    if (verifyError) {
      console.error('❌ Erro ao verificar:', verifyError);
      return;
    }

    console.log('\n📊 Resultado das atualizações:');
    updatedCampaigns?.forEach(campaign => {
      const totalViews = campaign.campaign_creators?.reduce((total: number, cc: any) => {
        return total + (cc.deliverables?.total_views || 0);
      }, 0) || 0;
      
      console.log(`  - ${campaign.title}: ${totalViews.toLocaleString('pt-BR')} visualizações`);
    });

    console.log('\n🎉 Dados de visualizações adicionados com sucesso!');
    console.log('🔄 Recarregue a página de campanhas para ver os novos dados');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addSampleViewsData();
}

export { addSampleViewsData };
