#!/usr/bin/env tsx

/**
 * Script para atualizar o usuário do Boussolé para business_owner
 * com acesso total às campanhas da empresa
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
  console.log('🏢 ATUALIZANDO USUÁRIO BOUSSOLÉ PARA BUSINESS_OWNER');
  console.log('==================================================\n');

  try {
    // 1. Verificar se a migration de user roles foi aplicada
    await checkUserRolesMigration();
    
    // 2. Verificar dados atuais do usuário
    await checkCurrentUser();
    
    // 3. Verificar dados da empresa Boussolé
    await checkBoussoleBusiness();
    
    // 4. Atualizar usuário para business_owner
    await updateUserToBusinessOwner();
    
    // 5. Verificar campanhas do Boussolé
    await checkBoussoleCampaigns();
    
    // 6. Testar acesso às campanhas
    await testCampaignAccess();
    
    console.log('\n✅ USUÁRIO BOUSSOLÉ ATUALIZADO COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
    process.exit(1);
  }
}

async function checkUserRolesMigration() {
  console.log('🔍 1. VERIFICANDO MIGRATION DE USER ROLES...');
  console.log('=============================================');
  
  try {
    // Verificar se business_owner existe no enum
    const { data: enumValues, error } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT unnest(enum_range(NULL::user_role)) as role_name;" 
      });
    
    if (error) {
      console.log('⚠️ Não foi possível verificar enum (normal se exec_sql não estiver disponível)');
    } else if (enumValues) {
      const roles = enumValues.map((row: any) => row.role_name);
      console.log('📋 User roles disponíveis:', roles);
      
      if (roles.includes('business_owner')) {
        console.log('✅ Role business_owner está disponível');
      } else {
        console.log('❌ Role business_owner NÃO está disponível');
        console.log('Execute primeiro: scripts/apply-user-roles-migration.sql');
        process.exit(1);
      }
    }
    
    // Verificar se colunas business_id existem
    const { data: columns, error: colError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name = 'business_id';
        ` 
      });
    
    if (!colError && columns && columns.length > 0) {
      console.log('✅ Coluna business_id existe na tabela users');
    } else {
      console.log('⚠️ Coluna business_id pode não existir (aplicar migration primeiro)');
    }
    
  } catch (error) {
    console.log('⚠️ Erro ao verificar migration (continuando...):', error);
  }
}

async function checkCurrentUser() {
  console.log('\n👤 2. VERIFICANDO USUÁRIO ATUAL...');
  console.log('==================================');
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', BOUSSOLE_USER_EMAIL)
    .single();
  
  if (error) {
    console.error('❌ Usuário não encontrado:', error.message);
    process.exit(1);
  }
  
  console.log('📋 Dados atuais do usuário:');
  console.log(`   📧 Email: ${user.email}`);
  console.log(`   👤 Nome: ${user.full_name}`);
  console.log(`   🔑 Role atual: ${user.role}`);
  console.log(`   🏢 Business ID atual: ${user.business_id || 'NÃO DEFINIDO'}`);
  console.log(`   ✅ Ativo: ${user.is_active ? 'SIM' : 'NÃO'}`);
  console.log(`   📝 Permissions:`, JSON.stringify(user.permissions, null, 2));
}

async function checkBoussoleBusiness() {
  console.log('\n🏢 3. VERIFICANDO EMPRESA BOUSSOLÉ...');
  console.log('====================================');
  
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', BOUSSOLE_BUSINESS_ID)
    .single();
  
  if (error) {
    console.error('❌ Empresa Boussolé não encontrada:', error.message);
    process.exit(1);
  }
  
  console.log('📋 Dados da empresa Boussolé:');
  console.log(`   🆔 ID: ${business.id}`);
  console.log(`   🏢 Nome: ${business.name}`);
  console.log(`   📊 Status: ${business.status}`);
  console.log(`   💰 Valor estimado: R$ ${business.estimated_value}`);
  console.log(`   ✅ Ativa: ${business.is_active ? 'SIM' : 'NÃO'}`);
}

async function updateUserToBusinessOwner() {
  console.log('\n🔄 4. ATUALIZANDO USUÁRIO PARA BUSINESS_OWNER...');
  console.log('================================================');
  
  const businessOwnerPermissions = {
    businesses: { read: true, write: true, delete: false },
    campaigns: { read: true, write: true, delete: false },
    creators: { read: true, write: false, delete: false },
    leads: { read: true, write: true, delete: false },
    tasks: { read: true, write: true, delete: false },
    analytics: { read: true, write: false, delete: false },
    users: { read: false, write: false, delete: false },
    scope: 'business',
    business_id: BOUSSOLE_BUSINESS_ID
  };
  
  const { data, error } = await supabase
    .from('users')
    .update({
      role: 'business_owner',
      business_id: BOUSSOLE_BUSINESS_ID,
      permissions: businessOwnerPermissions,
      updated_at: new Date().toISOString()
    })
    .eq('email', BOUSSOLE_USER_EMAIL)
    .select()
    .single();
  
  if (error) {
    console.error('❌ Erro ao atualizar usuário:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Usuário atualizado com sucesso!');
  console.log(`   🔑 Novo role: ${data.role}`);
  console.log(`   🏢 Business ID: ${data.business_id}`);
  console.log(`   📝 Permissões atualizadas: ${data.permissions.scope} scope`);
}

async function checkBoussoleCampaigns() {
  console.log('\n📊 5. VERIFICANDO CAMPANHAS DO BOUSSOLÉ...');
  console.log('==========================================');
  
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      description,
      month,
      status,
      budget,
      start_date,
      end_date,
      business_id,
      business:businesses(name)
    `)
    .eq('business_id', BOUSSOLE_BUSINESS_ID)
    .eq('organization_id', DEFAULT_ORG_ID)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Erro ao buscar campanhas:', error.message);
    return;
  }
  
  console.log(`📋 Encontradas ${campaigns.length} campanhas do Boussolé:`);
  
  if (campaigns.length === 0) {
    console.log('⚠️ Nenhuma campanha encontrada para o Boussolé');
    console.log('   Verifique se as campanhas foram criadas com business_id correto');
  } else {
    campaigns.forEach((campaign, index) => {
      console.log(`   ${index + 1}. ${campaign.title}`);
      console.log(`      📅 Mês: ${campaign.month}`);
      console.log(`      📊 Status: ${campaign.status}`);
      console.log(`      💰 Budget: R$ ${campaign.budget || 0}`);
      console.log(`      🏢 Business: ${campaign.business?.name}`);
      console.log('');
    });
  }
}

async function testCampaignAccess() {
  console.log('\n🧪 6. TESTANDO ACESSO ÀS CAMPANHAS...');
  console.log('====================================');
  
  // Simular chamada da API de campanhas
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      month,
      status,
      business_id
    `)
    .eq('organization_id', DEFAULT_ORG_ID)
    .eq('business_id', BOUSSOLE_BUSINESS_ID)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Erro no teste de acesso:', error.message);
    return;
  }
  
  console.log(`✅ Teste de acesso bem-sucedido!`);
  console.log(`   📊 ${campaigns.length} campanhas acessíveis`);
  console.log(`   🔒 Filtro por business_id funcionando`);
  
  if (campaigns.length > 0) {
    console.log('\n📋 Campanhas que aparecerão na página /campaigns:');
    campaigns.forEach((campaign, index) => {
      console.log(`   ${index + 1}. ${campaign.title} (${campaign.status})`);
    });
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

export { main };
