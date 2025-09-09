#!/usr/bin/env tsx

/**
 * Script para testar o acesso às campanhas do usuário Boussolé
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
const BOUSSOLE_BUSINESS_ID = '55310ebd-0e0d-492e-8c34-cd4740000000';
const BOUSSOLE_USER_EMAIL = 'financeiro.brooftop@gmail.com';

async function main() {
  console.log('🧪 TESTANDO ACESSO ÀS CAMPANHAS DO BOUSSOLÉ');
  console.log('==========================================\n');

  try {
    // 1. Verificar usuário Boussolé
    await checkBoussolUser();
    
    // 2. Verificar campanhas diretas no banco
    await checkCampaignsInDatabase();
    
    // 3. Simular chamada da API client/campaigns
    await testClientCampaignsAPI();
    
    // 4. Verificar se há campanhas sem business_id
    await checkCampaignsWithoutBusinessId();
    
    // 5. Sugerir correções se necessário
    await suggestFixes();
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  }
}

async function checkBoussolUser() {
  console.log('👤 1. VERIFICANDO USUÁRIO BOUSSOLÉ...');
  console.log('===================================');
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', BOUSSOLE_USER_EMAIL)
    .single();
  
  if (error) {
    console.error('❌ Usuário não encontrado:', error.message);
    return;
  }
  
  console.log('📋 Dados do usuário:');
  console.log(`   📧 Email: ${user.email}`);
  console.log(`   👤 Nome: ${user.full_name}`);
  console.log(`   🔑 Role: ${user.role}`);
  console.log(`   🏢 Business ID: ${user.business_id || 'NÃO DEFINIDO'}`);
  console.log(`   ✅ Ativo: ${user.is_active ? 'SIM' : 'NÃO'}`);
  
  if (user.role !== 'business_owner') {
    console.log('⚠️ PROBLEMA: Role deveria ser business_owner');
  }
  
  if (user.business_id !== BOUSSOLE_BUSINESS_ID) {
    console.log('⚠️ PROBLEMA: Business ID não está correto');
  }
}

async function checkCampaignsInDatabase() {
  console.log('\n📊 2. VERIFICANDO CAMPANHAS NO BANCO...');
  console.log('======================================');
  
  // Campanhas com business_id do Boussolé
  const { data: boussoleCampaigns, error: bError } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      description,
      month,
      status,
      business_id,
      organization_id,
      created_at
    `)
    .eq('business_id', BOUSSOLE_BUSINESS_ID)
    .eq('organization_id', DEFAULT_ORG_ID);
  
  if (bError) {
    console.error('❌ Erro ao buscar campanhas do Boussolé:', bError.message);
    return;
  }
  
  console.log(`📋 Campanhas com business_id do Boussolé: ${boussoleCampaigns.length}`);
  
  if (boussoleCampaigns.length === 0) {
    console.log('⚠️ PROBLEMA: Nenhuma campanha encontrada com business_id do Boussolé');
  } else {
    console.log('\n✅ Campanhas encontradas:');
    boussoleCampaigns.forEach((campaign, index) => {
      console.log(`   ${index + 1}. ${campaign.title}`);
      console.log(`      📅 Mês: ${campaign.month}`);
      console.log(`      📊 Status: ${campaign.status}`);
      console.log(`      🆔 ID: ${campaign.id}`);
      console.log('');
    });
  }
}

async function testClientCampaignsAPI() {
  console.log('\n🔒 3. TESTANDO API CLIENT/CAMPAIGNS...');
  console.log('====================================');
  
  try {
    // Simular requisição com headers de segurança
    const response = await fetch('http://localhost:3000/api/client/campaigns', {
      method: 'GET',
      headers: {
        'x-client-business-id': BOUSSOLE_BUSINESS_ID,
        'x-client-mode': 'true',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log(`📊 Status da resposta: ${response.status}`);
    console.log(`✅ Sucesso: ${data.success}`);
    
    if (data.success) {
      console.log(`📋 Campanhas retornadas: ${data.count}`);
      console.log(`🏢 Business ID validado: ${data.businessId}`);
      
      if (data.data && data.data.length > 0) {
        console.log('\n📋 Campanhas encontradas via API:');
        data.data.forEach((campaign: any, index: number) => {
          console.log(`   ${index + 1}. ${campaign.title}`);
          console.log(`      📅 Mês: ${campaign.month}`);
          console.log(`      📊 Status: ${campaign.status}`);
        });
      }
    } else {
      console.log(`❌ Erro: ${data.error}`);
    }
    
  } catch (error) {
    console.log('⚠️ Erro ao testar API (servidor pode não estar rodando):', error);
  }
}

async function checkCampaignsWithoutBusinessId() {
  console.log('\n🔍 4. VERIFICANDO CAMPANHAS SEM BUSINESS_ID...');
  console.log('==============================================');
  
  const { data: orphanCampaigns, error } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      description,
      month,
      status,
      business_id,
      created_at
    `)
    .is('business_id', null)
    .eq('organization_id', DEFAULT_ORG_ID)
    .or('title.ilike.%boussolé%,title.ilike.%boussole%,description.ilike.%boussolé%,description.ilike.%boussole%');
  
  if (error) {
    console.error('❌ Erro ao buscar campanhas órfãs:', error.message);
    return;
  }
  
  console.log(`📋 Campanhas sem business_id que podem ser do Boussolé: ${orphanCampaigns.length}`);
  
  if (orphanCampaigns.length > 0) {
    console.log('\n⚠️ Campanhas que precisam ser vinculadas ao Boussolé:');
    orphanCampaigns.forEach((campaign, index) => {
      console.log(`   ${index + 1}. ${campaign.title}`);
      console.log(`      📅 Mês: ${campaign.month}`);
      console.log(`      📊 Status: ${campaign.status}`);
      console.log(`      🆔 ID: ${campaign.id}`);
      console.log('');
    });
  }
}

async function suggestFixes() {
  console.log('\n🔧 5. SUGESTÕES DE CORREÇÃO...');
  console.log('=============================');
  
  // Verificar se usuário está configurado corretamente
  const { data: user } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('email', BOUSSOLE_USER_EMAIL)
    .single();
  
  // Verificar campanhas do Boussolé
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('business_id', BOUSSOLE_BUSINESS_ID);
  
  // Verificar campanhas órfãs
  const { data: orphans } = await supabase
    .from('campaigns')
    .select('id')
    .is('business_id', null)
    .or('title.ilike.%boussolé%,title.ilike.%boussole%');
  
  console.log('📋 Diagnóstico:');
  
  if (user?.role !== 'business_owner') {
    console.log('❌ Usuário não é business_owner - Execute: scripts/update-boussole-user-direct.sql');
  } else {
    console.log('✅ Usuário configurado como business_owner');
  }
  
  if (user?.business_id !== BOUSSOLE_BUSINESS_ID) {
    console.log('❌ Business ID do usuário incorreto - Execute: scripts/update-boussole-user-direct.sql');
  } else {
    console.log('✅ Business ID do usuário correto');
  }
  
  if (!campaigns || campaigns.length === 0) {
    console.log('❌ Nenhuma campanha vinculada ao Boussolé');
    if (orphans && orphans.length > 0) {
      console.log('💡 Sugestão: Vincular campanhas órfãs ao Boussolé');
      console.log('   Execute o UPDATE comentado no script SQL');
    }
  } else {
    console.log(`✅ ${campaigns.length} campanhas vinculadas ao Boussolé`);
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Certifique-se de que o script SQL foi executado completamente');
  console.log('2. Se há campanhas órfãs, descomente e execute o UPDATE no script SQL');
  console.log('3. Teste o login em: https://www.criadores.app/login');
  console.log('4. Acesse: https://www.criadores.app/campaigns');
  console.log('5. Verifique os logs do console do navegador');
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

export { main };
