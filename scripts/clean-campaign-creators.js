const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function cleanCampaignCreators() {
  console.log('🧹 Limpando relacionamentos de campaign_creators...');

  try {
    // 1. Buscar todos os relacionamentos
    const { data: allRelations } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        campaign_id,
        creator_id,
        status,
        created_at,
        campaign:campaigns(title, business:businesses(name)),
        creator:creators(name)
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .order('created_at', { ascending: true });

    console.log(`📊 Total de relacionamentos: ${allRelations?.length || 0}`);

    // 2. Agrupar por campanha + criador para encontrar duplicatas
    const grouped = {};
    allRelations?.forEach(rel => {
      const key = `${rel.campaign_id}-${rel.creator_id}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(rel);
    });

    // 3. Identificar e limpar duplicatas
    let duplicatesFound = 0;
    let duplicatesRemoved = 0;

    for (const [key, relations] of Object.entries(grouped)) {
      if (relations.length > 1) {
        duplicatesFound++;
        const [campaignId, creatorId] = key.split('-');
        
        console.log(`\n🔍 Duplicata encontrada:`);
        console.log(`  Campanha: ${relations[0].campaign?.business?.name} - ${relations[0].campaign?.title}`);
        console.log(`  Criador: ${relations[0].creator?.name}`);
        console.log(`  ${relations.length} relacionamentos:`);
        
        relations.forEach((rel, i) => {
          console.log(`    ${i + 1}. ID: ${rel.id}, Status: ${rel.status}, Criado: ${rel.created_at}`);
        });

        // Manter apenas o mais antigo (primeiro criado)
        const toKeep = relations[0];
        const toRemove = relations.slice(1);

        console.log(`  ✅ Mantendo: ${toKeep.id} (mais antigo)`);
        console.log(`  🗑️ Removendo: ${toRemove.length} relacionamentos`);

        // Remover duplicatas
        for (const rel of toRemove) {
          const { error } = await supabase
            .from('campaign_creators')
            .delete()
            .eq('id', rel.id);

          if (error) {
            console.log(`    ❌ Erro ao remover ${rel.id}:`, error.message);
          } else {
            console.log(`    ✅ Removido: ${rel.id}`);
            duplicatesRemoved++;
          }
        }
      }
    }

    console.log(`\n📊 Resumo da limpeza:`);
    console.log(`  🔍 Duplicatas encontradas: ${duplicatesFound}`);
    console.log(`  🗑️ Relacionamentos removidos: ${duplicatesRemoved}`);

    // 4. Verificar estado final
    const { data: finalRelations } = await supabase
      .from('campaign_creators')
      .select('id')
      .eq('organization_id', DEFAULT_ORG_ID);

    console.log(`  ✅ Relacionamentos restantes: ${finalRelations?.length || 0}`);

    // 5. Verificar especificamente o criador "111"
    const { data: creator111Relations } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        campaign:campaigns(title, business:businesses(name))
      `)
      .eq('creator_id', '7e2d6a12-5075-41ac-9d05-8dc3dfe43c1f')
      .eq('organization_id', DEFAULT_ORG_ID);

    console.log(`\n👤 Criador "111" agora está em ${creator111Relations?.length || 0} campanhas:`);
    creator111Relations?.forEach((rel, i) => {
      console.log(`  ${i + 1}. ${rel.campaign?.business?.name} - ${rel.campaign?.title}`);
    });

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  }
}

// Executar
cleanCampaignCreators();
