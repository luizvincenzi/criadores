import dotenv from 'dotenv';
import { supabase } from '../lib/supabase';

dotenv.config({ path: '.env.local' });

async function addBriefingFields() {
  console.log('🔧 ADICIONANDO CAMPOS DE BRIEFING À TABELA CAMPAIGNS\n');
  
  try {
    // 1. Verificar se a coluna já existe
    console.log('🔍 1. VERIFICANDO SE A COLUNA JÁ EXISTE...');
    
    const { data: existingColumns, error: checkError } = await supabase
      .from('campaigns')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Erro ao verificar tabela:', checkError);
      return;
    }
    
    // Verificar se briefing_details já existe
    const hasColumn = existingColumns && existingColumns.length > 0 && 
                     existingColumns[0].hasOwnProperty('briefing_details');
    
    if (hasColumn) {
      console.log('✅ Campo briefing_details já existe na tabela');
    } else {
      console.log('⚠️ Campo briefing_details não existe - será necessário adicionar via SQL');
    }
    
    // 2. Tentar executar a migração via SQL (se possível)
    console.log('\n🛠️ 2. TENTANDO APLICAR MIGRAÇÃO...');
    
    const migrationSQL = `
      -- Adicionar campo briefing_details se não existir
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'campaigns' AND column_name = 'briefing_details'
        ) THEN
          ALTER TABLE campaigns 
          ADD COLUMN briefing_details JSONB DEFAULT '{
            "formato": "",
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
          
          -- Criar índice
          CREATE INDEX IF NOT EXISTS idx_campaigns_briefing_details_gin 
          ON campaigns USING gin(briefing_details);
          
          RAISE NOTICE 'Campo briefing_details adicionado com sucesso';
        ELSE
          RAISE NOTICE 'Campo briefing_details já existe';
        END IF;
      END $$;
    `;
    
    try {
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: migrationSQL });
      
      if (sqlError) {
        console.log('⚠️ Não foi possível executar SQL diretamente:', sqlError.message);
        console.log('📝 Execute manualmente no Supabase Dashboard:');
        console.log('\n' + migrationSQL);
      } else {
        console.log('✅ Migração SQL executada com sucesso');
      }
    } catch (error) {
      console.log('⚠️ Função exec_sql não disponível, tentando método alternativo...');
    }
    
    // 3. Verificar campanhas existentes
    console.log('\n📊 3. VERIFICANDO CAMPANHAS EXISTENTES...');
    
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, briefing_details')
      .limit(5);
    
    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
    } else {
      console.log(`✅ ${campaigns?.length || 0} campanhas encontradas`);
      
      if (campaigns && campaigns.length > 0) {
        console.log('📋 EXEMPLOS DE CAMPANHAS:');
        campaigns.forEach((campaign, index) => {
          const hasBriefing = campaign.briefing_details ? '✅' : '❌';
          console.log(`   ${index + 1}. ${campaign.title} ${hasBriefing}`);
        });
      }
    }
    
    // 4. Testar inserção com novos campos
    console.log('\n🧪 4. TESTANDO INSERÇÃO COM NOVOS CAMPOS...');
    
    const testCampaign = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      business_id: '5032df40-0e0d-4949-8507-804f60000000', // ID de teste
      title: 'Teste Briefing - ' + new Date().toISOString(),
      description: 'Campanha de teste para validar campos de briefing',
      month: 'julho/2025',
      budget: 1000,
      status: 'Reunião de briefing',
      objectives: {
        primary: 'Testar novos campos',
        secondary: [],
        kpis: { reach: 0, engagement: 0, conversions: 0 }
      },
      deliverables: {
        posts: 1,
        stories: 2,
        reels: 1,
        events: 0,
        requirements: []
      },
      briefing_details: {
        formato: 'Vídeo',
        perfil_criador: 'Lifestyle',
        objetivo_detalhado: 'Promover produto de forma natural',
        comunicacao_secundaria: 'Destacar benefícios únicos',
        datas_gravacao: {
          data_inicio: '2025-07-20',
          data_fim: '2025-07-25',
          horarios_preferenciais: ['manhã', 'tarde'],
          observacoes: 'Preferência por luz natural'
        },
        roteiro_video: {
          o_que_falar: 'Falar sobre experiência pessoal com o produto',
          historia: 'Contar como o produto mudou a rotina',
          promocao_cta: 'Use o código TESTE20 para 20% de desconto',
          tom_comunicacao: 'Casual e autêntico',
          pontos_obrigatorios: ['Mencionar benefícios', 'Mostrar produto em uso']
        },
        requisitos_tecnicos: {
          duracao_video: '60 segundos',
          qualidade: 'HD 1080p',
          formato_entrega: 'MP4',
          hashtags_obrigatorias: ['#teste', '#produto']
        }
      },
      created_by: '00000000-0000-0000-0000-000000000001',
      responsible_user_id: '00000000-0000-0000-0000-000000000001'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('campaigns')
      .insert(testCampaign)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir campanha de teste:', insertError);
      
      if (insertError.message.includes('briefing_details')) {
        console.log('\n📝 INSTRUÇÕES PARA ADICIONAR O CAMPO MANUALMENTE:');
        console.log('1. Acesse o Supabase Dashboard');
        console.log('2. Vá para SQL Editor');
        console.log('3. Execute o seguinte comando:');
        console.log('\nALTER TABLE campaigns ADD COLUMN briefing_details JSONB DEFAULT \'{}\'::jsonb;');
        console.log('CREATE INDEX idx_campaigns_briefing_details_gin ON campaigns USING gin(briefing_details);');
      }
    } else {
      console.log('✅ Campanha de teste inserida com sucesso!');
      console.log(`📋 ID da campanha: ${insertResult.id}`);
      console.log('🗑️ Removendo campanha de teste...');
      
      // Remover campanha de teste
      await supabase
        .from('campaigns')
        .delete()
        .eq('id', insertResult.id);
      
      console.log('✅ Campanha de teste removida');
    }
    
    // 5. Resultado final
    console.log('\n🏆 5. RESULTADO FINAL...');
    
    const finalCheck = await supabase
      .from('campaigns')
      .select('id, briefing_details')
      .limit(1);
    
    if (finalCheck.data && finalCheck.data.length > 0) {
      const hasBriefingField = finalCheck.data[0].hasOwnProperty('briefing_details');
      
      if (hasBriefingField) {
        console.log('🎉 CAMPOS DE BRIEFING ADICIONADOS COM SUCESSO!');
        console.log('✅ A tabela campaigns agora suporta:');
        console.log('   - Formato');
        console.log('   - Perfil do criador');
        console.log('   - Objetivo detalhado');
        console.log('   - Comunicação secundária');
        console.log('   - Datas e horários para gravação');
        console.log('   - O que precisa ser falado no vídeo');
        console.log('   - História');
        console.log('   - Promoção CTA');
        console.log('   - Requisitos técnicos');
        
        console.log('\n🚀 PRÓXIMOS PASSOS:');
        console.log('1. Teste o modal de campanha em: http://localhost:3000/campaigns');
        console.log('2. Clique em "Nova Campanha"');
        console.log('3. Preencha os novos campos de briefing');
        console.log('4. Verifique se os dados são salvos corretamente');
        
      } else {
        console.log('⚠️ CAMPO AINDA NÃO DISPONÍVEL');
        console.log('🔧 Execute a migração manualmente no Supabase Dashboard');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

if (require.main === module) {
  addBriefingFields()
    .then(() => {
      console.log('\n🎉 Script de adição de campos de briefing concluído');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Script falhou:', error);
      process.exit(1);
    });
}

export { addBriefingFields };
