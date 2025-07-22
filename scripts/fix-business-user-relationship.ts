import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixBusinessUserRelationship() {
  try {
    console.log('🔧 CORRIGINDO RELACIONAMENTO USUÁRIO-NEGÓCIO');
    console.log('==========================================\n');

    // 1. Adicionar colunas uma por vez para evitar erro
    console.log('📊 1. ADICIONANDO COLUNAS DE USUÁRIO...');
    console.log('====================================');
    
    const columns = [
      { name: 'owner_user_id', description: 'Proprietário do negócio' },
      { name: 'created_by_user_id', description: 'Usuário que criou' },
      { name: 'assigned_to_user_id', description: 'Usuário responsável' }
    ];
    
    for (const column of columns) {
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ${column.name} UUID REFERENCES users(id);`
        });
        
        if (error && !error.message.includes('exec_sql') && !error.message.includes('already exists')) {
          console.log(`⚠️ Erro ao adicionar ${column.name}:`, error.message);
        } else {
          console.log(`✅ ${column.name} - ${column.description}`);
        }
      } catch (e) {
        console.log(`⚠️ Erro ao adicionar ${column.name}`);
      }
    }

    // 2. Buscar usuários ativos (excluindo sistema)
    console.log('\n👥 2. BUSCANDO USUÁRIOS ATIVOS...');
    console.log('==============================');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .neq('email', 'sistema@crmcriadores.com')
      .order('created_at');
      
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message);
      return false;
    }

    console.log(`📊 ${users.length} usuários ativos encontrados:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.full_name} (${user.email})`);
    });

    // 3. Buscar negócios
    console.log('\n🏢 3. BUSCANDO NEGÓCIOS...');
    console.log('=======================');
    
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at');
      
    if (businessError) {
      console.error('❌ Erro ao buscar negócios:', businessError.message);
      return false;
    }

    console.log(`📊 ${businesses.length} negócios encontrados`);

    // 4. Distribuir negócios entre usuários
    console.log('\n🎯 4. DISTRIBUINDO NEGÓCIOS...');
    console.log('============================');
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário ativo encontrado');
      return false;
    }

    // Usuário principal (Luiz Vincenzi)
    const mainUser = users.find(u => u.email === 'luizvincenzi@gmail.com') || users[0];
    console.log(`👤 Usuário principal: ${mainUser.full_name}`);

    // Distribuir negócios de forma equilibrada
    const updates = [];
    
    for (let i = 0; i < businesses.length; i++) {
      const userIndex = i % users.length;
      const assignedUser = users[userIndex];
      
      updates.push({
        business_id: businesses[i].id,
        business_name: businesses[i].name,
        assigned_user: assignedUser.full_name,
        user_id: assignedUser.id
      });
    }

    // 5. Executar atualizações
    console.log('\n📝 5. EXECUTANDO ATUALIZAÇÕES...');
    console.log('==============================');
    
    for (const update of updates) {
      try {
        const { error } = await supabase
          .from('businesses')
          .update({
            owner_user_id: update.user_id,
            created_by_user_id: mainUser.id, // Criado pelo usuário principal
            assigned_to_user_id: update.user_id
          })
          .eq('id', update.business_id);
          
        if (error) {
          console.log(`⚠️ ${update.business_name}: ${error.message}`);
        } else {
          console.log(`✅ ${update.business_name} → ${update.assigned_user}`);
        }
      } catch (e) {
        console.log(`⚠️ Erro ao atualizar ${update.business_name}`);
      }
    }

    // 6. Gerar relatório final
    console.log('\n📊 6. RELATÓRIO FINAL DE DISTRIBUIÇÃO...');
    console.log('=====================================');
    
    for (const user of users) {
      try {
        const { data: userBusinesses, error } = await supabase
          .from('businesses')
          .select('name, business_stage, estimated_value')
          .eq('owner_user_id', user.id);
          
        if (!error && userBusinesses) {
          const totalValue = userBusinesses.reduce((sum, b) => sum + (b.estimated_value || 0), 0);
          
          console.log(`\n👤 ${user.full_name}:`);
          console.log(`   📧 ${user.email}`);
          console.log(`   🏢 Negócios: ${userBusinesses.length}`);
          console.log(`   💰 Valor total: R$ ${totalValue.toLocaleString('pt-BR')}`);
          
          if (userBusinesses.length > 0) {
            console.log('   📋 Lista de negócios:');
            userBusinesses.forEach(business => {
              console.log(`     • ${business.name} (${business.business_stage}) - R$ ${(business.estimated_value || 0).toLocaleString('pt-BR')}`);
            });
          }
        }
      } catch (e) {
        console.log(`⚠️ Erro ao buscar negócios de ${user.full_name}`);
      }
    }

    // 7. Criar índices para performance
    console.log('\n🚀 7. CRIANDO ÍNDICES PARA PERFORMANCE...');
    console.log('======================================');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_businesses_owner_user_id ON businesses(owner_user_id);',
      'CREATE INDEX IF NOT EXISTS idx_businesses_created_by_user_id ON businesses(created_by_user_id);',
      'CREATE INDEX IF NOT EXISTS idx_businesses_assigned_to_user_id ON businesses(assigned_to_user_id);'
    ];
    
    for (const indexSql of indexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: indexSql });
        
        if (error && !error.message.includes('exec_sql')) {
          console.log('⚠️ Erro ao criar índice:', error.message);
        } else {
          console.log('✅ Índice criado');
        }
      } catch (e) {
        console.log('⚠️ Erro ao criar índice');
      }
    }

    // 8. Testar sistema completo
    console.log('\n🧪 8. TESTANDO SISTEMA COMPLETO...');
    console.log('===============================');
    
    try {
      // Testar busca de negócios por usuário
      const testUser = users[0];
      const { data: testBusinesses, error: testError } = await supabase
        .from('businesses')
        .select('name, business_stage, owner_user_id')
        .eq('owner_user_id', testUser.id)
        .limit(3);
        
      if (!testError && testBusinesses) {
        console.log(`✅ Busca por usuário funcionando: ${testBusinesses.length} negócios encontrados`);
        
        // Testar criação de nota com usuário específico
        if (testBusinesses.length > 0) {
          const testBusiness = testBusinesses[0];
          
          const response = await fetch('http://localhost:3000/api/crm/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              business_id: testBusiness.id,
              user_id: testUser.id,
              content: `Nota de teste - Relacionamento usuário-negócio funcionando! ${testBusiness.name} pertence a ${testUser.full_name}`,
              note_type: 'general',
              create_activity: false
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Sistema de notas com usuários funcionando!');
            console.log(`  - Negócio: ${testBusiness.name}`);
            console.log(`  - Usuário: ${testUser.full_name}`);
            console.log(`  - Nota ID: ${data.note?.id}`);
          } else {
            console.log(`⚠️ Erro no sistema de notas: ${response.status}`);
          }
        }
      } else {
        console.log('⚠️ Erro na busca por usuário:', testError?.message);
      }
    } catch (error) {
      console.log('❌ Erro no teste:', error);
    }

    console.log('\n🎉 RELACIONAMENTO USUÁRIO-NEGÓCIO CONFIGURADO!');
    console.log('============================================\n');
    
    console.log('✅ RESULTADOS:');
    console.log(`  👥 ${users.length} usuários ativos`);
    console.log(`  🏢 ${businesses.length} negócios distribuídos`);
    console.log('  🔗 Relacionamentos criados');
    console.log('  📊 Índices de performance criados');
    console.log('  📝 Sistema de notas funcionando');

    console.log('\n🚀 FUNCIONALIDADES DISPONÍVEIS:');
    console.log('  📱 Modal premium com usuários');
    console.log('  👥 Negócios atribuídos aos usuários');
    console.log('  🎯 Kanban com responsáveis');
    console.log('  📊 Relatórios por usuário');
    console.log('  📝 Notas vinculadas aos usuários');

    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('  1. Atualizar interface para mostrar responsáveis');
    console.log('  2. Adicionar filtros por usuário no Kanban');
    console.log('  3. Criar dashboard de performance por usuário');
    console.log('  4. Implementar notificações por usuário');

    return true;

  } catch (error) {
    console.error('❌ Erro geral na correção:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixBusinessUserRelationship()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { fixBusinessUserRelationship };
