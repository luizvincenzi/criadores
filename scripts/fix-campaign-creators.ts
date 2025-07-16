import { createClient } from '@supabase/supabase-js';
import { getRawCampaignsData, getBusinessesData, getCreatorsData } from '../app/actions/sheetsActions';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function fixCampaignCreators() {
  console.log('🔧 Corrigindo relacionamentos campaign_creators...\n');
  
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
    
    const businessMap = new Map<string, any>();
    businessesData.forEach(business => {
      if (business.businessId) {
        businessMap.set(business.businessId, business);
      }
    });
    
    const creatorMap = new Map<string, any>();
    creatorsData.forEach(creator => {
      if (creator.criadorId) {
        creatorMap.set(creator.criadorId, creator);
      }
    });
    
    console.log(`✅ ${businessMap.size} negócios mapeados`);
    console.log(`✅ ${creatorMap.size} criadores mapeados\n`);
    
    // 3. Buscar campanhas e IDs do Supabase
    console.log('🔍 Buscando dados do Supabase...');
    const [campaignsResult, businessesResult, creatorsResult] = await Promise.all([
      supabase.from('campaigns').select('id, title, business_id').eq('organization_id', DEFAULT_ORG_ID),
      supabase.from('businesses').select('id, name').eq('organization_id', DEFAULT_ORG_ID),
      supabase.from('creators').select('id, name').eq('organization_id', DEFAULT_ORG_ID)
    ]);
    
    const supabaseCampaigns = campaignsResult.data || [];
    const supabaseBusinesses = businessesResult.data || [];
    const supabaseCreators = creatorsResult.data || [];
    
    // Criar mapas nome -> ID do Supabase
    const businessNameToId = new Map<string, string>();
    supabaseBusinesses.forEach(b => {
      businessNameToId.set(b.name.toLowerCase().trim(), b.id);
    });
    
    const creatorNameToId = new Map<string, string>();
    supabaseCreators.forEach(c => {
      creatorNameToId.set(c.name.toLowerCase().trim(), c.id);
    });
    
    console.log(`✅ ${supabaseCampaigns.length} campanhas do Supabase`);
    console.log(`✅ ${businessNameToId.size} negócios do Supabase mapeados`);
    console.log(`✅ ${creatorNameToId.size} criadores do Supabase mapeados\n`);
    
    // 4. Processar relacionamentos
    console.log('🔄 Criando relacionamentos campaign_creators...');
    
    let createdCount = 0;
    let errorCount = 0;
    
    for (const campaign of campaignsData) {
      try {
        // Resolver business e creator
        const businessData = businessMap.get(campaign.business);
        const creatorData = creatorMap.get(campaign.influenciador);
        
        if (!businessData || !creatorData) {
          console.log(`⚠️ Dados não encontrados para campanha: ${campaign.business} + ${campaign.influenciador}`);
          errorCount++;
          continue;
        }
        
        // Buscar IDs do Supabase
        const businessSupabaseId = businessNameToId.get(businessData.nome.toLowerCase().trim());
        const creatorSupabaseId = creatorNameToId.get(creatorData.nome.toLowerCase().trim());
        
        if (!businessSupabaseId || !creatorSupabaseId) {
          console.log(`⚠️ IDs do Supabase não encontrados: Business="${businessData.nome}", Creator="${creatorData.nome}"`);
          errorCount++;
          continue;
        }
        
        // Encontrar campanha correspondente no Supabase
        const supabaseCampaign = supabaseCampaigns.find(c => c.business_id === businessSupabaseId);
        if (!supabaseCampaign) {
          console.log(`⚠️ Campanha não encontrada no Supabase para business: ${businessData.nome}`);
          errorCount++;
          continue;
        }
        
        // Verificar se relacionamento já existe
        const { data: existingRelation } = await supabase
          .from('campaign_creators')
          .select('id')
          .eq('campaign_id', supabaseCampaign.id)
          .eq('creator_id', creatorSupabaseId)
          .single();
          
        if (existingRelation) {
          console.log(`⚠️ Relacionamento já existe: ${businessData.nome} + ${creatorData.nome}`);
          continue;
        }
        
        // Criar relacionamento
        const campaignCreatorRecord = {
          campaign_id: supabaseCampaign.id,
          creator_id: creatorSupabaseId,
          role: 'primary',
          fee: 0,
          payment_status: 'pending',
          status: 'Confirmado',
          deliverables: {
            briefing_complete: campaign.briefingCompleto || 'Pendente',
            visit_datetime: campaign.dataHoraVisita || null,
            guest_quantity: parseInt(campaign.quantidadeConvidados) || 0,
            visit_confirmed: campaign.visitaConfirmado || 'Pendente',
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
        
        const { error } = await supabase
          .from('campaign_creators')
          .insert(campaignCreatorRecord);
          
        if (error) {
          console.error(`❌ Erro ao criar relacionamento:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Relacionamento criado: ${businessData.nome} + ${creatorData.nome}`);
          createdCount++;
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar campanha:`, error);
        errorCount++;
      }
    }
    
    console.log('\n🎉 CORREÇÃO DE RELACIONAMENTOS CONCLUÍDA!');
    console.log(`📊 Resultados:`);
    console.log(`  - ✅ ${createdCount} relacionamentos criados`);
    console.log(`  - ❌ ${errorCount} erros encontrados`);
    
    return {
      created: createdCount,
      errors: errorCount
    };
    
  } catch (error) {
    console.error('❌ Erro geral na correção:', error);
    throw error;
  }
}

if (require.main === module) {
  fixCampaignCreators()
    .then(result => {
      console.log('\n✅ Correção finalizada:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Correção falhou:', error);
      process.exit(1);
    });
}

export { fixCampaignCreators };
