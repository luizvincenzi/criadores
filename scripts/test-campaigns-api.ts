import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testCampaignsAPI() {
  console.log('🧪 Testando API de campanhas do Supabase...\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Testar GET - buscar campanhas
    console.log('📊 Testando GET /api/supabase/campaigns...');
    
    const getResponse = await fetch(`${baseUrl}/api/supabase/campaigns`);
    const getData = await getResponse.json();
    
    if (getData.success) {
      console.log(`✅ GET bem-sucedido: ${getData.count} campanhas encontradas`);
      
      if (getData.data.length > 0) {
        console.log('📋 Primeira campanha:');
        const firstCampaign = getData.data[0];
        console.log(`  - ID: ${firstCampaign.id}`);
        console.log(`  - Nome: ${firstCampaign.nome}`);
        console.log(`  - Business: ${firstCampaign.businessName}`);
        console.log(`  - Mês: ${firstCampaign.mes}`);
        console.log(`  - Status: ${firstCampaign.status}`);
        console.log(`  - Criadores: ${firstCampaign.totalCriadores}`);
      }
    } else {
      console.error('❌ GET falhou:', getData.error);
    }
    
    // 2. Testar filtros
    console.log('\n🔍 Testando filtros...');
    
    const filterResponse = await fetch(`${baseUrl}/api/supabase/campaigns?status=Reunião de briefing`);
    const filterData = await filterResponse.json();
    
    if (filterData.success) {
      console.log(`✅ Filtro por status: ${filterData.count} campanhas encontradas`);
    } else {
      console.error('❌ Filtro falhou:', filterData.error);
    }
    
    // 3. Testar POST - criar campanha (opcional)
    console.log('\n➕ Testando POST (criar campanha)...');
    
    // Buscar um business_id válido primeiro
    const businessResponse = await fetch(`${baseUrl}/api/supabase/businesses`);
    const businessData = await businessResponse.json();
    
    if (businessData.success && businessData.data.length > 0) {
      const testCampaign = {
        title: 'Campanha Teste API',
        business_id: businessData.data[0].id,
        month: 'Teste',
        description: 'Campanha criada via teste da API',
        budget: 1000,
        status: 'Reunião de briefing'
      };
      
      const postResponse = await fetch(`${baseUrl}/api/supabase/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCampaign)
      });
      
      const postData = await postResponse.json();
      
      if (postData.success) {
        console.log('✅ POST bem-sucedido: campanha criada');
        console.log(`  - ID: ${postData.data.id}`);
        console.log(`  - Título: ${postData.data.title}`);
        
        // Limpar campanha de teste
        console.log('🧹 Limpando campanha de teste...');
        // Note: Não implementamos DELETE ainda, então deixar para limpeza manual
        console.log('⚠️ Limpeza manual necessária no Supabase');
        
      } else {
        console.error('❌ POST falhou:', postData.error);
      }
    } else {
      console.log('⚠️ Não foi possível testar POST - nenhum business encontrado');
    }
    
    console.log('\n✅ Teste da API concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

if (require.main === module) {
  testCampaignsAPI()
    .then(() => {
      console.log('\n🎉 Teste finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testCampaignsAPI };
