const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function debugCampaignState() {
  console.log('🔍 Debugando estado da campanha...');

  try {
    // 1. Buscar uma campanha específica
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title, business_id, month')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);

    if (!campaigns || campaigns.length === 0) {
      console.log('❌ Nenhuma campanha encontrada');
      return;
    }

    const campaign = campaigns[0];
    console.log(`📋 Campanha: ${campaign.title} (${campaign.month})`);

    // 2. Buscar business da campanha
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', campaign.business_id)
      .single();

    console.log(`🏢 Business: ${business?.name}`);

    // 3. Buscar relacionamentos existentes
    const { data: relations } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        status,
        creator:creators(id, name)
      `)
      .eq('campaign_id', campaign.id)
      .eq('organization_id', DEFAULT_ORG_ID);

    console.log(`\n🔗 ${relations?.length || 0} relacionamentos encontrados:`);
    relations?.forEach((rel, i) => {
      console.log(`  ${i + 1}. ${rel.creator?.name} (${rel.status}) - ID: ${rel.id}`);
    });

    // 4. Buscar criadores disponíveis
    const { data: availableCreators } = await supabase
      .from('creators')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID)
      .in('status', ['Ativo', 'Precisa engajar'])
      .limit(5);

    console.log(`\n👥 ${availableCreators?.length || 0} criadores disponíveis (primeiros 5):`);
    availableCreators?.forEach((creator, i) => {
      console.log(`  ${i + 1}. ${creator.name} (ID: ${creator.id})`);
    });

    // 5. Testar se um criador específico já está na campanha
    if (availableCreators && availableCreators.length > 0) {
      const testCreator = availableCreators[0];
      
      const { data: existingRelation } = await supabase
        .from('campaign_creators')
        .select('id')
        .eq('campaign_id', campaign.id)
        .eq('creator_id', testCreator.id)
        .single();

      console.log(`\n🧪 Teste: Criador "${testCreator.name}" já está na campanha?`, !!existingRelation);
      
      if (existingRelation) {
        console.log(`   - Relacionamento ID: ${existingRelation.id}`);
      }
    }

    // 6. Verificar slots via API
    console.log('\n🎯 Testando API de creator slots...');
    
    const apiUrl = `http://localhost:3001/api/supabase/creator-slots?businessName=${encodeURIComponent(business.name)}&mes=${encodeURIComponent(campaign.month)}&quantidadeContratada=6`;
    
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (result.success) {
      console.log(`✅ API funcionando: ${result.slots?.length || 0} slots, ${result.availableCreators?.length || 0} criadores`);
      
      console.log('\n📊 Slots atuais:');
      result.slots?.forEach((slot, i) => {
        console.log(`  Slot ${i}: ${slot.influenciador || 'vazio'}`);
      });
    } else {
      console.log('❌ Erro na API:', result.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
debugCampaignState();
