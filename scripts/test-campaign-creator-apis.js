const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function testCampaignCreatorAPIs() {
  console.log('🧪 Testando APIs de Campaign Creators...');

  try {
    // 1. Buscar dados de teste
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);

    const { data: creators } = await supabase
      .from('creators')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);

    if (!businesses || !creators || businesses.length === 0 || creators.length === 0) {
      console.log('❌ Dados de teste não encontrados');
      return;
    }

    const testBusiness = businesses[0];
    const testCreator = creators[0];

    console.log(`📋 Business de teste: ${testBusiness.name}`);
    console.log(`👤 Criador de teste: ${testCreator.name}`);

    // 2. Testar API de adicionar criador
    console.log('\n🧪 Testando API de adicionar criador...');
    
    const addPayload = {
      businessName: testBusiness.name,
      mes: 'julho/2025',
      creatorId: testCreator.id,
      creatorData: { nome: testCreator.name },
      userEmail: 'teste@crm.com'
    };

    console.log('📝 Payload:', addPayload);

    const addResponse = await fetch('http://localhost:3001/api/supabase/campaign-creators/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addPayload)
    });

    console.log(`📊 Status da resposta: ${addResponse.status}`);

    if (addResponse.status === 404) {
      console.log('❌ API não encontrada (404)');
      const text = await addResponse.text();
      console.log('📄 Resposta:', text.substring(0, 200));
      return;
    }

    const addResult = await addResponse.json();
    console.log('📊 Resultado da adição:', addResult);

    if (addResult.success) {
      console.log('✅ Criador adicionado com sucesso!');
      
      // 3. Testar API de remoção
      console.log('\n🧪 Testando API de remoção...');
      
      const removePayload = {
        businessName: testBusiness.name,
        mes: 'julho/2025',
        creatorId: testCreator.id,
        userEmail: 'teste@crm.com'
      };

      const removeResponse = await fetch('http://localhost:3001/api/supabase/campaign-creators/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(removePayload)
      });

      const removeResult = await removeResponse.json();
      console.log('📊 Resultado da remoção:', removeResult);

      if (removeResult.success) {
        console.log('✅ Criador removido com sucesso!');
      } else {
        console.log('❌ Erro na remoção:', removeResult.error);
      }
    } else {
      console.log('❌ Erro na adição:', addResult.error);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar
testCampaignCreatorAPIs();
