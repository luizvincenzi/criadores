import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmptyRanking() {
  console.log('🧪 Testando ranking vazio...');

  try {
    // 1. Backup dos dados atuais
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, results')
      .not('results', 'is', null)
      .limit(5);

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`📊 Fazendo backup de ${campaigns?.length || 0} campanhas com dados`);

    // 2. Limpar temporariamente os dados de results
    const { error: clearError } = await supabase
      .from('campaigns')
      .update({ results: null })
      .not('results', 'is', null);

    if (clearError) {
      console.error('❌ Erro ao limpar dados:', clearError);
      return;
    }

    console.log('✅ Dados de visualizações removidos temporariamente');
    console.log('🔄 Recarregue a página para ver "Nenhum trabalho esse mês"');
    console.log('⏰ Aguardando 10 segundos antes de restaurar...');

    // 3. Aguardar 10 segundos
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 4. Restaurar os dados
    for (const campaign of campaigns || []) {
      if (campaign.results) {
        const { error: restoreError } = await supabase
          .from('campaigns')
          .update({ results: campaign.results })
          .eq('id', campaign.id);

        if (restoreError) {
          console.error(`❌ Erro ao restaurar ${campaign.title}:`, restoreError);
        }
      }
    }

    console.log('✅ Dados restaurados com sucesso!');
    console.log('🔄 Recarregue a página para ver o ranking normal');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testEmptyRanking();
}

export { testEmptyRanking };
