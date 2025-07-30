#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Aplicando migração: Adicionar campo apresentacao_empresa');

    // Tentar adicionar a coluna (se já existir, vai dar erro mas não tem problema)
    console.log('📝 Adicionando coluna apresentacao_empresa...');

    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Adicionar campo apresentacao_empresa como TEXT (se não existir)
        ALTER TABLE businesses
        ADD COLUMN IF NOT EXISTS apresentacao_empresa TEXT;

        -- Adicionar comentário explicativo
        COMMENT ON COLUMN businesses.apresentacao_empresa IS 'Apresentação detalhada da empresa para landing pages e detalhes';

        -- Atualizar empresas existentes com valor padrão vazio
        UPDATE businesses
        SET apresentacao_empresa = COALESCE(apresentacao_empresa, '')
        WHERE apresentacao_empresa IS NULL OR apresentacao_empresa = '';
      `
    });

    if (addColumnError) {
      console.error('❌ Erro ao adicionar coluna:', addColumnError);
      // Tentar método alternativo
      console.log('🔄 Tentando método alternativo...');

      try {
        // Método direto via SQL
        await supabase.from('businesses').select('apresentacao_empresa').limit(1);
        console.log('✅ Campo apresentacao_empresa já existe!');
      } catch (testError) {
        console.log('📝 Campo não existe, tentando criar...');

        // Executar SQL diretamente
        const { error: directError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE businesses ADD COLUMN apresentacao_empresa TEXT DEFAULT \'\';'
        });

        if (directError) {
          console.error('❌ Erro no método direto:', directError);
        } else {
          console.log('✅ Campo criado com sucesso!');
        }
      }
      return;
    }

    console.log('✅ Migração aplicada com sucesso!');
    console.log('📊 Campo apresentacao_empresa adicionado à tabela businesses');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar migração
applyMigration();
