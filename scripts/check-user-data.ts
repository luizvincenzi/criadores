import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

// Cliente igual ao da aplicação
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

async function checkUserData() {
  console.log('🔍 [DEBUG] Verificando dados exatos retornados pela query...\n');

  const email = 'luizvincenzi@gmail.com';

  try {
    // Query exata do store de autenticação
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        permissions,
        avatar_url,
        created_at,
        updated_at,
        last_login
      `)
      .eq('email', email)
      .eq('is_active', true)
      .single();

    console.log('📊 RESULTADO DA QUERY:');
    console.log('======================');
    
    if (userError) {
      console.error('❌ Erro na query:', userError);
      console.error('   Código:', userError.code);
      console.error('   Mensagem:', userError.message);
      console.error('   Detalhes:', userError.details);
    } else if (!userData) {
      console.log('❌ Nenhum dado retornado (userData é null/undefined)');
    } else {
      console.log('✅ Dados retornados com sucesso:');
      console.log('   📧 Email:', userData.email);
      console.log('   👤 Nome:', userData.full_name);
      console.log('   🔑 Role:', userData.role);
      console.log('   📝 Permissions:', userData.permissions);
      console.log('   🖼️ Avatar:', userData.avatar_url);
      console.log('   📅 Criado:', userData.created_at);
      console.log('   📅 Atualizado:', userData.updated_at);
      console.log('   🔐 Último login:', userData.last_login);
      
      // Verificar se is_active está nos dados
      console.log('\n🔍 VERIFICAÇÃO DE CAMPOS:');
      console.log('   is_active presente?', 'is_active' in userData);
      console.log('   is_active valor:', (userData as any).is_active);
      console.log('   Tipo de is_active:', typeof (userData as any).is_active);
      
      // Mostrar todos os campos
      console.log('\n📋 TODOS OS CAMPOS RETORNADOS:');
      console.log(JSON.stringify(userData, null, 2));
    }

    // Tentar query sem filtro is_active
    console.log('\n🔍 TESTANDO QUERY SEM FILTRO is_active:');
    const { data: userData2, error: userError2 } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError2) {
      console.error('❌ Erro na query 2:', userError2);
    } else {
      console.log('✅ Dados completos do usuário:');
      console.log('   is_active:', userData2.is_active);
      console.log('   Tipo:', typeof userData2.is_active);
      console.log('   Todos os campos:', Object.keys(userData2));
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }

  console.log('\n🎯 CONCLUSÃO:');
  console.log('==============');
  console.log('Se is_active não estiver nos dados retornados,');
  console.log('isso explica por que a validação está falhando.');
  console.log('O campo pode não estar sendo selecionado na query.');
}

// Executar o script
if (require.main === module) {
  checkUserData()
    .then(() => {
      console.log('\n🎯 Verificação concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro na verificação:', error);
      process.exit(1);
    });
}

export { checkUserData };
