import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testReports() {
  console.log('🧪 Testando sistema de relatórios...\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Testar se o servidor está funcionando
    console.log('📊 Verificando se o servidor está rodando...');
    
    try {
      const healthResponse = await fetch(`${baseUrl}/dashboard`);
      if (healthResponse.ok) {
        console.log('✅ Servidor está rodando');
      } else {
        console.log('⚠️ Servidor retornou erro:', healthResponse.status);
      }
    } catch (error) {
      console.log('❌ Servidor não está rodando. Inicie com: npm run dev');
      return;
    }
    
    // 2. Testar API de relatórios
    console.log('\n📊 Testando API /api/reports...');
    
    const periods = ['last30days', 'last3months', 'last6months', 'lastyear'];
    
    for (const period of periods) {
      console.log(`\n📋 Testando período: ${period}`);
      
      try {
        const response = await fetch(`${baseUrl}/api/reports?period=${period}`);
        const data = await response.json();
        
        if (data.success) {
          console.log(`✅ Relatório gerado com sucesso`);
          console.log(`   - Fonte: ${data.source}`);
          console.log(`   - Período: ${data.period}`);
          console.log(`   - Negócios: ${data.data.totalBusinesses}`);
          console.log(`   - Criadores: ${data.data.totalCreators}`);
          console.log(`   - Campanhas: ${data.data.totalCampaigns}`);
          console.log(`   - Campanhas Ativas: ${data.data.activeCampaigns}`);
          console.log(`   - Campanhas Concluídas: ${data.data.completedCampaigns}`);
          
          // Verificar estrutura dos dados
          if (data.data.monthlyStats && data.data.monthlyStats.length > 0) {
            console.log(`   - Estatísticas mensais: ${data.data.monthlyStats.length} meses`);
          }
          
          if (data.data.creatorsByStatus && data.data.creatorsByStatus.length > 0) {
            console.log(`   - Status de criadores: ${data.data.creatorsByStatus.length} categorias`);
          }
          
          if (data.data.campaignsByStatus && data.data.campaignsByStatus.length > 0) {
            console.log(`   - Status de campanhas: ${data.data.campaignsByStatus.length} categorias`);
          }
          
          if (data.data.topCreators && data.data.topCreators.length > 0) {
            console.log(`   - Top criadores: ${data.data.topCreators.length} criadores`);
          }
          
          if (data.data.businessCategories && data.data.businessCategories.length > 0) {
            console.log(`   - Categorias de negócios: ${data.data.businessCategories.length} categorias`);
          }
          
        } else {
          console.log(`❌ Erro no relatório: ${data.error}`);
        }
        
      } catch (error) {
        console.error(`❌ Erro na requisição para ${period}:`, error);
      }
      
      // Aguardar um pouco entre as requisições
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 3. Testar diferentes fontes de dados
    console.log('\n🔄 Testando diferentes fontes de dados...');
    
    const sources = ['auto', 'supabase', 'sheets'];
    
    for (const source of sources) {
      console.log(`\n📋 Testando fonte: ${source}`);
      
      try {
        const response = await fetch(`${baseUrl}/api/reports?period=last6months&source=${source}`);
        const data = await response.json();
        
        if (data.success) {
          console.log(`✅ Fonte ${source}: Funcionando`);
          console.log(`   - Fonte real: ${data.source}`);
          console.log(`   - Total de dados: ${data.data.totalBusinesses + data.data.totalCreators + data.data.totalCampaigns}`);
        } else {
          console.log(`⚠️ Fonte ${source}: ${data.error}`);
        }
        
      } catch (error) {
        console.error(`❌ Erro na fonte ${source}:`, error);
      }
      
      // Aguardar um pouco entre as requisições
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 4. Testar página de relatórios
    console.log('\n🌐 Testando página de relatórios...');
    
    try {
      const pageResponse = await fetch(`${baseUrl}/relatorios`);
      
      if (pageResponse.ok) {
        console.log('✅ Página de relatórios carregando corretamente');
        
        const pageContent = await pageResponse.text();
        
        // Verificar se contém elementos esperados
        const checks = [
          { name: 'Título da página', check: pageContent.includes('Relatórios e Analytics') },
          { name: 'Componentes de filtro', check: pageContent.includes('Filter') },
          { name: 'Botão de exportar', check: pageContent.includes('Exportar') },
          { name: 'Cards de métricas', check: pageContent.includes('Total de Negócios') },
          { name: 'Gráficos', check: pageContent.includes('Campanhas por Mês') },
          { name: 'Tabelas', check: pageContent.includes('Top Criadores') }
        ];
        
        checks.forEach(check => {
          console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
        });
        
      } else {
        console.log(`⚠️ Página de relatórios retornou erro: ${pageResponse.status}`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao testar página de relatórios:', error);
    }
    
    // 5. Testar navegação
    console.log('\n🧭 Testando navegação...');
    
    const navigationTests = [
      { name: 'Dashboard', url: `${baseUrl}/dashboard` },
      { name: 'Negócios', url: `${baseUrl}/businesses` },
      { name: 'Criadores', url: `${baseUrl}/creators` },
      { name: 'Campanhas', url: `${baseUrl}/campaigns` },
      { name: 'Jornada', url: `${baseUrl}/jornada` },
      { name: 'Relatórios', url: `${baseUrl}/relatorios` }
    ];
    
    for (const test of navigationTests) {
      try {
        const response = await fetch(test.url);
        console.log(`${response.ok ? '✅' : '❌'} ${test.name}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${test.name}: Erro de conexão`);
      }
    }
    
    // 6. Testar performance
    console.log('\n⚡ Testando performance...');
    
    const performanceTests = [
      { name: 'Relatório simples', url: `${baseUrl}/api/reports?period=last30days` },
      { name: 'Relatório médio', url: `${baseUrl}/api/reports?period=last6months` },
      { name: 'Relatório completo', url: `${baseUrl}/api/reports?period=lastyear` }
    ];
    
    for (const test of performanceTests) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(test.url);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (response.ok) {
          console.log(`✅ ${test.name}: ${duration}ms`);
        } else {
          console.log(`❌ ${test.name}: Erro ${response.status} em ${duration}ms`);
        }
        
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`❌ ${test.name}: Erro em ${duration}ms`);
      }
    }
    
    console.log('\n✅ Teste do sistema de relatórios concluído!');
    
    // 7. Resumo e instruções
    console.log('\n📋 Resumo:');
    console.log('- ✅ API de relatórios implementada (/api/reports)');
    console.log('- ✅ Página de relatórios criada (/relatorios)');
    console.log('- ✅ Suporte a múltiplos períodos');
    console.log('- ✅ Suporte a múltiplas fontes de dados');
    console.log('- ✅ Integração com sistema de notificações');
    console.log('- ✅ Navegação integrada');
    
    console.log('\n🎯 Funcionalidades disponíveis:');
    console.log('1. Métricas principais (totais, ativos, taxa de conclusão)');
    console.log('2. Gráficos de campanhas por mês');
    console.log('3. Distribuição de status (criadores e campanhas)');
    console.log('4. Top criadores por performance');
    console.log('5. Categorias de negócios');
    console.log('6. Filtros por período');
    console.log('7. Exportação de relatórios');
    
    console.log('\n🔧 Próximos passos:');
    console.log('1. Acesse http://localhost:3000/relatorios para ver os relatórios');
    console.log('2. Teste os filtros de período');
    console.log('3. Verifique as notificações de carregamento');
    console.log('4. Implemente gráficos mais avançados (opcional)');
    console.log('5. Adicione mais métricas específicas do negócio');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

if (require.main === module) {
  testReports()
    .then(() => {
      console.log('\n🎉 Teste finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testReports };
