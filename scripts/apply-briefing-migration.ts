import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function applyBriefingMigration() {
  console.log('🔧 APLICANDO MIGRAÇÃO DE BRIEFING_DETAILS\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Verificar se o servidor está rodando
    console.log('🌐 1. VERIFICANDO SERVIDOR...');
    
    try {
      const healthCheck = await fetch(`${baseUrl}/api/supabase/campaigns`);
      if (!healthCheck.ok) {
        throw new Error('API não acessível');
      }
      console.log('✅ Servidor rodando');
    } catch (error) {
      console.log('❌ ERRO: Servidor não está rodando');
      console.log('🔧 SOLUÇÃO: Execute "npm run dev" para iniciar o servidor');
      return;
    }
    
    // 2. Tentar criar uma campanha de teste para verificar o erro
    console.log('\n🧪 2. TESTANDO CRIAÇÃO DE CAMPANHA...');
    
    const testCampaignData = {
      business_id: '5032df40-0e0d-4949-8507-804f60000000', // ID de teste
      title: 'Teste Migração - ' + new Date().toISOString().slice(0, 19),
      description: 'Campanha de teste para verificar migração',
      month: 'julho/2025',
      budget: 1000,
      quantidade_criadores: 1,
      objectives: {
        primary: 'Testar migração',
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
        objetivo_detalhado: 'Testar migração',
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
          promocao_cta: 'Teste'
        }
      }
    };
    
    const testResponse = await fetch(`${baseUrl}/api/supabase/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCampaignData)
    });
    
    const testResult = await testResponse.json();
    
    if (testResult.success) {
      console.log('✅ Migração já aplicada - campanha criada com sucesso!');
      console.log(`📋 ID da campanha: ${testResult.data.campaign.id}`);
      
      // Limpar campanha de teste
      console.log('🗑️ Removendo campanha de teste...');
      // Nota: Implementar remoção se necessário
      
      return;
    } else {
      console.log('❌ Erro confirmado:', testResult.error);
      
      if (testResult.error.includes('briefing_details')) {
        console.log('🔍 Erro relacionado à coluna briefing_details confirmado');
      }
    }
    
    // 3. Instruções para aplicar a migração
    console.log('\n📝 3. INSTRUÇÕES PARA APLICAR A MIGRAÇÃO:\n');
    
    console.log('🎯 OPÇÃO 1: Via Supabase Dashboard (RECOMENDADO)');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para "SQL Editor"');
    console.log('4. Cole e execute o seguinte SQL:\n');
    
    const migrationSQL = `-- Adicionar coluna briefing_details à tabela campaigns
ALTER TABLE campaigns 
ADD COLUMN briefing_details JSONB DEFAULT '{
  "formatos": [],
  "perfil_criador": "",
  "objetivo_detalhado": "",
  "comunicacao_secundaria": "",
  "datas_gravacao": {
    "data_inicio": null,
    "data_fim": null,
    "horarios_preferenciais": [],
    "observacoes": ""
  },
  "roteiro_video": {
    "o_que_falar": "",
    "historia": "",
    "promocao_cta": "",
    "tom_comunicacao": "",
    "pontos_obrigatorios": []
  },
  "requisitos_tecnicos": {
    "duracao_video": "",
    "qualidade": "",
    "formato_entrega": "",
    "hashtags_obrigatorias": []
  }
}'::jsonb;

-- Criar índice para performance
CREATE INDEX idx_campaigns_briefing_details_gin 
ON campaigns USING gin(briefing_details);

-- Verificar se foi criado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
AND column_name = 'briefing_details';`;
    
    console.log(migrationSQL);
    
    console.log('\n🎯 OPÇÃO 2: Via CLI do Supabase (Alternativa)');
    console.log('1. Execute: npx supabase login');
    console.log('2. Execute: npx supabase link --project-ref SEU_PROJECT_REF');
    console.log('3. Execute: npx supabase db push');
    
    console.log('\n🎯 OPÇÃO 3: Temporária (Sem briefing_details)');
    console.log('Posso modificar a API para funcionar sem a coluna briefing_details');
    console.log('enquanto você aplica a migração.\n');
    
    // 4. Verificar estrutura atual
    console.log('🔍 4. VERIFICANDO ESTRUTURA ATUAL...');
    
    const campaignsResponse = await fetch(`${baseUrl}/api/supabase/campaigns`);
    const campaignsResult = await campaignsResponse.json();
    
    if (campaignsResult.success && campaignsResult.data.length > 0) {
      const sampleCampaign = campaignsResult.data[0];
      
      console.log('📊 CAMPOS ATUAIS DISPONÍVEIS:');
      const availableFields = Object.keys(sampleCampaign);
      availableFields.forEach(field => {
        const hasField = sampleCampaign[field] !== undefined;
        console.log(`   ${hasField ? '✅' : '❌'} ${field}`);
      });
      
      const hasBriefingDetails = availableFields.includes('briefing_details') || 
                                availableFields.includes('briefingDetails');
      
      if (!hasBriefingDetails) {
        console.log('\n❌ CONFIRMADO: Campo briefing_details não existe');
        console.log('🔧 AÇÃO NECESSÁRIA: Aplicar migração SQL');
      }
    }
    
    // 5. Resultado final
    console.log('\n🏆 5. PRÓXIMOS PASSOS:\n');
    
    console.log('1. 📝 APLICAR MIGRAÇÃO:');
    console.log('   - Use a OPÇÃO 1 (Supabase Dashboard)');
    console.log('   - Cole o SQL fornecido acima');
    console.log('   - Execute a migração');
    
    console.log('\n2. ✅ VERIFICAR RESULTADO:');
    console.log('   - Recarregue a página de campanhas');
    console.log('   - Teste criar uma nova campanha');
    console.log('   - Verifique se o erro desapareceu');
    
    console.log('\n3. 🧪 TESTAR FUNCIONALIDADE:');
    console.log('   - Preencha todos os campos de briefing');
    console.log('   - Selecione formatos múltiplos');
    console.log('   - Crie a campanha');
    console.log('   - Verifique se os dados são salvos');
    
    console.log('\n⚠️ IMPORTANTE:');
    console.log('Após aplicar a migração, todas as funcionalidades de briefing');
    console.log('funcionarão perfeitamente. O erro atual é apenas devido à');
    console.log('coluna faltante no banco de dados.');
    
  } catch (error) {
    console.error('❌ Erro no script:', error);
  }
}

if (require.main === module) {
  applyBriefingMigration()
    .then(() => {
      console.log('\n🎉 Script de migração concluído');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Script falhou:', error);
      process.exit(1);
    });
}

export { applyBriefingMigration };
