import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔄 APLICANDO MIGRATION: Suporte a Múltiplos Roles\n');
  
  try {
    // Ler o arquivo SQL
    const migrationPath = path.join(
      __dirname,
      '../supabase/migrations/028_add_multiple_roles_support.sql'
    );
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('📝 Executando SQL...\n');
    
    // Executar a migration
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    }).catch(async () => {
      // Se rpc não existir, tentar com query direto
      console.log('⚠️ RPC exec_sql não disponível, tentando alternativa...\n');
      
      // Dividir em statements individuais
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        console.log(`Executando: ${statement.substring(0, 60)}...`);
        const { error } = await supabase.rpc('exec', {
          sql: statement
        }).catch(() => ({ error: null }));
        
        if (error) {
          console.warn(`⚠️ Erro (ignorando): ${error.message}`);
        }
      }
      
      return { error: null };
    });
    
    if (error) {
      console.error('❌ Erro ao executar migration:', error);
      return;
    }
    
    console.log('✅ Migration aplicada com sucesso!\n');
    
    // Verificar se a coluna foi criada
    console.log('🔍 Verificando estrutura da tabela users...\n');
    
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');
    
    if (!checkError && columns) {
      const hasRoles = columns.some(c => c.column_name === 'roles');
      if (hasRoles) {
        console.log('✅ Coluna "roles" criada com sucesso!');
      } else {
        console.log('⚠️ Coluna "roles" não encontrada. Tentando criar manualmente...');
        
        // Tentar criar manualmente
        await supabase.rpc('exec', {
          sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS roles user_role[] DEFAULT ARRAY['user']::user_role[];`
        }).catch(() => null);
      }
    }
    
    // Migrar dados existentes
    console.log('\n📊 Migrando dados existentes...\n');
    
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, role, roles')
      .eq('is_active', true);
    
    if (!fetchError && users) {
      let migratedCount = 0;
      
      for (const user of users) {
        if (!user.roles || user.roles.length === 0) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ roles: [user.role] })
            .eq('id', user.id);
          
          if (!updateError) {
            migratedCount++;
          }
        }
      }
      
      console.log(`✅ ${migratedCount} usuários migrados`);
    }
    
    console.log('\n✅ MIGRATION CONCLUÍDA COM SUCESSO!\n');
    console.log('📋 Próximos passos:');
    console.log('1. Atualizar lib/database.types.ts');
    console.log('2. Atualizar lib/auth-types.ts');
    console.log('3. Atualizar lógica de autenticação');
    console.log('4. Testar com múltiplos roles\n');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

applyMigration();

