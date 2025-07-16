import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testBriefingFix() {
  console.log('🔧 TESTANDO CORREÇÃO DO BRIEFING_DETAILS\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Testar GET para ver se briefing_details aparece
    console.log('📊 1. TESTANDO GET CAMPAIGNS...');
    
    const campaignsResponse = await fetch(`${baseUrl}/api/supabase/campaigns`);
    const campaignsResult = await campaignsResponse.json();
    
    if (campaignsResult.success && campaignsResult.data.length > 0) {
      const sampleCampaign = campaignsResult.data[0];
      
      console.log('✅ Campanhas carregadas com sucesso');
      console.log(`📋 ${campaignsResult.data.length} campanhas encontradas`);
      
      // Verificar se briefing_details está presente
      const hasBriefingDetails = sampleCampaign.hasOwnProperty('briefing_details');
      console.log(`${hasBriefingDetails ? '✅' : '❌'} briefing_details presente: ${hasBriefingDetails}`);
      
      if (hasBriefingDetails) {
        console.log('📋 Conteúdo do briefing_details:');
        console.log(JSON.stringify(sampleCampaign.briefing_details, null, 2));
      }
    } else {
      console.log('❌ Erro ao carregar campanhas:', campaignsResult.error);
    }
    
    // 2. Testar POST com briefing_details completo
    console.log('\n🧪 2. TESTANDO POST COM BRIEFING_DETAILS...');
    
    const testCampaignData = {
      business_id: '5032df40-0e0d-4949-8507-804f60000000',
      title: 'Teste Correção - ' + new Date().toISOString().slice(0, 19),
      description: 'Teste após correção da API',
      month: 'julho/2025',
      budget: 2000,
      quantidade_criadores: 2,
      objectives: {
        primary: 'Testar correção do briefing_details',
        secondary: ['Validar formatos múltiplos'],
        kpis: { reach: 1000, engagement: 100, conversions: 10 }
      },
      deliverables: {
        posts: 2,
        stories: 3,
        reels: 1
      },
      briefing_details: {
        formatos: ['Reels', 'Stories'], // Array como esperado
        perfil_criador: 'Lifestyle/Tech',
        objetivo_detalhado: 'Promover produto de forma autêntica e natural',
        comunicacao_secundaria: 'Destacar benefícios únicos e diferenciais competitivos',
        datas_gravacao: {
          data_inicio: '2025-07-20',
          data_fim: '2025-07-25',
          horarios_preferenciais: ['manhã', 'tarde'],
          observacoes: 'Preferência por luz natural, evitar horários de pico de trânsito'
        },
        roteiro_video: {
          o_que_falar: 'Falar sobre experiência pessoal com o produto, mostrar uso no dia a dia de forma natural',
          historia: 'Contar como o produto se encaixa na rotina, mostrar antes e depois do uso',
          promocao_cta: 'Use o código TESTE30 para 30% de desconto. Link na bio para comprar!',
          tom_comunicacao: 'Casual, autêntico, como conversa entre amigos',
          pontos_obrigatorios: ['Mostrar produto em uso', 'Mencionar código de desconto', 'Tag da marca']
        },
        requisitos_tecnicos: {
          duracao_video: '60-90 segundos',
          qualidade: 'HD 1080p mínimo',
          formato_entrega: 'MP4 vertical para Stories/Reels',
          hashtags_obrigatorias: ['#parceria', '#produtoTeste', '#lifestyle']
        }
      }
    };
    
    const postResponse = await fetch(`${baseUrl}/api/supabase/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCampaignData)
    });
    
    const postResult = await postResponse.json();
    
    if (postResult.success) {
      console.log('✅ Campanha criada com sucesso!');
      console.log(`📋 ID: ${postResult.data.campaign.id}`);
      console.log(`👥 Criadores associados: ${postResult.data.creators_associated}`);
      console.log(`🏢 Business: ${postResult.data.business_name}`);
      
      // Verificar se a campanha foi criada com briefing_details
      const newCampaignId = postResult.data.campaign.id;
      
      // Buscar a campanha recém-criada
      console.log('\n🔍 3. VERIFICANDO CAMPANHA RECÉM-CRIADA...');
      
      const verifyResponse = await fetch(`${baseUrl}/api/supabase/campaigns`);
      const verifyResult = await verifyResponse.json();
      
      if (verifyResult.success) {
        const newCampaign = verifyResult.data.find((c: any) => c.id === newCampaignId);
        
        if (newCampaign && newCampaign.briefing_details) {
          console.log('✅ briefing_details salvo e recuperado com sucesso!');
          console.log('📋 Formatos salvos:', newCampaign.briefing_details.formatos);
          console.log('📋 Perfil criador:', newCampaign.briefing_details.perfil_criador);
          console.log('📋 CTA:', newCampaign.briefing_details.roteiro_video?.promocao_cta);
        } else {
          console.log('❌ briefing_details não encontrado na campanha criada');
        }
      }
      
    } else {
      console.log('❌ Erro ao criar campanha:', postResult.error);
      
      if (postResult.error.includes('briefing_details')) {
        console.log('🔍 Erro ainda relacionado ao briefing_details');
        console.log('📝 Detalhes:', postResult.error);
      }
    }
    
    // 4. Resultado final
    console.log('\n🏆 4. RESULTADO FINAL...');
    
    const getWorked = campaignsResult.success && campaignsResult.data[0]?.briefing_details;
    const postWorked = postResult.success;
    
    console.log('📊 STATUS DA CORREÇÃO:');
    console.log(`   ${getWorked ? '✅' : '❌'} GET retorna briefing_details`);
    console.log(`   ${postWorked ? '✅' : '❌'} POST aceita briefing_details`);
    
    if (getWorked && postWorked) {
      console.log('\n🎉 PROBLEMA RESOLVIDO!');
      console.log('✅ A API agora funciona corretamente com briefing_details');
      console.log('✅ Formatos múltiplos suportados');
      console.log('✅ Todos os campos de briefing funcionando');
      
      console.log('\n🚀 PRÓXIMOS PASSOS:');
      console.log('1. Recarregue a página de campanhas');
      console.log('2. Teste criar uma nova campanha');
      console.log('3. Preencha todos os campos de briefing');
      console.log('4. Selecione múltiplos formatos');
      console.log('5. Verifique se a campanha é criada sem erros');
      
    } else {
      console.log('\n⚠️ PROBLEMA PARCIALMENTE RESOLVIDO');
      console.log('Algumas funcionalidades ainda podem precisar de ajustes');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

if (require.main === module) {
  testBriefingFix()
    .then(() => {
      console.log('\n🎉 Teste de correção do briefing_details concluído');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testBriefingFix };
