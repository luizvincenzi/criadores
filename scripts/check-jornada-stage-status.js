#!/usr/bin/env node

/**
 * Script para verificar se o tipo jornada_stage ainda existe no banco
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJornadaStageStatus() {
  try {
    console.log('🔍 Verificando status do tipo jornada_stage...\n');

    // Verificar se a tabela jornada_tasks existe e sua estrutura
    const { data: jornadaTasksData, error: jornadaTasksError } = await supabase
      .from('jornada_tasks')
      .select('id, journey_stage, auto_trigger_stage')
      .limit(1);

    if (jornadaTasksError) {
      console.error('❌ Erro ao acessar tabela jornada_tasks:', jornadaTasksError);

      // Se o erro menciona jornada_stage, é provável que ainda exista
      if (jornadaTasksError.message.includes('jornada_stage')) {
        console.log('\n⚠️ PROBLEMA DETECTADO: O erro menciona jornada_stage');
        console.log('Isso indica que ainda há referências ao tipo jornada_stage no banco.');
        console.log('\n🔧 SOLUÇÃO: Execute a migration 027 manualmente no Supabase Dashboard:');
        console.log('1. Vá para o SQL Editor no Supabase Dashboard');
        console.log('2. Execute o conteúdo do arquivo: supabase/migrations/027_unify_status_enums.sql');
      }
    } else {
      console.log('✅ Tabela jornada_tasks acessível');
      console.log(`📊 Dados encontrados: ${jornadaTasksData?.length || 0} registros`);
    }

    // Tentar buscar campanhas para verificar se o sistema está funcionando
    const { data: campaignsData, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, status')
      .limit(3);

    if (campaignsError) {
      console.error('❌ Erro ao acessar campanhas:', campaignsError);
    } else {
      console.log(`✅ Campanhas acessíveis: ${campaignsData?.length || 0} encontradas`);
    }

    // Tentar buscar businesses
    const { data: businessesData, error: businessesError } = await supabase
      .from('businesses')
      .select('id, name')
      .limit(3);

    if (businessesError) {
      console.error('❌ Erro ao acessar businesses:', businessesError);
    } else {
      console.log(`✅ Businesses acessíveis: ${businessesData?.length || 0} encontrados`);
      if (businessesData && businessesData.length > 0) {
        console.log('📋 Businesses disponíveis:');
        businessesData.forEach(b => console.log(`  - ${b.name} (${b.id})`));
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
checkJornadaStageStatus();
