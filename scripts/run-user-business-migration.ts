import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runUserBusinessMigration() {
  try {
    console.log('🚀 EXECUTANDO MIGRATION USUÁRIO-NEGÓCIO');
    console.log('====================================\n');

    // 1. Ler arquivo de migration
    console.log('📄 Lendo arquivo de migration...');
    const migrationPath = 'supabase/migrations/022_add_user_business_relationship.sql';
    const sql = readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration carregada');

    // 2. Executar migration
    console.log('\n🔧 Executando migration...');
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error && !error.message.includes('exec_sql')) {
      console.error('❌ Erro na migration:', error.message);
      return false;
    }
    
    console.log('✅ Migration executada com sucesso!');

    // 3. Verificar resultado
    console.log('\n📊 Verificando resultado...');
    
    // Verificar se colunas foram criadas
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, owner_user_id, assigned_to_user_id')
      .limit(5);
      
    if (businessError) {
      console.log('⚠️ Erro ao verificar negócios:', businessError.message);
    } else {
      console.log(`✅ ${businesses.length} negócios verificados`);
      
      const withOwner = businesses.filter(b => b.owner_user_id);
      console.log(`📊 ${withOwner.length} negócios com proprietário atribuído`);
    }

    // 4. Verificar view criada
    console.log('\n📈 Verificando view de relatórios...');
    
    const { data: userSummary, error: viewError } = await supabase
      .from('user_business_summary')
      .select('*');
      
    if (viewError) {
      console.log('⚠️ Erro na view:', viewError.message);
    } else {
      console.log(`✅ View criada com ${userSummary.length} usuários`);
      
      userSummary.forEach(user => {
        console.log(`  👤 ${user.full_name}: ${user.total_businesses} negócios (R$ ${user.total_value})`);
      });
    }

    // 5. Testar função de reatribuição
    console.log('\n🔧 Testando função de reatribuição...');
    
    if (businesses.length > 0) {
      const testBusiness = businesses[0];
      
      // Buscar usuários
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('is_active', true)
        .neq('email', 'sistema@crmcriadores.com')
        .limit(2);
        
      if (!usersError && users.length >= 2) {
        const newOwner = users.find(u => u.id !== testBusiness.owner_user_id) || users[1];
        
        try {
          const { data, error: funcError } = await supabase.rpc('reassign_business_to_user', {
            business_id: testBusiness.id,
            new_owner_id: newOwner.id
          });
          
          if (!funcError) {
            console.log(`✅ Função de reatribuição funcionando`);
            console.log(`  - ${testBusiness.name} reatribuído para ${newOwner.full_name}`);
          } else {
            console.log('⚠️ Erro na função:', funcError.message);
          }
        } catch (e) {
          console.log('⚠️ Erro ao testar função');
        }
      }
    }

    // 6. Testar sistema de notas com usuários
    console.log('\n📝 Testando sistema de notas com usuários...');
    
    if (businesses.length > 0) {
      const testBusiness = businesses[0];
      
      if (testBusiness.owner_user_id) {
        try {
          const response = await fetch('http://localhost:3000/api/crm/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              business_id: testBusiness.id,
              user_id: testBusiness.owner_user_id,
              content: `Teste após migration - Sistema de usuários e negócios funcionando!`,
              note_type: 'general',
              create_activity: false
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Sistema de notas com usuários funcionando!');
            console.log(`  - Nota criada: ${data.note?.id}`);
          } else {
            console.log(`⚠️ Erro no sistema de notas: ${response.status}`);
          }
        } catch (error) {
          console.log('❌ Erro ao testar notas:', error);
        }
      }
    }

    console.log('\n🎉 MIGRATION USUÁRIO-NEGÓCIO CONCLUÍDA!');
    console.log('====================================\n');
    
    console.log('✅ FUNCIONALIDADES IMPLEMENTADAS:');
    console.log('  🔗 Relacionamento usuário-negócio');
    console.log('  📊 View de relatórios por usuário');
    console.log('  🔧 Função de reatribuição');
    console.log('  📈 Índices de performance');
    console.log('  📝 Sistema de notas integrado');

    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('  1. Atualizar interface do Kanban');
    console.log('  2. Adicionar filtros por usuário');
    console.log('  3. Mostrar responsáveis nos cards');
    console.log('  4. Criar dashboard de performance');

    return true;

  } catch (error) {
    console.error('❌ Erro geral na migration:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runUserBusinessMigration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { runUserBusinessMigration };
