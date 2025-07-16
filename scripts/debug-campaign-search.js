const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function debugCampaignSearch() {
  console.log('🔍 Debugando busca de campanhas...');

  try {
    // 1. Buscar business Boussolé
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', 'Boussolé')
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    console.log('🏢 Business Boussolé:', business);
    if (businessError) console.log('❌ Erro business:', businessError);

    if (!business) {
      console.log('❌ Business não encontrado');
      return;
    }

    // 2. Buscar TODAS as campanhas deste business
    const { data: allCampaigns, error: allCampaignsError } = await supabase
      .from('campaigns')
      .select('id, title, month, business_id')
      .eq('business_id', business.id)
      .eq('organization_id', DEFAULT_ORG_ID);

    console.log(`\n📋 Todas as campanhas do Boussolé (${allCampaigns?.length || 0}):`);
    allCampaigns?.forEach((camp, i) => {
      console.log(`  ${i + 1}. "${camp.title}" - Mês: "${camp.month}" - ID: ${camp.id}`);
    });

    if (allCampaignsError) console.log('❌ Erro campanhas:', allCampaignsError);

    // 3. Buscar especificamente por mês "2025-07"
    const { data: specificCampaign, error: specificError } = await supabase
      .from('campaigns')
      .select('id, title, month')
      .eq('business_id', business.id)
      .eq('month', '2025-07')
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    console.log(`\n🎯 Campanha específica "2025-07":`, specificCampaign);
    if (specificError) console.log('❌ Erro específico:', specificError);

    // 4. Verificar se há relacionamentos existentes
    if (allCampaigns && allCampaigns.length > 0) {
      const campaignId = allCampaigns[0].id;
      
      const { data: relations } = await supabase
        .from('campaign_creators')
        .select(`
          id,
          status,
          creator:creators(name)
        `)
        .eq('campaign_id', campaignId)
        .eq('organization_id', DEFAULT_ORG_ID);

      console.log(`\n🔗 Relacionamentos na primeira campanha (${relations?.length || 0}):`);
      relations?.forEach((rel, i) => {
        console.log(`  ${i + 1}. ${rel.creator?.name} (${rel.status})`);
      });
    }

    // 5. Verificar view da jornada
    const { data: journeyData } = await supabase
      .from('campaign_journey_view')
      .select('id, title, business_name, month, status')
      .eq('business_name', 'Boussolé')
      .eq('organization_id', DEFAULT_ORG_ID);

    console.log(`\n📊 Campanhas na jornada (${journeyData?.length || 0}):`);
    journeyData?.forEach((item, i) => {
      console.log(`  ${i + 1}. "${item.title}" - Mês: "${item.month}" - Status: ${item.status}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
debugCampaignSearch();
