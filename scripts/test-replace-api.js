const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function testReplaceAPI() {
  console.log('🧪 Testando API de substituição...');

  try {
    // 1. Buscar uma campanha com criadores
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select(`
        id, 
        title, 
        month,
        business:businesses(name),
        campaign_creators(
          id,
          creator:creators(id, name)
        )
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .not('campaign_creators', 'is', null);

    if (!campaigns || campaigns.length === 0) {
      console.log('❌ Nenhuma campanha com criadores encontrada');
      return;
    }

    const testCampaign = campaigns.find(c => c.campaign_creators && c.campaign_creators.length > 0);
    if (!testCampaign) {
      console.log('❌ Nenhuma campanha com criadores encontrada');
      return;
    }

    console.log(`📋 Campanha de teste: ${testCampaign.business?.name} - ${testCampaign.title} (${testCampaign.month})`);
    console.log(`👥 Criadores atuais: ${testCampaign.campaign_creators.map(cc => cc.creator?.name).join(', ')}`);

    // 2. Buscar criadores disponíveis
    const { data: availableCreators } = await supabase
      .from('creators')
      .select('id, name, status')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('status', 'Ativo')
      .limit(5);

    if (!availableCreators || availableCreators.length < 2) {
      console.log('❌ Criadores insuficientes para teste');
      return;
    }

    console.log(`🎯 Criadores disponíveis: ${availableCreators.map(c => c.name).join(', ')}`);

    // 3. Preparar dados para teste
    const currentCreator = testCampaign.campaign_creators[0].creator;
    const newCreator = availableCreators.find(c => c.id !== currentCreator?.id);

    if (!currentCreator || !newCreator) {
      console.log('❌ Não foi possível encontrar criadores para teste');
      return;
    }

    console.log(`\n🔄 Teste de substituição:`);
    console.log(`  Atual: ${currentCreator.name} (${currentCreator.id})`);
    console.log(`  Novo: ${newCreator.name} (${newCreator.id})`);

    // 4. Testar a API de substituição
    const testPayload = {
      businessName: testCampaign.business?.name,
      mes: testCampaign.month,
      oldCreatorId: currentCreator.id,
      newCreatorId: newCreator.id,
      userEmail: 'teste@crmcriadores.com'
    };

    console.log('\n📤 Payload de teste:', testPayload);

    // Simular chamada da API (não executar para não alterar dados)
    console.log('\n💡 Para testar manualmente, use este payload na API:');
    console.log('POST /api/supabase/campaign-creators/replace');
    console.log(JSON.stringify(testPayload, null, 2));

    // 5. Verificar se há conflitos potenciais
    const { data: existingRelations } = await supabase
      .from('campaign_creators')
      .select('id, creator:creators(name)')
      .eq('campaign_id', testCampaign.id)
      .eq('creator_id', newCreator.id)
      .eq('organization_id', DEFAULT_ORG_ID);

    if (existingRelations && existingRelations.length > 0) {
      console.log(`\n⚠️ CONFLITO DETECTADO: ${newCreator.name} já está na campanha`);
      console.log('   Isso deveria ser permitido na substituição');
    } else {
      console.log(`\n✅ Sem conflitos: ${newCreator.name} não está na campanha`);
    }

    // 6. Mostrar estrutura atual da campanha
    console.log('\n📊 Estrutura atual da campanha:');
    testCampaign.campaign_creators.forEach((cc, i) => {
      console.log(`  ${i + 1}. ${cc.creator?.name} (ID: ${cc.creator?.id}, Relation: ${cc.id})`);
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar
testReplaceAPI();
