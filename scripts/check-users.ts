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

const testEmails = [
  'luizvincenzi@gmail.com',
  'pgabrieldavila@gmail.com', 
  'marloncpascoal@gmail.com'
];

async function checkUsers() {
  console.log('🔍 [crIAdores] Verificando usuários no Supabase Auth...\n');

  for (const email of testEmails) {
    console.log(`👤 Verificando: ${email}`);
    
    try {
      // Listar usuários do Auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('  ❌ Erro ao listar usuários do Auth:', authError.message);
        continue;
      }

      const authUser = authUsers.users.find(user => user.email === email);
      
      if (authUser) {
        console.log('  ✅ Usuário existe no Auth');
        console.log(`     ID: ${authUser.id}`);
        console.log(`     Email: ${authUser.email}`);
        console.log(`     Confirmado: ${authUser.email_confirmed_at ? 'Sim' : 'Não'}`);
        console.log(`     Criado: ${authUser.created_at}`);
        console.log(`     Último login: ${authUser.last_sign_in_at || 'Nunca'}`);
      } else {
        console.log('  ❌ Usuário NÃO existe no Auth');
      }

      // Verificar na tabela users
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (dbError) {
        console.log('  ❌ Usuário NÃO existe na tabela users');
      } else {
        console.log('  ✅ Usuário existe na tabela users');
        console.log(`     Nome: ${dbUser.full_name}`);
        console.log(`     Role: ${dbUser.role}`);
        console.log(`     Ativo: ${dbUser.is_active ? 'Sim' : 'Não'}`);
      }

      console.log('');
    } catch (error) {
      console.error(`  ❌ Erro inesperado para ${email}:`, error);
      console.log('');
    }
  }

  console.log('🔍 Verificação concluída!\n');
}

// Executar o script
if (require.main === module) {
  checkUsers()
    .then(() => {
      console.log('🎯 Verificação executada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar verificação:', error);
      process.exit(1);
    });
}

export { checkUsers };
