import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  'https://ecbhcalmulaiszslwhqz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA'
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function debugCampaigns() {
  try {
    console.log('🔍 Verificando campanhas no Supabase...');

    // 1. Listar todas as campanhas
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`📊 Total de campanhas encontradas: ${campaigns.length}`);
    
    if (campaigns.length > 0) {
      console.log('\n📋 Campanhas existentes:');
      campaigns.forEach((campaign, index) => {
        console.log(`${index + 1}. ${campaign.title}`);
        console.log(`   - ID: ${campaign.id}`);
        console.log(`   - Business ID: ${campaign.business_id}`);
        console.log(`   - Mês: ${campaign.month}`);
        console.log(`   - Status: ${campaign.status}`);
        console.log('');
      });
    }

    // 2. Listar businesses
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID)
      .order('name');

    if (businessError) {
      console.error('❌ Erro ao buscar businesses:', businessError);
      return;
    }

    console.log(`🏢 Total de businesses: ${businesses.length}`);
    console.log('\n🏢 Businesses existentes:');
    businesses.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name} (ID: ${business.id})`);
    });

    // 3. Verificar campaign_creators
    const { data: campaignCreators, error: ccError } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        campaign_id,
        creator_id,
        campaigns(title, month),
        creators(name)
      `)
      .order('created_at', { ascending: false });

    if (ccError) {
      console.error('❌ Erro ao buscar campaign_creators:', ccError);
      return;
    }

    console.log(`\n👥 Total de relacionamentos campaign_creators: ${campaignCreators.length}`);
    
    if (campaignCreators.length > 0) {
      console.log('\n👥 Relacionamentos existentes:');
      campaignCreators.forEach((cc, index) => {
        console.log(`${index + 1}. Campanha: ${cc.campaigns?.title || 'N/A'} (${cc.campaigns?.month || 'N/A'})`);
        console.log(`   - Criador: ${cc.creators?.name || 'N/A'}`);
        console.log(`   - Campaign ID: ${cc.campaign_id}`);
        console.log(`   - Creator ID: ${cc.creator_id}`);
        console.log('');
      });
    }

    // 4. Verificar especificamente "Auto Posto Bela Suíça"
    console.log('\n🔍 Verificando "Auto Posto Bela Suíça" especificamente...');
    
    const { data: autoPostoBusiness, error: autoPostoError } = await supabase
      .from('businesses')
      .select('id, name')
      .ilike('name', '%Auto Posto Bela Suíça%')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (autoPostoError) {
      console.error('❌ Erro ao buscar Auto Posto:', autoPostoError);
    } else {
      console.log('🏢 Auto Posto encontrado:', autoPostoBusiness);
      
      if (autoPostoBusiness.length > 0) {
        const businessId = autoPostoBusiness[0].id;
        
        // Buscar campanhas deste business
        const { data: autoPostoCampaigns, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('business_id', businessId)
          .eq('organization_id', DEFAULT_ORG_ID);

        if (campaignError) {
          console.error('❌ Erro ao buscar campanhas do Auto Posto:', campaignError);
        } else {
          console.log('📊 Campanhas do Auto Posto:', autoPostoCampaigns);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugCampaigns();
