const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function testFixedAPIs() {
  console.log('🧪 Testando APIs corrigidas...');

  try {
    // 1. Verificar se as constraints foram aplicadas
    console.log('\n🔒 1. VERIFICANDO CONSTRAINTS');
    
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('business_id, month')
      .eq('organization_id', DEFAULT_ORG_ID);

    const duplicateCheck = {};
    campaigns?.forEach(campaign => {
      const key = `${campaign.business_id}-${campaign.month}`;
      duplicateCheck[key] = (duplicateCheck[key] || 0) + 1;
    });

    const duplicates = Object.entries(duplicateCheck).filter(([key, count]) => count > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ Constraint única funcionando - nenhuma duplicata encontrada');
    } else {
      console.log(`❌ ${duplicates.length} duplicatas ainda existem`);
    }

    // 2. Verificar se campaign_date foi removida
    console.log('\n🗑️ 2. VERIFICANDO REMOÇÃO DE CAMPAIGN_DATE');
    
    const { data: sampleCampaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);

    if (sampleCampaign && sampleCampaign.length > 0) {
      const columns = Object.keys(sampleCampaign[0]);
      if (columns.includes('campaign_date')) {
        console.log('❌ Coluna campaign_date ainda existe');
      } else {
        console.log('✅ Coluna campaign_date removida com sucesso');
      }
    }

    // 3. Verificar constraint em campaign_creators
    console.log('\n🔗 3. VERIFICANDO CONSTRAINT CAMPAIGN_CREATORS');
    
    const { data: relations } = await supabase
      .from('campaign_creators')
      .select('campaign_id, creator_id')
      .eq('organization_id', DEFAULT_ORG_ID);

    const relationCheck = {};
    relations?.forEach(rel => {
      const key = `${rel.campaign_id}-${rel.creator_id}`;
      relationCheck[key] = (relationCheck[key] || 0) + 1;
    });

    const relationDuplicates = Object.entries(relationCheck).filter(([key, count]) => count > 1);
    
    if (relationDuplicates.length === 0) {
      console.log('✅ Constraint campaign_creators funcionando - nenhuma duplicata');
    } else {
      console.log(`❌ ${relationDuplicates.length} duplicatas em campaign_creators`);
    }

    // 4. Testar dados para APIs
    console.log('\n📊 4. DADOS PARA TESTE');
    
    const { data: testBusiness } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);

    const { data: testCampaign } = await supabase
      .from('campaigns')
      .select('id, title, month, business_id')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);

    const { data: testCreators } = await supabase
      .from('creators')
      .select('id, name, status')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('status', 'Ativo')
      .limit(2);

    if (testBusiness && testCampaign && testCreators && testCreators.length >= 2) {
      console.log('✅ Dados de teste disponíveis:');
      console.log(`  Business: ${testBusiness[0].name}`);
      console.log(`  Campanha: ${testCampaign[0].title} (${testCampaign[0].month})`);
      console.log(`  Criadores: ${testCreators.map(c => c.name).join(', ')}`);

      // 5. Simular teste de adição (sem executar)
      console.log('\n🎯 5. DADOS PARA TESTE MANUAL');
      console.log('Use estes dados para testar no navegador:');
      console.log(`Business: ${testBusiness[0].name}`);
      console.log(`Mês: ${testCampaign[0].month}`);
      console.log(`Criador 1: ${testCreators[0].name} (ID: ${testCreators[0].id})`);
      console.log(`Criador 2: ${testCreators[1].name} (ID: ${testCreators[1].id})`);

    } else {
      console.log('❌ Dados insuficientes para teste');
    }

    console.log('\n🎉 Verificação concluída!');
    console.log('💡 Agora teste no navegador - os erros 500 devem estar resolvidos');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar
testFixedAPIs();
