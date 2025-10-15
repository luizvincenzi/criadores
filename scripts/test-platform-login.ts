/**
 * Script para testar login de platform_users
 * 
 * Uso:
 *   npx tsx scripts/test-platform-login.ts
 */

import { supabase } from '../lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

interface TestUser {
  email: string;
  expectedRole: string;
  expectedRoles: string[];
  expectedCreatorId?: string;
  expectedBusinessId?: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'pietramantovani98@gmail.com',
    expectedRole: 'creator',
    expectedRoles: ['creator', 'marketing_strategist'],
    expectedCreatorId: '975c1933-cfa0-4b3a-9660-f14259ec4b26'
  },
  {
    email: 'marilia12cavalheiro@gmail.com',
    expectedRole: 'marketing_strategist',
    expectedRoles: ['marketing_strategist', 'creator'],
    expectedCreatorId: '550b0a85-2ca1-48b7-9ece-9ced8d2c895c'
  }
];

async function testPlatformLogin() {
  console.log('🧪 ========================================');
  console.log('🧪 TESTE DE LOGIN - PLATFORM_USERS');
  console.log('🧪 ========================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const testUser of TEST_USERS) {
    console.log(`\n📧 Testando: ${testUser.email}`);
    console.log('─'.repeat(50));

    totalTests++;

    try {
      // Buscar usuário em platform_users
      const { data: user, error } = await supabase
        .from('platform_users')
        .select('*')
        .eq('email', testUser.email.toLowerCase())
        .eq('organization_id', DEFAULT_ORG_ID)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar usuário:', error.message);
        failedTests++;
        continue;
      }

      if (!user) {
        console.error('❌ Usuário não encontrado');
        failedTests++;
        continue;
      }

      // Validações
      let allChecksPass = true;

      // 1. Verificar se está ativo
      if (!user.is_active) {
        console.error('❌ Usuário não está ativo');
        allChecksPass = false;
      } else {
        console.log('✅ Usuário está ativo');
      }

      // 2. Verificar role principal
      if (user.role !== testUser.expectedRole) {
        console.error(`❌ Role incorreta: esperado "${testUser.expectedRole}", recebido "${user.role}"`);
        allChecksPass = false;
      } else {
        console.log(`✅ Role principal correta: ${user.role}`);
      }

      // 3. Verificar roles array
      const hasAllRoles = testUser.expectedRoles.every(role => 
        user.roles && user.roles.includes(role)
      );
      if (!hasAllRoles) {
        console.error(`❌ Roles incorretas: esperado ${JSON.stringify(testUser.expectedRoles)}, recebido ${JSON.stringify(user.roles)}`);
        allChecksPass = false;
      } else {
        console.log(`✅ Roles corretas: ${user.roles.join(', ')}`);
      }

      // 4. Verificar creator_id (se esperado)
      if (testUser.expectedCreatorId) {
        if (user.creator_id !== testUser.expectedCreatorId) {
          console.error(`❌ Creator ID incorreto: esperado "${testUser.expectedCreatorId}", recebido "${user.creator_id}"`);
          allChecksPass = false;
        } else {
          console.log(`✅ Creator ID correto: ${user.creator_id}`);
        }
      }

      // 5. Verificar business_id (se esperado)
      if (testUser.expectedBusinessId) {
        if (user.business_id !== testUser.expectedBusinessId) {
          console.error(`❌ Business ID incorreto: esperado "${testUser.expectedBusinessId}", recebido "${user.business_id}"`);
          allChecksPass = false;
        } else {
          console.log(`✅ Business ID correto: ${user.business_id}`);
        }
      }

      // 6. Mostrar informações adicionais
      console.log('\n📊 Informações do usuário:');
      console.log(`   Nome: ${user.full_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Platform: ${user.platform}`);
      console.log(`   Criado em: ${user.created_at}`);
      console.log(`   Último login: ${user.last_login || 'Nunca'}`);

      if (allChecksPass) {
        console.log('\n✅ TODOS OS TESTES PASSARAM');
        passedTests++;
      } else {
        console.log('\n❌ ALGUNS TESTES FALHARAM');
        failedTests++;
      }

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      failedTests++;
    }
  }

  // Resumo final
  console.log('\n\n🧪 ========================================');
  console.log('🧪 RESUMO DOS TESTES');
  console.log('🧪 ========================================');
  console.log(`Total de testes: ${totalTests}`);
  console.log(`✅ Passaram: ${passedTests}`);
  console.log(`❌ Falharam: ${failedTests}`);
  console.log('🧪 ========================================\n');

  if (failedTests === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM! 🎉\n');
    process.exit(0);
  } else {
    console.log('⚠️  ALGUNS TESTES FALHARAM ⚠️\n');
    process.exit(1);
  }
}

// Executar testes
testPlatformLogin().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

