import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVersions() {
  console.log('🔍 Verificando versões da LP de Advogados...');
  console.log('');

  const lpId = '20000000-0000-0000-0000-000000000006';

  // Buscar versões
  const { data: versions, error } = await supabase
    .from('lp_versions')
    .select('*')
    .eq('lp_id', lpId)
    .order('version_number', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar versões:', error);
    return;
  }

  console.log(`📚 Total de versões: ${versions?.length || 0}`);
  console.log('');

  if (!versions || versions.length === 0) {
    console.log('⚠️  PROBLEMA: Nenhuma versão encontrada!');
    console.log('');
    console.log('💡 SOLUÇÃO: Criar versão inicial a partir dos dados da tabela landing_pages');
    return;
  }

  console.log('✅ Versões encontradas:');
  versions.forEach((v, idx) => {
    console.log(`  ${idx + 1}. Versão ${v.version_number} - Criada em ${v.created_at}`);
    if (v.snapshot?.variables?.hero?.title) {
      console.log(`     Hero: ${v.snapshot.variables.hero.title.substring(0, 60)}...`);
    }
  });
}

checkVersions();

