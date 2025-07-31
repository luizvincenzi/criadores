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

// Dados do usuário Boussolé
const boussolUser = {
  email: 'financeiro.brooftop@gmail.com',
  password: '1#Boussolecria',
  full_name: 'Financeiro Boussolé',
  role: 'business',
  business_id: '55310ebd-0e0d-492e-8c34-cd4740000000',
  company_name: 'Boussolé'
};

async function createBoussolUser() {
  console.log('🏢 [BOUSSOLÉ] Criando usuário para empresa Boussolé...\n');

  try {
    console.log(`👤 Criando usuário: ${boussolUser.email}`);
    console.log(`🏢 Empresa: ${boussolUser.company_name}`);
    console.log(`🆔 Business ID: ${boussolUser.business_id}`);
    console.log('');

    // 1. Verificar se usuário já existe no Auth
    console.log('🔍 1. Verificando se usuário já existe...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = existingUsers.users.find(user => user.email === boussolUser.email);

    if (existingAuthUser) {
      console.log('⚠️ Usuário já existe no Auth, deletando para recriar...');
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingAuthUser.id);
      if (deleteError) {
        console.error('❌ Erro ao deletar usuário existente:', deleteError.message);
        return;
      }
      console.log('✅ Usuário existente deletado');
    }

    // 2. Criar usuário no Supabase Auth
    console.log('\n🔐 2. Criando usuário no Supabase Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: boussolUser.email,
      password: boussolUser.password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        full_name: boussolUser.full_name,
        role: boussolUser.role,
        business_id: boussolUser.business_id,
        company_name: boussolUser.company_name
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário no Auth:', authError.message);
      return;
    }

    console.log('✅ Usuário criado no Supabase Auth');
    console.log(`   ID: ${authUser.user?.id}`);
    console.log(`   Email: ${authUser.user?.email}`);

    // 3. Verificar se usuário já existe na tabela users
    console.log('\n📝 3. Verificando tabela users...');
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
          role: boussolUser.role,
          permissions: { read: true, write: true, business_access: true },
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
          role: boussolUser.role,
          permissions: { read: true, write: true, business_access: true },
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

    // 4. Verificar se o business existe na tabela businesses
    console.log('\n🏢 4. Verificando business na tabela...');
    const { data: existingBusiness } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', boussolUser.business_id)
      .single();

    if (!existingBusiness) {
      console.log('📝 Business não existe, criando...');
      
      const { error: businessError } = await supabase
        .from('businesses')
        .insert({
          id: boussolUser.business_id,
          organization_id: DEFAULT_ORG_ID,
          name: boussolUser.company_name,
          contact_info: {
            primary_contact: boussolUser.full_name,
            email: boussolUser.email
          },
          address: {
            street: '',
            city: '',
            state: '',
            zip_code: '',
            country: 'Brasil'
          },
          business_stage: 'Cliente',
          status: 'Ativo',
          priority: 'Alta',
          tags: ['cliente', 'ativo'],
          custom_fields: {
            tipo: 'Cliente Plataforma',
            plataforma: 'crIAdores'
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (businessError) {
        console.error('❌ Erro ao criar business:', businessError.message);
      } else {
        console.log('✅ Business criado na tabela');
      }
    } else {
      console.log('✅ Business já existe na tabela');
      console.log(`   Nome: ${existingBusiness.name}`);
      console.log(`   Status: ${existingBusiness.status}`);
    }

    // 5. Teste de login
    console.log('\n🧪 5. Testando login...');
    
    // Cliente para teste (usando anon key)
    const testClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA');
    
    const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
      email: boussolUser.email,
      password: boussolUser.password
    });

    if (loginError) {
      console.error('❌ Teste de login falhou:', loginError.message);
    } else {
      console.log('✅ Teste de login bem-sucedido!');
      console.log(`   User ID: ${loginData.user?.id}`);
      console.log(`   Email: ${loginData.user?.email}`);
      
      // Fazer logout
      await testClient.auth.signOut();
    }

    console.log('\n🎉 [BOUSSOLÉ] Usuário criado com sucesso!\n');
    
    console.log('📋 RESUMO DO USUÁRIO CRIADO:');
    console.log('============================');
    console.log(`🏢 Empresa: ${boussolUser.company_name}`);
    console.log(`👤 Nome: ${boussolUser.full_name}`);
    console.log(`📧 Email: ${boussolUser.email}`);
    console.log(`🔐 Senha: ${boussolUser.password}`);
    console.log(`🔑 Role: ${boussolUser.role}`);
    console.log(`🆔 Business ID: ${boussolUser.business_id}`);
    console.log(`✅ Status: Ativo`);
    console.log('');
    
    console.log('🌐 TESTE DE LOGIN:');
    console.log('==================');
    console.log('🔗 URL Local: http://localhost:3000/login');
    console.log('🔗 URL Produção: https://criadores.vercel.app/login');
    console.log(`📧 Email: ${boussolUser.email}`);
    console.log(`🔐 Senha: ${boussolUser.password}`);
    console.log('');
    console.log('✅ O usuário pode fazer login agora!');

  } catch (error) {
    console.error('❌ Erro inesperado ao criar usuário Boussolé:', error);
  }
}

// Executar o script
if (require.main === module) {
  createBoussolUser()
    .then(() => {
      console.log('\n🎯 Criação do usuário Boussolé concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro ao criar usuário Boussolé:', error);
      process.exit(1);
    });
}

export { createBoussolUser };
