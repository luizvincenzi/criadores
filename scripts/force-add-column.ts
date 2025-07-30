#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function forceAddColumn() {
  try {
    console.log('🚀 Forçando adição da coluna apresentacao_empresa...');

    // Tentar inserir um registro com a coluna para ver se existe
    console.log('🔍 Testando se a coluna existe...');
    
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          name: 'TESTE_COLUNA_TEMP',
          organization_id: '00000000-0000-0000-0000-000000000001',
          apresentacao_empresa: 'teste'
        })
        .select();

      if (!error) {
        console.log('✅ Coluna já existe! Removendo registro de teste...');
        
        // Remover o registro de teste
        await supabase
          .from('businesses')
          .delete()
          .eq('name', 'TESTE_COLUNA_TEMP');
        
        return;
      } else {
        console.log('❌ Coluna não existe:', error.message);
      }
    } catch (error) {
      console.log('❌ Erro no teste:', error);
    }

    // Se chegou aqui, a coluna não existe. Vamos tentar criar via SQL direto
    console.log('📝 Tentando criar coluna via SQL direto...');

    // Usar fetch direto para a API do Supabase
    const sqlQuery = `
      ALTER TABLE businesses 
      ADD COLUMN apresentacao_empresa TEXT DEFAULT '';
      
      COMMENT ON COLUMN businesses.apresentacao_empresa 
      IS 'Apresentação detalhada da empresa para landing pages e detalhes';
    `;

    console.log('🔧 Executando SQL:', sqlQuery);

    // Tentar via API REST do Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        sql: sqlQuery
      })
    });

    if (response.ok) {
      console.log('✅ Coluna criada via API REST!');
    } else {
      const errorText = await response.text();
      console.log('❌ Erro na API REST:', errorText);
      
      // Última tentativa: usar uma abordagem diferente
      console.log('🔄 Última tentativa...');
      
      try {
        // Tentar usar o método de atualização para forçar a criação
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ apresentacao_empresa: '' })
          .eq('id', '00000000-0000-0000-0000-000000000000'); // ID que não existe

        if (updateError && updateError.message.includes('column "apresentacao_empresa" does not exist')) {
          console.log('❌ Confirmado: coluna não existe');
          console.log('📋 INSTRUÇÕES MANUAIS:');
          console.log('1. Acesse o painel do Supabase');
          console.log('2. Vá para SQL Editor');
          console.log('3. Execute o seguinte SQL:');
          console.log('');
          console.log('ALTER TABLE businesses ADD COLUMN apresentacao_empresa TEXT DEFAULT \'\';');
          console.log('');
          console.log('COMMENT ON COLUMN businesses.apresentacao_empresa IS \'Apresentação detalhada da empresa para landing pages e detalhes\';');
          console.log('');
        } else {
          console.log('✅ Coluna pode já existir ou foi criada!');
        }
      } catch (finalError) {
        console.log('❌ Erro final:', finalError);
      }
    }

    // Verificação final
    console.log('🔍 Verificação final...');
    
    try {
      const { data: finalTest, error: finalError } = await supabase
        .from('businesses')
        .select('apresentacao_empresa')
        .limit(1);

      if (finalError) {
        console.log('❌ Coluna ainda não existe:', finalError.message);
        console.log('');
        console.log('🔧 SOLUÇÃO MANUAL NECESSÁRIA:');
        console.log('Execute no SQL Editor do Supabase:');
        console.log('ALTER TABLE businesses ADD COLUMN apresentacao_empresa TEXT DEFAULT \'\';');
      } else {
        console.log('✅ Coluna criada com sucesso!');
      }
    } catch (error) {
      console.log('❌ Erro na verificação final:', error);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
forceAddColumn();
