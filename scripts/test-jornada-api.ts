import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function testJornadaAPI() {
  console.log('🧪 Testando API jornada-tasks...');

  const baseUrl = 'http://localhost:3002';
  
  try {
    // Teste 1: GET - Listar tarefas
    console.log('\n1️⃣ Testando GET /api/jornada-tasks...');
    
    const getResponse = await fetch(`${baseUrl}/api/jornada-tasks`);
    console.log('Status:', getResponse.status);
    console.log('Headers:', Object.fromEntries(getResponse.headers.entries()));
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET funcionou:', data);
    } else {
      const text = await getResponse.text();
      console.log('❌ GET falhou:', text.substring(0, 200));
    }

    // Teste 2: POST - Criar tarefa
    console.log('\n2️⃣ Testando POST /api/jornada-tasks...');
    
    const taskData = {
      title: 'Teste API',
      description: 'Tarefa de teste da API',
      business_name: 'Empresa Teste',
      campaign_month: 'Janeiro 2025',
      journey_stage: 'Reunião de briefing',
      priority: 'medium',
      metadata: {
        related_to: 'geral'
      }
    };

    const postResponse = await fetch(`${baseUrl}/api/jornada-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData)
    });

    console.log('Status:', postResponse.status);
    
    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log('✅ POST funcionou:', data);
      
      // Limpar tarefa de teste
      if (data.task?.id) {
        console.log('\n🗑️ Limpando tarefa de teste...');
        const deleteResponse = await fetch(`${baseUrl}/api/jornada-tasks?id=${data.task.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log('✅ Tarefa de teste removida');
        }
      }
    } else {
      const text = await postResponse.text();
      console.log('❌ POST falhou:', text.substring(0, 500));
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testJornadaAPI();
