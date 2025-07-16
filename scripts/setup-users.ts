import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function setupUsers() {
  console.log('👥 CONFIGURANDO USUÁRIOS DO SISTEMA\n');
  
  try {
    // 1. Verificar se a tabela users existe
    console.log('🔍 1. Verificando tabela users...');
    
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erro ao acessar tabela users:', usersError);
      console.log('\n💡 A tabela users precisa ser criada. Execute a migration:');
      console.log('   - Acesse Supabase Dashboard > SQL Editor');
      console.log('   - Execute o arquivo: supabase/migrations/001_initial_schema.sql');
      return;
    }
    
    console.log('✅ Tabela users existe');
    
    // 2. Verificar usuários existentes
    console.log('\n📊 2. Verificando usuários existentes...');
    
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*');
    
    if (allUsersError) {
      console.error('❌ Erro ao buscar usuários:', allUsersError);
      return;
    }
    
    console.log(`📋 Usuários encontrados: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('\n👥 Usuários existentes:');
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.full_name} (${user.email}) - ${user.role}`);
      });
    }
    
    // 3. Verificar organização
    console.log('\n🏢 3. Verificando organização...');
    
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', DEFAULT_ORG_ID)
      .single();
    
    if (orgError || !org) {
      console.log('⚠️ Organização padrão não encontrada. Criando...');
      
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert({
          id: DEFAULT_ORG_ID,
          name: 'CRM Criadores',
          slug: 'crm-criadores',
          settings: {
            theme: 'default',
            timezone: 'America/Sao_Paulo'
          }
        })
        .select()
        .single();
      
      if (createOrgError) {
        console.error('❌ Erro ao criar organização:', createOrgError);
        return;
      }
      
      console.log('✅ Organização criada:', newOrg.name);
    } else {
      console.log('✅ Organização encontrada:', org.name);
    }
    
    // 4. Criar usuários padrão se não existirem
    console.log('\n👤 4. Criando usuários padrão...');
    
    const defaultUsers = [
      {
        email: 'admin@crmcriadores.com',
        full_name: 'Administrador',
        role: 'admin',
        permissions: ['all']
      },
      {
        email: 'pgabrieldavila@gmail.com',
        full_name: 'Gabriel Davila',
        role: 'admin',
        permissions: ['all']
      },
      {
        email: 'marloncpascoal@gmail.com',
        full_name: 'Marlon Pascoal',
        role: 'admin',
        permissions: ['all']
      },
      {
        email: 'connectcityops@gmail.com',
        full_name: 'Connect City Ops',
        role: 'admin',
        permissions: ['all']
      },
      {
        email: 'luizvincenzi@gmail.com',
        full_name: 'Luiz Vincenzi',
        role: 'admin',
        permissions: ['all']
      }
    ];
    
    for (const userData of defaultUsers) {
      // Verificar se usuário já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', userData.email.toLowerCase())
        .single();
      
      if (existingUser) {
        console.log(`  ✅ ${userData.email} já existe`);
        continue;
      }
      
      // Criar usuário
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          email: userData.email.toLowerCase(),
          full_name: userData.full_name,
          role: userData.role,
          permissions: userData.permissions,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createUserError) {
        console.error(`❌ Erro ao criar usuário ${userData.email}:`, createUserError);
      } else {
        console.log(`  ✅ Usuário criado: ${userData.email}`);
      }
    }
    
    // 5. Verificar resultado final
    console.log('\n📊 5. Verificando resultado final...');
    
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true);
    
    if (finalError) {
      console.error('❌ Erro ao verificar usuários finais:', finalError);
    } else {
      console.log(`✅ Total de usuários ativos: ${finalUsers.length}`);
      
      console.log('\n👥 Usuários disponíveis para login:');
      finalUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.full_name}`);
        console.log(`     📧 Email: ${user.email}`);
        console.log(`     🔑 Role: ${user.role}`);
        console.log(`     🔐 Senha: Use qualquer senha (sistema não valida senha ainda)`);
        console.log('');
      });
    }
    
    // 6. Testar API de login
    console.log('\n🧪 6. Testando API de login...');
    
    if (finalUsers && finalUsers.length > 0) {
      const testUser = finalUsers[0];
      
      try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: testUser.email
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          console.log(`✅ API de login funcionando para: ${testUser.email}`);
        } else {
          console.log(`❌ API de login falhou: ${data.error}`);
        }
      } catch (error) {
        console.log('❌ Erro ao testar API de login:', error);
      }
    }
    
    console.log('\n✅ CONFIGURAÇÃO DE USUÁRIOS CONCLUÍDA!');
    
    console.log('\n🎯 COMO FAZER LOGIN:');
    console.log('1. Acesse: http://localhost:3000/login');
    console.log('2. Use qualquer email da lista acima');
    console.log('3. Use qualquer senha (sistema não valida senha ainda)');
    console.log('4. Clique em "Entrar"');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Teste o login com os usuários criados');
    console.log('2. Implemente validação de senha se necessário');
    console.log('3. Configure autenticação mais robusta');

  } catch (error) {
    console.error('❌ Erro na configuração de usuários:', error);
  }
}

if (require.main === module) {
  setupUsers()
    .then(() => {
      console.log('\n🎉 Configuração finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Configuração falhou:', error);
      process.exit(1);
    });
}

export { setupUsers };
