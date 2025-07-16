const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function debugBoussoléCampaign() {
  console.log('🔍 Debugando campanha específica do Boussolé...');

  try {
    // 1. Buscar campanhas do Boussolé
    const { data: boussoléCampaigns } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        month,
        business_id,
        business:businesses(name)
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .order('created_at', { ascending: false });

    console.log(`📋 Campanhas encontradas:`);
    boussoléCampaigns?.forEach((campaign, i) => {
      console.log(`  ${i + 1}. ${campaign.business?.name} - ${campaign.title} (${campaign.month})`);
      console.log(`      ID: ${campaign.id}`);
      console.log(`      Business ID: ${campaign.business_id}`);
    });

    // 2. Focar na campanha "Campanha de 2025-07"
    const targetCampaign = boussoléCampaigns?.find(c => 
      c.business?.name === 'Boussolé' && c.month === '2025-07'
    );

    if (!targetCampaign) {
      console.log('❌ Campanha específica não encontrada');
      return;
    }

    console.log(`\n🎯 Focando na campanha: ${targetCampaign.business?.name} - ${targetCampaign.title}`);

    // 3. Verificar business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', targetCampaign.business_id)
      .single();

    console.log(`🏢 Business: ${business?.name} (ID: ${business?.id})`);

    // 4. Testar API de creator-slots com diferentes parâmetros
    const testParams = [
      { businessName: 'Boussolé', mes: '2025-07', quantidadeContratada: 6 },
      { businessName: business?.name, mes: targetCampaign.month, quantidadeContratada: 6 },
      { businessName: encodeURIComponent(business?.name || ''), mes: encodeURIComponent(targetCampaign.month || ''), quantidadeContratada: 6 }
    ];

    for (let i = 0; i < testParams.length; i++) {
      const params = testParams[i];
      console.log(`\n🧪 Teste ${i + 1}:`);
      console.log(`  Parâmetros:`, params);

      const apiUrl = `http://localhost:3001/api/supabase/creator-slots?businessName=${params.businessName}&mes=${params.mes}&quantidadeContratada=${params.quantidadeContratada}`;
      console.log(`  URL: ${apiUrl}`);

      try {
        const response = await fetch(apiUrl);
        const result = await response.json();

        console.log(`  Status: ${response.status}`);
        console.log(`  Success: ${result.success}`);

        if (result.success) {
          console.log(`  ✅ Slots: ${result.slots?.length || 0}`);
          console.log(`  ✅ Criadores disponíveis: ${result.availableCreators?.length || 0}`);
          console.log(`  ✅ Campaign ID: ${result.campaignId}`);
          
          if (result.slots && result.slots.length > 0) {
            console.log(`  📊 Primeiros 3 slots:`);
            result.slots.slice(0, 3).forEach((slot, j) => {
              console.log(`    ${j + 1}. ${slot.influenciador || 'vazio'} (index: ${slot.index})`);
            });
          }
        } else {
          console.log(`  ❌ Erro: ${result.error}`);
        }
      } catch (error) {
        console.log(`  ❌ Erro na requisição: ${error.message}`);
      }
    }

    // 5. Verificar relacionamentos existentes
    const { data: existingRelations } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        status,
        creator:creators(name)
      `)
      .eq('campaign_id', targetCampaign.id)
      .eq('organization_id', DEFAULT_ORG_ID);

    console.log(`\n🔗 Relacionamentos existentes: ${existingRelations?.length || 0}`);
    existingRelations?.forEach((rel, i) => {
      console.log(`  ${i + 1}. ${rel.creator?.name} (${rel.status})`);
    });

    // 6. Verificar na view da jornada
    const { data: journeyItem } = await supabase
      .from('campaign_journey_view')
      .select('*')
      .eq('id', targetCampaign.id)
      .single();

    console.log(`\n📊 Na jornada:`);
    if (journeyItem) {
      console.log(`  ✅ Aparece na jornada`);
      console.log(`  Business: ${journeyItem.business_name}`);
      console.log(`  Título: ${journeyItem.title}`);
      console.log(`  Mês: ${journeyItem.month}`);
      console.log(`  Total criadores: ${journeyItem.total_creators}`);
    } else {
      console.log(`  ❌ Não aparece na jornada`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
debugBoussoléCampaign();
