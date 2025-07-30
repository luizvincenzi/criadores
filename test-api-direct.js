// Teste direto das APIs para debug dos problemas

const BASE_URL = 'http://localhost:3002';

async function testApresentacaoEmpresa() {
    console.log('🏢 Testando apresentacao_empresa...');
    
    try {
        // 1. Buscar empresas
        const businessResponse = await fetch(`${BASE_URL}/api/supabase/businesses`);
        const businessData = await businessResponse.json();
        
        if (!businessData.success || !businessData.data || businessData.data.length === 0) {
            throw new Error('Nenhuma empresa encontrada');
        }
        
        const business = businessData.data[0];
        console.log('🏢 Empresa encontrada:', {
            id: business.id,
            name: business.name,
            apresentacao_empresa_atual: business.apresentacao_empresa
        });
        
        // 2. Atualizar apresentacao_empresa
        const textoTeste = `Apresentação de teste - ${new Date().toISOString()}`;
        const updatePayload = {
            id: business.id,
            apresentacao_empresa: textoTeste
        };
        
        console.log('📤 Enviando atualização:', updatePayload);
        
        const updateResponse = await fetch(`${BASE_URL}/api/supabase/businesses`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePayload)
        });
        
        const updateResult = await updateResponse.json();
        console.log('📥 Resultado da atualização:', updateResult);
        
        // 3. Verificar se foi salvo
        const verifyResponse = await fetch(`${BASE_URL}/api/supabase/businesses?id=${business.id}`);
        const verifyData = await verifyResponse.json();
        
        console.log('🔍 Verificação após salvamento:', {
            success: verifyData.success,
            apresentacao_empresa: verifyData.data?.[0]?.apresentacao_empresa
        });
        
        if (verifyData.data?.[0]?.apresentacao_empresa === textoTeste) {
            console.log('✅ Apresentação da empresa salva com sucesso!');
        } else {
            console.log('❌ Apresentação da empresa NÃO foi salva corretamente');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste de apresentacao_empresa:', error);
    }
}

async function testObjectivePrincipal() {
    console.log('🎯 Testando objective principal...');
    
    try {
        // 1. Buscar campanhas
        const campaignResponse = await fetch(`${BASE_URL}/api/supabase/campaigns`);
        const campaignData = await campaignResponse.json();
        
        if (!campaignData.success || !campaignData.data || campaignData.data.length === 0) {
            throw new Error('Nenhuma campanha encontrada');
        }
        
        const campaign = campaignData.data[0];
        console.log('📋 Campanha encontrada:', {
            id: campaign.id,
            title: campaign.title,
            objectives_atual: campaign.objectives
        });
        
        // 2. Atualizar objectives
        const objetivoTeste = `Objetivo de teste - ${new Date().toISOString()}`;
        const updatePayload = {
            id: campaign.id,
            objectives: objetivoTeste,
            comunicacaoSecundaria: 'Comunicação secundária de teste'
        };
        
        console.log('📤 Enviando atualização:', updatePayload);
        
        const updateResponse = await fetch(`${BASE_URL}/api/supabase/campaigns`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePayload)
        });
        
        const updateResult = await updateResponse.json();
        console.log('📥 Resultado da atualização:', updateResult);
        
        // 3. Verificar se foi salvo
        const verifyResponse = await fetch(`${BASE_URL}/api/supabase/campaigns?campaignId=${campaign.id}`);
        const verifyData = await verifyResponse.json();
        
        console.log('🔍 Verificação após salvamento:', {
            success: verifyData.success,
            objectives: verifyData.data?.[0]?.objectives
        });
        
        if (verifyData.data?.[0]?.objectives?.primary === objetivoTeste) {
            console.log('✅ Objetivo principal salvo com sucesso!');
        } else {
            console.log('❌ Objetivo principal NÃO foi salvo corretamente');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste de objective principal:', error);
    }
}

async function runTests() {
    console.log('🧪 Iniciando testes das APIs...');
    
    await testApresentacaoEmpresa();
    console.log('\n' + '='.repeat(50) + '\n');
    await testObjectivePrincipal();
    
    console.log('\n🏁 Testes concluídos!');
}

// Executar testes se estiver no Node.js
if (typeof window === 'undefined') {
    runTests();
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
    window.testApresentacaoEmpresa = testApresentacaoEmpresa;
    window.testObjectivePrincipal = testObjectivePrincipal;
    window.runTests = runTests;
}
