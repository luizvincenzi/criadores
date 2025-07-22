#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testContratoAssinadoFlow() {
  console.log('🧪 Testando fluxo "Contrato assinado"...\n');

  try {
    // 1. Buscar negócios no kanban (antes)
    console.log('📋 1. Buscando negócios no kanban...');
    const kanbanResponse = await fetch('http://localhost:3000/api/deals');
    const kanbanData = await kanbanResponse.json();
    const totalKanban = kanbanData.deals?.length || 0;
    console.log(`   📊 Total no kanban: ${totalKanban} negócios`);

    // 2. Buscar um negócio para testar
    const testDeal = kanbanData.deals?.[0];
    if (!testDeal) {
      console.log('❌ Nenhum negócio encontrado para testar');
      return;
    }

    console.log(`\n🎯 2. Negócio selecionado para teste:`);
    console.log(`   📝 Nome: ${testDeal.business_name}`);
    console.log(`   📊 Etapa atual: ${testDeal.stage}`);
    console.log(`   🆔 ID: ${testDeal.business_id}`);

    // 3. Mover para "Contrato assinado"
    console.log(`\n🔄 3. Movendo para "Contrato assinado"...`);
    const updateResponse = await fetch('http://localhost:3000/api/deals', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: testDeal.business_id,
        stage: 'Contrato assinado',
        previous_stage: testDeal.stage
      })
    });

    if (updateResponse.ok) {
      console.log('   ✅ Negócio movido para "Contrato assinado"');
    } else {
      const error = await updateResponse.text();
      console.log('   ❌ Erro ao mover negócio:', error);
      return;
    }

    // 4. Verificar se sumiu do kanban
    console.log(`\n👀 4. Verificando se sumiu do kanban...`);
    const newKanbanResponse = await fetch('http://localhost:3000/api/deals');
    const newKanbanData = await newKanbanResponse.json();
    const newTotalKanban = newKanbanData.deals?.length || 0;

    console.log(`   📊 Total no kanban agora: ${newTotalKanban} negócios`);
    
    if (newTotalKanban === totalKanban - 1) {
      console.log('   ✅ Negócio removido do kanban com sucesso!');
    } else {
      console.log('   ⚠️  Negócio ainda aparece no kanban');
    }

    // 5. Verificar se está no banco com status correto
    console.log(`\n🔍 5. Verificando no banco de dados...`);
    const { data: business, error } = await supabase
      .from('businesses')
      .select('id, name, business_stage')
      .eq('id', testDeal.business_id)
      .single();

    if (error) {
      console.log('   ❌ Erro ao buscar no banco:', error.message);
    } else {
      console.log(`   📝 Nome: ${business.name}`);
      console.log(`   📊 Etapa no banco: ${business.business_stage}`);
      
      if (business.business_stage === 'Contrato assinado') {
        console.log('   ✅ Status correto no banco de dados!');
      } else {
        console.log('   ❌ Status incorreto no banco de dados');
      }
    }

    // 6. Reverter para teste (opcional)
    console.log(`\n🔄 6. Revertendo para teste...`);
    const revertResponse = await fetch('http://localhost:3000/api/deals', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: testDeal.business_id,
        stage: testDeal.stage, // Voltar para etapa original
        previous_stage: 'Contrato assinado'
      })
    });

    if (revertResponse.ok) {
      console.log('   ✅ Negócio revertido para etapa original');
      console.log('   📋 Negócio deve aparecer novamente no kanban');
    } else {
      console.log('   ⚠️  Erro ao reverter (não é crítico)');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

async function showContratoAssinadoBusinesses() {
  console.log('\n📋 Negócios com "Contrato assinado":');

  try {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, business_stage, created_at')
      .eq('business_stage', 'Contrato assinado')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Erro ao buscar contratos assinados:', error.message);
      return;
    }

    if (!businesses || businesses.length === 0) {
      console.log('   📝 Nenhum contrato assinado encontrado');
      return;
    }

    businesses.forEach((business, index) => {
      const date = new Date(business.created_at).toLocaleDateString('pt-BR');
      console.log(`   ${index + 1}. ${business.name} (Criado em ${date})`);
    });

    console.log(`\n📊 Total de contratos assinados: ${businesses.length}`);

  } catch (error) {
    console.log('❌ Erro ao listar contratos assinados:', error);
  }
}

async function main() {
  console.log('🚀 Testando funcionalidade "Contrato assinado"...\n');

  // 1. Testar fluxo completo
  await testContratoAssinadoFlow();

  // 2. Mostrar contratos assinados
  await showContratoAssinadoBusinesses();

  console.log('\n✅ Teste concluído!');
  console.log('💡 Funcionalidade "Contrato assinado" implementada:');
  console.log('   🎯 Remove negócios do kanban de vendas');
  console.log('   📊 Mantém histórico no banco de dados');
  console.log('   🔄 Permite reversão se necessário');
}

if (require.main === module) {
  main().catch(console.error);
}
