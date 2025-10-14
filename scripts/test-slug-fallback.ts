import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFallback() {
  console.log('🧪 Testando fallback de slug...');
  console.log('');

  // Reverter slug para valor errado (sem empresas/)
  console.log('1️⃣ Revertendo slug para valor errado...');
  const { data: revert, error: revertError } = await supabase
    .from('landing_pages')
    .update({ slug: 'social-media-advogados' })
    .eq('id', '20000000-0000-0000-0000-000000000006')
    .select();

  if (revertError) {
    console.error('❌ Erro ao reverter slug:', revertError);
    return;
  }

  console.log('✅ Slug revertido para: social-media-advogados');
  console.log('');

  console.log('2️⃣ Agora teste acessando:');
  console.log('   http://localhost:3005/empresas/social-media-advogados');
  console.log('');
  console.log('3️⃣ Deve funcionar mesmo com slug errado no banco!');
  console.log('   (Graças ao fallback implementado)');
  console.log('');
  console.log('4️⃣ Verifique os logs do servidor para ver a mensagem:');
  console.log('   "⚠️  LP não encontrada com slug \'empresas/social-media-advogados\', tentando \'social-media-advogados\'..."');
  console.log('   "✅ LP encontrada com slug alternativo: social-media-advogados"');
}

testFallback();

