import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Usar service role key para ter permissões de admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addPasswordColumn() {
  console.log('🔧 ADICIONANDO COLUNA PASSWORD_HASH À TABELA USERS\n');
  
  try {
    // 1. Verificar estrutura atual da tabela users
    console.log('🔍 1. Verificando estrutura atual da tabela users...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erro ao acessar tabela users:', usersError);
      return;
    }
    
    if (users && users.length > 0) {
      console.log('📋 Colunas atuais da tabela users:');
      const columns = Object.keys(users[0]);
      columns.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col}`);
      });
      
      const hasPasswordHash = columns.includes('password_hash');
      console.log(`\n🔐 Coluna password_hash: ${hasPasswordHash ? '✅ Existe' : '❌ Não existe'}`);
      
      if (hasPasswordHash) {
        console.log('✅ Coluna password_hash já existe. Nada a fazer.');
        return;
      }
    }
    
    // 2. Adicionar coluna password_hash via SQL
    console.log('\n🔧 2. Adicionando coluna password_hash...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS password_hash TEXT;
        
        COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt da senha do usuário';
      `
    });
    
    if (error) {
      console.log('⚠️ Erro ao executar SQL via RPC. Tentando método alternativo...');
      
      // Método alternativo: usar SQL direto
      try {
        const { error: sqlError } = await supabase
          .from('users')
          .select('password_hash')
          .limit(1);
        
        if (sqlError && sqlError.message.includes('password_hash')) {
          console.log('❌ Coluna password_hash realmente não existe');
          console.log('\n💡 SOLUÇÃO MANUAL NECESSÁRIA:');
          console.log('1. Acesse o Supabase Dashboard');
          console.log('2. Vá para SQL Editor');
          console.log('3. Execute o seguinte SQL:');
          console.log('');
          console.log('```sql');
          console.log('ALTER TABLE users ADD COLUMN password_hash TEXT;');
          console.log('COMMENT ON COLUMN users.password_hash IS \'Hash bcrypt da senha do usuário\';');
          console.log('```');
          console.log('');
          console.log('4. Depois execute novamente: npx tsx scripts/create-admin-users.ts');
          return;
        }
      } catch (e) {
        console.log('❌ Erro ao verificar coluna:', e);
      }
    } else {
      console.log('✅ Coluna password_hash adicionada com sucesso');
    }
    
    // 3. Verificar se a coluna foi adicionada
    console.log('\n🔍 3. Verificando se a coluna foi adicionada...');
    
    const { data: updatedUsers, error: checkError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Erro ao verificar tabela atualizada:', checkError);
    } else if (updatedUsers && updatedUsers.length > 0) {
      const updatedColumns = Object.keys(updatedUsers[0]);
      const hasPasswordHash = updatedColumns.includes('password_hash');
      
      if (hasPasswordHash) {
        console.log('✅ Coluna password_hash adicionada com sucesso!');
        console.log('\n📋 Colunas atualizadas:');
        updatedColumns.forEach((col, index) => {
          const isNew = col === 'password_hash';
          console.log(`  ${index + 1}. ${col} ${isNew ? '🆕' : ''}`);
        });
      } else {
        console.log('❌ Coluna password_hash ainda não foi adicionada');
      }
    }
    
    console.log('\n✅ PROCESSO CONCLUÍDO!');
    
    if (data || !error) {
      console.log('\n🎯 PRÓXIMOS PASSOS:');
      console.log('1. Execute: npx tsx scripts/create-admin-users.ts');
      console.log('2. Os usuários serão criados com senhas hash');
      console.log('3. Teste o login com as credenciais específicas');
    }

  } catch (error) {
    console.error('❌ Erro no processo:', error);
    
    console.log('\n💡 SOLUÇÃO MANUAL:');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para SQL Editor');
    console.log('4. Execute:');
    console.log('');
    console.log('ALTER TABLE users ADD COLUMN password_hash TEXT;');
    console.log('');
    console.log('5. Depois execute: npx tsx scripts/create-admin-users.ts');
  }
}

if (require.main === module) {
  addPasswordColumn()
    .then(() => {
      console.log('\n🎉 Processo finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Processo falhou:', error);
      process.exit(1);
    });
}

export { addPasswordColumn };
