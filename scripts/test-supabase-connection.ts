import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔗 Testando conexão com Supabase...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Service Key:', supabaseServiceKey ? 'Configurada ✅' : 'Não configurada ❌');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('\n🧪 Testando conexão básica...');
    
    // Teste 1: Verificar se consegue conectar
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }

    console.log('✅ Conexão estabelecida com sucesso!');

    // Teste 2: Verificar se as tabelas existem
    console.log('\n🗄️ Verificando tabelas...');
    
    const tables = [
      'organizations',
      'users', 
      'businesses',
      'creators',
      'campaigns',
      'campaign_creators'
    ];

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        if (tableError) {
          console.log(`❌ Tabela ${table}: ${tableError.message}`);
        } else {
          console.log(`✅ Tabela ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: Erro ao verificar`);
      }
    }

    // Teste 3: Verificar views
    console.log('\n👁️ Verificando views...');
    
    try {
      const { error: viewError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .limit(1);

      if (viewError) {
        console.log(`❌ View dashboard_stats: ${viewError.message}`);
      } else {
        console.log(`✅ View dashboard_stats: OK`);
      }
    } catch (err) {
      console.log(`❌ View dashboard_stats: Erro ao verificar`);
    }

    return true;

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

// Executar teste
testConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Supabase configurado corretamente!');
      console.log('📋 Próximo passo: Executar migração dos dados');
    } else {
      console.log('\n⚠️ Problemas encontrados na configuração');
      console.log('📋 Verifique se os scripts SQL foram executados corretamente');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
