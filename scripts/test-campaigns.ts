import { getRawCampaignsData, getBusinessesData, getCreatorsData } from '../app/actions/sheetsActions';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testCampaigns() {
  console.log('🔍 ANÁLISE DETALHADA DAS CAMPANHAS\n');

  try {
    // Buscar todos os dados
    const [campaigns, businesses, creators] = await Promise.all([
      getRawCampaignsData(),
      getBusinessesData(),
      getCreatorsData()
    ]);

    console.log(`📊 ${campaigns.length} campanhas encontradas`);
    console.log(`📊 ${businesses.length} negócios encontrados`);
    console.log(`📊 ${creators.length} criadores encontrados\n`);

    // Mostrar estrutura das campanhas
    console.log('🔍 ESTRUTURA DAS CAMPANHAS:');
    campaigns.slice(0, 2).forEach((c, i) => {
      console.log(`\n${i+1}. Campanha:`);
      console.log(`   Business ID: "${c.business}"`);
      console.log(`   Creator ID: "${c.influenciador}"`);
      console.log(`   Mês: "${c.mes}"`);
      console.log(`   Status: "${c.status}"`);
    });

    // Mostrar estrutura dos negócios
    console.log('\n🏢 ESTRUTURA DOS NEGÓCIOS:');
    businesses.slice(0, 2).forEach((b, i) => {
      console.log(`\n${i+1}. Negócio:`);
      console.log(`   Nome: "${b.nome}"`);
      console.log(`   Business ID: "${b.businessId}"`);
    });

    // Mostrar estrutura dos criadores
    console.log('\n👥 ESTRUTURA DOS CRIADORES:');
    creators.slice(0, 2).forEach((c, i) => {
      console.log(`\n${i+1}. Criador:`);
      console.log(`   Nome: "${c.nome}"`);
      console.log(`   Creator ID: "${c.criadorId}"`);
    });

    // Verificar se há correspondências
    console.log('\n🔍 VERIFICANDO CORRESPONDÊNCIAS:');

    const businessIds = new Set(businesses.map(b => b.businessId).filter(Boolean));
    const creatorIds = new Set(creators.map(c => c.criadorId).filter(Boolean));

    console.log(`\n📋 Business IDs disponíveis: ${businessIds.size}`);
    console.log(`📋 Creator IDs disponíveis: ${creatorIds.size}`);

    let matchedBusinesses = 0;
    let matchedCreators = 0;

    campaigns.forEach(campaign => {
      if (businessIds.has(campaign.business)) {
        matchedBusinesses++;
      }
      if (creatorIds.has(campaign.influenciador)) {
        matchedCreators++;
      }
    });

    console.log(`\n✅ Campanhas com business correspondente: ${matchedBusinesses}/${campaigns.length}`);
    console.log(`✅ Campanhas com creator correspondente: ${matchedCreators}/${campaigns.length}`);

    // Mostrar IDs que não correspondem
    console.log('\n❌ BUSINESS IDs NÃO ENCONTRADOS:');
    campaigns.forEach(campaign => {
      if (!businessIds.has(campaign.business)) {
        console.log(`   - ${campaign.business}`);
      }
    });

    console.log('\n❌ CREATOR IDs NÃO ENCONTRADOS:');
    campaigns.forEach(campaign => {
      if (!creatorIds.has(campaign.influenciador)) {
        console.log(`   - ${campaign.influenciador}`);
      }
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testCampaigns();