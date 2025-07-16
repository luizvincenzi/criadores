import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testDashboardPage() {
  console.log('🧪 Testando funcionalidade da página de dashboard...\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Testar funções do dataSource diretamente
    console.log('📊 Testando funções do dataSource...');
    
    const { 
      fetchBusinesses, 
      fetchCreators, 
      fetchCampaigns, 
      fetchCampaignJourney, 
      isUsingSupabase 
    } = await import('../lib/dataSource');
    
    console.log(`🔍 Usando ${isUsingSupabase() ? 'Supabase' : 'Google Sheets'} como fonte de dados`);
    
    // Carregar dados em paralelo
    console.log('📡 Carregando dados em paralelo...');
    
    const [businessesData, creatorsData, campaignsData, journeyData] = await Promise.all([
      fetchBusinesses(),
      fetchCreators(),
      fetchCampaigns(),
      fetchCampaignJourney()
    ]);
    
    console.log('✅ Dados carregados:');
    console.log(`  - Negócios: ${businessesData.length}`);
    console.log(`  - Criadores: ${creatorsData.length}`);
    console.log(`  - Campanhas: ${campaignsData.length}`);
    console.log(`  - Jornada: ${journeyData.length}`);
    
    // 2. Testar cálculo de estatísticas por estágio
    console.log('\n📊 Testando cálculo de estatísticas por estágio...');
    
    const campaignsByStage = {
      'Reunião de briefing': 0,
      'Agendamentos': 0,
      'Entrega final': 0,
      'Finalizado': 0
    };

    journeyData.forEach((campaign: any) => {
      const stage = campaign.journeyStage || 'Reunião de briefing';
      // Mapear para as chaves corretas do dashboard
      const stageKey = stage === 'Reunião Briefing' ? 'Reunião de briefing' :
                      stage === 'Agendamentos' ? 'Agendamentos' :
                      stage === 'Entrega Final' ? 'Entrega final' : 'Reunião de briefing';

      if (stageKey in campaignsByStage) {
        campaignsByStage[stageKey as keyof typeof campaignsByStage]++;
      }
    });
    
    console.log('✅ Campanhas por estágio:');
    Object.entries(campaignsByStage).forEach(([stage, count]) => {
      console.log(`  - ${stage}: ${count} campanhas`);
    });
    
    // 3. Testar cálculo de distribuição de planos
    console.log('\n📊 Testando distribuição de planos...');
    
    const planDistribution: { [key: string]: number } = {};
    
    if (isUsingSupabase()) {
      businessesData.forEach((business: any) => {
        const plan = business.current_plan || business.planoAtual || 'Sem Plano';
        planDistribution[plan] = (planDistribution[plan] || 0) + 1;
      });
    } else {
      // Para Google Sheets, simular
      businessesData.forEach((business: any) => {
        const plan = business.plano || business.planoAtual || 'Sem Plano';
        planDistribution[plan] = (planDistribution[plan] || 0) + 1;
      });
    }
    
    console.log('✅ Distribuição de planos:');
    Object.entries(planDistribution).forEach(([plan, count]) => {
      console.log(`  - ${plan}: ${count} negócios`);
    });
    
    // 4. Testar cálculo de estatísticas gerais
    console.log('\n📊 Testando estatísticas gerais...');
    
    const stats = {
      totalBusinesses: businessesData.length,
      totalCreators: creatorsData.length,
      totalCampaigns: campaignsData.length,
      campaignsByStage: campaignsByStage,
      totalRevenue: 0, // Seria calculado baseado nos planos
      planDistribution: planDistribution
    };
    
    console.log('✅ Estatísticas calculadas:');
    console.log(`  - Total de negócios: ${stats.totalBusinesses}`);
    console.log(`  - Total de criadores: ${stats.totalCreators}`);
    console.log(`  - Total de campanhas: ${stats.totalCampaigns}`);
    console.log(`  - Campanhas ativas na jornada: ${journeyData.length}`);
    
    // 5. Testar análise de seguidores
    console.log('\n📊 Testando análise de seguidores...');
    
    let totalFollowers = 0;
    let creatorsWithFollowers = 0;
    
    creatorsData.forEach((creator: any) => {
      const followers = parseInt(creator.followers || creator.seguidores || '0');
      if (followers > 0) {
        totalFollowers += followers;
        creatorsWithFollowers++;
      }
    });
    
    const averageFollowers = creatorsWithFollowers > 0 ? Math.round(totalFollowers / creatorsWithFollowers) : 0;
    
    console.log('✅ Análise de seguidores:');
    console.log(`  - Total de seguidores: ${totalFollowers.toLocaleString()}`);
    console.log(`  - Criadores com dados: ${creatorsWithFollowers}`);
    console.log(`  - Média de seguidores: ${averageFollowers.toLocaleString()}`);
    
    // 6. Testar análise de cidades
    console.log('\n📊 Testando análise de cidades...');
    
    const cityDistribution: { [key: string]: number } = {};
    
    creatorsData.forEach((creator: any) => {
      const city = creator.cidade || creator.city || 'Sem Cidade';
      cityDistribution[city] = (cityDistribution[city] || 0) + 1;
    });
    
    const topCities = Object.entries(cityDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    console.log('✅ Top 5 cidades com mais criadores:');
    topCities.forEach(([city, count]) => {
      console.log(`  - ${city}: ${count} criadores`);
    });
    
    // 7. Testar análise temporal
    console.log('\n📊 Testando análise temporal...');
    
    const monthDistribution: { [key: string]: number } = {};
    
    journeyData.forEach((campaign: any) => {
      const month = campaign.mes || 'Sem Mês';
      monthDistribution[month] = (monthDistribution[month] || 0) + 1;
    });
    
    console.log('✅ Campanhas por mês:');
    Object.entries(monthDistribution).forEach(([month, count]) => {
      console.log(`  - ${month}: ${count} campanhas`);
    });
    
    // 8. Verificar performance
    console.log('\n⚡ Testando performance...');
    
    const startTime = Date.now();
    
    // Simular carregamento do dashboard
    await Promise.all([
      fetchBusinesses(),
      fetchCreators(),
      fetchCampaigns(),
      fetchCampaignJourney()
    ]);
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    console.log(`✅ Tempo de carregamento: ${loadTime}ms`);
    
    if (loadTime < 2000) {
      console.log('🚀 Performance excelente (< 2s)');
    } else if (loadTime < 5000) {
      console.log('⚡ Performance boa (< 5s)');
    } else {
      console.log('⚠️ Performance pode ser melhorada (> 5s)');
    }
    
    // 9. Verificar integridade dos dados
    console.log('\n🔍 Verificando integridade dos dados...');
    
    let issues = 0;
    
    // Verificar se há negócios sem campanhas
    const businessesWithCampaigns = new Set(campaignsData.map((c: any) => c.businessId || c.business));
    const businessesWithoutCampaigns = businessesData.filter((b: any) => 
      !businessesWithCampaigns.has(b.id) && !businessesWithCampaigns.has(b.nome)
    );
    
    if (businessesWithoutCampaigns.length > 0) {
      console.log(`⚠️ ${businessesWithoutCampaigns.length} negócios sem campanhas`);
      issues++;
    }
    
    // Verificar criadores sem dados de seguidores
    const creatorsWithoutFollowers = creatorsData.filter((c: any) => 
      !c.followers && !c.seguidores
    );
    
    if (creatorsWithoutFollowers.length > 0) {
      console.log(`⚠️ ${creatorsWithoutFollowers.length} criadores sem dados de seguidores`);
      issues++;
    }
    
    if (issues === 0) {
      console.log('✅ Integridade dos dados OK');
    } else {
      console.log(`⚠️ ${issues} problemas de integridade encontrados`);
    }
    
    console.log('\n✅ Teste da página de dashboard concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

if (require.main === module) {
  testDashboardPage()
    .then(() => {
      console.log('\n🎉 Teste finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testDashboardPage };
