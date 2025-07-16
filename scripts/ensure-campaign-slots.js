const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_SLOTS_PER_CAMPAIGN = 6; // Número padrão de slots por campanha

// Função para gerar UUID válido
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function ensureCampaignSlots() {
  console.log('🎯 Garantindo que todas as campanhas tenham slots para criadores...');

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
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`📋 ${campaigns?.length || 0} campanhas encontradas`);

    if (!campaigns || campaigns.length === 0) {
      console.log('❌ Nenhuma campanha encontrada');
      return;
    }

    let campaignsProcessed = 0;
    let slotsCreated = 0;

    // 2. Processar cada campanha
    for (const campaign of campaigns) {
      console.log(`\n📝 Processando: ${campaign.business?.name} - ${campaign.title} (${campaign.month})`);

      // 3. Verificar quantos slots já existem
      const { data: existingSlots, error: slotsError } = await supabase
        .from('campaign_creators')
        .select('id, creator_id, status')
        .eq('campaign_id', campaign.id)
        .eq('organization_id', DEFAULT_ORG_ID)
        .neq('status', 'Removido');

      if (slotsError) {
        console.error(`❌ Erro ao buscar slots para ${campaign.title}:`, slotsError);
        continue;
      }

      const currentSlots = existingSlots?.length || 0;
      console.log(`  📊 Slots atuais: ${currentSlots}`);

      // 4. Criar slots vazios se necessário
      const slotsNeeded = Math.max(0, DEFAULT_SLOTS_PER_CAMPAIGN - currentSlots);
      
      if (slotsNeeded > 0) {
        console.log(`  ➕ Criando ${slotsNeeded} slots vazios...`);

        const newSlots = [];
        for (let i = 0; i < slotsNeeded; i++) {
          newSlots.push({
            id: generateUUID(),
            organization_id: DEFAULT_ORG_ID,
            campaign_id: campaign.id,
            creator_id: null, // Slot vazio
            role: 'primary',
            status: 'Disponível', // Status para slots vazios
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
            created_at: new Date().toISOString()
          });
        }

        // Inserir slots em lotes
        const { data: insertedSlots, error: insertError } = await supabase
          .from('campaign_creators')
          .insert(newSlots)
          .select();

        if (insertError) {
          console.error(`  ❌ Erro ao criar slots:`, insertError);
        } else {
          console.log(`  ✅ ${insertedSlots?.length || 0} slots criados`);
          slotsCreated += insertedSlots?.length || 0;
        }
      } else {
        console.log(`  ✅ Campanha já tem slots suficientes`);
      }

      campaignsProcessed++;
    }

    console.log(`\n🎉 Processamento concluído!`);
    console.log(`📊 Campanhas processadas: ${campaignsProcessed}`);
    console.log(`➕ Slots criados: ${slotsCreated}`);

    // 5. Verificar resultado final
    const { data: finalStats } = await supabase
      .from('campaign_creators')
      .select('campaign_id')
      .eq('organization_id', DEFAULT_ORG_ID);

    const campaignSlotCounts = {};
    finalStats?.forEach(slot => {
      campaignSlotCounts[slot.campaign_id] = (campaignSlotCounts[slot.campaign_id] || 0) + 1;
    });

    console.log(`\n📈 Estatísticas finais:`);
    console.log(`📋 Total de campanhas: ${campaigns.length}`);
    console.log(`🔗 Total de slots: ${finalStats?.length || 0}`);
    console.log(`📊 Média de slots por campanha: ${((finalStats?.length || 0) / campaigns.length).toFixed(1)}`);

    // 6. Mostrar campanhas com poucos slots (se houver)
    const campaignsWithFewSlots = campaigns.filter(campaign => {
      const slotCount = campaignSlotCounts[campaign.id] || 0;
      return slotCount < DEFAULT_SLOTS_PER_CAMPAIGN;
    });

    if (campaignsWithFewSlots.length > 0) {
      console.log(`\n⚠️ Campanhas com menos de ${DEFAULT_SLOTS_PER_CAMPAIGN} slots:`);
      campaignsWithFewSlots.forEach(campaign => {
        const slotCount = campaignSlotCounts[campaign.id] || 0;
        console.log(`  - ${campaign.business?.name} - ${campaign.title}: ${slotCount} slots`);
      });
    } else {
      console.log(`\n✅ Todas as campanhas têm pelo menos ${DEFAULT_SLOTS_PER_CAMPAIGN} slots!`);
    }

  } catch (error) {
    console.error('❌ Erro no processamento:', error);
  }
}

// Executar
ensureCampaignSlots();
