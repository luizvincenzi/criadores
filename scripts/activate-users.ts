import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

// Cliente admin para operações
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Usuários para ativar
const usersToActivate = [
  'luizvincenzi@gmail.com',
  'pgabrieldavila@gmail.com', 
  'marloncpascoal@gmail.com'
];

async function activateUsers() {
  console.log('🔧 [crIAdores] Ativando usuários na tabela users...\n');

  for (const email of usersToActivate) {
    console.log(`👤 Processando: ${email}`);
    
    try {
      // 1. Verificar se usuário existe na tabela
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error(`  ❌ Erro ao buscar usuário: ${selectError.message}`);
        continue;
      }

      if (existingUser) {
        console.log('  📝 Usuário existe, atualizando...');
        console.log(`     Status atual: is_active = ${existingUser.is_active}`);
        
        // Atualizar usuário existente
        const { error: updateError } = await supabase
          .from('users')
          .update({
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', email.toLowerCase());

        if (updateError) {
          console.error(`  ❌ Erro ao atualizar: ${updateError.message}`);
        } else {
          console.log('  ✅ Usuário ativado com sucesso!');
        }
      } else {
        console.log('  📝 Usuário não existe, criando...');
        
        // Criar novo usuário
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            organization_id: DEFAULT_ORG_ID,
            email: email.toLowerCase(),
            full_name: email === 'luizvincenzi@gmail.com' ? 'Luiz Vincenzi' :
                      email === 'pgabrieldavila@gmail.com' ? 'Pedro Gabriel Davila' :
                      'Marlon Pascoal',
            role: email === 'luizvincenzi@gmail.com' ? 'admin' : 'manager',
            permissions: email === 'luizvincenzi@gmail.com' ? { all: true } : { read: true, write: true },
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`  ❌ Erro ao criar: ${insertError.message}`);
        } else {
          console.log('  ✅ Usuário criado e ativado!');
        }
      }

      // Verificar resultado final
      const { data: finalUser, error: finalError } = await supabase
        .from('users')
        .select('email, full_name, role, is_active')
        .eq('email', email.toLowerCase())
        .single();

      if (finalError) {
        console.error(`  ❌ Erro ao verificar resultado: ${finalError.message}`);
      } else {
        console.log('  📊 Status final:');
        console.log(`     Nome: ${finalUser.full_name}`);
        console.log(`     Role: ${finalUser.role}`);
        console.log(`     Ativo: ${finalUser.is_active ? '✅ SIM' : '❌ NÃO'}`);
      }

      console.log('');
    } catch (error) {
      console.error(`  ❌ Erro inesperado para ${email}:`, error);
      console.log('');
    }
  }

  console.log('🎉 [crIAdores] Ativação de usuários concluída!\n');
  
  console.log('📋 USUÁRIOS ATIVADOS:');
  console.log('=====================');
  
  // Verificar todos os usuários
  for (const email of usersToActivate) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('email, full_name, role, is_active')
        .eq('email', email.toLowerCase())
        .single();

      if (user) {
        console.log(`👤 ${user.full_name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Role: ${user.role}`);
        console.log(`   ✅ Ativo: ${user.is_active ? 'SIM' : 'NÃO'}`);
        console.log('');
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar ${email}`);
    }
  }
  
  console.log('🌐 TESTE AGORA:');
  console.log('===============');
  console.log('🔗 URL: http://localhost:3000/login');
  console.log('📧 Email: luizvincenzi@gmail.com');
  console.log('🔐 Senha: criadores2024!');
  console.log('✅ Todos os usuários devem estar ativos agora!');
}

// Executar o script
if (require.main === module) {
  activateUsers()
    .then(() => {
      console.log('🎯 Ativação concluída com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na ativação:', error);
      process.exit(1);
    });
}

export { activateUsers };
