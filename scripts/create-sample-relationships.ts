import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleRelationships() {
  console.log('🔧 Criando relacionamentos de exemplo...\n');
  
  try {
    // 1. Buscar campanhas e criadores existentes
    console.log('📊 Buscando dados existentes...');
    
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*');
    
    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }
    
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('*')
      .limit(5); // Pegar apenas 5 criadores para teste
    
    if (creatorsError) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return;
    }
    
    console.log(`✅ Encontrados: ${campaigns.length} campanhas, ${creators.length} criadores`);
    
    // 2. Criar relacionamentos de exemplo
    console.log('\n🔗 Criando relacionamentos de exemplo...');
    
    const relationships = [];
    
    // Para cada campanha, associar alguns criadores
    campaigns.forEach((campaign, campaignIndex) => {
      // Associar 2-3 criadores por campanha
      const creatorsForCampaign = creators.slice(0, Math.min(3, creators.length));
      
      creatorsForCampaign.forEach((creator, creatorIndex) => {
        relationships.push({
          campaign_id: campaign.id,
          creator_id: creator.id,
          role: creatorIndex === 0 ? 'primary' : 'secondary',
          fee: 500 + (creatorIndex * 250),
          payment_status: 'pending',
          status: 'Confirmado',
          deliverables: {
            briefing_complete: 'Pendente',
            visit_datetime: null,
            guest_quantity: 2,
            visit_confirmed: 'Pendente',
            post_datetime: null,
            video_approved: 'Pendente',
            video_posted: 'Não',
            content_links: []
          },
          performance_data: {
            reach: 0,
            impressions: 0,
            engagement: 0,
            clicks: 0,
            saves: 0,
            shares: 0
          },
          notes: `Relacionamento de exemplo - Campanha: ${campaign.title}, Criador: ${creator.nome || creator.name}`
        });
      });
    });
    
    console.log(`📋 Preparados ${relationships.length} relacionamentos para inserção`);
    
    // 3. Tentar inserir usando SQL direto via API
    console.log('\n💾 Tentando inserção via SQL direto...');
    
    for (let i = 0; i < relationships.length; i++) {
      const rel = relationships[i];
      
      try {
        // Usar uma query SQL direta
        const { data, error } = await supabase
          .from('campaign_creators')
          .insert({
            campaign_id: rel.campaign_id,
            creator_id: rel.creator_id,
            role: rel.role,
            fee: rel.fee,
            payment_status: rel.payment_status,
            status: rel.status,
            notes: rel.notes
          });
        
        if (error) {
          console.error(`❌ Erro ao inserir relacionamento ${i + 1}:`, error);
          
          // Se o erro for sobre organization_id, vamos tentar uma abordagem diferente
          if (error.message.includes('organization_id')) {
            console.log('🔧 Tentando inserção alternativa...');
            
            // Tentar inserir apenas os campos essenciais
            const { data: altData, error: altError } = await supabase
              .from('campaign_creators')
              .insert({
                campaign_id: rel.campaign_id,
                creator_id: rel.creator_id
              });
            
            if (altError) {
              console.error(`❌ Inserção alternativa falhou:`, altError);
            } else {
              console.log(`✅ Inserção alternativa funcionou para relacionamento ${i + 1}`);
            }
          }
        } else {
          console.log(`✅ Relacionamento ${i + 1} inserido com sucesso`);
        }
        
      } catch (insertError) {
        console.error(`❌ Erro na inserção ${i + 1}:`, insertError);
      }
    }
    
    // 4. Verificar resultado
    console.log('\n🔍 Verificando resultado...');
    
    const { data: finalRelationships, error: finalError } = await supabase
      .from('campaign_creators')
      .select('*');
    
    if (finalError) {
      console.error('❌ Erro ao verificar resultado:', finalError);
    } else {
      console.log(`✅ Total de relacionamentos criados: ${finalRelationships.length}`);
      
      if (finalRelationships.length > 0) {
        console.log('\n📋 Relacionamentos criados:');
        finalRelationships.forEach((rel, index) => {
          console.log(`  ${index + 1}. Campaign: ${rel.campaign_id}, Creator: ${rel.creator_id}, Role: ${rel.role}, Status: ${rel.status}`);
        });
      }
    }
    
    console.log('\n✅ Criação de relacionamentos de exemplo concluída!');
    
  } catch (error) {
    console.error('❌ Erro na criação:', error);
  }
}

if (require.main === module) {
  createSampleRelationships()
    .then(() => {
      console.log('\n🎉 Criação finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Criação falhou:', error);
      process.exit(1);
    });
}

export { createSampleRelationships };
