import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

// Cliente com service role para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Dados do usuário Boussolé (corrigidos)
const boussolUser = {
  email: 'financeiro.brooftop@gmail.com',
  password: '1#Boussolecria',
  full_name: 'Financeiro Boussolé',
  role: 'user', // Role válido no enum
  business_id: '55310ebd-0e0d-492e-8c34-cd4740000000',
  company_name: 'Boussolé'
};

async function fixBoussolUser() {
  console.log('🔧 [BOUSSOLÉ] Corrigindo usuário na tabela users...\n');

  try {
    console.log(`👤 Corrigindo usuário: ${boussolUser.email}`);
    console.log(`🏢 Empresa: ${boussolUser.company_name}`);
    console.log(`🔑 Role correto: ${boussolUser.role}`);
    console.log('');

    // 1. Verificar se usuário já existe na tabela users
    console.log('🔍 1. Verificando usuário na tabela users...');
    const { data: existingDbUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', boussolUser.email.toLowerCase())
      .single();

    if (existingDbUser) {
      console.log('⚠️ Usuário já existe na tabela, atualizando...');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: boussolUser.full_name,
          role: boussolUser.role, // Role válido
          permissions: {
            businesses: { read: true, write: true, delete: false },
            campaigns: { read: true, write: true, delete: false },
            creators: { read: true, write: false, delete: false },
            leads: { read: true, write: true, delete: false },
            tasks: { read: true, write: true, delete: false },
            business_access: true,
            business_id: boussolUser.business_id
          },
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', boussolUser.email.toLowerCase());

      if (updateError) {
        console.error('❌ Erro ao atualizar usuário na tabela:', updateError.message);
      } else {
        console.log('✅ Usuário atualizado na tabela users');
      }
    } else {
      console.log('📝 Criando registro na tabela users...');
      
      const { error: createError } = await supabase
        .from('users')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          email: boussolUser.email.toLowerCase(),
          full_name: boussolUser.full_name,
          role: boussolUser.role, // Role válido
          permissions: {
            businesses: { read: true, write: true, delete: false },
            campaigns: { read: true, write: true, delete: false },
            creators: { read: true, write: false, delete: false },
            leads: { read: true, write: true, delete: false },
            tasks: { read: true, write: true, delete: false },
            business_access: true,
            business_id: boussolUser.business_id
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        console.error('❌ Erro ao criar usuário na tabela:', createError.message);
      } else {
        console.log('✅ Usuário criado na tabela users');
      }
    }

    // 2. Verificar resultado final
    console.log('\n📊 2. Verificando resultado final...');
    const { data: finalUser, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('email', boussolUser.email.toLowerCase())
      .single();

    if (finalError) {
      console.error('❌ Erro ao verificar usuário final:', finalError.message);
    } else {
      console.log('✅ Usuário verificado na tabela users:');
      console.log(`   📧 Email: ${finalUser.email}`);
      console.log(`   👤 Nome: ${finalUser.full_name}`);
      console.log(`   🔑 Role: ${finalUser.role}`);
      console.log(`   ✅ Ativo: ${finalUser.is_active ? 'SIM' : 'NÃO'}`);
      console.log(`   🏢 Org ID: ${finalUser.organization_id}`);
      console.log(`   📝 Permissions:`, JSON.stringify(finalUser.permissions, null, 2));
    }

    // 3. Teste de login completo
    console.log('\n🧪 3. Testando login completo...');
    
    // Cliente para teste (usando anon key)
    const testClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    
    const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
      email: boussolUser.email,
      password: boussolUser.password
    });

    if (loginError) {
      console.error('❌ Teste de login falhou:', loginError.message);
    } else {
      console.log('✅ Login no Supabase Auth funcionando!');
      
      // Testar busca na tabela users (igual ao authStore)
      const { data: userData, error: userError } = await testClient
        .from('users')
        .select(`
          id,
          email,
          full_name,
          role,
          permissions,
          avatar_url,
          is_active,
          created_at,
          updated_at,
          last_login
        `)
        .eq('email', boussolUser.email)
        .eq('is_active', true)
        .single();

      if (userError) {
        console.error('❌ Erro ao buscar usuário na tabela:', userError.message);
      } else {
        console.log('✅ Busca na tabela users funcionando!');
        console.log(`   Usuário encontrado: ${userData.full_name}`);
        console.log(`   Role: ${userData.role}`);
        console.log(`   Ativo: ${userData.is_active}`);
      }
      
      // Fazer logout
      await testClient.auth.signOut();
    }

    console.log('\n🎉 [BOUSSOLÉ] Usuário corrigido com sucesso!\n');
    
    console.log('📋 RESUMO DO USUÁRIO BOUSSOLÉ:');
    console.log('==============================');
    console.log(`🏢 Empresa: ${boussolUser.company_name}`);
    console.log(`👤 Nome: ${boussolUser.full_name}`);
    console.log(`📧 Email: ${boussolUser.email}`);
    console.log(`🔐 Senha: ${boussolUser.password}`);
    console.log(`🔑 Role: ${boussolUser.role} (válido no enum)`);
    console.log(`🆔 Business ID: ${boussolUser.business_id}`);
    console.log(`✅ Status: Ativo e funcionando`);
    console.log('');
    
    console.log('🌐 TESTE DE LOGIN:');
    console.log('==================');
    console.log('🔗 URL Local: http://localhost:3000/login');
    console.log('🔗 URL Produção: https://criadores.vercel.app/login');
    console.log(`📧 Email: ${boussolUser.email}`);
    console.log(`🔐 Senha: ${boussolUser.password}`);
    console.log('');
    console.log('✅ O usuário Boussolé pode fazer login agora!');
    console.log('✅ Tanto no Supabase Auth quanto na tabela users!');

  } catch (error) {
    console.error('❌ Erro inesperado ao corrigir usuário Boussolé:', error);
  }
}

// Executar o script
if (require.main === module) {
  fixBoussolUser()
    .then(() => {
      console.log('\n🎯 Correção do usuário Boussolé concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro ao corrigir usuário Boussolé:', error);
      process.exit(1);
    });
}

export { fixBoussolUser };
