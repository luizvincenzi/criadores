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

interface MigrationStats {
  organizations: number;
  users: number;
  businesses: number;
  creators: number;
  campaigns: number;
  campaign_creators: number;
  errors: string[];
}

export async function migrateFromGoogleSheets(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    organizations: 0,
    users: 0,
    businesses: 0,
    creators: 0,
    campaigns: 0,
    campaign_creators: 0,
    errors: []
  };

  console.log('🚀 Iniciando migração do Google Sheets para Supabase...');

  try {
    // 1. Criar organização padrão
    await createDefaultOrganization(stats);

    // 2. Criar usuário admin padrão
    await createDefaultUser(stats);

    // 3. Migrar dados dos negócios
    await migrateBusinesses(stats);

    // 4. Migrar dados dos criadores
    await migrateCreators(stats);

    // 5. Migrar dados das campanhas
    await migrateCampaigns(stats);

    console.log('✅ Migração concluída com sucesso!');
    console.log('📊 Estatísticas finais:', stats);

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    stats.errors.push(`Erro geral: ${error instanceof Error ? error.message : String(error)}`);
  }

  return stats;
}

async function createDefaultOrganization(stats: MigrationStats) {
  console.log('📋 Criando organização padrão...');

  const { error } = await supabase
    .from('organizations')
    .upsert({
      id: DEFAULT_ORG_ID,
      name: 'CRM Criadores',
      domain: 'crmcriadores.com',
      settings: {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        date_format: 'DD/MM/YYYY',
        features: {
          campaigns: true,
          leads: true,
          tasks: true,
          analytics: true
        }
      },
      subscription_plan: 'pro'
    });

  if (error) {
    stats.errors.push(`Erro ao criar organização: ${error.message}`);
    throw error;
  } else {
    stats.organizations = 1;
    console.log('✅ Organização criada');
  }
}

async function createDefaultUser(stats: MigrationStats) {
  console.log('👤 Criando usuário admin padrão...');

  const { error } = await supabase
    .from('users')
    .upsert({
      id: DEFAULT_USER_ID,
      organization_id: DEFAULT_ORG_ID,
      email: 'luizvincenzi@gmail.com',
      full_name: 'Luiz Vincenzi',
      role: 'admin',
      permissions: {
        businesses: { read: true, write: true, delete: true },
        campaigns: { read: true, write: true, delete: true },
        creators: { read: true, write: true, delete: true },
        leads: { read: true, write: true, delete: true },
        tasks: { read: true, write: true, delete: true }
      }
    });

  if (error) {
    stats.errors.push(`Erro ao criar usuário: ${error.message}`);
  } else {
    stats.users = 1;
    console.log('✅ Usuário admin criado');
  }
}

