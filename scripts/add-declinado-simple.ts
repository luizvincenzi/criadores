#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDeclinadoStage() {
  console.log('🧪 TESTANDO SE A ETAPA "DECLINADO" JÁ EXISTE...');
  
  try {
    // Tentar criar um business de teste com a nova etapa
    const testBusiness = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Declinado - ' + Date.now(),
      business_stage: 'Declinado',
      estimated_value: 0,
      priority: 'Baixa',
      is_active: true
    };

    const { data, error } = await supabase
      .from('businesses')
      .insert([testBusiness])
      .select()
      .single();

    if (error) {
      if (error.message.includes('invalid input value for enum')) {
        console.log('❌ Etapa "Declinado" ainda não existe no banco');
        console.log('📝 EXECUTE MANUALMENTE NO SUPABASE DASHBOARD:');
        console.log('');
        console.log('ALTER TYPE business_stage ADD VALUE IF NOT EXISTS \'Declinado\';');
        console.log('');
        console.log('🔗 Vá para: https://ecbhcalmulaiszslwhqz.supabase.co/project/ecbhcalmulaiszslwhqz/sql');
        console.log('📋 Cole o comando SQL acima e execute');
        return false;
      } else {
        console.error('❌ Outro erro:', error);
        return false;
      }
    }

    console.log('✅ Etapa "Declinado" já existe! Business criado com sucesso:');
    console.log(`   📝 ID: ${data.id}`);
    console.log(`   📝 Nome: ${data.name}`);
    console.log(`   📝 Etapa: ${data.business_stage}`);

    // Limpar o teste
    await supabase
      .from('businesses')
      .delete()
      .eq('id', data.id);

    console.log('🧹 Business de teste removido');
    return true;

  } catch (error) {
    console.error('❌ Erro ao testar nova etapa:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 VERIFICANDO E ADICIONANDO ETAPA "DECLINADO"');
  console.log('==============================================\n');

  const exists = await testDeclinadoStage();
  
  if (exists) {
    console.log('\n✅ ETAPA "DECLINADO" ESTÁ PRONTA!');
    console.log('🎯 Agora vou atualizar o frontend para incluir no Kanban.');
  } else {
    console.log('\n⚠️ AÇÃO NECESSÁRIA:');
    console.log('1. Execute o comando SQL no Supabase Dashboard');
    console.log('2. Execute este script novamente para verificar');
    console.log('3. Depois atualizaremos o frontend');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
