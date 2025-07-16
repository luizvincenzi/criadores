const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function debugSpecificCampaign() {
  console.log('🔍 Debugando campanha específica com criador "111"...');

  try {
    // 1. Buscar criador "111"
    const { data: creator111 } = await supabase
      .from('creators')
      .select('id, name, status')
      .eq('name', '111')
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (!creator111) {
      console.log('❌ Criador "111" não encontrado');
      return;
    }

    console.log(`👤 Criador "111": ID=${creator111.id}, Status=${creator111.status}`);

    // 2. Buscar todas as campanhas onde este criador está associado
    const { data: relations } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        status,
        campaign:campaigns(id, title, month, business:businesses(name))
      `)
      .eq('creator_id', creator111.id)
      .eq('organization_id', DEFAULT_ORG_ID);

    console.log(`\n🔗 Criador "111" está em ${relations?.length || 0} campanhas:`);
    relations?.forEach((rel, i) => {
      console.log(`  ${i + 1}. ${rel.campaign?.business?.name} - ${rel.campaign?.title} (${rel.campaign?.month}) - Status: ${rel.status}`);
      console.log(`      Relation ID: ${rel.id}`);
    });

    // 3. Buscar todas as campanhas para ver qual você está editando
    const { data: allCampaigns } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        month,
        business:businesses(name)
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .order('created_at', { ascending: false })
      .limit(10);

    console.log(`\n📋 Últimas 10 campanhas:`);
    allCampaigns?.forEach((camp, i) => {
      console.log(`  ${i + 1}. ${camp.business?.name} - ${camp.title} (${camp.month})`);
      console.log(`      ID: ${camp.id}`);
    });

    // 4. Verificar se há relacionamentos "Removido" que podem estar causando conflito
    const { data: removedRelations } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        status,
        campaign:campaigns(title, business:businesses(name))
      `)
      .eq('creator_id', creator111.id)
      .eq('status', 'Removido')
      .eq('organization_id', DEFAULT_ORG_ID);

    console.log(`\n🗑️ Relacionamentos "Removido" para criador "111": ${removedRelations?.length || 0}`);
    removedRelations?.forEach((rel, i) => {
      console.log(`  ${i + 1}. ${rel.campaign?.business?.name} - ${rel.campaign?.title} - ID: ${rel.id}`);
    });

    // 5. Limpar relacionamentos duplicados ou inválidos se necessário
    if (relations && relations.length > 0) {
      console.log('\n🧹 Verificando se há relacionamentos duplicados...');
      
      const campaignIds = relations.map(r => r.campaign?.id);
      const uniqueCampaignIds = [...new Set(campaignIds)];
      
      if (campaignIds.length !== uniqueCampaignIds.length) {
        console.log('⚠️ Relacionamentos duplicados detectados!');
        
        // Agrupar por campanha
        const grouped = {};
        relations.forEach(rel => {
          const campaignId = rel.campaign?.id;
          if (!grouped[campaignId]) {
            grouped[campaignId] = [];
          }
          grouped[campaignId].push(rel);
        });

        // Mostrar duplicatas
        Object.entries(grouped).forEach(([campaignId, rels]) => {
          if (rels.length > 1) {
            console.log(`  Campanha ${campaignId}: ${rels.length} relacionamentos`);
            rels.forEach((rel, i) => {
              console.log(`    ${i + 1}. ID: ${rel.id}, Status: ${rel.status}`);
            });
          }
        });
      } else {
        console.log('✅ Nenhum relacionamento duplicado encontrado');
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
debugSpecificCampaign();
