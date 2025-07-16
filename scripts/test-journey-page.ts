import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testJourneyPage() {
  console.log('🧪 Testando funcionalidade da página de jornada...\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Testar função fetchCampaignJourney diretamente
    console.log('📊 Testando fetchCampaignJourney...');
    
    // Importar e testar a função diretamente
    const { fetchCampaignJourney, isUsingSupabase } = await import('../lib/dataSource');
    
    console.log(`🔍 Usando ${isUsingSupabase() ? 'Supabase' : 'Google Sheets'} como fonte de dados`);
    
    const journeyData = await fetchCampaignJourney();
    
    console.log(`✅ ${journeyData.length} campanhas na jornada encontradas`);
    
    if (journeyData.length > 0) {
      const firstJourney = journeyData[0];
      console.log('\n📋 Primeira campanha da jornada:');
      console.log(`  - ID: ${firstJourney.id}`);
      console.log(`  - Business: ${firstJourney.businessName}`);
      console.log(`  - Mês: ${firstJourney.mes}`);
      console.log(`  - Estágio: ${firstJourney.journeyStage}`);
      console.log(`  - Total Campanhas: ${firstJourney.totalCampanhas}`);
      console.log(`  - Quantidade Criadores: ${firstJourney.quantidadeCriadores}`);
      console.log(`  - Campaign IDs: ${firstJourney.campaignIds?.join(', ') || 'N/A'}`);
      
      // 2. Testar agrupamento por estágio
      console.log('\n📊 Testando agrupamento por estágio...');
      
      const stageGroups = journeyData.reduce((acc: any, journey: any) => {
        const stage = journey.journeyStage || 'Sem Estágio';
        if (!acc[stage]) {
          acc[stage] = [];
        }
        acc[stage].push(journey);
        return acc;
      }, {});
      
      console.log('✅ Agrupamento por estágio:');
      Object.entries(stageGroups).forEach(([stage, journeys]: [string, any]) => {
        console.log(`  - ${stage}: ${journeys.length} campanhas`);
      });
      
      // 3. Testar estatísticas
      console.log('\n📊 Testando estatísticas...');
      
      const totalCampaigns = journeyData.reduce((sum: number, j: any) => sum + (j.totalCampanhas || 0), 0);
      const totalCreators = journeyData.reduce((sum: number, j: any) => sum + (j.quantidadeCriadores || 0), 0);
      const uniqueBusinesses = [...new Set(journeyData.map((j: any) => j.businessName))].length;
      const uniqueMonths = [...new Set(journeyData.map((j: any) => j.mes))].length;
      
      console.log(`✅ Estatísticas calculadas:`);
      console.log(`  - Grupos de jornada: ${journeyData.length}`);
      console.log(`  - Total de campanhas: ${totalCampaigns}`);
      console.log(`  - Total de criadores: ${totalCreators}`);
      console.log(`  - Negócios únicos: ${uniqueBusinesses}`);
      console.log(`  - Meses únicos: ${uniqueMonths}`);
      
      // 4. Verificar estrutura dos dados para o kanban
      console.log('\n🔍 Verificando compatibilidade com o kanban...');
      
      const requiredFields = [
        'id', 'businessName', 'mes', 'journeyStage', 'totalCampanhas', 'quantidadeCriadores'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in firstJourney));
      
      if (missingFields.length === 0) {
        console.log('✅ Estrutura de dados compatível com o kanban');
      } else {
        console.log('⚠️ Campos faltando:', missingFields);
      }
      
      // 5. Testar transformação para formato esperado pelo kanban
      console.log('\n🔄 Testando transformação para o kanban...');
      
      const kanbanData = journeyData.map((journey: any) => ({
        id: journey.id,
        businessName: journey.businessName,
        mes: journey.mes,
        journeyStage: journey.journeyStage,
        totalCampanhas: journey.totalCampanhas,
        quantidadeCriadores: journey.quantidadeCriadores,
        campanhas: journey.campanhas || [],
        businessData: journey.businessData,
        campaignIds: journey.campaignIds || [],
        primaryCampaignId: journey.primaryCampaignId
      }));
      
      console.log('✅ Transformação para kanban bem-sucedida');
      console.log(`  - Primeiro item: ${kanbanData[0].businessName} - ${kanbanData[0].mes}`);
      console.log(`  - Estágio: ${kanbanData[0].journeyStage}`);
      console.log(`  - Campanhas: ${kanbanData[0].totalCampanhas}`);
      
      // 6. Testar filtros por estágio
      console.log('\n🔍 Testando filtros por estágio...');
      
      const stages = ['Reunião de briefing', 'Agendamentos', 'Entrega final'];
      
      stages.forEach(stage => {
        const filtered = journeyData.filter((j: any) => j.journeyStage === stage);
        console.log(`  - ${stage}: ${filtered.length} campanhas`);
      });
      
    } else {
      console.log('⚠️ Nenhuma campanha na jornada encontrada');
      
      // Verificar se há campanhas em geral
      const { fetchCampaigns } = await import('../lib/dataSource');
      const allCampaigns = await fetchCampaigns();
      
      console.log(`📊 Total de campanhas (incluindo finalizadas): ${allCampaigns.length}`);
      
      if (allCampaigns.length > 0) {
        const statuses = allCampaigns.map((c: any) => c.status).filter(Boolean);
        const uniqueStatuses = [...new Set(statuses)];
        console.log(`📋 Status encontrados: ${uniqueStatuses.join(', ')}`);
        
        const finalized = allCampaigns.filter((c: any) => 
          c.status?.toLowerCase() === 'finalizado' || 
          c.status?.toLowerCase() === 'finalizada'
        );
        console.log(`🏁 Campanhas finalizadas (excluídas da jornada): ${finalized.length}`);
      }
    }
    
    console.log('\n✅ Teste da página de jornada concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

if (require.main === module) {
  testJourneyPage()
    .then(() => {
      console.log('\n🎉 Teste finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testJourneyPage };
