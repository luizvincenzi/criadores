import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSlug() {
  console.log('🔧 Corrigindo slug da LP de Advogados...');
  console.log('');

  // Atualizar slug
  const { data, error } = await supabase
    .from('landing_pages')
    .update({ slug: 'empresas/social-media-advogados' })
    .eq('id', '20000000-0000-0000-0000-000000000006')
    .select();

  if (error) {
    console.error('❌ Erro ao atualizar slug:', error);
    return;
  }

  console.log('✅ Slug atualizado com sucesso!');
  console.log('📄 Dados:', data);
  console.log('');
  console.log('🎉 Agora você pode acessar:');
  console.log('   https://criadores.app/empresas/social-media-advogados');
}

fixSlug();

