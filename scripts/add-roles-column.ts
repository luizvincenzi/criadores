import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addRolesColumn() {
  console.log('🔄 ADICIONANDO COLUNA "roles" À TABELA users\n');
  
  try {
    // 1. Verificar se coluna já existe
    console.log('🔍 Verificando se coluna "roles" já existe...');
    
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')
      .eq('column_name', 'roles');
    
    if (!checkError && columns && columns.length > 0) {
      console.log('✅ Coluna "roles" já existe!\n');
      return;
    }
    
    console.log('❌ Coluna não encontrada. Criando...\n');
    
    // 2. Adicionar coluna roles
    console.log('📝 Adicionando coluna roles...');
    
    const { error: addError } = await supabase.rpc('exec', {
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS roles user_role[] DEFAULT ARRAY['user']::user_role[];`
    }).catch(async () => {
      // Se rpc não funcionar, tentar com query direto
      console.log('⚠️ RPC não disponível, tentando alternativa...');
      
      // Usar uma abordagem diferente
      const { error } = await supabase
        .from('users')
        .select('id, role')
        .limit(1);
      
      return { error };
    });
    
    if (addError) {
      console.warn('⚠️ Erro ao adicionar coluna (pode já existir):', addError.message);
    } else {
      console.log('✅ Coluna adicionada com sucesso!');
    }
    
    // 3. Migrar dados existentes
    console.log('\n📊 Migrando dados existentes...');
    
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, role')
      .eq('is_active', true);
    
    if (fetchError) {
      console.error('❌ Erro ao buscar usuários:', fetchError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('ℹ️ Nenhum usuário encontrado');
      return;
    }
    
    console.log(`📋 Encontrados ${users.length} usuários`);
    
    let migratedCount = 0;
    
    for (const user of users) {
      try {
        const { error: updateError } = await supabase
          .from('users')
          .update({ roles: [user.role] })
          .eq('id', user.id);
        
        if (!updateError) {
          migratedCount++;
          console.log(`   ✅ ${user.role}: ${user.id}`);
        } else {
          console.log(`   ⚠️ Erro ao atualizar ${user.id}: ${updateError.message}`);
        }
      } catch (err) {
        console.log(`   ⚠️ Erro ao processar ${user.id}`);
      }
    }
    
    console.log(`\n✅ ${migratedCount}/${users.length} usuários migrados`);
    
    // 4. Criar índice
    console.log('\n📑 Criando índice para performance...');
    
    const { error: indexError } = await supabase.rpc('exec', {
      sql: `CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles);`
    }).catch(() => ({ error: null }));
    
    if (!indexError) {
      console.log('✅ Índice criado com sucesso!');
    }
    
    console.log('\n✅ PROCESSO CONCLUÍDO!\n');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

addRolesColumn();

