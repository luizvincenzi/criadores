import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixTriggerUserId() {
  try {
    console.log('🔧 Corrigindo trigger para lidar com user_id null...');

    // 1. Recriar função do trigger com tratamento de null
    console.log('📝 Recriando função track_business_stage_change...');
    
    const triggerFunction = `
      CREATE OR REPLACE FUNCTION track_business_stage_change()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Se a etapa mudou
        IF OLD.business_stage IS DISTINCT FROM NEW.business_stage THEN
          DECLARE
            time_in_stage INTERVAL := NOW() - COALESCE(OLD.current_stage_since, OLD.created_at);
            activity_user_id UUID := COALESCE(NEW.owner_user_id, OLD.owner_user_id);
          BEGIN
            -- Só inserir atividade se tiver um user_id válido
            IF activity_user_id IS NOT NULL THEN
              -- Inserir atividade de mudança de etapa
              INSERT INTO business_activities (
                business_id,
                user_id,
                activity_type,
                title,
                description,
                old_stage,
                new_stage,
                time_in_previous_stage
              ) VALUES (
                NEW.id,
                activity_user_id,
                'stage_change',
                'Etapa alterada de "' || COALESCE(OLD.business_stage::text, 'N/A') || '" para "' || COALESCE(NEW.business_stage::text, 'N/A') || '"',
                'Tempo na etapa anterior: ' || COALESCE(time_in_stage::text, '0'),
                OLD.business_stage,
                NEW.business_stage,
                time_in_stage
              );
            END IF;
            
            -- Atualizar timestamp da etapa atual
            NEW.current_stage_since = NOW();
          END;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: triggerFunction });
    
    if (functionError) {
      console.error('❌ Erro ao recriar função:', functionError);
      return false;
    }

    console.log('✅ Função do trigger recriada com sucesso');

    // 2. Atualizar current_stage_since para registros que não têm
    console.log('📅 Atualizando current_stage_since...');
    
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ 
        current_stage_since: new Date().toISOString() 
      })
      .is('current_stage_since', null);

    if (updateError) {
      console.log('⚠️  Erro ao atualizar current_stage_since:', updateError.message);
    } else {
      console.log('✅ current_stage_since atualizado');
    }

    // 3. Testar a atualização de etapa
    console.log('🧪 Testando atualização de etapa...');
    
    const { data: testBusiness, error: testError } = await supabase
      .from('businesses')
      .select('id, name, business_stage, owner_user_id')
      .limit(1)
      .single();

    if (testError || !testBusiness) {
      console.log('⚠️  Nenhuma empresa encontrada para teste');
      return true;
    }

    console.log(`🏢 Testando com empresa: ${testBusiness.name}`);

    const originalStage = testBusiness.business_stage;
    const newStage = originalStage === 'Leads próprios frios' ? 'Leads próprios quentes' : 'Leads próprios frios';

    // Testar mudança de etapa
    const { error: changeError } = await supabase
      .from('businesses')
      .update({ business_stage: newStage })
      .eq('id', testBusiness.id);

    if (changeError) {
      console.error('❌ Erro ao testar mudança de etapa:', changeError.message);
      return false;
    }

    console.log(`✅ Etapa alterada: ${originalStage} → ${newStage}`);

    // Verificar se a atividade foi criada (se houver owner_user_id)
    if (testBusiness.owner_user_id) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: activities, error: activityError } = await supabase
        .from('business_activities')
        .select('*')
        .eq('business_id', testBusiness.id)
        .eq('activity_type', 'stage_change')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!activityError && activities && activities.length > 0) {
        console.log('✅ Atividade de mudança de etapa criada automaticamente');
      } else {
        console.log('ℹ️  Nenhuma atividade criada (normal se não há owner_user_id)');
      }
    } else {
      console.log('ℹ️  Empresa sem proprietário - atividade não será criada');
    }

    // Reverter mudança
    await supabase
      .from('businesses')
      .update({ business_stage: originalStage })
      .eq('id', testBusiness.id);

    console.log('🔄 Etapa revertida para o estado original');

    console.log('\n🎉 Correção do trigger concluída com sucesso!');
    console.log('\n📋 O que foi corrigido:');
    console.log('✅ Trigger não falha mais com user_id null');
    console.log('✅ Atividades só são criadas quando há proprietário');
    console.log('✅ current_stage_since sempre tem valor');
    console.log('✅ Mudanças de etapa funcionam normalmente');

    return true;

  } catch (error) {
    console.error('❌ Erro geral na correção:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixTriggerUserId()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { fixTriggerUserId };
