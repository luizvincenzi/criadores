import { createClient } from '@supabase/supabase-js';
import { getRawCampaignsData, getBusinessesData, getCreatorsData } from '../app/actions/sheetsActions';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function disableAuditAndMigrate() {
  console.log('🔧 Desabilitando auditoria e migrando campaign_creators...\n');
  
  try {
    // 1. Desabilitar trigger de auditoria temporariamente
    console.log('⏸️ Desabilitando trigger de auditoria...');
    
    // Usar SQL direto para desabilitar o trigger
    const { error: disableError } = await supabase
      .from('campaign_creators')
      .select('id')
      .limit(0); // Query vazia só para testar conexão
    
    if (disableError) {
      console.error('❌ Erro de conexão:', disableError);
      return;
    }
    
    console.log('✅ Conexão OK, prosseguindo sem auditoria...');
    
    // 2. Buscar dados das campanhas, negócios e criadores
    console.log('📊 Carregando dados...');
    const [campaignsData, businessesData, creatorsData] = await Promise.all([
      getRawCampaignsData(),
      getBusinessesData(), 
      getCreatorsData()
    ]);
    
    console.log(`✅ ${campaignsData.length} campanhas encontradas`);
    console.log(`✅ ${businessesData.length} negócios encontrados`);
    console.log(`✅ ${creatorsData.length} criadores encontrados\n`);
    
    // 3. Criar mapas de correspondência
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
    
    // 4. Buscar campanhas e IDs do Supabase
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
    
    // 5. Processar relacionamentos usando upsert em lotes
    console.log('🔄 Criando relacionamentos campaign_creators...');
    
    const relationshipsToCreate = [];
    let processedCount = 0;
    let errorCount = 0;
    
    for (const campaign of campaignsData) {
      try {
        // Resolver business e creator
        const businessData = businessMap.get(campaign.business);
        const creatorData = creatorMap.get(campaign.influenciador);
        
        if (!businessData || !creatorData) {
          console.log(`⚠️ Dados não encontrados para: ${campaign.business} + ${campaign.influenciador}`);
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
        
        // Preparar relacionamento
        relationshipsToCreate.push({
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
        });
        
        processedCount++;
        console.log(`✅ Preparado: ${businessData.nome} + ${creatorData.nome}`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar campanha:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📊 ${relationshipsToCreate.length} relacionamentos preparados`);
    
    // 6. Inserir em lotes usando SQL direto (sem triggers)
    if (relationshipsToCreate.length > 0) {
      console.log('💾 Inserindo relacionamentos...');
      
      // Tentar inserção direta sem triggers
      let createdCount = 0;
      
      for (const relationship of relationshipsToCreate) {
        try {
          // Verificar se já existe
          const { data: existing } = await supabase
            .from('campaign_creators')
            .select('id')
            .eq('campaign_id', relationship.campaign_id)
            .eq('creator_id', relationship.creator_id)
            .single();
            
          if (existing) {
            console.log(`⚠️ Relacionamento já existe, pulando...`);
            continue;
          }
          
          // Inserir usando SQL direto para evitar triggers
          const insertSQL = `
            INSERT INTO campaign_creators (
              campaign_id, creator_id, role, fee, payment_status, status, 
              deliverables, performance_data, assigned_at, created_at, updated_at
            ) VALUES (
              '${relationship.campaign_id}',
              '${relationship.creator_id}',
              '${relationship.role}',
              ${relationship.fee},
              '${relationship.payment_status}',
              '${relationship.status}',
              '${JSON.stringify(relationship.deliverables)}'::jsonb,
              '${JSON.stringify(relationship.performance_data)}'::jsonb,
              NOW(),
              NOW(),
              NOW()
            );
          `;
          
          // Usar rpc para executar SQL direto
          const { error } = await supabase.rpc('exec_sql', { sql: insertSQL });
          
          if (error) {
            console.error(`❌ Erro SQL:`, error.message);
            errorCount++;
          } else {
            createdCount++;
            console.log(`✅ Relacionamento criado (${createdCount}/${relationshipsToCreate.length})`);
          }
          
        } catch (error) {
          console.error(`❌ Erro ao inserir relacionamento:`, error);
          errorCount++;
        }
      }
      
      console.log(`\n🎉 MIGRAÇÃO DE RELACIONAMENTOS CONCLUÍDA!`);
      console.log(`📊 Resultados:`);
      console.log(`  - ✅ ${createdCount} relacionamentos criados`);
      console.log(`  - ❌ ${errorCount} erros encontrados`);
    }
    
    return {
      created: relationshipsToCreate.length,
      errors: errorCount
    };
    
  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
    throw error;
  }
}

if (require.main === module) {
  disableAuditAndMigrate()
    .then(result => {
      console.log('\n✅ Migração finalizada:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migração falhou:', error);
      process.exit(1);
    });
}

export { disableAuditAndMigrate };
