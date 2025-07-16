import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSimpleViewsData() {
  console.log('📊 Adicionando dados de visualizações simples...');

  try {
    // 1. Buscar campanhas existentes
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, month')
      .order('created_at', { ascending: false })
      .limit(10);

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`✅ ${campaigns?.length || 0} campanhas encontradas`);

    // 2. Atualizar campo results com dados de visualizações simuladas
    for (let i = 0; i < (campaigns?.length || 0); i++) {
      const campaign = campaigns![i];
      
      // Gerar visualizações baseadas no índice para variedade
      const baseViews = 1500 + (i * 800); // Varia de 1500 a 8700
      
      const resultsData = {
        reach: Math.floor(baseViews * 1.2),
        impressions: Math.floor(baseViews * 1.8),
        engagement: Math.floor(baseViews * 0.05),
        clicks: Math.floor(baseViews * 0.02),
        conversions: Math.floor(baseViews * 0.005),
        roi: (Math.random() * 3 + 1).toFixed(2), // 1-4x ROI
        total_views: baseViews,
        post_views: Math.floor(baseViews * 0.4),
        story_views: Math.floor(baseViews * 0.3),
        reel_views: Math.floor(baseViews * 0.3),
        engagement_rate: (Math.random() * 4 + 2).toFixed(2) // 2-6%
      };

      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ results: resultsData })
        .eq('id', campaign.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar ${campaign.title}:`, updateError);
      } else {
        console.log(`  ✅ ${campaign.title}: ${baseViews.toLocaleString('pt-BR')} visualizações`);
      }
    }

    // 3. Verificar resultado
    const { data: updatedCampaigns, error: verifyError } = await supabase
      .from('campaigns')
      .select('id, title, month, results')
      .order('created_at', { ascending: false })
      .limit(5);

    if (verifyError) {
      console.error('❌ Erro ao verificar:', verifyError);
      return;
    }

    console.log('\n📊 Top 5 campanhas com visualizações:');
    updatedCampaigns?.forEach((campaign, index) => {
      const views = campaign.results?.total_views || 0;
      console.log(`  ${index + 1}. ${campaign.title}: ${views.toLocaleString('pt-BR')} views`);
    });

    console.log('\n🎉 Dados de visualizações adicionados com sucesso!');
    console.log('🔄 Recarregue a página de campanhas para ver os novos cards');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addSimpleViewsData();
}

export { addSimpleViewsData };
