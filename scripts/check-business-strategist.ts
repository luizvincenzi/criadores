import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBusinessStrategist() {
  console.log('🔍 Verificando estrutura de businesses e strategists...\n');

  // 1. Verificar estrutura da tabela businesses
  const { data: businesses, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .limit(1);

  if (businessError) {
    console.error('❌ Erro ao buscar businesses:', businessError);
    return;
  }

  if (businesses && businesses.length > 0) {
    console.log('📊 Estrutura da tabela businesses:');
    console.log('Campos disponíveis:', Object.keys(businesses[0]));
    console.log('\n');
  }

  // 2. Verificar creators que são strategists
  const { data: strategists, error: strategistError } = await supabase
    .from('creators')
    .select('id, name, is_strategist, strategist_specialties, strategist_experience_years')
    .eq('is_strategist', true);

  if (strategistError) {
    console.error('❌ Erro ao buscar strategists:', strategistError);
  } else {
    console.log(`✅ Strategists encontrados: ${strategists?.length || 0}\n`);
    strategists?.forEach(s => {
      console.log(`   - ${s.name} (${s.id})`);
      console.log(`     Especialidades: ${s.strategist_specialties || 'N/A'}`);
      console.log(`     Experiência: ${s.strategist_experience_years || 0} anos\n`);
    });
  }

  // 3. Verificar se existe campo strategist_id em businesses
  console.log('🔍 Verificando se businesses tem campo strategist_id...\n');
  
  const { data: testBusiness } = await supabase
    .from('businesses')
    .select('id, name, strategist_id')
    .limit(1)
    .maybeSingle();

  if (testBusiness && 'strategist_id' in testBusiness) {
    console.log('✅ Campo strategist_id EXISTE na tabela businesses');
    
    // Buscar businesses com strategist
    const { data: businessesWithStrategist } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        strategist_id,
        creators:strategist_id (
          id,
          name,
          is_strategist
        )
      `)
      .not('strategist_id', 'is', null);

    console.log(`\n📊 Businesses com strategist: ${businessesWithStrategist?.length || 0}\n`);
    businessesWithStrategist?.forEach(b => {
      console.log(`   - ${b.name}`);
      console.log(`     Strategist: ${(b.creators as any)?.name || 'N/A'}\n`);
    });
  } else {
    console.log('❌ Campo strategist_id NÃO EXISTE na tabela businesses');
    console.log('\n⚠️ AÇÃO NECESSÁRIA: Criar migration para adicionar strategist_id\n');
    console.log('SQL sugerido:');
    console.log(`
ALTER TABLE businesses 
ADD COLUMN strategist_id UUID REFERENCES creators(id) ON DELETE SET NULL;

CREATE INDEX idx_businesses_strategist ON businesses(strategist_id) 
WHERE strategist_id IS NOT NULL;

COMMENT ON COLUMN businesses.strategist_id IS 'ID do creator que é strategist responsável por este business';
    `);
  }
}

checkBusinessStrategist();

