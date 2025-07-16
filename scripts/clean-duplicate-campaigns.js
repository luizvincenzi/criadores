const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function cleanDuplicateCampaigns() {
  console.log('🧹 Limpando campanhas duplicadas...');
  console.log('📋 Regra: 1 campanha por mês por business');

  try {
    // 1. Buscar todas as campanhas
    const { data: allCampaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        month,
        business_id,
        created_at,
        business:businesses(name)
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .order('created_at', { ascending: true }); // Mais antigas primeiro

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`📊 Total de campanhas: ${allCampaigns?.length || 0}`);

    // 2. Agrupar por business + mês
    const grouped = {};
    allCampaigns?.forEach(campaign => {
      const key = `${campaign.business_id}-${campaign.month}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(campaign);
    });

    // 3. Identificar duplicatas
    let duplicatesFound = 0;
    let campaignsToRemove = [];
    let campaignsToKeep = [];

    for (const [key, campaigns] of Object.entries(grouped)) {
      if (campaigns.length > 1) {
        duplicatesFound++;
        const [businessId, month] = key.split('-');
        
        console.log(`\n🔍 Duplicata encontrada:`);
        console.log(`  Business: ${campaigns[0].business?.name}`);
        console.log(`  Mês: ${month}`);
        console.log(`  ${campaigns.length} campanhas:`);
        
        campaigns.forEach((camp, i) => {
          console.log(`    ${i + 1}. "${camp.title}" (${camp.created_at})`);
        });

        // Manter a mais antiga (primeira criada)
        const toKeep = campaigns[0];
        const toRemove = campaigns.slice(1);

        console.log(`  ✅ Mantendo: "${toKeep.title}" (mais antiga)`);
        console.log(`  🗑️ Removendo: ${toRemove.length} campanhas`);

        campaignsToKeep.push(toKeep);
        campaignsToRemove.push(...toRemove);
      } else {
        campaignsToKeep.push(campaigns[0]);
      }
    }

    console.log(`\n📊 Resumo:`);
    console.log(`  🔍 Duplicatas encontradas: ${duplicatesFound}`);
    console.log(`  ✅ Campanhas a manter: ${campaignsToKeep.length}`);
    console.log(`  🗑️ Campanhas a remover: ${campaignsToRemove.length}`);

    if (campaignsToRemove.length === 0) {
      console.log(`\n✅ Nenhuma duplicata encontrada! Sistema já está limpo.`);
      return;
    }

    // 4. Confirmar remoção
    console.log(`\n⚠️ ATENÇÃO: Isso vai remover ${campaignsToRemove.length} campanhas permanentemente!`);
    console.log(`📋 Campanhas que serão removidas:`);
    campaignsToRemove.forEach((camp, i) => {
      console.log(`  ${i + 1}. ${camp.business?.name} - "${camp.title}" (${camp.month})`);
    });

    // 5. Remover relacionamentos primeiro
    console.log(`\n🔗 Removendo relacionamentos das campanhas duplicadas...`);
    const campaignIdsToRemove = campaignsToRemove.map(c => c.id);
    
    const { data: removedRelations, error: removeRelationsError } = await supabase
      .from('campaign_creators')
      .delete()
      .in('campaign_id', campaignIdsToRemove);

    if (removeRelationsError) {
      console.error('❌ Erro ao remover relacionamentos:', removeRelationsError);
      return;
    }

    console.log(`✅ Relacionamentos removidos`);

    // 6. Remover campanhas duplicadas
    console.log(`\n🗑️ Removendo campanhas duplicadas...`);
    
    const { data: removedCampaigns, error: removeCampaignsError } = await supabase
      .from('campaigns')
      .delete()
      .in('id', campaignIdsToRemove);

    if (removeCampaignsError) {
      console.error('❌ Erro ao remover campanhas:', removeCampaignsError);
      return;
    }

    console.log(`✅ ${campaignsToRemove.length} campanhas removidas`);

    // 7. Verificar resultado final
    const { data: finalCampaigns } = await supabase
      .from('campaigns')
      .select('id, business_id, month')
      .eq('organization_id', DEFAULT_ORG_ID);

    const finalGrouped = {};
    finalCampaigns?.forEach(campaign => {
      const key = `${campaign.business_id}-${campaign.month}`;
      finalGrouped[key] = (finalGrouped[key] || 0) + 1;
    });

    const stillDuplicated = Object.values(finalGrouped).filter(count => count > 1).length;

    console.log(`\n🎉 Limpeza concluída!`);
    console.log(`📊 Campanhas restantes: ${finalCampaigns?.length || 0}`);
    console.log(`🔍 Duplicatas restantes: ${stillDuplicated}`);

    if (stillDuplicated === 0) {
      console.log(`✅ Sistema limpo! Cada business tem no máximo 1 campanha por mês.`);
    } else {
      console.log(`⚠️ Ainda há ${stillDuplicated} duplicatas. Execute novamente se necessário.`);
    }

    // 8. Mostrar estatísticas finais
    console.log(`\n📈 Estatísticas finais:`);
    const businessCounts = {};
    finalCampaigns?.forEach(campaign => {
      businessCounts[campaign.business_id] = (businessCounts[campaign.business_id] || 0) + 1;
    });

    console.log(`🏢 Businesses com campanhas: ${Object.keys(businessCounts).length}`);
    console.log(`📊 Média de campanhas por business: ${(finalCampaigns?.length / Object.keys(businessCounts).length || 0).toFixed(1)}`);

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  }
}

// Executar
cleanDuplicateCampaigns();
