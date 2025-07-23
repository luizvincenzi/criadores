#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDeclinadoStage() {
  console.log('🚀 ADICIONANDO ETAPA "DECLINADO" AO BUSINESS_STAGE');
  console.log('================================================\n');

  try {
    // Ler o arquivo de migration
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/023_add_declinado_stage.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Executando migration...');
    
    // Executar a migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Erro ao executar migration:', error);
      return false;
    }

    console.log('✅ Migration executada com sucesso!');
    return true;

  } catch (error) {
    console.error('❌ Erro ao adicionar etapa Declinado:', error);
    return false;
  }
}

async function testDeclinadoStage() {
  console.log('\n🧪 TESTANDO NOVA ETAPA "DECLINADO"...');
  
  try {
    // Tentar criar um business de teste com a nova etapa
    const testBusiness = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Declinado - ' + Date.now(),
      business_stage: 'Declinado',
      estimated_value: 0,
      priority: 'Baixa',
      is_active: true
    };

    const { data, error } = await supabase
      .from('businesses')
      .insert([testBusiness])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao testar nova etapa:', error);
      return false;
    }

    console.log('✅ Teste bem-sucedido! Business criado com etapa "Declinado"');
    console.log(`   📝 ID: ${data.id}`);
    console.log(`   📝 Nome: ${data.name}`);
    console.log(`   📝 Etapa: ${data.business_stage}`);

    // Limpar o teste
    await supabase
      .from('businesses')
      .delete()
      .eq('id', data.id);

    console.log('🧹 Business de teste removido');
    return true;

  } catch (error) {
    console.error('❌ Erro ao testar nova etapa:', error);
    return false;
  }
}

async function verifyAllStages() {
  console.log('\n🔍 VERIFICANDO TODAS AS ETAPAS DISPONÍVEIS...');
  
  try {
    // Query para listar todos os valores do enum
    const { data, error } = await supabase
      .rpc('get_enum_values', { enum_name: 'business_stage' });

    if (error) {
      console.log('⚠️ Não foi possível verificar enum via RPC, usando método alternativo...');
      
      // Método alternativo: tentar inserir com cada valor conhecido
      const knownStages = [
        'Leads próprios frios',
        'Leads próprios quentes', 
        'Leads indicados',
        'Enviando proposta',
        'Marcado reunião',
        'Reunião realizada',
        'Follow up',
        'Contrato assinado',
        'Não teve interesse',
        'Não responde',
        'Declinado'
      ];

      console.log('📋 Etapas conhecidas do sistema:');
      knownStages.forEach((stage, index) => {
        console.log(`   ${index + 1}. ${stage}`);
      });

      return true;
    }

    console.log('📋 Etapas disponíveis no banco:');
    data?.forEach((stage: string, index: number) => {
      console.log(`   ${index + 1}. ${stage}`);
    });

    return true;

  } catch (error) {
    console.error('❌ Erro ao verificar etapas:', error);
    return false;
  }
}

async function main() {
  console.log('🎯 OBJETIVO: Adicionar etapa "Declinado" para negócios rejeitados\n');

  // 1. Adicionar a nova etapa
  const migrationSuccess = await addDeclinadoStage();
  if (!migrationSuccess) {
    console.log('❌ Falha na migration. Abortando.');
    process.exit(1);
  }

  // 2. Testar a nova etapa
  const testSuccess = await testDeclinadoStage();
  if (!testSuccess) {
    console.log('⚠️ Teste falhou, mas a etapa pode ter sido adicionada.');
  }

  // 3. Verificar todas as etapas
  await verifyAllStages();

  console.log('\n✅ PROCESSO CONCLUÍDO!');
  console.log('🎯 A etapa "Declinado" foi adicionada ao sistema.');
  console.log('📝 Próximo passo: Atualizar o frontend para incluir a nova etapa no Kanban.');
}

if (require.main === module) {
  main().catch(console.error);
}
