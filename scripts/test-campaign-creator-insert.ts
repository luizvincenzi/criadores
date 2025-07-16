import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCampaignCreatorInsert() {
  console.log('🧪 Testando inserção de campaign_creator...\n');
  
  try {
    // 1. Buscar uma campanha e um criador existentes
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .limit(1);
    
    if (campaignsError || !campaigns || campaigns.length === 0) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }
    
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('*')
      .limit(1);
    
    if (creatorsError || !creators || creators.length === 0) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return;
    }
    
    const campaign = campaigns[0];
    const creator = creators[0];
    
    console.log('📊 Dados para teste:');
    console.log(`  - Campanha: ${campaign.id} (${campaign.title})`);
    console.log(`  - Criador: ${creator.id} (${creator.nome || creator.name})`);
    
    // 2. Testar inserção simples
    console.log('\n🔄 Testando inserção simples...');
    
    const simpleRelationship = {
      campaign_id: campaign.id,
      creator_id: creator.id,
      role: 'primary',
      status: 'Confirmado'
    };
    
    const { data: simpleResult, error: simpleError } = await supabase
      .from('campaign_creators')
      .insert(simpleRelationship)
      .select();
    
    if (simpleError) {
      console.error('❌ Erro na inserção simples:', simpleError);
    } else {
      console.log('✅ Inserção simples funcionou:', simpleResult);
    }
    
    // 3. Testar inserção com todos os campos
    console.log('\n🔄 Testando inserção completa...');
    
    const completeRelationship = {
      campaign_id: campaign.id,
      creator_id: creator.id,
      role: 'primary',
      fee: 1000,
      payment_status: 'pending',
      status: 'Confirmado',
      deliverables: {
        briefing_complete: 'Pendente',
        visit_datetime: null,
        guest_quantity: 0,
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
      notes: 'Teste de inserção'
    };
    
    const { data: completeResult, error: completeError } = await supabase
      .from('campaign_creators')
      .insert(completeRelationship)
      .select();
    
    if (completeError) {
      console.error('❌ Erro na inserção completa:', completeError);
    } else {
      console.log('✅ Inserção completa funcionou:', completeResult);
    }
    
    // 4. Verificar dados inseridos
    console.log('\n🔍 Verificando dados inseridos...');
    
    const { data: allRelationships, error: allError } = await supabase
      .from('campaign_creators')
      .select('*');
    
    if (allError) {
      console.error('❌ Erro ao verificar dados:', allError);
    } else {
      console.log(`✅ Total de relacionamentos: ${allRelationships.length}`);
      allRelationships.forEach((rel, index) => {
        console.log(`  ${index + 1}. Campaign: ${rel.campaign_id}, Creator: ${rel.creator_id}, Status: ${rel.status}`);
      });
    }
    
    console.log('\n✅ Teste de inserção concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

if (require.main === module) {
  testCampaignCreatorInsert()
    .then(() => {
      console.log('\n🎉 Teste finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testCampaignCreatorInsert };
