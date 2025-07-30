// Teste para verificar se o businessId está sendo retornado nas campanhas

const BASE_URL = 'http://localhost:3002';

async function testCampaignBusinessId() {
    console.log('🔍 Testando businessId nas campanhas...');
    
    try {
        // 1. Buscar todas as campanhas
        const campaignsResponse = await fetch(`${BASE_URL}/api/supabase/campaigns`);
        const campaignsData = await campaignsResponse.json();
        
        if (!campaignsData.success) {
            throw new Error('Erro ao buscar campanhas');
        }
        
        console.log('📊 Total de campanhas encontradas:', campaignsData.data.length);
        
        // 2. Verificar campanhas do Auto Posto Bela Suíça
        const autoPostoCampaigns = campaignsData.data.filter(c => 
            c.businessName && c.businessName.toLowerCase().includes('auto posto bela')
        );
        
        console.log('🏢 Campanhas do Auto Posto Bela Suíça:', autoPostoCampaigns.length);
        
        autoPostoCampaigns.forEach((campaign, index) => {
            console.log(`📋 Campanha ${index + 1}:`, {
                id: campaign.id,
                title: campaign.title || campaign.nome,
                businessName: campaign.businessName,
                businessId: campaign.businessId,
                month: campaign.month || campaign.mes,
                hasBusinessId: !!campaign.businessId
            });
        });
        
        // 3. Se não tem businessId, vamos verificar o que está acontecendo
        const campaignWithoutBusinessId = autoPostoCampaigns.find(c => !c.businessId);
        
        if (campaignWithoutBusinessId) {
            console.log('⚠️ Campanha sem businessId encontrada:', campaignWithoutBusinessId.id);
            
            // Buscar dados específicos desta campanha
            const specificResponse = await fetch(`${BASE_URL}/api/supabase/campaigns?campaignId=${campaignWithoutBusinessId.id}`);
            const specificData = await specificResponse.json();
            
            console.log('🔍 Dados específicos da campanha:', {
                success: specificData.success,
                businessData: specificData.data?.[0]?.business,
                businessId: specificData.data?.[0]?.businessId
            });
        }
        
        // 4. Verificar se existe a empresa no banco
        const businessResponse = await fetch(`${BASE_URL}/api/supabase/businesses`);
        const businessData = await businessResponse.json();
        
        const autoPostoBusiness = businessData.data?.find(b => 
            b.name.toLowerCase().includes('auto posto bela')
        );
        
        if (autoPostoBusiness) {
            console.log('✅ Empresa encontrada no banco:', {
                id: autoPostoBusiness.id,
                name: autoPostoBusiness.name
            });
            
            // Verificar se as campanhas estão linkadas corretamente
            const linkedCampaigns = campaignsData.data.filter(c => c.businessId === autoPostoBusiness.id);
            console.log('🔗 Campanhas linkadas com esta empresa:', linkedCampaigns.length);
        } else {
            console.log('❌ Empresa Auto Posto Bela Suíça não encontrada no banco');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar teste se estiver no Node.js
if (typeof window === 'undefined') {
    testCampaignBusinessId();
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
    window.testCampaignBusinessId = testCampaignBusinessId;
}
