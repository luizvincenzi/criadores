import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBusinessesStructure() {
  console.log('🔍 Verificando estrutura da tabela businesses...\n');
  
  try {
    // 1. Buscar um negócio para ver a estrutura
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('*')
      .limit(3);
    
    if (businessesError) {
      console.error('❌ Erro ao buscar negócios:', businessesError);
      return;
    }
    
    console.log('📊 Estrutura dos negócios:');
    businesses?.forEach((business, index) => {
      console.log(`\n  Negócio ${index + 1}:`);
      Object.entries(business).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
    });
    
    // 2. Verificar se existe campo 'name' em vez de 'nome'
    console.log('\n🔍 Testando diferentes campos de nome...');
    
    const { data: testName, error: testNameError } = await supabase
      .from('businesses')
      .select('name')
      .limit(1);
    
    if (!testNameError) {
      console.log('✅ Campo "name" existe');
    } else {
      console.log('❌ Campo "name" não existe:', testNameError.message);
    }
    
    const { data: testNome, error: testNomeError } = await supabase
      .from('businesses')
      .select('nome')
      .limit(1);
    
    if (!testNomeError) {
      console.log('✅ Campo "nome" existe');
    } else {
      console.log('❌ Campo "nome" não existe:', testNomeError.message);
    }
    
    // 3. Buscar com todos os campos possíveis
    console.log('\n📋 Buscando com campos específicos...');
    
    const { data: specificFields, error: specificError } = await supabase
      .from('businesses')
      .select('id, name, nome, business_name, title')
      .limit(3);
    
    if (specificError) {
      console.error('❌ Erro ao buscar campos específicos:', specificError);
    } else {
      console.log('✅ Dados com campos específicos:');
      specificFields?.forEach((business, index) => {
        console.log(`\n  Negócio ${index + 1}:`);
        console.log(`    ID: ${business.id}`);
        console.log(`    name: ${(business as any).name}`);
        console.log(`    nome: ${(business as any).nome}`);
        console.log(`    business_name: ${(business as any).business_name}`);
        console.log(`    title: ${(business as any).title}`);
      });
    }
    
    console.log('\n✅ Verificação da estrutura concluída!');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

if (require.main === module) {
  checkBusinessesStructure()
    .then(() => {
      console.log('\n🎉 Verificação finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Verificação falhou:', error);
      process.exit(1);
    });
}

export { checkBusinessesStructure };
