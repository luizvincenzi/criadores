// Teste específico para a API de businesses por ID

const BASE_URL = 'http://localhost:3002';
const AUTO_POSTO_ID = '5032df40-0e0d-4949-8507-804f60000000';

async function testBusinessApi() {
    console.log('🧪 Testando API de businesses por ID...');
    
    try {
        // 1. Testar busca por ID específico
        console.log('🔍 Testando busca por ID:', AUTO_POSTO_ID);
        
        const response = await fetch(`${BASE_URL}/api/supabase/businesses?id=${encodeURIComponent(AUTO_POSTO_ID)}`);
        console.log('📡 Status da resposta:', response.status);
        
        const data = await response.json();
        console.log('📊 Resposta da API:', {
            success: data.success,
            dataLength: data.data?.length,
            error: data.error
        });
        
        if (data.success && data.data && data.data.length > 0) {
            const business = data.data[0];
            console.log('✅ Empresa encontrada:', {
                id: business.id,
                name: business.name,
                apresentacao_empresa_preview: business.apresentacao_empresa?.substring(0, 100) + '...',
                apresentacao_empresa_full: business.apresentacao_empresa
            });
            
            // Verificar se tem dados de teste
            if (business.apresentacao_empresa?.includes('teste')) {
                console.log('⚠️ PROBLEMA: Apresentação da empresa contém dados de teste!');
                console.log('📝 Conteúdo atual:', business.apresentacao_empresa);
            } else if (business.apresentacao_empresa?.includes('Posto Bela Suíça')) {
                console.log('✅ Apresentação da empresa está correta!');
            } else {
                console.log('❓ Apresentação da empresa tem conteúdo inesperado');
                console.log('📝 Conteúdo:', business.apresentacao_empresa);
            }
        } else {
            console.log('❌ Empresa não encontrada ou erro na API');
        }
        
        // 2. Testar busca geral para comparar
        console.log('\n🔍 Testando busca geral para comparar...');
        
        const generalResponse = await fetch(`${BASE_URL}/api/supabase/businesses`);
        const generalData = await generalResponse.json();
        
        if (generalData.success) {
            const autoPostoFromGeneral = generalData.data.find(b => b.id === AUTO_POSTO_ID);
            
            if (autoPostoFromGeneral) {
                console.log('✅ Empresa encontrada na busca geral:', {
                    id: autoPostoFromGeneral.id,
                    name: autoPostoFromGeneral.name,
                    apresentacao_empresa_preview: autoPostoFromGeneral.apresentacao_empresa?.substring(0, 100) + '...'
                });
                
                // Comparar os dois resultados
                const specificResult = data.data?.[0];
                if (specificResult && autoPostoFromGeneral.apresentacao_empresa === specificResult.apresentacao_empresa) {
                    console.log('✅ Resultados são consistentes entre busca específica e geral');
                } else {
                    console.log('⚠️ Resultados diferem entre busca específica e geral');
                    console.log('Específica:', specificResult?.apresentacao_empresa?.substring(0, 50));
                    console.log('Geral:', autoPostoFromGeneral.apresentacao_empresa?.substring(0, 50));
                }
            } else {
                console.log('❌ Empresa não encontrada na busca geral');
            }
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar teste se estiver no Node.js
if (typeof window === 'undefined') {
    testBusinessApi();
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
    window.testBusinessApi = testBusinessApi;
}
