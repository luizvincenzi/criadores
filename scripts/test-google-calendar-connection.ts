import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });

async function testGoogleCalendarConnection() {
  try {
    console.log('🧪 TESTANDO CONEXÃO COM GOOGLE CALENDAR');
    console.log('======================================\n');

    // 1. Verificar variáveis de ambiente
    console.log('🔧 Verificando configurações...');
    
    const requiredEnvs = [
      'GOOGLE_CLIENT_EMAIL',
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_CALENDAR_ID'
    ];

    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    
    if (missingEnvs.length > 0) {
      console.error('❌ Variáveis de ambiente faltando:', missingEnvs);
      return false;
    }

    console.log('✅ Configurações encontradas:');
    console.log(`   • Email: ${process.env.GOOGLE_CLIENT_EMAIL}`);
    console.log(`   • Calendar ID: ${process.env.GOOGLE_CALENDAR_ID?.substring(0, 20)}...`);
    console.log(`   • Private Key: ${process.env.GOOGLE_PRIVATE_KEY ? 'Configurada' : 'Não encontrada'}`);

    // 2. Configurar autenticação
    console.log('\n🔐 Configurando autenticação...');
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const authClient = await auth.getClient();
    console.log('✅ Cliente de autenticação criado');

    // 3. Criar cliente do Google Calendar
    console.log('\n📅 Criando cliente do Google Calendar...');
    
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    console.log('✅ Cliente do Google Calendar criado');

    // 4. Testar acesso ao calendário
    console.log('\n🔍 Testando acesso ao calendário...');
    
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    
    try {
      const calendarInfo = await calendar.calendars.get({
        calendarId: calendarId,
      });

      console.log('✅ Acesso ao calendário confirmado!');
      console.log(`   • Nome: ${calendarInfo.data.summary}`);
      console.log(`   • Descrição: ${calendarInfo.data.description || 'Nenhuma'}`);
      console.log(`   • Timezone: ${calendarInfo.data.timeZone}`);
    } catch (calendarError: any) {
      console.error('❌ Erro ao acessar calendário:', calendarError.message);
      
      if (calendarError.code === 404) {
        console.log('💡 Dica: Verifique se o Calendar ID está correto');
        console.log('💡 Dica: Verifique se o Service Account tem acesso ao calendário');
      } else if (calendarError.code === 403) {
        console.log('💡 Dica: Service Account não tem permissão para acessar este calendário');
        console.log('💡 Solução: Compartilhe o calendário com o email do Service Account');
      }
      
      return false;
    }

    // 5. Testar criação de evento
    console.log('\n🧪 Testando criação de evento...');
    
    const testEvent = {
      summary: '🧪 Teste de Integração CRM Criadores',
      description: 'Este é um evento de teste criado pelo sistema CRM Criadores para verificar a integração com Google Calendar.',
      start: {
        dateTime: new Date(Date.now() + 60000).toISOString(), // 1 minuto no futuro
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: new Date(Date.now() + 120000).toISOString(), // 2 minutos no futuro
        timeZone: 'America/Sao_Paulo',
      },
      colorId: '2', // Verde
    };

    try {
      const response = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: testEvent,
      });

      console.log('✅ Evento de teste criado com sucesso!');
      console.log(`   • Event ID: ${response.data.id}`);
      console.log(`   • Link: ${response.data.htmlLink}`);

      // 6. Remover evento de teste
      console.log('\n🧹 Removendo evento de teste...');
      
      await calendar.events.delete({
        calendarId: calendarId,
        eventId: response.data.id!,
      });

      console.log('✅ Evento de teste removido');

    } catch (eventError: any) {
      console.error('❌ Erro ao criar evento de teste:', eventError.message);
      
      if (eventError.code === 403) {
        console.log('💡 Dica: Service Account não tem permissão para criar eventos');
        console.log('💡 Solução: Compartilhe o calendário com permissão de edição');
      }
      
      return false;
    }

    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ A integração com Google Calendar está funcionando perfeitamente');
    console.log('🚀 O sistema está pronto para agendar tarefas no calendário');

    return true;

  } catch (error: any) {
    console.error('❌ Erro fatal no teste:', error.message);
    
    if (error.message.includes('DECODER routines')) {
      console.log('💡 Problema na chave privada do Google');
      console.log('💡 Verifique se a GOOGLE_PRIVATE_KEY está formatada corretamente');
    }
    
    return false;
  }
}

// Executar teste
testGoogleCalendarConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ INTEGRAÇÃO FUNCIONANDO!');
      process.exit(0);
    } else {
      console.log('\n❌ PROBLEMAS ENCONTRADOS');
      console.log('🔧 Corrija os problemas acima e execute novamente');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
