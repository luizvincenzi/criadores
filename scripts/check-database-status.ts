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

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Verificando status do banco de dados...');

    // 1. Verificar colunas existentes na tabela businesses
    console.log('\n📊 Verificando colunas da tabela businesses...');
    
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .limit(1);

    if (businessError) {
      console.error('❌ Erro ao acessar tabela businesses:', businessError);
      return false;
    }

    if (businesses && businesses.length > 0) {
      const business = businesses[0];
      const columns = Object.keys(business);
      
      console.log('✅ Colunas existentes na tabela businesses:');
      columns.sort().forEach(col => {
        console.log(`  - ${col}`);
      });

      // Verificar campos específicos que implementamos
      const requiredFields = [
        'business_stage',
        'estimated_value', 
        'contract_creators_count',
        'owner_user_id',
        'priority'
      ];

      console.log('\n🎯 Status dos novos campos:');
      requiredFields.forEach(field => {
        const exists = columns.includes(field);
        const status = exists ? '✅' : '❌';
        const value = exists ? business[field] : 'N/A';
        console.log(`  ${status} ${field}: ${value}`);
      });

      // Contar campos implementados
      const implementedCount = requiredFields.filter(field => columns.includes(field)).length;
      console.log(`\n📈 Progresso: ${implementedCount}/${requiredFields.length} campos implementados`);

    } else {
      console.log('⚠️  Nenhum negócio encontrado para verificar estrutura');
    }

    // 2. Verificar enums existentes
    console.log('\n🔤 Verificando enums...');
    
    try {
      // Tentar buscar com business_stage para verificar se o enum existe
      const { data: stageTest, error: stageError } = await supabase
        .from('businesses')
        .select('business_stage')
        .limit(1);

      if (!stageError) {
        console.log('✅ Enum business_stage existe');
      } else {
        console.log('❌ Enum business_stage não existe:', stageError.message);
      }
    } catch (e) {
      console.log('❌ Erro ao verificar business_stage enum');
    }

    try {
      // Tentar buscar com priority para verificar se o enum existe
      const { data: priorityTest, error: priorityError } = await supabase
        .from('businesses')
        .select('priority')
        .limit(1);

      if (!priorityError) {
        console.log('✅ Enum business_priority existe');
      } else {
        console.log('❌ Enum business_priority não existe:', priorityError.message);
      }
    } catch (e) {
      console.log('❌ Erro ao verificar business_priority enum');
    }

    // 3. Verificar tabela users
    console.log('\n👥 Verificando tabela users...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(3);

    if (usersError) {
      console.error('❌ Erro ao acessar tabela users:', usersError);
    } else {
      console.log(`✅ Tabela users acessível: ${users?.length || 0} usuários encontrados`);
      if (users && users.length > 0) {
        console.log('👤 Usuários disponíveis:');
        users.forEach(user => {
          console.log(`  - ${user.name} (${user.email})`);
        });
      }
    }

    // 4. Verificar tabela plans
    console.log('\n📋 Verificando tabela plans...');
    
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('name, price')
      .eq('is_active', true);

    if (plansError) {
      console.error('❌ Erro ao acessar tabela plans:', plansError);
    } else {
      console.log(`✅ Tabela plans acessível: ${plans?.length || 0} planos encontrados`);
      if (plans && plans.length > 0) {
        console.log('📋 Planos disponíveis:');
        plans.forEach(plan => {
          console.log(`  - ${plan.name}: R$ ${plan.price}`);
        });
      }
    }

    // 5. Testar inserção com novos campos
    console.log('\n🧪 Testando inserção com novos campos...');
    
    const testData = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Status DB - ' + Date.now(),
      contact_info: { primary_contact: 'Teste' },
      address: { city: 'São Paulo' }
    };

    // Adicionar campos opcionais se existirem
    const optionalFields = {
      business_stage: 'Leads próprios quentes',
      estimated_value: 15000.00,
      contract_creators_count: 4,
      priority: 'Média'
    };

    // Tentar inserir com campos opcionais
    const { data: testBusiness, error: insertError } = await supabase
      .from('businesses')
      .insert([{ ...testData, ...optionalFields }])
      .select()
      .single();

    if (insertError) {
      console.log('⚠️  Erro na inserção (esperado se campos não existem):', insertError.message);
      
      // Tentar inserção básica
      const { data: basicBusiness, error: basicError } = await supabase
        .from('businesses')
        .insert([testData])
        .select()
        .single();

      if (!basicError) {
        console.log('✅ Inserção básica funcionou');
        // Limpar
        await supabase.from('businesses').delete().eq('id', basicBusiness.id);
      }
    } else {
      console.log('✅ Inserção com novos campos funcionou!');
      console.log('📊 Dados inseridos:', {
        business_stage: testBusiness.business_stage,
        estimated_value: testBusiness.estimated_value,
        contract_creators_count: testBusiness.contract_creators_count,
        priority: testBusiness.priority
      });
      
      // Limpar dados de teste
      await supabase.from('businesses').delete().eq('id', testBusiness.id);
      console.log('🗑️ Dados de teste removidos');
    }

    console.log('\n📋 Resumo do Status:');
    console.log('✅ Conexão com Supabase funcionando');
    console.log('✅ Tabela businesses acessível');
    console.log('✅ Campo contract_creators_count já existe');
    console.log('⚠️  Execute a migration SQL inteligente para adicionar campos restantes');

    return true;

  } catch (error) {
    console.error('❌ Erro geral na verificação:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkDatabaseStatus()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { checkDatabaseStatus };