async function migrateBusinesses(stats: MigrationStats) {
  console.log('🏢 Migrando negócios...');

  try {
    const businessesData = await getBusinessesData();
    
    for (const business of businessesData) {
      try {
        // Gerar UUID válido baseado no nome para consistência
        const businessId = generateUUIDFromString(`business_${business.nome}`);

        const businessRecord = {
          id: businessId,
          organization_id: DEFAULT_ORG_ID,
          name: business.nome,
          contact_info: {
            primary_contact: business.nomeResponsavel || '',
            whatsapp: business.whatsappResponsavel || '',
            instagram: business.instagram || '',
            email: '',
            phone: '',
            website: ''
          },
          address: {
            street: '',
            city: business.cidade || '',
            state: '',
            zip_code: '',
            country: 'Brasil'
          },
          contract_info: {
            signed: business.contratoAssinadoEnviado === 'Sim',
            signature_date: business.dataAssinaturaContrato || null,
            valid_until: business.contratoValidoAte || null,
            files: business.relatedFiles ? [business.relatedFiles] : [],
            terms: {}
          },
          status: mapBusinessStatus(business.prospeccao),
          responsible_user_id: DEFAULT_USER_ID,
          tags: business.categoria ? [business.categoria] : [],
          custom_fields: {
            plano_atual: business.planoAtual,
            comercial: business.comercial,
            grupo_whatsapp_criado: business.grupoWhatsappCriado === 'Sim',
            notes: business.notes || ''
          }
        };

        const { error } = await supabase
          .from('businesses')
          .upsert(businessRecord);

        if (error) {
          stats.errors.push(`Erro ao migrar negócio ${business.nome}: ${error.message}`);
        } else {
          stats.businesses++;
        }

      } catch (error) {
        stats.errors.push(`Erro ao processar negócio ${business.nome}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log(`✅ ${stats.businesses} negócios migrados`);

  } catch (error) {
    stats.errors.push(`Erro ao buscar dados dos negócios: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function migrateCreators(stats: MigrationStats) {
  console.log('👥 Migrando criadores...');

  try {
    const creatorsData = await getCreatorsData();
    
    for (const creator of creatorsData) {
      try {
        // Gerar UUID válido baseado no nome para consistência
        const creatorId = generateUUIDFromString(`creator_${creator.nome}`);

        const creatorRecord = {
          id: creatorId,
          organization_id: DEFAULT_ORG_ID,
          name: creator.nome,
          social_media: {
            instagram: {
              username: creator.instagram || '',
              followers: creator.seguidores || 0,
              engagement_rate: 0,
              verified: false
            },
            tiktok: {
              username: '',
              followers: 0
            },
            youtube: {
              channel: '',
              subscribers: 0
            }
          },
          contact_info: {
            whatsapp: creator.whatsapp || '',
            email: '',
            phone: '',
            preferred_contact: 'whatsapp'
          },
          profile_info: {
            biography: creator.biografia || '',
            category: creator.categoria || '',
            niche: [],
            location: {
              city: creator.cidade || '',
              state: '',
              country: 'Brasil'
            },
            rates: {
              post: 0,
              story: 0,
              reel: 0,
              event: 0
            },
            availability: {
              weekdays: true,
              weekends: true,
              travel: false
            }
          },
          performance_metrics: {
            total_campaigns: 0,
            avg_engagement: 0,
            completion_rate: 100,
            rating: 5.0,
            last_campaign_date: null
          },
          status: mapCreatorStatus(creator.status),
          tags: [],
          notes: ''
        };

        const { error } = await supabase
          .from('creators')
          .upsert(creatorRecord);

        if (error) {
          stats.errors.push(`Erro ao migrar criador ${creator.nome}: ${error.message}`);
        } else {
          stats.creators++;
        }

      } catch (error) {
        stats.errors.push(`Erro ao processar criador ${creator.nome}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log(`✅ ${stats.creators} criadores migrados`);

  } catch (error) {
    stats.errors.push(`Erro ao buscar dados dos criadores: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function migrateCampaigns(stats: MigrationStats) {
  console.log('📋 Migrando campanhas...');

  try {
    const campaignsData = await getRawCampaignsData();
    
    // Agrupar campanhas por negócio e mês
    const campaignGroups = new Map<string, any[]>();
    
    for (const campaign of campaignsData) {
      const key = `${campaign.businessId}-${campaign.mes}`;
      if (!campaignGroups.has(key)) {
        campaignGroups.set(key, []);
      }
      campaignGroups.get(key)!.push(campaign);
    }

    // Criar campanhas agrupadas
    for (const [key, campaigns] of campaignGroups) {
      try {
        const firstCampaign = campaigns[0];
        const campaignId = generateUUIDFromString(`campaign_${firstCampaign.businessName}_${firstCampaign.mes}`);
        
        // Gerar business_id baseado no nome do negócio
        const businessId = generateUUIDFromString(`business_${firstCampaign.businessName}`);

        // Criar campanha principal
        const campaignRecord = {
          id: campaignId,
          organization_id: DEFAULT_ORG_ID,
          business_id: businessId,
          title: firstCampaign.tituloCampanha || `Campanha ${firstCampaign.businessName} - ${firstCampaign.mes}`,
          description: '',
          campaign_type: 'influencer',
          month: firstCampaign.mes,
          budget: 0,
          spent_amount: 0,
          status: mapCampaignStatus(firstCampaign.status),
          objectives: {
            primary: '',
            secondary: [],
            kpis: {
              reach: 0,
              engagement: 0,
              conversions: 0
            }
          },
          deliverables: {
            posts: campaigns.length,
            stories: 0,
            reels: 0,
            events: 0,
            requirements: []
          },
          created_by: DEFAULT_USER_ID,
          responsible_user_id: DEFAULT_USER_ID
        };

        const { error: campaignError } = await supabase
          .from('campaigns')
          .upsert(campaignRecord);

        if (campaignError) {
          stats.errors.push(`Erro ao criar campanha ${campaignRecord.title}: ${campaignError.message}`);
          continue;
        }

        stats.campaigns++;

        // Criar relacionamentos campaign_creators
        for (const campaign of campaigns) {
          if (campaign.criadorName) {
            try {
              // Gerar creator_id baseado no nome do criador
              const creatorId = generateUUIDFromString(`creator_${campaign.criadorName}`);

              const campaignCreatorRecord = {
                campaign_id: campaignId,
                creator_id: creatorId,
                role: 'primary',
                fee: 0,
                payment_status: 'pending',
                status: 'Confirmado',
                deliverables: {
                  briefing_complete: campaign.briefingCompleto || 'Pendente',
                  visit_datetime: campaign.dataHoraVisita || null,
                  guest_quantity: campaign.quantidadeConvidados || 0,
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
                stats.errors.push(`Erro ao criar campaign_creator: ${ccError.message}`);
              } else {
                stats.campaign_creators++;
              }

            } catch (error) {
              stats.errors.push(`Erro ao processar campaign_creator: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }

      } catch (error) {
        stats.errors.push(`Erro ao processar grupo de campanhas ${key}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log(`✅ ${stats.campaigns} campanhas e ${stats.campaign_creators} relacionamentos migrados`);

  } catch (error) {
    stats.errors.push(`Erro ao buscar dados das campanhas: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Funções auxiliares para mapear status
function mapBusinessStatus(status: string): 'Reunião de briefing' | 'Agendamentos' | 'Entrega final' | 'Finalizado' {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower.includes('agendamento')) return 'Agendamentos';
  if (statusLower.includes('entrega')) return 'Entrega final';
  if (statusLower.includes('finalizado')) return 'Finalizado';
  
  return 'Reunião de briefing';
}

function mapCreatorStatus(status: string): 'Ativo' | 'Não parceiro' | 'Precisa engajar' | 'Inativo' {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower.includes('não parceiro')) return 'Não parceiro';
  if (statusLower.includes('precisa engajar')) return 'Precisa engajar';
  if (statusLower.includes('inativo')) return 'Inativo';
  
  return 'Ativo';
}

function mapCampaignStatus(status: string): 'Reunião de briefing' | 'Agendamentos' | 'Entrega final' | 'Finalizado' {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower.includes('agendamento')) return 'Agendamentos';
  if (statusLower.includes('entrega')) return 'Entrega final';
  if (statusLower.includes('finalizado')) return 'Finalizado';
  
  return 'Reunião de briefing';
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateFromGoogleSheets()
    .then(stats => {
      console.log('📊 Migração finalizada:', stats);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro na migração:', error);
      process.exit(1);
    });
}
