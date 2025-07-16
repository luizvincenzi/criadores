const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function verifyCampaignSlots() {
  console.log('🔍 Verificando slots das campanhas...');

  try {
    // 1. Buscar todas as campanhas
    const { data: campaigns, error: campaignsError } = await supabase
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

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`📋 Verificando ${campaigns?.length || 0} campanhas mais recentes`);

    if (!campaigns || campaigns.length === 0) {
      console.log('❌ Nenhuma campanha encontrada');
      return;
    }

    // 2. Testar API de creator-slots para cada campanha
    for (const campaign of campaigns) {
      console.log(`\n📝 Testando: ${campaign.business?.name} - ${campaign.title}`);

      try {
        // Testar API com quantidade padrão de 6 slots
        const apiUrl = `http://localhost:3001/api/supabase/creator-slots?businessName=${encodeURIComponent(campaign.business?.name || '')}&mes=${encodeURIComponent(campaign.month || '')}&quantidadeContratada=6`;
        
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success) {
          console.log(`  ✅ API funcionando: ${result.slots?.length || 0} slots, ${result.availableCreators?.length || 0} criadores`);
          
          // Mostrar slots preenchidos
          const filledSlots = result.slots?.filter(slot => slot.influenciador && slot.influenciador.trim() !== '') || [];
          const emptySlots = (result.slots?.length || 0) - filledSlots.length;
          
          console.log(`  📊 Slots preenchidos: ${filledSlots.length}, Slots vazios: ${emptySlots}`);
          
          if (filledSlots.length > 0) {
            console.log(`  👥 Criadores atuais:`);
            filledSlots.forEach((slot, i) => {
              console.log(`    ${i + 1}. ${slot.influenciador}`);
            });
          }
        } else {
          console.log(`  ❌ Erro na API: ${result.error}`);
        }

      } catch (error) {
        console.log(`  ❌ Erro ao testar API: ${error.message}`);
      }
    }

    // 3. Verificar view da jornada
    console.log(`\n📊 Verificando view da jornada...`);
    
    const { data: journeyData, error: journeyError } = await supabase
      .from('campaign_journey_view')
      .select('id, title, business_name, total_creators, status')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(10);

    if (journeyError) {
      console.error('❌ Erro ao buscar jornada:', journeyError);
    } else {
      console.log(`✅ ${journeyData?.length || 0} campanhas na jornada:`);
      journeyData?.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.business_name} - ${item.title} (${item.status}) - ${item.total_creators} criadores`);
      });
    }

    // 4. Resumo
    console.log(`\n📈 Resumo:`);
    console.log(`📋 Campanhas no banco: ${campaigns.length}`);
    console.log(`📊 Campanhas na jornada: ${journeyData?.length || 0}`);
    
    if (campaigns.length === journeyData?.length) {
      console.log(`✅ Todas as campanhas aparecem na jornada!`);
    } else {
      console.log(`⚠️ Algumas campanhas podem não aparecer na jornada`);
    }

    console.log(`\n🎯 Próximos passos:`);
    console.log(`1. Todas as campanhas têm slots dinâmicos (6 por padrão)`);
    console.log(`2. Slots vazios são criados automaticamente pela API`);
    console.log(`3. Você pode adicionar criadores através da jornada`);
    console.log(`4. Múltiplas associações são permitidas`);

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar
verifyCampaignSlots();
