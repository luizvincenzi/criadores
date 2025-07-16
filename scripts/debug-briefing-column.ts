import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function debugBriefingColumn() {
  console.log('🔍 DEBUGANDO COLUNA BRIEFING_DETAILS\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Testar inserção simples sem briefing_details
    console.log('🧪 1. TESTANDO INSERÇÃO SEM BRIEFING_DETAILS...');
    
    const simpleCampaignData = {
      business_id: '5032df40-0e0d-4949-8507-804f60000000',
      title: 'Teste Simples - ' + new Date().toISOString().slice(0, 19),
      description: 'Teste sem briefing_details',
      month: 'julho/2025',
      budget: 1000,
      quantidade_criadores: 1,
      objectives: {
        primary: 'Teste simples',
        secondary: [],
        kpis: { reach: 0, engagement: 0, conversions: 0 }
      },
      deliverables: {
        posts: 1,
        stories: 1,
        reels: 1
      }
      // SEM briefing_details
    };
    
    const simpleResponse = await fetch(`${baseUrl}/api/supabase/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simpleCampaignData)
    });
    
    const simpleResult = await simpleResponse.json();
    
    if (simpleResult.success) {
      console.log('✅ Inserção simples funcionou!');
      console.log(`📋 ID: ${simpleResult.data.campaign.id}`);
    } else {
      console.log('❌ Erro na inserção simples:', simpleResult.error);
    }
    
    // 2. Testar inserção com briefing_details
    console.log('\n🧪 2. TESTANDO INSERÇÃO COM BRIEFING_DETAILS...');
    
    const fullCampaignData = {
      business_id: '5032df40-0e0d-4949-8507-804f60000000',
      title: 'Teste Completo - ' + new Date().toISOString().slice(0, 19),
      description: 'Teste com briefing_details',
      month: 'julho/2025',
      budget: 1000,
      quantidade_criadores: 1,
      objectives: {
        primary: 'Teste completo',
        secondary: [],
        kpis: { reach: 0, engagement: 0, conversions: 0 }
      },
      deliverables: {
        posts: 1,
        stories: 1,
        reels: 1
      },
      briefing_details: {
        formatos: ['Reels'],
        perfil_criador: 'Teste',
        objetivo_detalhado: 'Teste completo',
        comunicacao_secundaria: 'Teste',
        datas_gravacao: {
          data_inicio: '2025-07-20',
          data_fim: '2025-07-25',
          horarios_preferenciais: [],
          observacoes: 'Teste'
        },
        roteiro_video: {
          o_que_falar: 'Teste',
          historia: 'Teste',
          promocao_cta: 'Teste',
          tom_comunicacao: 'Casual',
          pontos_obrigatorios: []
        },
        requisitos_tecnicos: {
          duracao_video: '60s',
          qualidade: 'HD',
          formato_entrega: 'MP4',
          hashtags_obrigatorias: []
        }
      }
    };
    
    const fullResponse = await fetch(`${baseUrl}/api/supabase/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullCampaignData)
    });
    
    const fullResult = await fullResponse.json();
    
    if (fullResult.success) {
      console.log('✅ Inserção completa funcionou!');
      console.log(`📋 ID: ${fullResult.data.campaign.id}`);
    } else {
      console.log('❌ Erro na inserção completa:', fullResult.error);
      
      // Analisar o erro específico
      if (fullResult.error.includes('briefing_details')) {
        console.log('🔍 Erro relacionado ao briefing_details detectado');
        console.log('📝 Detalhes do erro:', fullResult.error);
      }
    }
    
    // 3. Verificar campanhas existentes
    console.log('\n📊 3. VERIFICANDO CAMPANHAS EXISTENTES...');
    
    const campaignsResponse = await fetch(`${baseUrl}/api/supabase/campaigns`);
    const campaignsResult = await campaignsResponse.json();
    
    if (campaignsResult.success) {
      console.log(`✅ ${campaignsResult.data.length} campanhas encontradas`);
      
      if (campaignsResult.data.length > 0) {
        const sampleCampaign = campaignsResult.data[0];
        
        console.log('🔍 ESTRUTURA DA PRIMEIRA CAMPANHA:');
        console.log('📋 Campos disponíveis:');
        Object.keys(sampleCampaign).forEach(key => {
          const value = sampleCampaign[key];
          const type = typeof value;
          const hasValue = value !== null && value !== undefined;
          console.log(`   ${hasValue ? '✅' : '❌'} ${key} (${type})`);
        });
        
        // Verificar especificamente briefing_details
        if (sampleCampaign.hasOwnProperty('briefing_details')) {
          console.log('\n🎯 BRIEFING_DETAILS ENCONTRADO:');
          console.log('📋 Conteúdo:', JSON.stringify(sampleCampaign.briefing_details, null, 2));
        } else {
          console.log('\n❌ BRIEFING_DETAILS NÃO ENCONTRADO na resposta da API');
        }
      }
    } else {
      console.log('❌ Erro ao buscar campanhas:', campaignsResult.error);
    }
    
    // 4. Diagnóstico final
    console.log('\n🏆 4. DIAGNÓSTICO FINAL...');
    
    const simpleWorked = simpleResult.success;
    const fullWorked = fullResult.success;
    
    console.log('📊 RESULTADOS DOS TESTES:');
    console.log(`   ${simpleWorked ? '✅' : '❌'} Inserção simples (sem briefing_details)`);
    console.log(`   ${fullWorked ? '✅' : '❌'} Inserção completa (com briefing_details)`);
    
    if (simpleWorked && !fullWorked) {
      console.log('\n🔍 PROBLEMA IDENTIFICADO:');
      console.log('O erro está especificamente relacionado ao campo briefing_details');
      console.log('Possíveis causas:');
      console.log('1. Estrutura do JSON não compatível');
      console.log('2. Validação de schema no Supabase');
      console.log('3. Tipo de dados incorreto');
      
      console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
      console.log('1. Simplificar estrutura do briefing_details');
      console.log('2. Verificar schema no Supabase Dashboard');
      console.log('3. Usar estrutura mais simples temporariamente');
      
    } else if (fullWorked) {
      console.log('\n✅ TUDO FUNCIONANDO:');
      console.log('O problema pode ter sido resolvido ou ser intermitente');
      console.log('Teste novamente no frontend');
      
    } else {
      console.log('\n❌ PROBLEMA MAIS AMPLO:');
      console.log('O erro não está relacionado apenas ao briefing_details');
      console.log('Verificar configuração geral do Supabase');
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
}

if (require.main === module) {
  debugBriefingColumn()
    .then(() => {
      console.log('\n🎉 Debug da coluna briefing_details concluído');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Debug falhou:', error);
      process.exit(1);
    });
}

export { debugBriefingColumn };
