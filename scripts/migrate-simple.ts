import { createClient } from '@supabase/supabase-js';
import { getRawCampaignsData, getCreatorsData, getBusinessesData } from '../app/actions/sheetsActions';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// IDs fixos para migração
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000002';

// Função para gerar UUID válido a partir de string
function generateUUIDFromString(input: string): string {
  // Criar hash simples da string
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Converter para UUID válido
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
  const timestamp = Date.now().toString(16).slice(-8);
  const random = Math.random().toString(16).slice(2, 10);
  
  return `${hashStr.slice(0, 8)}-${timestamp.slice(0, 4)}-4${timestamp.slice(4, 7)}-8${random.slice(0, 3)}-${random.slice(3, 15).padEnd(12, '0')}`;
}

export async function migrateSimple() {
  console.log('🚀 Iniciando migração SIMPLIFICADA...');

  try {
    // 1. Migrar negócios
    console.log('🏢 Migrando negócios...');
    const businessesData = await getBusinessesData();
    console.log(`📊 Encontrados ${businessesData.length} negócios`);
    
    let businessCount = 0;
    for (const business of businessesData) {
      try {
        const businessId = generateUUIDFromString(`business_${business.nome}`);
        
        const { error } = await supabase
          .from('businesses')
          .insert({
            id: businessId,
            organization_id: DEFAULT_ORG_ID,
            name: business.nome || 'Nome não informado',
            contact_info: {
              primary_contact: business.nomeResponsavel || '',
              whatsapp: business.whatsappResponsavel || '',
              instagram: business.instagram || ''
            },
            address: {
              city: business.cidade || '',
              country: 'Brasil'
            },
            status: 'Reunião de briefing',
            responsible_user_id: DEFAULT_USER_ID,
            tags: business.categoria ? [business.categoria] : []
          });

        if (error) {
          console.error(`❌ Erro ao migrar negócio ${business.nome}:`, error.message);
        } else {
          businessCount++;
          console.log(`✅ Negócio migrado: ${business.nome}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar negócio ${business.nome}:`, error);
      }
    }

    // 2. Migrar criadores
    console.log('👥 Migrando criadores...');
    const creatorsData = await getCreatorsData();
    console.log(`📊 Encontrados ${creatorsData.length} criadores`);
    
    let creatorCount = 0;
    for (const creator of creatorsData) {
      try {
        const creatorId = generateUUIDFromString(`creator_${creator.nome}`);
        
        const { error } = await supabase
          .from('creators')
          .insert({
            id: creatorId,
            organization_id: DEFAULT_ORG_ID,
            name: creator.nome || 'Nome não informado',
            social_media: {
              instagram: {
                username: creator.instagram || '',
                followers: creator.seguidores || 0
              }
            },
            contact_info: {
              whatsapp: creator.whatsapp || ''
            },
            profile_info: {
              biography: creator.biografia || '',
              category: creator.categoria || '',
              location: {
                city: creator.cidade || '',
                country: 'Brasil'
              }
            },
            status: creator.status === 'Ativo' ? 'Ativo' : 'Inativo'
          });

        if (error) {
          console.error(`❌ Erro ao migrar criador ${creator.nome}:`, error.message);
        } else {
          creatorCount++;
          console.log(`✅ Criador migrado: ${creator.nome}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar criador ${creator.nome}:`, error);
      }
    }

    // 3. Migrar campanhas
    console.log('📋 Migrando campanhas...');
    const campaignsData = await getRawCampaignsData();
    console.log(`📊 Encontrados ${campaignsData.length} registros de campanha`);
    
    // Agrupar por negócio e mês
    const campaignGroups = new Map<string, any[]>();
    
    for (const campaign of campaignsData) {
      if (campaign.businessName && campaign.mes) {
        const key = `${campaign.businessName}-${campaign.mes}`;
        if (!campaignGroups.has(key)) {
          campaignGroups.set(key, []);
        }
        campaignGroups.get(key)!.push(campaign);
      }
    }

    console.log(`📊 Agrupadas em ${campaignGroups.size} campanhas únicas`);

    let campaignCount = 0;
    let campaignCreatorCount = 0;

    for (const [key, campaigns] of campaignGroups) {
      try {
        const firstCampaign = campaigns[0];
        const campaignId = generateUUIDFromString(`campaign_${firstCampaign.businessName}_${firstCampaign.mes}`);
        const businessId = generateUUIDFromString(`business_${firstCampaign.businessName}`);
        
        // Criar campanha
        const { error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            id: campaignId,
            organization_id: DEFAULT_ORG_ID,
            business_id: businessId,
            title: `Campanha ${firstCampaign.businessName} - ${firstCampaign.mes}`,
            month: firstCampaign.mes,
            status: 'Reunião de briefing',
            created_by: DEFAULT_USER_ID,
            responsible_user_id: DEFAULT_USER_ID
          });

        if (campaignError) {
          console.error(`❌ Erro ao criar campanha ${key}:`, campaignError.message);
          continue;
        }

        campaignCount++;
        console.log(`✅ Campanha criada: ${key}`);

        // Criar relacionamentos campaign_creators
        for (const campaign of campaigns) {
          if (campaign.criadorName) {
            try {
              const creatorId = generateUUIDFromString(`creator_${campaign.criadorName}`);
              
              const { error: ccError } = await supabase
                .from('campaign_creators')
                .insert({
                  campaign_id: campaignId,
                  creator_id: creatorId,
                  role: 'primary',
                  status: 'Confirmado',
                  deliverables: {
                    briefing_complete: campaign.briefingCompleto || 'Pendente',
                    visit_datetime: campaign.dataHoraVisita || null,
                    guest_quantity: campaign.quantidadeConvidados || 0,
                    visit_confirmed: campaign.visitaConfirmada || 'Pendente',
                    post_datetime: campaign.dataHoraPostagem || null,
                    video_approved: campaign.videoAprovado || 'Pendente',
                    video_posted: campaign.videoPostado || 'Não'
                  }
                });

              if (ccError) {
                console.error(`❌ Erro ao criar campaign_creator:`, ccError.message);
              } else {
                campaignCreatorCount++;
              }

            } catch (error) {
              console.error(`❌ Erro ao processar campaign_creator:`, error);
            }
          }
        }

      } catch (error) {
        console.error(`❌ Erro ao processar campanha ${key}:`, error);
      }
    }

    console.log('\n🎉 MIGRAÇÃO SIMPLIFICADA CONCLUÍDA!');
    console.log(`📊 Resultados:`);
    console.log(`  - ✅ ${businessCount} negócios migrados`);
    console.log(`  - ✅ ${creatorCount} criadores migrados`);
    console.log(`  - ✅ ${campaignCount} campanhas migradas`);
    console.log(`  - ✅ ${campaignCreatorCount} relacionamentos criados`);

    return {
      businesses: businessCount,
      creators: creatorCount,
      campaigns: campaignCount,
      campaign_creators: campaignCreatorCount
    };

  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
    throw error;
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateSimple()
    .then(stats => {
      console.log('\n🎉 Migração finalizada com sucesso!', stats);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Erro na migração:', error);
      process.exit(1);
    });
}
