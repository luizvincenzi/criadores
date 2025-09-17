// Script para testar sistema de notificações
// Execute: npx tsx scripts/test-notifications.ts

async function testNotifications() {
  console.log('🔔 Testando sistema de notificações...');

  // Dados de teste
  const testLeadData = {
    name: 'João Teste',
    email: 'joao@teste.com',
    whatsapp: '11999888777',
    instagram: '@joaoteste',
    userType: 'empresa',
    businessName: 'Empresa Teste Ltda',
    businessSegment: 'alimentacao',
    businessGoal: 'vendas',
    hasWorkedWithInfluencers: 'sim'
  };

  const testBusinessId = 'test-business-id-123';
  const testLeadId = 'CRI999999';

  try {
    console.log('📤 Enviando notificação de teste...');

    const response = await fetch('http://localhost:3000/api/notifications/new-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadData: testLeadData,
        businessId: testBusinessId,
        leadId: testLeadId,
        source: 'test'
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Notificação enviada com sucesso!');
      console.log('📋 Resposta:', result);
    } else {
      console.log('❌ Erro ao enviar notificação:', result);
    }

  } catch (error) {
    console.log('❌ Erro na requisição:', error);
  }

  // Testar endpoint GET
  console.log('\n📋 Testando endpoint GET...');

  try {
    const getResponse = await fetch('http://localhost:3000/api/notifications/new-lead');
    const getResult = await getResponse.json();

    console.log('✅ Endpoint GET funcionando:');
    console.log('📋 Configurações:', getResult);

  } catch (error) {
    console.log('❌ Erro no GET:', error);
  }

  console.log('\n🎉 Teste de notificações finalizado!');
  console.log('\n📝 Para configurar notificações reais:');
  console.log('1. Discord: Crie um webhook em um canal do Discord');
  console.log('2. Slack: Crie um webhook em um canal do Slack');
  console.log('3. Zapier: Crie um webhook trigger no Zapier');
  console.log('4. Adicione as URLs no arquivo .env.local');
  console.log('\nExemplo no .env.local:');
  console.log('DISCORD_NEW_LEAD_WEBHOOK=https://discord.com/api/webhooks/...');
  console.log('SLACK_NEW_LEAD_WEBHOOK=https://hooks.slack.com/services/...');
  console.log('ZAPIER_NEW_LEAD_WEBHOOK=https://hooks.zapier.com/hooks/catch/...');
}

// Executar teste
testNotifications().catch(console.error);
