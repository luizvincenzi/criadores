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
const CLIENT_BUSINESS_ID = '00000000-0000-0000-0000-000000000002';

// Usuários para criar na plataforma crIAdores
const platformUsers = [
  {
    email: 'luizvincenzi@gmail.com',
    password: 'criadores2024!',
    full_name: 'Luiz Vincenzi',
    role: 'admin',
    business_id: null, // Admin pode acessar tudo
    creator_id: null
  },
  {
    email: 'pgabrieldavila@gmail.com', 
    password: 'criadores2024!',
    full_name: 'Pedro Gabriel Davila',
    role: 'business',
    business_id: CLIENT_BUSINESS_ID,
    creator_id: null
  },
  {
    email: 'marloncpascoal@gmail.com',
    password: 'criadores2024!', 
    full_name: 'Marlon Pascoal',
    role: 'business',
    business_id: CLIENT_BUSINESS_ID,
    creator_id: null
  }
];

async function createPlatformUsers() {
  console.log('🚀 [crIAdores] Criando usuários da plataforma...\n');

  for (const userData of platformUsers) {
    console.log(`👤 Processando usuário: ${userData.email}`);
    
    try {
      // 1. Criar usuário no Supabase Auth
      console.log('  🔐 Criando no Supabase Auth...');
      
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log('  ⚠️ Usuário já existe no Auth, atualizando...');
          
          // Tentar atualizar a senha
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            authUser?.user?.id || '', 
            { password: userData.password }
          );
          
          if (updateError) {
            console.log('  ❌ Erro ao atualizar senha:', updateError.message);
          } else {
            console.log('  ✅ Senha atualizada no Auth');
          }
        } else {
          console.error('  ❌ Erro no Auth:', authError.message);
          continue;
        }
      } else {
        console.log('  ✅ Usuário criado no Auth');
      }

      // 2. Verificar se usuário já existe na tabela users
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', userData.email.toLowerCase())
        .single();

      if (existingUser) {
        console.log('  📝 Atualizando dados na tabela users...');
        
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: userData.full_name,
            role: userData.role,
            business_id: userData.business_id,
            creator_id: userData.creator_id,
            status: 'active',
            permissions: userData.role === 'admin' ? ['all'] : ['read', 'write'],
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', userData.email.toLowerCase());

        if (updateError) {
          console.error('  ❌ Erro ao atualizar usuário:', updateError.message);
        } else {
          console.log('  ✅ Dados atualizados na tabela users');
        }
      } else {
        console.log('  📝 Criando registro na tabela users...');
        
        const { error: createError } = await supabase
          .from('users')
          .insert({
            organization_id: DEFAULT_ORG_ID,
            email: userData.email.toLowerCase(),
            full_name: userData.full_name,
            role: userData.role,
            business_id: userData.business_id,
            creator_id: userData.creator_id,
            status: 'active',
            permissions: userData.role === 'admin' ? ['all'] : ['read', 'write'],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createError) {
          console.error('  ❌ Erro ao criar usuário:', createError.message);
        } else {
          console.log('  ✅ Usuário criado na tabela users');
        }
      }

      console.log(`  📧 Email: ${userData.email}`);
      console.log(`  🔐 Senha: ${userData.password}`);
      console.log(`  👤 Nome: ${userData.full_name}`);
      console.log(`  🔑 Role: ${userData.role}`);
      console.log(`  🏢 Business ID: ${userData.business_id || 'N/A'}`);
      console.log('  ✅ Usuário processado com sucesso!\n');

    } catch (error) {
      console.error(`  ❌ Erro inesperado para ${userData.email}:`, error);
      console.log('');
    }
  }

  console.log('🎉 [crIAdores] Processo de criação de usuários concluído!\n');
  
  console.log('📋 RESUMO DOS USUÁRIOS CRIADOS:');
  console.log('================================');
  
  for (const user of platformUsers) {
    console.log(`👤 ${user.full_name}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔐 Senha: ${user.password}`);
    console.log(`   🔑 Role: ${user.role}`);
    console.log(`   🏢 Business: ${user.business_id ? 'Cliente crIAdores' : 'Todos'}`);
    console.log('');
  }
  
  console.log('🌐 TESTE NA PLATAFORMA:');
  console.log('========================');
  console.log('🔗 URL Local: http://localhost:3000/login');
  console.log('🔗 URL Produção: https://criadores.vercel.app/login');
  console.log('');
  console.log('✅ Todos os usuários podem fazer login com as credenciais acima!');
}

// Executar o script
if (require.main === module) {
  createPlatformUsers()
    .then(() => {
      console.log('🎯 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script:', error);
      process.exit(1);
    });
}

export { createPlatformUsers };
