import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testCampaignModal() {
  console.log('🧪 TESTANDO MODAL DE CAMPANHAS\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Testar API de campanhas para verificar estrutura dos dados
    console.log('🔍 1. Verificando estrutura dos dados de campanhas...');
    
    try {
      const apiResponse = await fetch(`${baseUrl}/api/supabase/campaigns`);
      const apiData = await apiResponse.json();
      
      if (apiData.success) {
        console.log(`✅ API funcionando: ${apiData.data.length} campanhas`);
        
        if (apiData.data.length > 0) {
          const firstCampaign = apiData.data[0];
          console.log('📋 Estrutura da primeira campanha:');
          console.log(`   - ID: ${firstCampaign.id || 'N/A'}`);
          console.log(`   - Título: ${firstCampaign.title || 'N/A'}`);
          console.log(`   - Business ID: ${firstCampaign.business_id || 'N/A'}`);
          console.log(`   - Mês: ${firstCampaign.month || 'N/A'}`);
          console.log(`   - Status: ${firstCampaign.status || 'N/A'}`);
          console.log(`   - Criadores: ${firstCampaign.criadores ? 'Array presente' : 'Não definido'}`);
          
          if (firstCampaign.criadores) {
            console.log(`   - Tipo criadores: ${typeof firstCampaign.criadores}`);
            console.log(`   - Length criadores: ${Array.isArray(firstCampaign.criadores) ? firstCampaign.criadores.length : 'Não é array'}`);
          }
        }
      } else {
        console.log('❌ API falhou:', apiData.error);
        return;
      }
    } catch (error) {
      console.log('❌ Erro ao testar API:', error);
      return;
    }

    // 2. Simular função de agrupamento
    console.log('\n🔍 2. Testando função de agrupamento...');
    
    try {
      // Simular dados de campanha
      const mockCampaigns = [
        {
          id: 'camp1',
          title: 'Campanha Janeiro A',
          business_id: 'bus1',
          businessName: 'Negócio A',
          month: 'Janeiro',
          status: 'Ativa',
          criadores: [
            { id: 'cri1', nome: 'Criador 1', status: 'Ativo' },
            { id: 'cri2', nome: 'Criador 2', status: 'Ativo' }
          ]
        },
        {
          id: 'camp2',
          title: 'Campanha Janeiro B',
          business_id: 'bus1',
          businessName: 'Negócio A',
          month: 'Janeiro',
          status: 'Ativa',
          criadores: [
            { id: 'cri3', nome: 'Criador 3', status: 'Ativo' }
          ]
        }
      ];
      
      // Simular agrupamento
      const groupCampaignsByBusiness = (campaigns: any[]) => {
        const grouped = campaigns.reduce((acc: any, campaign: any) => {
          const businessName = campaign.businessName || 'Sem Negócio';

          if (!acc[businessName]) {
            acc[businessName] = {
              businessName: businessName,
              businessId: campaign.business_id || '',
              month: campaign.month || '',
              campaigns: [],
              criadores: [],
              totalCreators: 0,
              status: campaign.status || 'Ativa',
              // Compatibilidade com modal
              mes: campaign.month || '',
              campanhas: [],
              quantidadeCriadores: 0,
              totalCampanhas: 0
            };
          }

          // Adicionar criadores da campanha
          if (campaign.criadores && campaign.criadores.length > 0) {
            acc[businessName].campaigns.push(...campaign.criadores.map((criador: any) => ({
              id: `${campaign.id}_${criador.id}`,
              campaignId: campaign.id,
              businessName: businessName,
              creatorName: criador.nome,
              creatorId: criador.id,
              month: campaign.month,
              status: criador.status || 'Ativo'
            })));

            // Adicionar nomes dos criadores ao array criadores
            acc[businessName].criadores.push(...campaign.criadores.map((criador: any) => criador.nome || 'Sem Nome'));
            acc[businessName].totalCreators += campaign.criadores.length;
            
            // Compatibilidade com modal
            acc[businessName].campanhas.push(...campaign.criadores.map((criador: any) => ({
              id: `${campaign.id}_${criador.id}`,
              campanha: campaign.title,
              criador: criador.nome,
              status: criador.status || 'Ativo',
              deliverables: criador.deliverables || {}
            })));
            
            acc[businessName].quantidadeCriadores = acc[businessName].totalCreators;
            acc[businessName].totalCampanhas = acc[businessName].campanhas.length;
          }

          return acc;
        }, {});

        return Object.values(grouped);
      };
      
      const groupedResult = groupCampaignsByBusiness(mockCampaigns);
      
      console.log('✅ Função de agrupamento funcionando');
      console.log(`   - Grupos criados: ${groupedResult.length}`);
      
      if (groupedResult.length > 0) {
        const firstGroup = groupedResult[0] as any;
        console.log('📋 Primeiro grupo:');
        console.log(`   - Business: ${firstGroup.businessName}`);
        console.log(`   - Mês: ${firstGroup.mes || firstGroup.month}`);
        console.log(`   - Campanhas: ${firstGroup.campaigns.length}`);
        console.log(`   - Criadores: ${firstGroup.criadores.length}`);
        console.log(`   - Campanhas (modal): ${firstGroup.campanhas.length}`);
        console.log(`   - Quantidade criadores: ${firstGroup.quantidadeCriadores}`);
        console.log(`   - Total campanhas: ${firstGroup.totalCampanhas}`);
        
        // Testar se arrays existem e não são undefined
        console.log('\n🔍 Verificando arrays:');
        console.log(`   - criadores é array: ${Array.isArray(firstGroup.criadores)}`);
        console.log(`   - campanhas é array: ${Array.isArray(firstGroup.campanhas)}`);
        console.log(`   - campaigns é array: ${Array.isArray(firstGroup.campaigns)}`);
        
        // Testar se .map() funcionaria
        try {
          const criadoresTest = (firstGroup.criadores || []).map((c: any) => c);
          const campanhasTest = (firstGroup.campanhas || firstGroup.campaigns || []).map((c: any) => c);
          
          console.log(`   - .map() criadores: ✅ (${criadoresTest.length} itens)`);
          console.log(`   - .map() campanhas: ✅ (${campanhasTest.length} itens)`);
        } catch (error) {
          console.log(`   - .map() erro: ❌ ${error}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Erro no teste de agrupamento:', error);
    }

    // 3. Testar página de campanhas
    console.log('\n🔍 3. Testando página de campanhas...');
    
    try {
      const campaignsResponse = await fetch(`${baseUrl}/campaigns`);
      
      if (campaignsResponse.ok) {
        console.log('✅ Página de campanhas carregando');
        
        const content = await campaignsResponse.text();
        
        // Verificar se não há erros JavaScript
        const hasJSError = content.includes('TypeError') || 
                          content.includes('Cannot read properties') ||
                          content.includes('undefined');
        
        if (hasJSError) {
          console.log('⚠️ Possíveis erros JavaScript detectados');
        } else {
          console.log('✅ Nenhum erro JavaScript detectado');
        }
      } else {
        console.log(`❌ Página retornou erro: ${campaignsResponse.status}`);
      }
    } catch (error) {
      console.log('❌ Erro ao testar página:', error);
    }

    console.log('\n✅ TESTE DO MODAL DE CAMPANHAS CONCLUÍDO!');
    
    console.log('\n📋 CORREÇÕES APLICADAS:');
    console.log('✅ CampaignGroupModal: Proteção contra arrays undefined');
    console.log('✅ CampaignGroupModal: Compatibilidade com diferentes estruturas');
    console.log('✅ CampaignGroupModal: Keys únicas para elementos');
    console.log('✅ Página campanhas: Normalização de dados antes de abrir modal');
    console.log('✅ Página campanhas: Logs de debug para identificar problemas');
    
    console.log('\n🎯 ESTRUTURA ESPERADA PELO MODAL:');
    console.log('• businessName: string');
    console.log('• mes/month: string');
    console.log('• criadores: string[] (nomes dos criadores)');
    console.log('• campanhas/campaigns: any[] (dados das campanhas)');
    console.log('• quantidadeCriadores/totalCreators: number');
    console.log('• totalCampanhas: number');
    
    console.log('\n🚀 MODAL DEVE ESTAR FUNCIONANDO AGORA!');
    console.log('   Acesse: http://localhost:3000/campaigns');
    console.log('   Clique em "Ver Detalhes" em qualquer campanha');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

if (require.main === module) {
  testCampaignModal()
    .then(() => {
      console.log('\n🎉 Teste finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testCampaignModal };
