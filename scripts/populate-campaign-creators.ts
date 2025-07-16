import { supabase } from '../lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Função para gerar UUID válido a partir de string
function generateUUIDFromString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
  const timestamp = Date.now().toString(16).slice(-8);
  const random = Math.random().toString(16).slice(2, 10);
  
  return `${hashStr.slice(0, 8)}-${timestamp.slice(0, 4)}-4${timestamp.slice(4, 7)}-8${random.slice(0, 3)}-${random.slice(3, 15).padEnd(12, '0')}`;
}

async function populateCampaignCreators() {
  console.log('🚀 Populando tabela campaign_creators...');

  try {
    // 1. Buscar todas as campanhas existentes
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`📋 ${campaigns?.length || 0} campanhas encontradas`);

    if (!campaigns || campaigns.length === 0) {
      console.log('❌ Nenhuma campanha encontrada');
      return;
    }

    // 2. Verificar quais campanhas já têm relacionamentos
    const { data: existingRelations } = await supabase
      .from('campaign_creators')
      .select('campaign_id')
      .eq('organization_id', DEFAULT_ORG_ID);

    const existingCampaignIds = new Set(existingRelations?.map(r => r.campaign_id) || []);

    // 3. Buscar criadores do Google Sheets para mapear
    const { GoogleSheetsService } = await import('../lib/google-sheets');
    const sheetsService = new GoogleSheetsService();
    const campanhasSheets = await sheetsService.getCampanhas();

    console.log(`📊 ${campanhasSheets.length} campanhas encontradas no Google Sheets`);

    // 4. Buscar criadores do Supabase
    const { data: creators } = await supabase
      .from('creators')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID);

    const creatorMap = new Map(creators?.map(c => [c.name, c.id]) || []);
    console.log(`👥 ${creators?.length || 0} criadores encontrados no Supabase`);

    let processedCount = 0;
    let skippedCount = 0;

    // 5. Processar cada campanha
    for (const campaign of campaigns) {
      try {
        // Pular se já tem relacionamentos
        if (existingCampaignIds.has(campaign.id)) {
          console.log(`⏭️ Campanha ${campaign.name} já tem relacionamentos`);
          skippedCount++;
          continue;
        }

        console.log(`\n📝 Processando campanha: ${campaign.name}`);

        // Buscar criadores relacionados no Google Sheets
        const relatedSheetsCampaigns = campanhasSheets.filter(sc => {
          const businessName = sc['Nome Campanha'] || '';
          const mes = sc['Mês'] || '';
          return businessName.includes(campaign.business_id) || 
                 campaign.name.includes(businessName) ||
                 campaign.month === mes;
        });

        if (relatedSheetsCampaigns.length === 0) {
          console.log(`⚠️ Nenhum criador encontrado no Sheets para: ${campaign.name}`);
          // Criar campanha sem criadores (será preenchido depois na jornada)
          processedCount++;
          continue;
        }

        // Criar relacionamentos para cada criador encontrado
        for (const sheetsCampaign of relatedSheetsCampaigns) {
          const creatorName = sheetsCampaign['Criador'] || '';
          const creatorId = creatorMap.get(creatorName);

          if (!creatorId) {
            console.log(`❌ Criador "${creatorName}" não encontrado no Supabase`);
            continue;
          }

          // Verificar se relacionamento já existe
          const { data: existingRelation } = await supabase
            .from('campaign_creators')
            .select('id')
            .eq('campaign_id', campaign.id)
            .eq('creator_id', creatorId)
            .single();

          if (existingRelation) {
            console.log(`⏭️ Relacionamento já existe: ${campaign.name} - ${creatorName}`);
            continue;
          }

          // Criar relacionamento
          const relationshipData = {
            id: generateUUIDFromString(`${campaign.id}-${creatorId}-${Date.now()}`),
            organization_id: DEFAULT_ORG_ID,
            campaign_id: campaign.id,
            creator_id: creatorId,
            status: 'active',
            created_at: new Date().toISOString()
          };

          const { error: relationshipError } = await supabase
            .from('campaign_creators')
            .insert(relationshipData);

          if (relationshipError) {
            console.log(`❌ Erro ao criar relacionamento: ${relationshipError.message}`);
          } else {
            console.log(`✅ Relacionamento criado: ${campaign.name} - ${creatorName}`);
          }
        }

        processedCount++;

      } catch (error) {
        console.error(`❌ Erro ao processar campanha ${campaign.name}:`, error);
        skippedCount++;
      }
    }

    console.log(`\n🎉 Processamento concluído!`);
    console.log(`✅ ${processedCount} campanhas processadas`);
    console.log(`⏭️ ${skippedCount} campanhas ignoradas`);

    // 6. Verificar resultado final
    const { data: finalRelations } = await supabase
      .from('campaign_creators')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID);

    console.log(`\n📊 Total de relacionamentos criados: ${finalRelations?.length || 0}`);

  } catch (error) {
    console.error('❌ Erro no processamento:', error);
  }
}

// Executar
populateCampaignCreators();
