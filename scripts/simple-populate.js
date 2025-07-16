const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function checkCampaignsAndJourney() {
  console.log('🚀 Verificando campanhas e jornada...');

  try {
    // 1. Buscar todas as campanhas
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`📋 ${campaigns?.length || 0} campanhas encontradas`);
    campaigns?.forEach(campaign => {
      console.log(`  - ${campaign.title} (${campaign.status}) - ${campaign.month}`);
    });

    // 2. Buscar relacionamentos campaign_creators
    const { data: relations, error: relationsError } = await supabase
      .from('campaign_creators')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (relationsError) {
      console.error('❌ Erro ao buscar relacionamentos:', relationsError);
      return;
    }

    console.log(`\n🔗 ${relations?.length || 0} relacionamentos campaign_creators encontrados`);

    // 3. Verificar view da jornada
    const { data: journeyData, error: journeyError } = await supabase
      .from('campaign_journey_view')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (journeyError) {
      console.error('❌ Erro ao buscar jornada:', journeyError);
      return;
    }

    console.log(`\n📊 ${journeyData?.length || 0} itens na jornada`);
    journeyData?.forEach(item => {
      console.log(`  - ${item.business_name} (${item.status}) - ${item.month} - ${item.total_creators} criadores`);
    });

    // 4. Verificar se todas as campanhas aparecem na jornada
    console.log('\n🔍 Verificando se todas as campanhas aparecem na jornada...');
    
    const campaignIds = new Set(campaigns?.map(c => c.id) || []);
    const journeyIds = new Set(journeyData?.map(j => j.id) || []);
    
    const missingInJourney = [...campaignIds].filter(id => !journeyIds.has(id));
    
    if (missingInJourney.length > 0) {
      console.log(`⚠️ ${missingInJourney.length} campanhas não aparecem na jornada:`);
      missingInJourney.forEach(id => {
        const campaign = campaigns?.find(c => c.id === id);
        console.log(`  - ${campaign?.title} (${campaign?.status})`);
      });
    } else {
      console.log('✅ Todas as campanhas aparecem na jornada!');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
checkCampaignsAndJourney();
