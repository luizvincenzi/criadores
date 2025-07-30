#!/usr/bin/env tsx

import { supabase } from '../lib/supabase';

async function applyMigrationDirect() {
  try {
    console.log('🚀 Aplicando migration diretamente via comandos SQL...');
    
    // Verificar conexão
    console.log('🔍 Verificando conexão...');
    const { data: testData, error: testError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError);
      throw testError;
    }
    
    console.log('✅ Conexão OK');
    
    // Passo 1: Recriar função create_automatic_jornada_tasks
    console.log('\n1️⃣ Recriando função create_automatic_jornada_tasks...');
    
    const createFunctionSQL = `
      DROP FUNCTION IF EXISTS create_automatic_jornada_tasks(character varying,character varying,jornada_stage,uuid,uuid,uuid,uuid);
      CREATE OR REPLACE FUNCTION create_automatic_jornada_tasks(
        p_business_name VARCHAR(255),
        p_campaign_month VARCHAR(50),
        p_journey_stage campaign_status,
        p_business_id UUID DEFAULT NULL,
        p_campaign_id UUID DEFAULT NULL,
        p_organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
        p_created_by UUID DEFAULT '00000000-0000-0000-0000-000000000001'
      ) RETURNS INTEGER AS $$
      DECLARE
        tasks_created INTEGER := 0;
      BEGIN
        -- Verificar se já existem tarefas automáticas
        IF EXISTS (
          SELECT 1 FROM jornada_tasks 
          WHERE organization_id = p_organization_id
            AND business_name = p_business_name
            AND campaign_month = p_campaign_month
            AND journey_stage = p_journey_stage
            AND is_auto_generated = true
        ) THEN
          RETURN 0;
        END IF;

        -- Criar tarefas baseadas no estágio
        IF p_journey_stage = 'Reunião de briefing' THEN
          INSERT INTO jornada_tasks (
            organization_id, business_name, campaign_month, journey_stage,
            title, description, task_type, priority, is_auto_generated,
            blocks_stage_progression, created_by, business_id, campaign_id
          ) VALUES 
          (p_organization_id, p_business_name, p_campaign_month, p_journey_stage,
           'Preparar briefing da campanha', 'Reunir informações e preparar briefing detalhado',
           'briefing_preparation', 'high', true, true, p_created_by, p_business_id, p_campaign_id);
          tasks_created := 1;
        END IF;

        RETURN tasks_created;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    try {
      // Tentar executar usando uma query simples
      const { error: funcError } = await supabase.rpc('exec_sql', { 
        sql: createFunctionSQL 
      });
      
      if (funcError) {
        console.log('⚠️ Erro ao usar exec_sql, tentando método alternativo...');
        // Se exec_sql não funcionar, vamos tentar uma abordagem diferente
        console.log('📝 Execute este SQL manualmente no Supabase Dashboard:');
        console.log('----------------------------------------');
        console.log(createFunctionSQL);
        console.log('----------------------------------------');
      } else {
        console.log('✅ Função create_automatic_jornada_tasks recriada');
      }
    } catch (error) {
      console.log('⚠️ Método exec_sql não disponível, mostrando SQL para execução manual...');
    }
    
    // Passo 2: Recriar outras funções
    console.log('\n2️⃣ Recriando outras funções...');
    
    const otherFunctionsSQL = `
      DROP FUNCTION IF EXISTS can_progress_to_next_stage(character varying,character varying,jornada_stage);
      CREATE OR REPLACE FUNCTION can_progress_to_next_stage(
        p_business_name VARCHAR(255),
        p_campaign_month VARCHAR(50),
        p_current_stage campaign_status
      ) RETURNS BOOLEAN AS $$
      DECLARE
        blocking_tasks_count INTEGER;
      BEGIN
        SELECT COUNT(*) INTO blocking_tasks_count
        FROM jornada_tasks
        WHERE business_name = p_business_name
          AND campaign_month = p_campaign_month
          AND journey_stage = p_current_stage
          AND blocks_stage_progression = true
          AND status != 'done';
        
        RETURN blocking_tasks_count = 0;
      END;
      $$ LANGUAGE plpgsql;

      DROP FUNCTION IF EXISTS get_jornada_tasks_by_stage(uuid,character varying,character varying,jornada_stage);
      CREATE OR REPLACE FUNCTION get_jornada_tasks_by_stage(
        p_organization_id UUID,
        p_business_name VARCHAR(255),
        p_campaign_month VARCHAR(50),
        p_journey_stage campaign_status
      ) RETURNS TABLE(
        id UUID,
        title VARCHAR(255),
        description TEXT,
        status task_status,
        priority task_priority
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT jt.id, jt.title, jt.description, jt.status, jt.priority
        FROM jornada_tasks jt
        WHERE jt.organization_id = p_organization_id
          AND jt.business_name = p_business_name
          AND jt.campaign_month = p_campaign_month
          AND jt.journey_stage = p_journey_stage;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    console.log('📝 Execute este SQL no Supabase Dashboard:');
    console.log('----------------------------------------');
    console.log(otherFunctionsSQL);
    console.log('----------------------------------------');
    
    // Passo 3: Atualizar tabela
    console.log('\n3️⃣ Atualizando tabela jornada_tasks...');
    
    const updateTableSQL = `
      ALTER TABLE jornada_tasks 
      ALTER COLUMN journey_stage TYPE campaign_status 
      USING journey_stage::text::campaign_status;

      ALTER TABLE jornada_tasks 
      ALTER COLUMN auto_trigger_stage TYPE campaign_status 
      USING auto_trigger_stage::text::campaign_status;
    `;
    
    console.log('📝 Execute este SQL no Supabase Dashboard:');
    console.log('----------------------------------------');
    console.log(updateTableSQL);
    console.log('----------------------------------------');
    
    // Passo 4: Remover enum
    console.log('\n4️⃣ Removendo enum jornada_stage...');
    
    const dropEnumSQL = `DROP TYPE IF EXISTS jornada_stage;`;
    
    console.log('📝 Execute este SQL no Supabase Dashboard:');
    console.log('----------------------------------------');
    console.log(dropEnumSQL);
    console.log('----------------------------------------');
    
    console.log('\n🎯 INSTRUÇÕES COMPLETAS:');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute os SQLs acima na ordem mostrada');
    console.log('4. Teste o drag & drop na aba jornada');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyMigrationDirect();
}

export { applyMigrationDirect };
