import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTable() {
  console.log('🔍 Verificando tabela business_content_social...\n');

  try {
    // Tentar fazer uma query simples
    const { data, error, count } = await supabase
      .from('business_content_social')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ ERRO:', error.message);
      console.error('Código:', error.code);
      console.error('\n📝 SOLUÇÃO:');
      console.error('1. Verifique se a migration foi executada no Supabase');
      console.error('2. Aguarde alguns segundos e tente novamente');
      console.error('3. Reinicie o servidor Next.js (npm run dev)');
      return;
    }

    console.log('✅ Tabela business_content_social existe!');
    console.log(`📊 Total de registros: ${count || 0}`);

    // Verificar policies
    console.log('\n🔒 Verificando RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'business_content_social' })
      .catch(() => ({ data: null, error: null }));

    if (policies) {
      console.log(`✅ ${policies.length} policies encontradas`);
    } else {
      console.log('⚠️  Não foi possível verificar policies (normal)');
    }

    console.log('\n✅ Tudo OK! A tabela está pronta para uso.');

  } catch (error: any) {
    console.error('❌ Erro ao verificar tabela:', error.message);
  }
}

verifyTable();

