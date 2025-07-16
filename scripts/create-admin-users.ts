import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Usar service role key para ter permissões de admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function createAdminUsers() {
  console.log('👥 CRIANDO USUÁRIOS ADMIN COM SENHAS ESPECÍFICAS\n');
  
  try {
    // 1. Verificar se a organização existe
    console.log('🏢 1. Verificando organização...');
    
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', DEFAULT_ORG_ID)
      .single();
    
    if (orgError || !org) {
      console.log('⚠️ Organização não encontrada. Criando...');
      
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert({
          id: DEFAULT_ORG_ID,
          name: 'CRM Criadores',
          slug: 'crm-criadores',
          settings: {
            theme: 'default',
            timezone: 'America/Sao_Paulo'
          },
          is_active: true,
          created_at: new Date().toISOString()
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
    
    // 2. Definir usuários admin
    console.log('\n👤 2. Criando usuários admin...');
    
    const adminUsers = [
      {
        email: 'luizvincenzi@gmail.com',
        password: 'admin123',
        full_name: 'Luiz Vincenzi',
        role: 'admin'
      },
      {
        email: 'connectcityops@gmail.com',
        password: 'admin2345',
        full_name: 'Connect City Ops',
        role: 'admin'
      },
      {
        email: 'pgabrieldavila@gmail.com',
        password: 'admin2345',
        full_name: 'Gabriel Davila',
        role: 'admin'
      },
      {
        email: 'marloncpascoal@gmail.com',
        password: 'admin2345',
        full_name: 'Marlon Pascoal',
        role: 'admin'
      }
    ];
    
    for (const userData of adminUsers) {
      console.log(`\n📧 Processando: ${userData.email}`);
      
      // Verificar se usuário já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userData.email.toLowerCase())
        .eq('organization_id', DEFAULT_ORG_ID)
        .single();
      
      if (existingUser) {
        console.log(`  ⚠️ Usuário já existe. Atualizando senha...`);
        
        // Hash da nova senha
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(userData.password, saltRounds);
        
        // Atualizar usuário existente
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: userData.full_name,
            role: userData.role,
            password_hash: passwordHash,
            permissions: ['all'],
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id);
        
        if (updateError) {
          console.error(`  ❌ Erro ao atualizar usuário:`, updateError);
        } else {
          console.log(`  ✅ Usuário atualizado com nova senha`);
        }
      } else {
        console.log(`  🆕 Criando novo usuário...`);
        
        // Hash da senha
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(userData.password, saltRounds);
        
        // Criar novo usuário
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            organization_id: DEFAULT_ORG_ID,
            email: userData.email.toLowerCase(),
            full_name: userData.full_name,
            role: userData.role,
            password_hash: passwordHash,
            permissions: ['all'],
            is_active: true,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) {
          console.error(`  ❌ Erro ao criar usuário:`, createError);
        } else {
          console.log(`  ✅ Usuário criado com sucesso`);
        }
      }
      
      console.log(`  📧 Email: ${userData.email}`);
      console.log(`  🔐 Senha: ${userData.password}`);
      console.log(`  👤 Nome: ${userData.full_name}`);
      console.log(`  🔑 Role: ${userData.role}`);
    }
    
    // 3. Verificar resultado final
    console.log('\n📊 3. Verificando usuários criados...');
    
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    if (finalError) {
      console.error('❌ Erro ao verificar usuários finais:', finalError);
    } else {
      console.log(`✅ Total de usuários ativos: ${finalUsers.length}`);
      
      console.log('\n👥 USUÁRIOS DISPONÍVEIS PARA LOGIN:');
      finalUsers.forEach((user, index) => {
        const userCredentials = adminUsers.find(u => u.email === user.email);
        console.log(`\n  ${index + 1}. ${user.full_name}`);
        console.log(`     📧 Email: ${user.email}`);
        console.log(`     🔐 Senha: ${userCredentials?.password || 'Senha não definida'}`);
        console.log(`     🔑 Role: ${user.role}`);
        console.log(`     📅 Criado: ${new Date(user.created_at).toLocaleDateString('pt-BR')}`);
      });
    }
    
    // 4. Testar login com as credenciais
    console.log('\n🧪 4. Testando login com as credenciais...');
    
    for (const userData of adminUsers) {
      try {
        const response = await fetch('http://localhost:3000/api/supabase/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          console.log(`  ✅ Login OK: ${userData.email}`);
        } else {
          console.log(`  ❌ Login falhou: ${userData.email} - ${data.error}`);
        }
      } catch (error) {
        console.log(`  ❌ Erro ao testar login: ${userData.email}`);
      }
    }
    
    console.log('\n✅ USUÁRIOS ADMIN CRIADOS COM SUCESSO!');
    
    console.log('\n🎯 CREDENCIAIS DE ACESSO:');
    console.log('┌─────────────────────────────────┬──────────────┬─────────────────────┐');
    console.log('│ Email                           │ Senha        │ Nome                │');
    console.log('├─────────────────────────────────┼──────────────┼─────────────────────┤');
    adminUsers.forEach(user => {
      const email = user.email.padEnd(31);
      const password = user.password.padEnd(12);
      const name = user.full_name.padEnd(19);
      console.log(`│ ${email} │ ${password} │ ${name} │`);
    });
    console.log('└─────────────────────────────────┴──────────────┴─────────────────────┘');
    
    console.log('\n🚀 COMO FAZER LOGIN:');
    console.log('1. Acesse: http://localhost:3000/login');
    console.log('2. Use qualquer email e senha da tabela acima');
    console.log('3. As senhas agora são validadas corretamente');
    console.log('4. Será redirecionado para o dashboard');

  } catch (error) {
    console.error('❌ Erro na criação de usuários:', error);
  }
}

if (require.main === module) {
  createAdminUsers()
    .then(() => {
      console.log('\n🎉 Criação de usuários finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Criação de usuários falhou:', error);
      process.exit(1);
    });
}

export { createAdminUsers };
