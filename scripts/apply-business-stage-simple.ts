import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyBusinessStageMigration() {
  try {
    console.log('🚀 Aplicando migration para business_stage e estimated_value...');
    console.log('⚠️  ATENÇÃO: Execute os comandos SQL manualmente no Supabase Dashboard');
    console.log('');

    console.log('📝 SQL para executar no Supabase Dashboard:');
    console.log('');
    console.log('-- 1. Criar enum business_stage');
    console.log(`CREATE TYPE business_stage AS ENUM (
  'Leads próprios frios',
  'Leads próprios quentes',
  'Leads indicados',
  'Enviando proposta',
  'Marcado reunião',
  'Reunião realizada',
  'Follow up',
  'Contrato assinado',
  'Não teve interesse',
  'Não responde'
);`);
    console.log('');

    console.log('-- 2. Adicionar coluna business_stage');
    console.log(`ALTER TABLE businesses
ADD COLUMN business_stage business_stage DEFAULT 'Leads próprios frios';`);
    console.log('');

    console.log('-- 3. Adicionar coluna estimated_value');
    console.log(`ALTER TABLE businesses
ADD COLUMN estimated_value DECIMAL(12,2) DEFAULT 0.00;`);
    console.log('');

    console.log('-- 4. Criar índice');
    console.log(`CREATE INDEX idx_businesses_stage ON businesses(organization_id, business_stage) WHERE is_active = true;`);
    console.log('');

    console.log('-- 5. Adicionar comentários');
    console.log(`COMMENT ON COLUMN businesses.business_stage IS 'Etapa atual do negócio no funil de vendas';
COMMENT ON COLUMN businesses.estimated_value IS 'Valor estimado do negócio em R$ (valor aproximado que pode ser gerado)';`);
    console.log('');

    console.log('🔗 Acesse: https://supabase.com/dashboard/project/ecbhcalmulaiszslwhqz/sql');
    console.log('');

    // Verificar se as colunas já existem
    console.log('🔍 Verificando se as colunas já existem...');

    const { data: businessData, error: selectError } = await supabase
      .from('businesses')
      .select('id, name')
      .limit(1);

    if (selectError) {
      console.error('❌ Erro ao conectar com o banco:', selectError);
      return false;
    } else {
      console.log('✅ Conexão com banco funcionando');
    }

    // Tentar verificar se as colunas existem
    try {
      const { data: testData, error: testError } = await supabase
        .from('businesses')
        .select('business_stage, estimated_value')
        .limit(1);

      if (!testError) {
        console.log('✅ As colunas business_stage e estimated_value já existem!');
        console.log('📊 Dados de exemplo:', testData);
        return true;
      }
    } catch (e) {
      console.log('ℹ️  As colunas ainda não existem - execute o SQL acima');
    }

    return true;

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyBusinessStageMigration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { applyBusinessStageMigration };
