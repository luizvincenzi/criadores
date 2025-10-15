import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPietraAccess() {
  console.log('🔍 Verificando acesso da Pietra...\n');

  // 1. Buscar dados da Pietra
  const { data: pietra, error: pietraError } = await supabase
    .from('platform_users')
    .select('id, email, role, creator_id, business_id')
    .eq('email', 'pietramantovani98@gmail.com')
    .single();

  if (pietraError) {
    console.error('❌ Erro ao buscar Pietra:', pietraError);
    return;
  }

  console.log('👤 Dados da Pietra:');
  console.log('   - ID:', pietra.id);
  console.log('   - Email:', pietra.email);
  console.log('   - Role:', pietra.role);
  console.log('   - Creator ID:', pietra.creator_id);
  console.log('   - Business ID:', pietra.business_id);
  console.log('');

  if (!pietra.creator_id) {
    console.error('❌ Pietra não tem creator_id definido!');
    return;
  }

  // 2. Buscar creator relacionado
  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .select('id, name, email')
    .eq('id', pietra.creator_id)
    .single();

  if (creatorError) {
    console.error('❌ Erro ao buscar creator:', creatorError);
  } else {
    console.log('🎨 Creator relacionado:');
    console.log('   - ID:', creator.id);
    console.log('   - Nome:', creator.name);
    console.log('   - Email:', creator.email);
    console.log('');
  }

  // 3. Buscar businesses onde strategist_id = creator_id
  const { data: businesses, error: businessesError } = await supabase
    .from('businesses')
    .select('id, name, has_strategist, strategist_id, is_active')
    .eq('strategist_id', pietra.creator_id)
    .eq('has_strategist', true);

  if (businessesError) {
    console.error('❌ Erro ao buscar businesses:', businessesError);
    return;
  }

  console.log(`📊 Businesses encontrados: ${businesses?.length || 0}`);
  if (businesses && businesses.length > 0) {
    businesses.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.name}`);
      console.log(`      - ID: ${b.id}`);
      console.log(`      - Strategist ID: ${b.strategist_id}`);
      console.log(`      - Has Strategist: ${b.has_strategist}`);
      console.log(`      - Is Active: ${b.is_active}`);
    });
  } else {
    console.log('   ❌ Nenhum business encontrado!');
    console.log('');
    console.log('🔍 Verificando se existe algum business com has_strategist=true:');
    
    const { data: allBusinesses } = await supabase
      .from('businesses')
      .select('id, name, has_strategist, strategist_id')
      .eq('has_strategist', true);
    
    console.log(`   Total de businesses com strategist: ${allBusinesses?.length || 0}`);
    if (allBusinesses && allBusinesses.length > 0) {
      allBusinesses.forEach((b, i) => {
        console.log(`   ${i + 1}. ${b.name} (strategist_id: ${b.strategist_id})`);
      });
    }
  }
  console.log('');

  // 4. Testar a API
  console.log('🌐 Testando API /api/strategist/businesses...');
  const apiUrl = `http://localhost:3000/api/strategist/businesses?strategist_id=${pietra.creator_id}`;
  console.log('   URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Resposta:', JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error('   ❌ Erro ao chamar API:', error.message);
  }
}

checkPietraAccess();

