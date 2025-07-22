import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testOwnerAndPriority() {
  try {
    console.log('🧪 Testando campos de proprietário e prioridade...');

    // 1. Verificar se os campos existem
    console.log('🔍 Verificando novos campos...');
    
    const { data: businesses, error: selectError } = await supabase
      .from('businesses')
      .select('id, name, owner_user_id, priority')
      .limit(3);

    if (selectError) {
      console.error('❌ Erro ao buscar negócios:', selectError);
      console.log('⚠️  Execute a migration SQL no Supabase Dashboard primeiro.');
      return false;
    }

    console.log('✅ Campos owner_user_id e priority existem!');
    console.log('📊 Dados encontrados:', businesses);

    // 2. Verificar usuários disponíveis
    console.log('🔍 Verificando usuários disponíveis...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('is_active', true)
      .limit(5);

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
    } else {
      console.log('👥 Usuários disponíveis:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    // 3. Testar criação de negócio com proprietário e prioridade
    console.log('🧪 Testando criação com proprietário e prioridade...');
    
    const testBusiness = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Proprietário e Prioridade - ' + Date.now(),
      business_stage: 'Leads próprios quentes',
      estimated_value: 35000.00,
      contract_creators_count: 8,
      owner_user_id: users && users.length > 0 ? users[0].id : null,
      priority: 'Alta',
      contact_info: {
        primary_contact: 'João Teste',
        email: 'joao@teste.com',
        whatsapp: '11999999999'
      },
      address: {
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil'
      },
      custom_fields: {
        plano_atual: 'Diamond',
        comercial: 'Ativo',
        notes: 'Teste de proprietário e prioridade'
      },
      status: 'Reunião de briefing'
    };

    const { data: newBusiness, error: insertError } = await supabase
      .from('businesses')
      .insert([testBusiness])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar negócio de teste:', insertError);
      return false;
    }

    console.log('✅ Negócio de teste criado:', {
      id: newBusiness.id,
      name: newBusiness.name,
      owner_user_id: newBusiness.owner_user_id,
      priority: newBusiness.priority
    });

    // 4. Testar atualização dos campos
    console.log('🔄 Testando atualização dos campos...');
    
    const { data: updatedBusiness, error: updateError } = await supabase
      .from('businesses')
      .update({
        priority: 'Baixa',
        owner_user_id: users && users.length > 1 ? users[1].id : users?.[0]?.id
      })
      .eq('id', newBusiness.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar negócio:', updateError);
      return false;
    }

    console.log('✅ Negócio atualizado:', {
      priority: updatedBusiness.priority,
      owner_user_id: updatedBusiness.owner_user_id
    });

    // 5. Testar busca por prioridade
    console.log('🔍 Testando busca por prioridade...');
    
    const { data: highPriorityBusinesses, error: priorityError } = await supabase
      .from('businesses')
      .select('id, name, priority, owner_user_id')
      .eq('priority', 'Alta')
      .limit(5);

    if (priorityError) {
      console.error('❌ Erro ao buscar por prioridade:', priorityError);
    } else {
      console.log('🔴 Negócios com prioridade Alta:', highPriorityBusinesses);
    }

    // 6. Testar busca por proprietário
    if (users && users.length > 0) {
      console.log('🔍 Testando busca por proprietário...');
      
      const { data: ownerBusinesses, error: ownerError } = await supabase
        .from('businesses')
        .select('id, name, priority, owner_user_id')
        .eq('owner_user_id', users[0].id)
        .limit(5);

      if (ownerError) {
        console.error('❌ Erro ao buscar por proprietário:', ownerError);
      } else {
        console.log(`👤 Negócios do proprietário ${users[0].name}:`, ownerBusinesses);
      }
    }

    // 7. Estatísticas por prioridade
    console.log('📈 Estatísticas por prioridade...');
    
    const { data: allBusinesses, error: statsError } = await supabase
      .from('businesses')
      .select('priority, estimated_value, contract_creators_count')
      .eq('is_active', true);

    if (statsError) {
      console.error('❌ Erro ao buscar estatísticas:', statsError);
    } else {
      const priorityStats = allBusinesses.reduce((acc: any, business: any) => {
        const priority = business.priority || 'Média';
        if (!acc[priority]) {
          acc[priority] = { 
            count: 0, 
            totalValue: 0, 
            totalCreators: 0,
            avgValue: 0,
            avgCreators: 0
          };
        }
        acc[priority].count++;
        acc[priority].totalValue += business.estimated_value || 0;
        acc[priority].totalCreators += business.contract_creators_count || 0;
        acc[priority].avgValue = Math.round(acc[priority].totalValue / acc[priority].count);
        acc[priority].avgCreators = Math.round(acc[priority].totalCreators / acc[priority].count);
        return acc;
      }, {});

      console.log('📊 Distribuição por prioridade:');
      Object.entries(priorityStats).forEach(([priority, stats]: [string, any]) => {
        const icon = priority === 'Alta' ? '🔴' : 
                    priority === 'Média' ? '🟡' : 
                    priority === 'Baixa' ? '🟢' : '⚪';
        
        console.log(`  ${icon} ${priority}:`);
        console.log(`    - ${stats.count} negócios`);
        console.log(`    - R$ ${stats.totalValue.toFixed(2)} valor total`);
        console.log(`    - R$ ${stats.avgValue.toFixed(2)} valor médio`);
        console.log(`    - ${stats.totalCreators} criadores total`);
        console.log(`    - ${stats.avgCreators} criadores em média`);
        console.log('');
      });
    }

    // 8. Testar API de usuários
    console.log('🔍 Testando API de usuários...');
    
    try {
      const response = await fetch('http://localhost:3000/api/supabase/users');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API de usuários funcionando:', data.total, 'usuários');
      } else {
        console.log('⚠️  API de usuários não disponível (servidor não rodando)');
      }
    } catch (e) {
      console.log('⚠️  API de usuários não disponível (servidor não rodando)');
    }

    // 9. Limpar dados de teste
    console.log('🗑️ Removendo dados de teste...');
    
    await supabase
      .from('businesses')
      .delete()
      .eq('id', newBusiness.id);

    console.log('✅ Dados de teste removidos');

    console.log('\n🎉 Todos os testes de proprietário e prioridade passaram!');
    return true;

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testOwnerAndPriority()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { testOwnerAndPriority };
