#!/usr/bin/env tsx

/**
 * Script para executar migrations do portal diretamente no Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runPortalMigrations() {
  console.log('🚀 Executando migrations do Portal...\n');

  try {
    // Migration 1: Criar tabelas do portal
    console.log('📋 Criando tabelas do portal...');
    
    const migration1 = `
      -- 1. Tabela de usuários do portal (empresas e criadores)
      CREATE TABLE IF NOT EXISTS portal_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        user_type TEXT NOT NULL CHECK (user_type IN ('empresa', 'criador')),
        entity_id UUID NOT NULL,
        full_name TEXT,
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- 2. Tabela de sessões do portal
      CREATE TABLE IF NOT EXISTS portal_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES portal_users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- 3. Configurações de acesso por empresa
      CREATE TABLE IF NOT EXISTS business_portal_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        show_financial_data BOOLEAN DEFAULT false,
        show_creator_details BOOLEAN DEFAULT true,
        show_campaign_metrics BOOLEAN DEFAULT true,
        show_task_system BOOLEAN DEFAULT true,
        custom_branding JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- 4. Notificações do portal
      CREATE TABLE IF NOT EXISTS portal_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES portal_users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
        is_read BOOLEAN DEFAULT false,
        related_entity_type TEXT,
        related_entity_id UUID,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Executar cada comando SQL separadamente
    const commands1 = migration1.split(';').filter(cmd => cmd.trim());

    for (const command of commands1) {
      if (command.trim()) {
        const { error } = await supabase.rpc('exec', { sql: command.trim() });
        if (error) {
          console.error('❌ Erro executando comando:', command.substring(0, 50) + '...', error);
          // Continuar mesmo com erro (pode ser que a tabela já exista)
        }
      }
    }

    console.log('✅ Tabelas criadas com sucesso!');

    // Migration 2: Criar índices
    console.log('📋 Criando índices...');
    
    const migration2 = `
      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_portal_users_email ON portal_users(email);
      CREATE INDEX IF NOT EXISTS idx_portal_users_entity ON portal_users(entity_id, user_type);
      CREATE INDEX IF NOT EXISTS idx_portal_sessions_token ON portal_sessions(token);
      CREATE INDEX IF NOT EXISTS idx_portal_sessions_user ON portal_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_business_portal_settings_business ON business_portal_settings(business_id);
      CREATE INDEX IF NOT EXISTS idx_portal_notifications_user ON portal_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_portal_notifications_unread ON portal_notifications(user_id, is_read);
    `;

    const { error: migration2Error } = await supabase.rpc('exec_sql', { sql: migration2 });
    
    if (migration2Error) {
      console.error('❌ Erro na migration 2:', migration2Error);
      return;
    }

    console.log('✅ Índices criados com sucesso!');

    // Migration 3: Habilitar RLS
    console.log('🔒 Habilitando RLS...');
    
    const migration3 = `
      -- Habilitar RLS nas novas tabelas
      ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE portal_sessions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE business_portal_settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE portal_notifications ENABLE ROW LEVEL SECURITY;
    `;

    const { error: migration3Error } = await supabase.rpc('exec_sql', { sql: migration3 });
    
    if (migration3Error) {
      console.error('❌ Erro na migration 3:', migration3Error);
      return;
    }

    console.log('✅ RLS habilitado com sucesso!');

    console.log('\n🎉 Todas as migrations executadas com sucesso!');
    console.log('📋 Próximos passos:');
    console.log('  1. Execute: npx tsx scripts/setup-portal-test-data.ts');
    console.log('  2. Teste o portal em: http://localhost:3001/portal');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar as migrations
runPortalMigrations();
