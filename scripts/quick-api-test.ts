import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function quickApiTest() {
  console.log('⚡ TESTE RÁPIDO DA API\n');
  
  try {
    // Teste direto da API
    const response = await fetch('http://localhost:3000/api/supabase/campaigns');
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      const campaign = result.data[0];
      console.log('📋 PRIMEIRA CAMPANHA:');
      console.log('ID:', campaign.id);
      console.log('Título:', campaign.title);
      console.log('briefing_details presente:', !!campaign.briefing_details);
      
      if (campaign.briefing_details) {
        console.log('briefing_details:', JSON.stringify(campaign.briefing_details, null, 2));
      }
      
      console.log('\n📊 TODOS OS CAMPOS:');
      Object.keys(campaign).forEach(key => {
        console.log(`- ${key}: ${typeof campaign[key]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

quickApiTest();
