// Teste para verificar os dados da empresa "Auto Posto Bela Suíça"

const BASE_URL = 'http://localhost:3002';

async function testAutoPostoBelaData() {
    console.log('🏢 Testando dados do Auto Posto Bela Suíça...');
    
    try {
        // 1. Buscar todas as empresas
        const allBusinessResponse = await fetch(`${BASE_URL}/api/supabase/businesses`);
        const allBusinessData = await allBusinessResponse.json();
        
        if (!allBusinessData.success) {
            throw new Error('Erro ao buscar empresas');
        }
        
        // 2. Encontrar Auto Posto Bela Suíça
        const autoPostoBela = allBusinessData.data.find(b => 
            b.name.toLowerCase().includes('auto posto bela') || 
            b.name.toLowerCase().includes('bela suíça')
        );
        
        if (!autoPostoBela) {
            console.log('❌ Auto Posto Bela Suíça não encontrado');
            console.log('📋 Empresas disponíveis:', allBusinessData.data.map(b => b.name));
            return;
        }
        
        console.log('✅ Auto Posto Bela Suíça encontrado:', {
            id: autoPostoBela.id,
            name: autoPostoBela.name,
            apresentacao_empresa: autoPostoBela.apresentacao_empresa
        });
        
        // 3. Buscar especificamente por ID
        const specificResponse = await fetch(`${BASE_URL}/api/supabase/businesses?id=${autoPostoBela.id}`);
        const specificData = await specificResponse.json();
        
        console.log('🔍 Dados específicos por ID:', {
            success: specificData.success,
            apresentacao_empresa: specificData.data?.[0]?.apresentacao_empresa
        });
        
        // 4. Verificar se tem o conteúdo correto
        const apresentacao = autoPostoBela.apresentacao_empresa;
        if (apresentacao && apresentacao.includes('Posto Bela Suíça')) {
            console.log('✅ Apresentação da empresa está correta!');
        } else if (apresentacao && apresentacao.includes('teste')) {
            console.log('⚠️ Apresentação da empresa contém dados de teste');
            console.log('📝 Conteúdo atual:', apresentacao);
            
            // Vamos corrigir com o conteúdo correto
            const conteudoCorreto = `No Posto Bela Suíça você encontra tudo o que precisa em um só lugar:
– Combustível Ipiranga premium, para seu carro render mais
– Padaria artesanal e conveniência 24h, com pães quentinhos o dia inteiro
– Cerveja sempre gelada e com preço imbatível, além de vinhos selecionados
– Troca de óleo rápida e profissional, sem complicação
– Ambiente familiar e acolhedor, cheio de boas histórias

Posto Bela Suíça: tradição de família, qualidade de rede e aquele atendimento que faz você se sentir em casa. Vem abastecer o tanque e a sua experiência com a gente! ⛽🍞🍻`;
            
            console.log('🔧 Corrigindo apresentação da empresa...');
            
            const updateResponse = await fetch(`${BASE_URL}/api/supabase/businesses`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: autoPostoBela.id,
                    apresentacao_empresa: conteudoCorreto
                })
            });
            
            const updateResult = await updateResponse.json();
            
            if (updateResult.success) {
                console.log('✅ Apresentação da empresa corrigida com sucesso!');
            } else {
                console.log('❌ Erro ao corrigir apresentação:', updateResult.error);
            }
        } else {
            console.log('⚠️ Apresentação da empresa está vazia ou com conteúdo inesperado');
            console.log('📝 Conteúdo atual:', apresentacao);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar teste se estiver no Node.js
if (typeof window === 'undefined') {
    testAutoPostoBelaData();
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
    window.testAutoPostoBelaData = testAutoPostoBelaData;
}
