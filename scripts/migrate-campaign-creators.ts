import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Google Sheets
function getGoogleSheetsAuth() {
  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
  };

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
}

async function migrateCampaignCreators() {
  console.log('🔄 Migrando relacionamentos Campaign-Creators...\n');
  
  try {
    // 1. Buscar dados do Supabase
    console.log('📊 Carregando dados do Supabase...');
    
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*');
    
    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }
    
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('*');
    
    if (creatorsError) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return;
    }
    
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('*');
    
    if (businessesError) {
      console.error('❌ Erro ao buscar negócios:', businessesError);
      return;
    }
    
    console.log(`✅ Dados carregados: ${campaigns.length} campanhas, ${creators.length} criadores, ${businesses.length} negócios`);
    
    // 2. Buscar dados do Google Sheets
    console.log('\n📋 Carregando dados do Google Sheets...');
    
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      console.error('❌ GOOGLE_SPREADSHEET_ID não configurado');
      return;
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:AE'
    });
    
    const values = response.data.values || [];
    const headers = values[0] || [];
    
    console.log(`✅ ${values.length - 1} linhas carregadas do Google Sheets`);
    
    // 3. Criar mapas para busca rápida
    console.log('\n🗺️ Criando mapas de referência...');
    
    const campaignMap = new Map<string, any>();
    campaigns.forEach(campaign => {
      campaignMap.set(campaign.id, campaign);
      // Também mapear por título e mês para busca
      const key = `${campaign.title}-${campaign.month}`.toLowerCase();
      campaignMap.set(key, campaign);
    });
    
    const creatorMap = new Map<string, any>();
    creators.forEach(creator => {
      // Verificar se usa 'nome' ou 'name'
      const creatorName = creator.nome || creator.name;
      if (creatorName) {
        creatorMap.set(creatorName.toLowerCase(), creator);
      }
      creatorMap.set(creator.id, creator);
    });

    const businessMap = new Map<string, any>();
    businesses.forEach(business => {
      if (business.name) {
        businessMap.set(business.name.toLowerCase(), business);
      }
      businessMap.set(business.id, business);
    });
    
    console.log('✅ Mapas criados');
    
    // 4. Processar dados do Google Sheets
    console.log('\n🔄 Processando relacionamentos...');
    
    const relationshipsToCreate = [];
    const stats = {
      processed: 0,
      matched: 0,
      errors: 0,
      skipped: 0
    };
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      stats.processed++;
      
      try {
        // Extrair dados da linha
        const campaignId = row[0]; // A - Campaign_ID
        const businessName = row[1]; // B - Nome Campanha (business_id)
        const creatorName = row[2]; // C - Influenciador (criador_id)
        const responsible = row[3]; // D - Responsável
        const status = row[4]; // E - Status_campaign
        const month = row[5]; // F - Mês
        
        // Dados de deliverables
        const briefingComplete = row[7]; // H - Briefing completo enviado
        const visitDateTime = row[8]; // I - Data e hora Visita
        const guestQuantity = row[9]; // J - Quantidade de convidados
        const visitConfirmed = row[10]; // K - Visita Confirmado
        const postDateTime = row[11]; // L - Data e hora da Postagem
        const videoApproved = row[12]; // M - Vídeo aprovado?
        const videoPosted = row[13]; // N - Video/Reels postado?
        const contentLink = row[14]; // O - Link Video Instagram
        
        if (!creatorName || creatorName.trim() === '') {
          stats.skipped++;
          continue;
        }
        
        // Buscar campanha correspondente no Supabase
        let supabaseCampaign = null;

        // Extrair nome do business do business_id do Google Sheets
        // Formato: bus_1752518506990_8erlqw_boussol -> boussol
        let extractedBusinessName = '';
        if (businessName && businessName.includes('_')) {
          const parts = businessName.split('_');
          extractedBusinessName = parts[parts.length - 1]; // Última parte
        }

        // Primeiro, tentar buscar por nome extraído
        let business = null;
        if (extractedBusinessName) {
          // Buscar business que contenha o nome extraído
          business = businesses.find(b =>
            b.name?.toLowerCase().includes(extractedBusinessName.toLowerCase()) ||
            extractedBusinessName.toLowerCase().includes(b.name?.toLowerCase())
          );
        }

        // Se não encontrou, tentar buscar pelo business_id completo
        if (!business) {
          business = businessMap.get(businessName?.toLowerCase());
        }
        
        if (business) {
          supabaseCampaign = campaigns.find(c =>
            c.business_id === business.id &&
            c.month?.toLowerCase() === month?.toLowerCase()
          );

          if (supabaseCampaign) {
            console.log(`✅ Campanha encontrada: ${business.name} - ${month} → ${supabaseCampaign.title}`);
          }
        }

        // Se não encontrou, tentar buscar por título
        if (!supabaseCampaign) {
          const titleKey = `${businessName}-${month}`.toLowerCase();
          supabaseCampaign = campaignMap.get(titleKey);
        }

        if (!supabaseCampaign) {
          console.log(`⚠️ Campanha não encontrada: ${businessName} - ${month} (business: ${extractedBusinessName})`);
          stats.errors++;
          continue;
        }
        
        // Buscar criador correspondente
        // O creatorName no Google Sheets é um criador_id como: crt_1752518507498_2obhdz_pietramant
        // Vamos extrair o nome do final e buscar no Supabase
        let creator = null;

        if (creatorName) {
          // Primeiro, tentar buscar diretamente pelo criador_id
          creator = creatorMap.get(creatorName);

          // Se não encontrou, extrair nome do criador_id
          if (!creator && creatorName.includes('_')) {
            const parts = creatorName.split('_');
            const extractedCreatorName = parts[parts.length - 1]; // Última parte

            // Buscar criador que contenha o nome extraído
            creator = creators.find(c => {
              const creatorFullName = c.nome || c.name || '';
              return creatorFullName.toLowerCase().includes(extractedCreatorName.toLowerCase()) ||
                     extractedCreatorName.toLowerCase().includes(creatorFullName.toLowerCase());
            });
          }

          // Se ainda não encontrou, tentar buscar pelo nome completo
          if (!creator) {
            creator = creatorMap.get(creatorName.toLowerCase());
          }
        }
        
        if (!creator) {
          console.log(`⚠️ Criador não encontrado: ${creatorName} (extraído: ${creatorName.includes('_') ? creatorName.split('_').pop() : 'N/A'})`);
          stats.errors++;
          continue;
        } else {
          const creatorDisplayName = creator.nome || creator.name;
          console.log(`✅ Criador encontrado: ${creatorName} → ${creatorDisplayName}`);
        }
        
        // Criar relacionamento
        const relationship = {
          campaign_id: supabaseCampaign.id,
          creator_id: creator.id,
          role: 'primary',
          fee: 0,
          payment_status: 'pending',
          status: mapCreatorStatus(status),
          deliverables: {
            briefing_complete: briefingComplete || 'Pendente',
            visit_datetime: visitDateTime || null,
            guest_quantity: parseInt(guestQuantity) || 0,
            visit_confirmed: visitConfirmed || 'Pendente',
            post_datetime: postDateTime || null,
            video_approved: videoApproved || 'Pendente',
            video_posted: videoPosted || 'Não',
            content_links: contentLink ? [contentLink] : []
          },
          performance_data: {
            reach: 0,
            impressions: 0,
            engagement: 0,
            clicks: 0,
            saves: 0,
            shares: 0
          },
          notes: `Migrado do Google Sheets - Campaign_ID: ${campaignId}`
        };
        
        relationshipsToCreate.push(relationship);
        stats.matched++;
        
        if (stats.matched % 10 === 0) {
          console.log(`📊 Processados: ${stats.matched} relacionamentos`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar linha ${i}:`, error);
        stats.errors++;
      }
    }
    
    console.log(`\n📊 Estatísticas do processamento:`);
    console.log(`  - Linhas processadas: ${stats.processed}`);
    console.log(`  - Relacionamentos criados: ${stats.matched}`);
    console.log(`  - Erros: ${stats.errors}`);
    console.log(`  - Ignorados: ${stats.skipped}`);
    
    // 5. Inserir relacionamentos no Supabase
    if (relationshipsToCreate.length > 0) {
      console.log(`\n💾 Inserindo ${relationshipsToCreate.length} relacionamentos no Supabase...`);
      
      // Inserir em lotes de 100
      const batchSize = 100;
      let inserted = 0;
      
      for (let i = 0; i < relationshipsToCreate.length; i += batchSize) {
        const batch = relationshipsToCreate.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from('campaign_creators')
          .insert(batch);
        
        if (insertError) {
          console.error(`❌ Erro ao inserir lote ${Math.floor(i / batchSize) + 1}:`, insertError);
        } else {
          inserted += batch.length;
          console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} inserido: ${batch.length} relacionamentos`);
        }
      }
      
      console.log(`\n✅ Total inserido: ${inserted}/${relationshipsToCreate.length} relacionamentos`);
    }
    
    // 6. Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');
    
    const { data: finalCC, error: finalError } = await supabase
      .from('campaign_creators')
      .select('*');
    
    if (finalError) {
      console.error('❌ Erro ao verificar resultado:', finalError);
    } else {
      console.log(`✅ Total de relacionamentos no Supabase: ${finalCC.length}`);
    }
    
    console.log('\n✅ Migração de relacionamentos Campaign-Creators concluída!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Função auxiliar para mapear status do criador
function mapCreatorStatus(campaignStatus: string): string {
  if (!campaignStatus) return 'Pendente';
  
  const status = campaignStatus.toLowerCase();
  
  if (status.includes('finalizada') || status.includes('finalizado')) {
    return 'Finalizado';
  } else if (status.includes('entrega')) {
    return 'Em Produção';
  } else if (status.includes('agendamento')) {
    return 'Agendado';
  } else if (status.includes('briefing')) {
    return 'Briefing';
  } else {
    return 'Confirmado';
  }
}

if (require.main === module) {
  migrateCampaignCreators()
    .then(() => {
      console.log('\n🎉 Migração finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migração falhou:', error);
      process.exit(1);
    });
}

export { migrateCampaignCreators };
