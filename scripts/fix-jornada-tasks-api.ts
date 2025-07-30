#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixJornadaTasksAPI() {
  try {
    console.log('🔧 Verificando e corrigindo API jornada-tasks...');

    // 1. Verificar se a tabela jornada_tasks existe
    console.log('📋 Verificando tabela jornada_tasks...');
    
    try {
      const { data: testQuery, error: testError } = await supabase
        .from('jornada_tasks')
        .select('id')
        .limit(1);

      if (testError) {
        console.log('❌ Tabela jornada_tasks não existe ou tem problemas:', testError.message);
        
        // Criar tabela básica se não existir
        console.log('📝 Criando tabela jornada_tasks básica...');
        
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS jornada_tasks (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
              business_name VARCHAR(255),
              campaign_month VARCHAR(20),
              journey_stage VARCHAR(100),
              title VARCHAR(255) NOT NULL,
              description TEXT,
              task_type VARCHAR(50) DEFAULT 'manual',
              status VARCHAR(20) DEFAULT 'todo',
              priority VARCHAR(20) DEFAULT 'medium',
              assigned_to UUID,
              created_by UUID,
              due_date TIMESTAMP WITH TIME ZONE,
              completed_at TIMESTAMP WITH TIME ZONE,
              estimated_hours INTEGER DEFAULT 0,
              actual_hours INTEGER DEFAULT 0,
              is_auto_generated BOOLEAN DEFAULT false,
              blocks_stage_progression BOOLEAN DEFAULT false,
              tags JSONB DEFAULT '[]'::jsonb,
              metadata JSONB DEFAULT '{}'::jsonb,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });

        if (createError) {
          console.error('❌ Erro ao criar tabela:', createError);
        } else {
          console.log('✅ Tabela jornada_tasks criada com sucesso!');
        }
      } else {
        console.log('✅ Tabela jornada_tasks existe e está acessível');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar tabela:', error);
    }

    // 2. Testar a API diretamente
    console.log('\n🌐 Testando API jornada-tasks...');
    
    try {
      const response = await fetch('http://localhost:3000/api/jornada-tasks', {
        headers: {
          'x-user-email': 'luizvincenzi@gmail.com'
        }
      });

      console.log('Status da resposta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API funcionando:', {
          totalTasks: data.tasks?.length || 0,
          userRole: data.userRole
        });
      } else {
        const text = await response.text();
        console.log('❌ API com erro:', text.substring(0, 300));
      }
    } catch (error) {
      console.error('❌ Erro ao testar API:', error);
    }

    // 3. Verificar se o usuário existe
    console.log('\n👤 Verificando usuário...');
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .eq('email', 'luizvincenzi@gmail.com')
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      console.log('❌ Usuário não encontrado:', userError?.message);
    } else {
      console.log('✅ Usuário encontrado:', {
        id: user.id,
        name: user.full_name,
        role: user.role
      });
    }

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar correção
fixJornadaTasksAPI();
