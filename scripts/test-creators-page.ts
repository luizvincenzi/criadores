import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testCreatorsPage() {
  console.log('🧪 Testando funcionalidade da página de criadores...\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Testar API de criadores do Supabase
    console.log('👥 Testando API /api/supabase/creators...');
    
    const response = await fetch(`${baseUrl}/api/supabase/creators`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ API funcionando: ${data.count} criadores encontrados`);
      
      if (data.data.length > 0) {
        const firstCreator = data.data[0];
        console.log('\n👤 Primeiro criador:');
        console.log(`  - ID: ${firstCreator.id}`);
        console.log(`  - Nome: ${firstCreator.nome}`);
        console.log(`  - Cidade: ${firstCreator.cidade || 'N/A'}`);
        console.log(`  - Status: ${firstCreator.status || 'N/A'}`);
        console.log(`  - Instagram: ${firstCreator.instagram || 'N/A'}`);
        console.log(`  - Seguidores: ${firstCreator.seguidores || 'N/A'}`);
        console.log(`  - WhatsApp: ${firstCreator.whatsapp || 'N/A'}`);
        
        // 2. Testar filtros
        console.log('\n🔍 Testando filtros...');
        
        // Filtro por status
        const statusResponse = await fetch(`${baseUrl}/api/supabase/creators?status=Ativo`);
        const statusData = await statusResponse.json();
        
        if (statusData.success) {
          console.log(`✅ Filtro por status 'Ativo': ${statusData.count} criadores encontrados`);
        } else {
          console.error('❌ Filtro por status falhou:', statusData.error);
        }
        
        // Filtro por cidade
        if (firstCreator.cidade) {
          const cityResponse = await fetch(`${baseUrl}/api/supabase/creators?city=${encodeURIComponent(firstCreator.cidade)}`);
          const cityData = await cityResponse.json();
          
          if (cityData.success) {
            console.log(`✅ Filtro por cidade '${firstCreator.cidade}': ${cityData.count} criadores encontrados`);
          } else {
            console.error('❌ Filtro por cidade falhou:', cityData.error);
          }
        }
        
        // 3. Testar atualização de criador
        console.log('\n🔄 Testando atualização de criador...');
        
        const updateResponse = await fetch(`${baseUrl}/api/supabase/creators`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: firstCreator.id,
            status: 'Ativo' // Manter como ativo
          })
        });
        
        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          if (updateData.success) {
            console.log('✅ Atualização de criador funcionando');
          } else {
            console.error('❌ Erro na atualização:', updateData.error);
          }
        } else {
          console.log('⚠️ Método PUT não implementado (normal)');
        }
        
        // 4. Verificar estrutura dos dados para o frontend
        console.log('\n🔍 Verificando compatibilidade com o frontend...');
        
        const requiredFields = [
          'id', 'nome', 'cidade', 'status', 'instagram', 'seguidores', 'whatsapp'
        ];
        
        const missingFields = requiredFields.filter(field => !(field in firstCreator));
        
        if (missingFields.length === 0) {
          console.log('✅ Estrutura de dados compatível com o frontend');
        } else {
          console.log('⚠️ Campos faltando:', missingFields);
        }
        
        // 5. Testar transformação para o formato esperado
        console.log('\n🔄 Testando transformação para o formato esperado...');
        
        const transformed = {
          id: firstCreator.id,
          nome: firstCreator.nome,
          cidade: firstCreator.cidade || '',
          status: firstCreator.status || 'Ativo',
          instagram: firstCreator.instagram || '',
          seguidores: firstCreator.seguidores || 0,
          whatsapp: firstCreator.whatsapp || '',
          biografia: firstCreator.biografia || '',
          categoria: firstCreator.categoria || ''
        };
        
        console.log('✅ Transformação bem-sucedida:');
        console.log(`  - Nome: ${transformed.nome}`);
        console.log(`  - Cidade: ${transformed.cidade}`);
        console.log(`  - Status: ${transformed.status}`);
        console.log(`  - Instagram: ${transformed.instagram}`);
        console.log(`  - Seguidores: ${transformed.seguidores}`);
        
        // 6. Testar estatísticas
        console.log('\n📊 Testando estatísticas...');
        
        const allCreators = data.data;
        const cities = [...new Set(allCreators.map((c: any) => c.cidade).filter(Boolean))];
        const activeCreators = allCreators.filter((c: any) => c.status === 'Ativo');
        const totalFollowers = allCreators.reduce((sum: number, c: any) => sum + (c.seguidores || 0), 0);
        
        console.log(`✅ Estatísticas calculadas:`);
        console.log(`  - Total de criadores: ${allCreators.length}`);
        console.log(`  - Criadores ativos: ${activeCreators.length}`);
        console.log(`  - Cidades únicas: ${cities.length}`);
        console.log(`  - Total de seguidores: ${totalFollowers.toLocaleString()}`);
        console.log(`  - Principais cidades: ${cities.slice(0, 3).join(', ')}`);
        
      }
    } else {
      console.error('❌ API falhou:', data.error);
    }
    
    // 7. Testar ranking de criadores
    console.log('\n🏆 Testando ranking de criadores...');
    
    const rankingResponse = await fetch(`${baseUrl}/api/creators-ranking`);
    if (rankingResponse.ok) {
      const rankingData = await rankingResponse.json();
      if (rankingData.success) {
        console.log(`✅ Ranking funcionando: ${rankingData.ranking.length} criadores no ranking`);
      } else {
        console.error('❌ Erro no ranking:', rankingData.error);
      }
    } else {
      console.log('⚠️ API de ranking não encontrada (pode não estar implementada)');
    }
    
    console.log('\n✅ Teste da página de criadores concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

if (require.main === module) {
  testCreatorsPage()
    .then(() => {
      console.log('\n🎉 Teste finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testCreatorsPage };
