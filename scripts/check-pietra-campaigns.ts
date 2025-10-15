import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPietraCampaigns() {
  console.log('🔍 Verificando campanhas da Pietra...\n');

  try {
    // 1. Buscar dados da Pietra
    console.log('1️⃣ Buscando dados da Pietra...');
    const { data: pietra, error: pietraError } = await supabase
      .from('creators')
      .select('id, name, platform_email')
      .eq('platform_email', 'pietramantovani98@gmail.com')
      .single();

    if (pietraError) {
      console.error('❌ Erro ao buscar Pietra:', pietraError);
      
      // Tentar buscar por nome
      console.log('\n🔍 Tentando buscar por nome...');
      const { data: pietraByName, error: nameError } = await supabase
        .from('creators')
        .select('id, name, platform_email')
        .ilike('name', '%pietra%')
        .limit(5);

      if (nameError) {
        console.error('❌ Erro ao buscar por nome:', nameError);
        return;
      }

      console.log('📋 Creators encontrados com "pietra" no nome:');
      console.table(pietraByName);
      
      if (!pietraByName || pietraByName.length === 0) {
        console.log('\n❌ Nenhum creator encontrado com "pietra" no nome');
        return;
      }

      // Usar o primeiro encontrado
      const selectedPietra = pietraByName[0];
      console.log(`\n✅ Usando creator: ${selectedPietra.name} (${selectedPietra.id})`);
      
      // Continuar com este creator
      await checkCampaignsForCreator(selectedPietra.id, selectedPietra.name);
      return;
    }

    console.log('✅ Pietra encontrada:');
    console.log(`   ID: ${pietra.id}`);
    console.log(`   Nome: ${pietra.name}`);
    console.log(`   Email: ${pietra.platform_email}`);

    await checkCampaignsForCreator(pietra.id, pietra.name);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

async function checkCampaignsForCreator(creatorId: string, creatorName: string) {
  console.log(`\n2️⃣ Buscando campanhas de ${creatorName}...`);

  // Buscar na tabela campaign_creators
  const { data: campaignCreators, error: ccError } = await supabase
    .from('campaign_creators')
    .select(`
      id,
      campaign_id,
      creator_id,
      status,
      role,
      created_at
    `)
    .eq('creator_id', creatorId);

  if (ccError) {
    console.error('❌ Erro ao buscar campaign_creators:', ccError);
    return;
  }

  console.log(`✅ Total de registros em campaign_creators: ${campaignCreators?.length || 0}`);

  if (!campaignCreators || campaignCreators.length === 0) {
    console.log('\n⚠️ Nenhuma campanha encontrada para este creator em campaign_creators');
    console.log('\n🔍 Verificando se existem campanhas no banco...');
    
    const { data: allCampaigns, error: allError } = await supabase
      .from('campaigns')
      .select('id, title, business_id')
      .limit(5);

    if (allError) {
      console.error('❌ Erro ao buscar campanhas:', allError);
      return;
    }

    console.log(`\n📊 Total de campanhas no banco: ${allCampaigns?.length || 0}`);
    if (allCampaigns && allCampaigns.length > 0) {
      console.log('\n📋 Primeiras 5 campanhas:');
      console.table(allCampaigns);
      
      console.log('\n💡 SOLUÇÃO: Você precisa associar a Pietra às campanhas!');
      console.log('Execute este SQL no Supabase:');
      console.log(`
-- Associar Pietra a uma campanha (exemplo)
INSERT INTO campaign_creators (campaign_id, creator_id, role, status)
VALUES (
  '${allCampaigns[0].id}', -- ID da campanha
  '${creatorId}', -- ID da Pietra
  'primary',
  'Agendado'
);
      `);
    }
    return;
  }

  console.log('\n📋 Registros em campaign_creators:');
  console.table(campaignCreators);

  // Buscar detalhes das campanhas
  console.log('\n3️⃣ Buscando detalhes das campanhas...');
  
  const campaignIds = campaignCreators.map(cc => cc.campaign_id);
  
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      description,
      status,
      start_date,
      end_date,
      business_id,
      businesses:business_id (
        name,
        slug
      )
    `)
    .in('id', campaignIds);

  if (campaignsError) {
    console.error('❌ Erro ao buscar campanhas:', campaignsError);
    return;
  }

  console.log(`✅ Campanhas encontradas: ${campaigns?.length || 0}`);
  
  if (campaigns && campaigns.length > 0) {
    console.log('\n📋 Detalhes das campanhas:');
    campaigns.forEach((campaign, index) => {
      console.log(`\n${index + 1}. ${campaign.title}`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Business: ${(campaign.businesses as any)?.name || 'N/A'}`);
      console.log(`   Período: ${campaign.start_date || 'N/A'} até ${campaign.end_date || 'N/A'}`);
    });
  }

  // Testar query exata da página
  console.log('\n4️⃣ Testando query exata da página /campanhas-criador...');
  
  const { data: testQuery, error: testError } = await supabase
    .from('campaign_creators')
    .select(`
      campaign_id,
      role,
      status,
      campaigns:campaign_id (
        id,
        title,
        description,
        start_date,
        end_date,
        status,
        business_id,
        businesses:business_id (
          name,
          slug
        )
      )
    `)
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });

  if (testError) {
    console.error('❌ Erro na query de teste:', testError);
    return;
  }

  console.log(`✅ Query de teste retornou: ${testQuery?.length || 0} registros`);
  
  if (testQuery && testQuery.length > 0) {
    console.log('\n📋 Dados retornados pela query:');
    testQuery.forEach((item, index) => {
      console.log(`\n${index + 1}. Campaign Creator:`);
      console.log(`   Role: ${item.role}`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Campaign:`, item.campaigns);
    });
  }

  console.log('\n✅ Verificação concluída!');
}

checkPietraCampaigns();

