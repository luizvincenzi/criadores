import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testCampaignsPage() {
  console.log('🧪 Testando funcionalidade da página de campanhas...\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Testar API de campanhas do Supabase
    console.log('📊 Testando API /api/supabase/campaigns...');
    
    const response = await fetch(`${baseUrl}/api/supabase/campaigns`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ API funcionando: ${data.count} campanhas encontradas`);
      
      if (data.data.length > 0) {
        const firstCampaign = data.data[0];
        console.log('\n📋 Primeira campanha:');
        console.log(`  - ID: ${firstCampaign.id}`);
        console.log(`  - Nome: ${firstCampaign.nome}`);
        console.log(`  - Business: ${firstCampaign.businessName}`);
        console.log(`  - Mês: ${firstCampaign.mes}`);
        console.log(`  - Status: ${firstCampaign.status}`);
        console.log(`  - Total Criadores: ${firstCampaign.totalCriadores}`);
        console.log(`  - Orçamento: ${firstCampaign.orcamento}`);
        
        // 2. Testar filtros
        console.log('\n🔍 Testando filtros...');
        
        // Filtro por status
        const statusResponse = await fetch(`${baseUrl}/api/supabase/campaigns?status=Reunião de briefing`);
        const statusData = await statusResponse.json();
        
        if (statusData.success) {
          console.log(`✅ Filtro por status: ${statusData.count} campanhas encontradas`);
        } else {
          console.error('❌ Filtro por status falhou:', statusData.error);
        }
        
        // Filtro por mês
        if (firstCampaign.mes) {
          const monthResponse = await fetch(`${baseUrl}/api/supabase/campaigns?month=${encodeURIComponent(firstCampaign.mes)}`);
          const monthData = await monthResponse.json();
          
          if (monthData.success) {
            console.log(`✅ Filtro por mês '${firstCampaign.mes}': ${monthData.count} campanhas encontradas`);
          } else {
            console.error('❌ Filtro por mês falhou:', monthData.error);
          }
        }
        
        // Filtro por business
        if (firstCampaign.businessId) {
          const businessResponse = await fetch(`${baseUrl}/api/supabase/campaigns?business_id=${firstCampaign.businessId}`);
          const businessData = await businessResponse.json();
          
          if (businessData.success) {
            console.log(`✅ Filtro por business: ${businessData.count} campanhas encontradas`);
          } else {
            console.error('❌ Filtro por business falhou:', businessData.error);
          }
        }
        
        // 3. Testar estrutura dos dados para agrupamento
        console.log('\n🔍 Testando agrupamento de campanhas...');
        
        const campaigns = data.data;
        
        // Simular agrupamento por negócio
        const grouped = campaigns.reduce((acc: any, campaign: any) => {
          const businessName = campaign.businessName || 'Sem Negócio';
          
          if (!acc[businessName]) {
            acc[businessName] = {
              businessName: businessName,
              businessId: campaign.businessId || '',
              month: campaign.mes || '',
              campaigns: [],
              totalCreators: 0,
              status: campaign.status || 'Ativa'
            };
          }
          
          acc[businessName].totalCreators += campaign.totalCriadores || 0;
          acc[businessName].campaigns.push(campaign);
          
          return acc;
        }, {});
        
        const groupedArray = Object.values(grouped);
        
        console.log(`✅ Agrupamento bem-sucedido:`);
        console.log(`  - Grupos de campanhas: ${groupedArray.length}`);
        console.log(`  - Primeira campanha agrupada: ${(groupedArray[0] as any).businessName}`);
        console.log(`  - Total de criadores no grupo: ${(groupedArray[0] as any).totalCreators}`);
        
        // 4. Testar criação de nova campanha
        console.log('\n➕ Testando criação de nova campanha...');
        
        // Buscar um business_id válido
        const businessResponse = await fetch(`${baseUrl}/api/supabase/businesses`);
        const businessData = await businessResponse.json();
        
        if (businessData.success && businessData.data.length > 0) {
          const testCampaign = {
            title: 'Campanha Teste - Página',
            business_id: businessData.data[0].id,
            month: 'Teste',
            description: 'Campanha criada via teste da página',
            budget: 2000,
            status: 'Reunião de briefing'
          };
          
          const createResponse = await fetch(`${baseUrl}/api/supabase/campaigns`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(testCampaign)
          });
          
          if (createResponse.ok) {
            const createData = await createResponse.json();
            if (createData.success) {
              console.log('✅ Criação de campanha funcionando');
              console.log(`  - ID criado: ${createData.data.id}`);
            } else {
              console.error('❌ Erro na criação:', createData.error);
            }
          } else {
            console.log('⚠️ Erro na requisição de criação');
          }
        } else {
          console.log('⚠️ Não foi possível testar criação - nenhum business encontrado');
        }
        
        // 5. Verificar compatibilidade com o formato esperado
        console.log('\n🔍 Verificando compatibilidade com o frontend...');
        
        const requiredFields = [
          'id', 'nome', 'businessName', 'mes', 'status', 'totalCriadores'
        ];
        
        const missingFields = requiredFields.filter(field => !(field in firstCampaign));
        
        if (missingFields.length === 0) {
          console.log('✅ Estrutura de dados compatível com o frontend');
        } else {
          console.log('⚠️ Campos faltando:', missingFields);
        }
        
        // 6. Testar estatísticas
        console.log('\n📊 Testando estatísticas...');
        
        const totalCampaigns = campaigns.length;
        const activeCampaigns = campaigns.filter((c: any) => c.status === 'Ativa' || c.status === 'Reunião de briefing').length;
        const totalCreators = campaigns.reduce((sum: number, c: any) => sum + (c.totalCriadores || 0), 0);
        const uniqueBusinesses = [...new Set(campaigns.map((c: any) => c.businessName))].length;
        const uniqueMonths = [...new Set(campaigns.map((c: any) => c.mes))].length;
        
        console.log(`✅ Estatísticas calculadas:`);
        console.log(`  - Total de campanhas: ${totalCampaigns}`);
        console.log(`  - Campanhas ativas: ${activeCampaigns}`);
        console.log(`  - Total de criadores: ${totalCreators}`);
        console.log(`  - Negócios únicos: ${uniqueBusinesses}`);
        console.log(`  - Meses únicos: ${uniqueMonths}`);
        
      }
    } else {
      console.error('❌ API falhou:', data.error);
    }
    
    console.log('\n✅ Teste da página de campanhas concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

if (require.main === module) {
  testCampaignsPage()
    .then(() => {
      console.log('\n🎉 Teste finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testCampaignsPage };
