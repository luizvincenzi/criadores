import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function simpleCampaignCreatorsInsert() {
  console.log('🔧 Inserção simples de campaign_creators...\n');
  
  try {
    // 1. Buscar uma campanha e criadores existentes
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title, business_id');
      
    const { data: creators } = await supabase
      .from('creators')
      .select('id, name')
      .limit(5);
    
    if (!campaigns?.length || !creators?.length) {
      console.error('❌ Não há campanhas ou criadores para testar');
      return;
    }
    
    console.log(`📋 ${campaigns.length} campanhas encontradas`);
    console.log(`👤 ${creators.length} criadores encontrados\n`);
    
    // 2. Criar relacionamentos básicos
    const relationshipsToCreate = [];
    
    // Para cada campanha, associar com alguns criadores
    for (const campaign of campaigns) {
      // Pegar até 2 criadores por campanha
      const campaignCreators = creators.slice(0, 2);
      
      for (const creator of campaignCreators) {
        relationshipsToCreate.push({
          campaign_id: campaign.id,
          creator_id: creator.id,
          role: 'primary',
          fee: 0,
          payment_status: 'pending',
          status: 'Confirmado'
        });
      }
    }
    
    console.log(`📊 ${relationshipsToCreate.length} relacionamentos para criar\n`);
    
    // 3. Inserir um por vez para identificar problemas
    let createdCount = 0;
    let errorCount = 0;
    
    for (const [index, relationship] of relationshipsToCreate.entries()) {
      try {
        console.log(`🔄 Inserindo ${index + 1}/${relationshipsToCreate.length}...`);
        
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('campaign_creators')
          .select('id')
          .eq('campaign_id', relationship.campaign_id)
          .eq('creator_id', relationship.creator_id)
          .single();
          
        if (existing) {
          console.log(`⚠️ Relacionamento já existe, pulando...`);
          continue;
        }
        
        // Tentar inserção com dados mínimos
        const minimalRecord = {
          campaign_id: relationship.campaign_id,
          creator_id: relationship.creator_id,
          role: relationship.role,
          status: relationship.status
        };
        
        const { data: insertResult, error: insertError } = await supabase
          .from('campaign_creators')
          .insert(minimalRecord)
          .select();
        
        if (insertError) {
          console.error(`❌ Erro na inserção:`, insertError.message);
          console.error(`Detalhes:`, insertError);
          errorCount++;
          
          // Se o primeiro falhar, parar para investigar
          if (index === 0) {
            console.log('\n🛑 Parando na primeira falha para investigação');
            break;
          }
        } else {
          console.log(`✅ Relacionamento criado: ${insertResult[0].id}`);
          createdCount++;
        }
        
      } catch (error) {
        console.error(`❌ Erro geral:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 RESULTADOS:');
    console.log(`  - ✅ ${createdCount} relacionamentos criados`);
    console.log(`  - ❌ ${errorCount} erros encontrados`);
    
    // 4. Verificar o que foi criado
    if (createdCount > 0) {
      const { data: allRelationships } = await supabase
        .from('campaign_creators')
        .select(`
          id,
          campaign:campaigns(title),
          creator:creators(name)
        `);
      
      console.log('\n📋 Relacionamentos existentes:');
      allRelationships?.forEach(rel => {
        console.log(`  - ${rel.campaign?.title} + ${rel.creator?.name}`);
      });
    }
    
    return {
      created: createdCount,
      errors: errorCount
    };
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    throw error;
  }
}

if (require.main === module) {
  simpleCampaignCreatorsInsert()
    .then(result => {
      console.log('\n✅ Teste finalizado:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { simpleCampaignCreatorsInsert };
