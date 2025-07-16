const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function testChangeAPI() {
  console.log('🧪 Testando API de troca de criadores...');

  try {
    // 1. Buscar criadores para teste
    const { data: creators } = await supabase
      .from('creators')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(3);

    if (!creators || creators.length < 2) {
      console.log('❌ Não há criadores suficientes para teste');
      return;
    }

    const oldCreator = creators[0]; // ADRIANO YAMAMOTO
    const newCreator = creators[1]; // Alanna Alícia

    if (!oldCreator || !newCreator) {
      console.log('❌ Criadores específicos não encontrados');
      console.log('Criadores disponíveis:', creators.map(c => c.name));
      return;
    }

    console.log(`👤 Criador antigo: ${oldCreator.name} (${oldCreator.id})`);
    console.log(`👤 Criador novo: ${newCreator.name} (${newCreator.id})`);

    // 2. Buscar campanha do Boussolé
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', 'Boussolé')
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (!business) {
      console.log('❌ Business Boussolé não encontrado');
      return;
    }

    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, title, month')
      .eq('business_id', business.id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1)
      .single();

    if (!campaign) {
      console.log('❌ Campanha do Boussolé não encontrada');
      return;
    }

    console.log(`📋 Campanha: ${campaign.title} (${campaign.month})`);

    // 3. Testar API de troca
    const payload = {
      businessName: business.name,
      mes: campaign.month,
      oldCreatorId: oldCreator.id,
      newCreatorId: newCreator.id,
      userEmail: 'teste@crmcriadores.com'
    };

    console.log('\n🔄 Testando API de troca...');
    console.log('Payload:', payload);

    const response = await fetch('http://localhost:3001/api/supabase/campaign-creators/change', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log(`📡 Status: ${response.status}`);

    const result = await response.json();
    console.log('📊 Resultado:', result);

    if (result.success) {
      console.log('✅ API de troca funcionando!');
    } else {
      console.log('❌ Erro na API:', result.error);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar
testChangeAPI();
