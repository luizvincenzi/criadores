const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function checkAndFix() {
  console.log('🚀 Verificando estrutura e dados...');

  try {
    // 1. Verificar campanhas
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, status, month')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(5);

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`📋 ${campaigns?.length || 0} campanhas encontradas (primeiras 5):`);
    campaigns?.forEach(campaign => {
      console.log(`  - ${campaign.title} (${campaign.status})`);
    });

    // 2. Verificar se campaign_creators tem organization_id
    console.log('\n🔍 Verificando estrutura de campaign_creators...');
    
    try {
      const { data: testRelation, error: testError } = await supabase
        .from('campaign_creators')
        .select('id, campaign_id, creator_id, organization_id')
        .limit(1);

      if (testError) {
        if (testError.message.includes('organization_id')) {
          console.log('❌ Coluna organization_id não existe em campaign_creators');
          console.log('📝 Execute este SQL no Supabase Dashboard:');
          console.log(`
ALTER TABLE campaign_creators 
ADD COLUMN organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';

ALTER TABLE campaign_creators 
ADD CONSTRAINT fk_campaign_creators_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX idx_campaign_creators_organization_id 
ON campaign_creators(organization_id);
          `);
          return;
        } else {
          console.error('❌ Erro ao verificar campaign_creators:', testError);
          return;
        }
      }

      console.log('✅ Coluna organization_id existe em campaign_creators');
      console.log(`📊 ${testRelation?.length || 0} relacionamentos encontrados`);

    } catch (error) {
      console.error('❌ Erro ao verificar campaign_creators:', error);
      return;
    }

    // 3. Verificar view da jornada
    console.log('\n📊 Verificando view da jornada...');
    
    try {
      const { data: journeyData, error: journeyError } = await supabase
        .from('campaign_journey_view')
        .select('id, title, status, business_name, total_creators')
        .eq('organization_id', DEFAULT_ORG_ID)
        .limit(5);

      if (journeyError) {
        console.error('❌ Erro ao buscar jornada:', journeyError);
        console.log('📝 Pode ser necessário recriar a view campaign_journey_view');
        return;
      }

      console.log(`✅ ${journeyData?.length || 0} itens na jornada (primeiros 5):`);
      journeyData?.forEach(item => {
        console.log(`  - ${item.business_name}: ${item.title} (${item.status}) - ${item.total_creators} criadores`);
      });

    } catch (error) {
      console.error('❌ Erro ao verificar jornada:', error);
    }

    // 4. Verificar se todas as campanhas aparecem na jornada
    console.log('\n🔍 Verificando cobertura da jornada...');
    
    const { data: allCampaigns } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('organization_id', DEFAULT_ORG_ID);

    const { data: allJourney } = await supabase
      .from('campaign_journey_view')
      .select('id')
      .eq('organization_id', DEFAULT_ORG_ID);

    const campaignIds = new Set(allCampaigns?.map(c => c.id) || []);
    const journeyIds = new Set(allJourney?.map(j => j.id) || []);
    
    const missingInJourney = [...campaignIds].filter(id => !journeyIds.has(id));
    
    if (missingInJourney.length > 0) {
      console.log(`⚠️ ${missingInJourney.length} campanhas não aparecem na jornada`);
      console.log('💡 Isso é normal se as campanhas não têm criadores relacionados ainda');
    } else {
      console.log('✅ Todas as campanhas aparecem na jornada!');
    }

    console.log('\n🎯 Resumo:');
    console.log(`📋 Total de campanhas: ${allCampaigns?.length || 0}`);
    console.log(`📊 Total na jornada: ${allJourney?.length || 0}`);
    console.log(`🔗 Campanhas sem criadores: ${missingInJourney.length}`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
checkAndFix();
