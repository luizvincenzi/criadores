const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function testCreatorSlotsAPI() {
  console.log('🧪 Testando API de Creator Slots...');

  try {
    // 1. Listar businesses disponíveis
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, address')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(5);

    if (businessError) {
      console.error('❌ Erro ao buscar businesses:', businessError);
      return;
    }

    console.log(`📋 ${businesses?.length || 0} businesses encontrados:`);
    businesses?.forEach(business => {
      console.log(`  - ${business.name} (ID: ${business.id})`);
    });

    if (!businesses || businesses.length === 0) {
      console.log('❌ Nenhum business encontrado');
      return;
    }

    // 2. Testar com o primeiro business
    const testBusiness = businesses[0];
    console.log(`\n🧪 Testando com business: ${testBusiness.name}`);

    // 3. Testar API de creator slots
    const testParams = {
      businessName: testBusiness.name,
      mes: 'julho/2025',
      quantidadeContratada: 6
    };

    console.log('📝 Parâmetros de teste:', testParams);

    const apiUrl = `http://localhost:3001/api/supabase/creator-slots?businessName=${encodeURIComponent(testParams.businessName)}&mes=${encodeURIComponent(testParams.mes)}&quantidadeContratada=${testParams.quantidadeContratada}`;
    
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetch(apiUrl);
    const result = await response.json();

    console.log('\n📊 Resultado da API:');
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${result.success}`);

    if (result.success) {
      console.log(`✅ ${result.slots?.length || 0} slots criados`);
      console.log(`✅ ${result.availableCreators?.length || 0} criadores disponíveis`);
      console.log(`✅ Campaign ID: ${result.campaignId}`);
      
      if (result.availableCreators && result.availableCreators.length > 0) {
        console.log('\n👥 Primeiros 3 criadores disponíveis:');
        result.availableCreators.slice(0, 3).forEach(creator => {
          console.log(`  - ${creator.nome} (${creator.instagram}) - ${creator.seguidores} seguidores`);
        });
      }
    } else {
      console.error('❌ Erro na API:', result.error);
    }

    // 4. Verificar se campanha foi criada
    console.log('\n🔍 Verificando campanhas criadas...');
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title, business_id, month')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_id', testBusiness.id);

    console.log(`📋 ${campaigns?.length || 0} campanhas encontradas para ${testBusiness.name}:`);
    campaigns?.forEach(campaign => {
      console.log(`  - ${campaign.title} (${campaign.month})`);
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar
testCreatorSlotsAPI();
