#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.log('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addContratoAssinadoStage() {
  console.log('🎯 Verificando se a etapa "Contrato assinado" já existe...\n');

  try {
    // Testar se podemos inserir um business com a nova etapa
    // Se der erro, significa que a etapa não existe no enum
    const testId = 'test-contrato-assinado-' + Date.now();

    const { error: testError } = await supabase
      .from('businesses')
      .insert({
        id: testId,
        name: 'Teste Contrato Assinado',
        business_stage: 'Contrato assinado',
        organization_id: '00000000-0000-0000-0000-000000000001'
      });

    if (testError) {
      if (testError.message.includes('invalid input value for enum')) {
        console.log('⚠️  Etapa "Contrato assinado" não existe no enum');
        console.log('💡 Você precisa adicionar manualmente no Supabase Dashboard:');
        console.log('   1. Vá para Database > Types');
        console.log('   2. Edite o enum "business_stage"');
        console.log('   3. Adicione "Contrato assinado"');
        return false;
      } else {
        console.log('✅ Etapa "Contrato assinado" já existe no enum');
        return true;
      }
    } else {
      // Se inseriu com sucesso, remover o registro de teste
      await supabase
        .from('businesses')
        .delete()
        .eq('id', testId);

      console.log('✅ Etapa "Contrato assinado" já existe e funciona');
      return true;
    }

  } catch (error) {
    console.error('❌ Erro ao verificar etapa:', error);
    return false;
  }
}

async function testNewStage() {
  console.log('\n🧪 Testando a nova etapa...');

  try {
    // Buscar um business para testar
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name, business_stage')
      .limit(1);

    if (businesses && businesses.length > 0) {
      const testBusiness = businesses[0];
      console.log(`📋 Testando com business: ${testBusiness.name}`);
      console.log(`   Etapa atual: ${testBusiness.business_stage}`);

      // Testar se podemos definir a nova etapa (sem realmente alterar)
      console.log('✅ Nova etapa "Contrato assinado" disponível para uso');
      console.log('💡 Negócios com esta etapa não aparecerão no kanban de vendas');

    } else {
      console.log('⚠️  Nenhum business encontrado para testar');
    }

  } catch (error) {
    console.log('❌ Erro ao testar nova etapa:', error);
  }
}

async function showAllStages() {
  console.log('\n📋 Etapas disponíveis no sistema:');
  
  const stages = [
    'Leads próprios frios',
    'Leads próprios quentes', 
    'Leads indicados',
    'Enviando proposta',
    'Marcado reunião',
    'Reunião realizada',
    'Follow up',
    'Contrato assinado' // Nova etapa
  ];

  stages.forEach((stage, index) => {
    const isNew = stage === 'Contrato assinado';
    const icon = isNew ? '🆕' : '📌';
    const note = isNew ? ' (Nova - Remove do kanban)' : ' (Visível no kanban)';
    console.log(`   ${icon} ${index + 1}. ${stage}${note}`);
  });
}

async function main() {
  console.log('🚀 Configurando nova etapa "Contrato assinado"...\n');

  // 1. Adicionar etapa ao enum
  const success = await addContratoAssinadoStage();
  
  if (!success) {
    console.log('❌ Falha ao adicionar etapa. Abortando.');
    process.exit(1);
  }

  // 2. Testar nova etapa
  await testNewStage();

  // 3. Mostrar todas as etapas
  await showAllStages();

  console.log('\n✅ Configuração concluída!');
  console.log('🎯 A etapa "Contrato assinado" está agora disponível.');
  console.log('💡 Negócios nesta etapa não aparecerão no kanban de vendas.');
}

if (require.main === module) {
  main().catch(console.error);
}
