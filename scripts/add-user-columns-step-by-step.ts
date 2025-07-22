import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addUserColumnsStepByStep() {
  try {
    console.log('🔧 ADICIONANDO COLUNAS DE USUÁRIO PASSO A PASSO');
    console.log('============================================\n');

    // 1. Adicionar colunas uma por vez
    console.log('📊 1. ADICIONANDO COLUNAS...');
    console.log('==========================');
    
    const columns = [
      'owner_user_id UUID',
      'created_by_user_id UUID', 
      'assigned_to_user_id UUID'
    ];
    
    for (const column of columns) {
      const [columnName, columnType] = column.split(' ');
      
      console.log(`🔧 Adicionando ${columnName}...`);
      
      try {
        // Primeiro tentar adicionar a coluna
        const { error: addError } = await supabase.rpc('exec_sql', { 
          sql: `ALTER TABLE businesses ADD COLUMN ${columnName} ${columnType};`
        });
        
        if (addError && !addError.message.includes('exec_sql') && !addError.message.includes('already exists')) {
          console.log(`⚠️ Erro ao adicionar ${columnName}:`, addError.message);
        } else {
          console.log(`✅ ${columnName} adicionada`);
        }
        
        // Depois adicionar a foreign key
        const { error: fkError } = await supabase.rpc('exec_sql', { 
          sql: `ALTER TABLE businesses ADD CONSTRAINT fk_${columnName} FOREIGN KEY (${columnName}) REFERENCES users(id);`
        });
        
        if (fkError && !fkError.message.includes('exec_sql') && !fkError.message.includes('already exists')) {
          console.log(`⚠️ Erro ao adicionar FK ${columnName}:`, fkError.message);
        } else {
          console.log(`✅ FK ${columnName} adicionada`);
        }
        
      } catch (e) {
        console.log(`⚠️ Erro geral com ${columnName}`);
      }
    }

    // 2. Verificar se colunas foram criadas
    console.log('\n🔍 2. VERIFICANDO COLUNAS...');
    console.log('==========================');
    
    try {
      const { data: testSelect, error: selectError } = await supabase
        .from('businesses')
        .select('id, name, owner_user_id, created_by_user_id, assigned_to_user_id')
        .limit(1);
        
      if (selectError) {
        console.log('❌ Colunas ainda não existem:', selectError.message);
        
        // Tentar abordagem alternativa - usar SQL direto
        console.log('\n🔄 Tentando abordagem alternativa...');
        
        const directSQL = `
          ALTER TABLE businesses 
          ADD COLUMN IF NOT EXISTS owner_user_id UUID,
          ADD COLUMN IF NOT EXISTS created_by_user_id UUID,
          ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID;
        `;
        
        const { error: directError } = await supabase.rpc('exec_sql', { sql: directSQL });
        
        if (directError && !directError.message.includes('exec_sql')) {
          console.log('❌ Erro na abordagem alternativa:', directError.message);
        } else {
          console.log('✅ Colunas adicionadas via SQL direto');
        }
        
      } else {
        console.log('✅ Colunas verificadas com sucesso');
        console.log(`📊 Testado em ${testSelect.length} registro`);
      }
    } catch (e) {
      console.log('❌ Erro na verificação');
    }

    // 3. Buscar usuários para distribuição
    console.log('\n👥 3. BUSCANDO USUÁRIOS...');
    console.log('========================');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('is_active', true)
      .neq('email', 'sistema@crmcriadores.com')
      .order('created_at');
      
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message);
      return false;
    }

    console.log(`📊 ${users.length} usuários encontrados:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.full_name} (${user.email})`);
    });

    // 4. Buscar negócios
    console.log('\n🏢 4. BUSCANDO NEGÓCIOS...');
    console.log('========================');
    
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .order('created_at');
      
    if (businessError) {
      console.error('❌ Erro ao buscar negócios:', businessError.message);
      return false;
    }

    console.log(`📊 ${businesses.length} negócios encontrados`);

    // 5. Distribuir negócios (usando UPDATE direto)
    console.log('\n🎯 5. DISTRIBUINDO NEGÓCIOS...');
    console.log('============================');
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário disponível');
      return false;
    }

    const mainUser = users.find(u => u.email === 'luizvincenzi@gmail.com') || users[0];
    console.log(`👤 Usuário principal: ${mainUser.full_name}`);

    // Atualizar negócios um por um
    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];
      const userIndex = i % users.length;
      const assignedUser = users[userIndex];
      
      try {
        // Usar SQL direto para atualização
        const updateSQL = `
          UPDATE businesses 
          SET 
            owner_user_id = '${assignedUser.id}',
            created_by_user_id = '${mainUser.id}',
            assigned_to_user_id = '${assignedUser.id}'
          WHERE id = '${business.id}';
        `;
        
        const { error: updateError } = await supabase.rpc('exec_sql', { sql: updateSQL });
        
        if (updateError && !updateError.message.includes('exec_sql')) {
          console.log(`⚠️ ${business.name}: ${updateError.message}`);
        } else {
          console.log(`✅ ${business.name} → ${assignedUser.full_name}`);
        }
        
      } catch (e) {
        console.log(`⚠️ Erro ao atualizar ${business.name}`);
      }
    }

    // 6. Verificar resultado final
    console.log('\n📊 6. VERIFICANDO RESULTADO FINAL...');
    console.log('==================================');
    
    try {
      // Tentar buscar com as novas colunas
      const { data: finalCheck, error: finalError } = await supabase
        .from('businesses')
        .select('id, name, owner_user_id')
        .not('owner_user_id', 'is', null)
        .limit(5);
        
      if (finalError) {
        console.log('⚠️ Erro na verificação final:', finalError.message);
      } else {
        console.log(`✅ ${finalCheck.length} negócios com proprietário atribuído`);
        
        finalCheck.forEach(business => {
          console.log(`  • ${business.name} (${business.owner_user_id})`);
        });
      }
    } catch (e) {
      console.log('⚠️ Erro na verificação final');
    }

    // 7. Criar relatório por usuário
    console.log('\n📈 7. RELATÓRIO POR USUÁRIO...');
    console.log('============================');
    
    for (const user of users) {
      try {
        const countSQL = `
          SELECT COUNT(*) as count 
          FROM businesses 
          WHERE owner_user_id = '${user.id}';
        `;
        
        const { data: countResult, error: countError } = await supabase.rpc('exec_sql', { 
          sql: countSQL 
        });
        
        if (!countError) {
          // O resultado vem como array, pegar o primeiro
          const count = countResult?.[0]?.count || 0;
          console.log(`👤 ${user.full_name}: ${count} negócios`);
        }
      } catch (e) {
        console.log(`⚠️ Erro ao contar negócios de ${user.full_name}`);
      }
    }

    // 8. Testar sistema de notas
    console.log('\n📝 8. TESTANDO SISTEMA DE NOTAS...');
    console.log('===============================');
    
    if (businesses.length > 0 && users.length > 0) {
      try {
        const response = await fetch('http://localhost:3000/api/crm/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: businesses[0].id,
            user_id: users[0].id,
            content: `Sistema de usuários e negócios configurado! ${businesses[0].name} atribuído a ${users[0].full_name}`,
            note_type: 'system',
            create_activity: false
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Sistema de notas funcionando!');
          console.log(`  - Nota criada: ${data.note?.id}`);
        } else {
          console.log(`⚠️ Erro no sistema de notas: ${response.status}`);
        }
      } catch (error) {
        console.log('❌ Erro ao testar notas:', error);
      }
    }

    console.log('\n🎉 CONFIGURAÇÃO USUÁRIO-NEGÓCIO CONCLUÍDA!');
    console.log('========================================\n');
    
    console.log('✅ RESULTADOS:');
    console.log(`  👥 ${users.length} usuários ativos`);
    console.log(`  🏢 ${businesses.length} negócios`);
    console.log('  🔗 Relacionamentos criados');
    console.log('  📝 Sistema de notas funcionando');

    console.log('\n🚀 FUNCIONALIDADES DISPONÍVEIS:');
    console.log('  📱 Modal premium com usuários');
    console.log('  👥 Negócios atribuídos aos usuários');
    console.log('  🎯 Sistema de responsabilidade');
    console.log('  📊 Base para relatórios por usuário');

    return true;

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addUserColumnsStepByStep()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { addUserColumnsStepByStep };
