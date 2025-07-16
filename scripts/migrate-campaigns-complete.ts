import { createClient } from '@supabase/supabase-js';
import { getRawCampaignsData, getBusinessesData, getCreatorsData } from '../app/actions/sheetsActions';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// Função para gerar UUID único
function generateUUIDFromString(str: string): string {
  // Usar UUID aleatório para garantir validade
  return randomUUID();
}

// Mapear status de campanha
function mapCampaignStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Reunião de briefing': 'Reunião de briefing',
    'Agendamentos': 'Agendamentos', 
    'Entrega final': 'Entrega final',
    'Finalizado': 'Finalizado'
  };
  
  return statusMap[status] || 'Reunião de briefing';
}

async function migrateCampaignsComplete() {
  console.log('🚀 Iniciando migração completa de campanhas...\n');
  
  try {
    // 1. Buscar dados das campanhas, negócios e criadores
    console.log('📊 Carregando dados...');
    const [campaignsData, businessesData, creatorsData] = await Promise.all([
      getRawCampaignsData(),
      getBusinessesData(), 
      getCreatorsData()
    ]);
    
    console.log(`✅ ${campaignsData.length} campanhas encontradas`);
    console.log(`✅ ${businessesData.length} negócios encontrados`);
    console.log(`✅ ${creatorsData.length} criadores encontrados\n`);
    
    // 2. Criar mapas de correspondência
    console.log('🗺️ Criando mapas de correspondência...');
    
    // Mapa business_id -> business real
    const businessMap = new Map<string, any>();
    businessesData.forEach(business => {
      if (business.businessId) {
        businessMap.set(business.businessId, business);
      }
    });
    
    // Mapa criador_id -> criador real  
    const creatorMap = new Map<string, any>();
    creatorsData.forEach(creator => {
      if (creator.criadorId) {
        creatorMap.set(creator.criadorId, creator);
      }
    });
    
    console.log(`✅ ${businessMap.size} negócios mapeados`);
    console.log(`✅ ${creatorMap.size} criadores mapeados\n`);
    
    // 3. Buscar IDs do Supabase
    console.log('🔍 Buscando IDs do Supabase...');
    const [businessesResult, creatorsResult, usersResult] = await Promise.all([
      supabase.from('businesses').select('id, name').eq('organization_id', DEFAULT_ORG_ID),
      supabase.from('creators').select('id, name').eq('organization_id', DEFAULT_ORG_ID),
      supabase.from('users').select('id, email').eq('organization_id', DEFAULT_ORG_ID).limit(1)
    ]);

    const supabaseBusinesses = businessesResult.data;
    const supabaseCreators = creatorsResult.data;
    const realUserId = usersResult.data?.[0]?.id || DEFAULT_ORG_ID;

    console.log(`✅ Usuário real encontrado: ${realUserId}`);
    
    // Criar mapas nome -> ID do Supabase
    const businessNameToId = new Map<string, string>();
    supabaseBusinesses?.forEach(b => {
      businessNameToId.set(b.name.toLowerCase().trim(), b.id);
    });
    
    const creatorNameToId = new Map<string, string>();
    supabaseCreators?.forEach(c => {
      creatorNameToId.set(c.name.toLowerCase().trim(), c.id);
    });
    
    console.log(`✅ ${businessNameToId.size} negócios do Supabase mapeados`);
    console.log(`✅ ${creatorNameToId.size} criadores do Supabase mapeados\n`);
    
    // 4. Processar campanhas
    console.log('🔄 Processando campanhas...');
    
    const campaignGroups = new Map<string, any[]>();
    let processedCount = 0;
    let errorCount = 0;
    
    // Agrupar campanhas por business + mês
    for (const campaign of campaignsData) {
      try {
        // ESTRUTURA CORRETA IDENTIFICADA:
        // campaign.business = coluna B = business_id (ex: bus_1752518506990_8erlqw_boussol)
        // campaign.influenciador = coluna C = criador_id (ex: crt_1752518507498_2obhdz_pietramant)

        console.log(`🔍 Processando: Business ID="${campaign.business}", Creator ID="${campaign.influenciador}"`);

        // Resolver business real usando o business_id
        const businessData = businessMap.get(campaign.business);
        if (!businessData) {
          console.log(`⚠️ Business não encontrado para ID: ${campaign.business}`);
          errorCount++;
          continue;
        }

        // Resolver criador real usando o criador_id
        const creatorData = creatorMap.get(campaign.influenciador);
        if (!creatorData) {
          console.log(`⚠️ Criador não encontrado para ID: ${campaign.influenciador}`);
          errorCount++;
          continue;
        }

        console.log(`✅ Resolvido: Business="${businessData.nome}", Creator="${creatorData.nome}"`);

        
        // Buscar IDs do Supabase
        const businessSupabaseId = businessNameToId.get(businessData.nome.toLowerCase().trim());
        const creatorSupabaseId = creatorNameToId.get(creatorData.nome.toLowerCase().trim());
        
        if (!businessSupabaseId) {
          console.log(`⚠️ Business "${businessData.nome}" não encontrado no Supabase`);
          errorCount++;
          continue;
        }
        
        if (!creatorSupabaseId) {
          console.log(`⚠️ Criador "${creatorData.nome}" não encontrado no Supabase`);
          errorCount++;
          continue;
        }
        
        // Criar chave única para agrupamento
        const groupKey = `${businessData.nome}_${campaign.mes}`;
        
        if (!campaignGroups.has(groupKey)) {
          campaignGroups.set(groupKey, []);
        }
        
        campaignGroups.get(groupKey)!.push({
          ...campaign,
          businessData,
          creatorData,
          businessSupabaseId,
          creatorSupabaseId
        });
        
        processedCount++;
        
      } catch (error) {
        console.error(`❌ Erro ao processar campanha:`, error);
        errorCount++;
      }
    }
    
    console.log(`✅ ${processedCount} campanhas processadas`);
    console.log(`❌ ${errorCount} erros encontrados`);
    console.log(`📊 ${campaignGroups.size} grupos de campanhas criados\n`);
    
    // 5. Criar campanhas no Supabase
    console.log('💾 Criando campanhas no Supabase...');

    let campaignCount = 0;
    let campaignCreatorCount = 0;

    for (const [groupKey, campaigns] of campaignGroups) {
      try {
        const firstCampaign = campaigns[0];
        const campaignId = generateUUIDFromString(`campaign_${groupKey}`);

        // Criar campanha principal
        const campaignRecord = {
          id: campaignId,
          organization_id: DEFAULT_ORG_ID,
          business_id: firstCampaign.businessSupabaseId,
          title: `${firstCampaign.businessData.nome} - ${firstCampaign.mes}`,
          description: '',
          campaign_type: 'influencer',
          month: firstCampaign.mes,
          budget: 0,
          spent_amount: 0,
          status: mapCampaignStatus(firstCampaign.status),
          objectives: {
            primary: '',
            secondary: [],
            kpis: { reach: 0, engagement: 0, conversions: 0 }
          },
          deliverables: {
            posts: campaigns.length,
            stories: 0,
            reels: 0,
            events: 0,
            requirements: []
          },
          created_by: realUserId,
          responsible_user_id: realUserId
        };

        const { error: campaignError } = await supabase
          .from('campaigns')
          .upsert(campaignRecord);

        if (campaignError) {
          console.error(`❌ Erro ao criar campanha ${groupKey}:`, campaignError.message);
          continue;
        }

        campaignCount++;
        console.log(`✅ Campanha criada: ${firstCampaign.businessData.nome} - ${firstCampaign.mes}`);

        // Criar relacionamentos campaign_creators
        for (const campaign of campaigns) {
          try {
            const campaignCreatorRecord = {
              campaign_id: campaignId,
              creator_id: campaign.creatorSupabaseId,
              role: 'primary',
              fee: 0,
              payment_status: 'pending',
              status: 'Confirmado',
              deliverables: {
                briefing_complete: campaign.briefingCompleto || 'Pendente',
                visit_datetime: campaign.dataHoraVisita || null,
                guest_quantity: parseInt(campaign.quantidadeConvidados) || 0,
                visit_confirmed: campaign.visitaConfirmada || 'Pendente',
                post_datetime: campaign.dataHoraPostagem || null,
                video_approved: campaign.videoAprovado || 'Pendente',
                video_posted: campaign.videoPostado || 'Não',
                content_links: []
              },
              performance_data: {
                reach: 0,
                impressions: 0,
                engagement: 0,
                clicks: 0,
                saves: 0,
                shares: 0
              }
            };

            const { error: ccError } = await supabase
              .from('campaign_creators')
              .upsert(campaignCreatorRecord);

            if (ccError) {
              console.error(`❌ Erro ao criar campaign_creator:`, ccError.message);
            } else {
              campaignCreatorCount++;
            }

          } catch (error) {
            console.error(`❌ Erro ao processar campaign_creator:`, error);
          }
        }

      } catch (error) {
        console.error(`❌ Erro ao processar grupo ${groupKey}:`, error);
      }
    }

    console.log('\n🎉 MIGRAÇÃO DE CAMPANHAS CONCLUÍDA!');
    console.log(`📊 Resultados:`);
    console.log(`  - ✅ ${campaignCount} campanhas migradas`);
    console.log(`  - ✅ ${campaignCreatorCount} relacionamentos criados`);
    console.log(`  - ❌ ${errorCount} erros encontrados`);

    return {
      campaigns: campaignCount,
      campaign_creators: campaignCreatorCount,
      errors: errorCount
    };

  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
    throw error;
  }
}

if (require.main === module) {
  migrateCampaignsComplete()
    .then(result => {
      console.log('\n✅ Migração finalizada:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migração falhou:', error);
      process.exit(1);
    });
}

export { migrateCampaignsComplete };
