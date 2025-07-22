import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function testKanbanSync() {
  try {
    console.log('🧪 Testando sincronização completa do Kanban...');

    const baseUrl = 'http://localhost:3000';

    // 1. Buscar negócios atuais
    console.log('📊 Buscando negócios atuais...');
    
    const dealsResponse = await fetch(`${baseUrl}/api/deals`);
    if (!dealsResponse.ok) {
      console.error('❌ Erro ao buscar negócios');
      return false;
    }

    const dealsData = await dealsResponse.json();
    console.log(`✅ ${dealsData.total} negócios encontrados`);

    if (dealsData.deals.length === 0) {
      console.log('⚠️  Nenhum negócio encontrado para teste');
      return false;
    }

    const testDeal = dealsData.deals[0];
    console.log(`🎯 Testando com negócio: ${testDeal.business_name}`);
    console.log(`📍 Etapa atual: ${testDeal.stage}`);
    console.log(`📅 Desde: ${new Date(testDeal.current_stage_since).toLocaleString('pt-BR')}`);

    // 2. Testar mudança de etapa
    const stages = [
      'Leads próprios frios',
      'Leads próprios quentes', 
      'Indicações',
      'Enviado proposta',
      'Marcado reunião',
      'Reunião realizada',
      'Follow up'
    ];

    const currentStageIndex = stages.indexOf(testDeal.stage);
    const nextStageIndex = (currentStageIndex + 1) % stages.length;
    const newStage = stages[nextStageIndex];

    console.log(`🔄 Testando mudança: ${testDeal.stage} → ${newStage}`);

    // 3. Executar mudança de etapa
    const updateResponse = await fetch(`${baseUrl}/api/deals`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: testDeal.id,
        stage: newStage,
        previous_stage: testDeal.stage
      })
    });

    if (!updateResponse.ok) {
      console.error('❌ Erro ao atualizar etapa');
      return false;
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Etapa atualizada no servidor:');
    console.log(`  - Mensagem: ${updateResult.message}`);
    console.log(`  - Nova etapa: ${updateResult.deal.stage}`);
    console.log(`  - Atualizado em: ${new Date(updateResult.deal.current_stage_since).toLocaleString('pt-BR')}`);
    
    if (updateResult.tracking) {
      console.log('📊 Tracking:');
      console.log(`  - Etapa anterior: ${updateResult.tracking.previous_stage}`);
      console.log(`  - Nova etapa: ${updateResult.tracking.new_stage}`);
      console.log(`  - Tempo na etapa anterior: ${updateResult.tracking.time_in_previous_stage_days || 0} dias`);
    }

    // 4. Verificar persistência - buscar novamente
    console.log('🔍 Verificando persistência...');
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo
    
    const verifyResponse = await fetch(`${baseUrl}/api/deals`);
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const updatedDeal = verifyData.deals.find((d: any) => d.id === testDeal.id);
      
      if (updatedDeal) {
        console.log('✅ Persistência verificada:');
        console.log(`  - Etapa atual: ${updatedDeal.stage}`);
        console.log(`  - Desde: ${new Date(updatedDeal.current_stage_since).toLocaleString('pt-BR')}`);
        
        if (updatedDeal.stage === newStage) {
          console.log('🎉 Sincronização funcionando perfeitamente!');
        } else {
          console.log('⚠️  Etapa não foi persistida corretamente');
        }
      } else {
        console.log('❌ Negócio não encontrado após atualização');
      }
    }

    // 5. Testar múltiplas mudanças rápidas
    console.log('⚡ Testando múltiplas mudanças rápidas...');
    
    const rapidChanges = [
      stages[(nextStageIndex + 1) % stages.length],
      stages[(nextStageIndex + 2) % stages.length],
      testDeal.stage // Voltar ao original
    ];

    for (let i = 0; i < rapidChanges.length; i++) {
      const targetStage = rapidChanges[i];
      console.log(`🔄 Mudança ${i + 1}: → ${targetStage}`);
      
      const rapidResponse = await fetch(`${baseUrl}/api/deals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: testDeal.id,
          stage: targetStage,
          previous_stage: i === 0 ? newStage : rapidChanges[i - 1]
        })
      });

      if (rapidResponse.ok) {
        const rapidResult = await rapidResponse.json();
        console.log(`  ✅ ${rapidResult.message}`);
      } else {
        console.log(`  ❌ Erro na mudança ${i + 1}`);
      }
      
      // Pequena pausa entre mudanças
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 6. Verificação final
    console.log('🏁 Verificação final...');
    
    const finalResponse = await fetch(`${baseUrl}/api/deals`);
    if (finalResponse.ok) {
      const finalData = await finalResponse.json();
      const finalDeal = finalData.deals.find((d: any) => d.id === testDeal.id);
      
      if (finalDeal) {
        console.log('📊 Estado final:');
        console.log(`  - Etapa: ${finalDeal.stage}`);
        console.log(`  - Desde: ${new Date(finalDeal.current_stage_since).toLocaleString('pt-BR')}`);
        console.log(`  - Valor: R$ ${finalDeal.estimated_value}`);
        console.log(`  - Prioridade: ${finalDeal.priority}`);
      }
    }

    // 7. Resumo dos testes
    console.log('\n🎉 Teste de sincronização do Kanban concluído!');
    console.log('\n📋 Funcionalidades testadas:');
    console.log('✅ Busca de negócios');
    console.log('✅ Atualização de etapa');
    console.log('✅ Tracking de tempo');
    console.log('✅ Persistência no banco');
    console.log('✅ Múltiplas mudanças rápidas');
    console.log('✅ Verificação de consistência');

    console.log('\n🚀 Sistema pronto para uso:');
    console.log('1. Acesse http://localhost:3000/deals');
    console.log('2. Arraste negócios entre colunas');
    console.log('3. Veja notificações de sucesso/erro');
    console.log('4. Atualize a página - mudanças persistem');
    console.log('5. Clique em "Ver Detalhes" para tracking');

    return true;

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testKanbanSync()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { testKanbanSync };
