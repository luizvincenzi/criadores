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

async function testBusinessPlans() {
  try {
    console.log('🧪 Testando planos de negócio...');

    // 1. Verificar negócios existentes e seus planos
    console.log('🔍 Verificando planos existentes nos negócios...');
    
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, custom_fields')
      .limit(10);

    if (businessError) {
      console.error('❌ Erro ao buscar negócios:', businessError);
      return false;
    }

    console.log('📊 Planos encontrados nos negócios:');
    businesses.forEach(business => {
      const plano = business.custom_fields?.plano_atual || 'Não definido';
      console.log(`  - ${business.name}: ${plano}`);
    });

    // 2. Verificar planos na tabela plans
    console.log('\n🔍 Verificando tabela de planos...');
    
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('name, description, price, features')
      .eq('is_active', true)
      .order('price');

    if (plansError) {
      console.error('❌ Erro ao buscar planos:', plansError);
    } else {
      console.log('📋 Planos disponíveis:');
      plans.forEach(plan => {
        const features = plan.features as any;
        console.log(`  - ${plan.name}: R$ ${plan.price}`);
        console.log(`    ${plan.description}`);
        console.log(`    Criadores: ${features?.criadores_por_campanha || 'N/A'}`);
        console.log('');
      });
    }

    // 3. Testar criação de negócio com novo plano
    console.log('🧪 Testando criação de negócio com plano Silver - 4...');
    
    const testBusiness = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Plano Silver - ' + Date.now(),
      business_stage: 'Leads próprios quentes',
      estimated_value: 15000.00,
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
        plano_atual: 'Silver - 4',
        comercial: 'Ativo',
        notes: 'Teste de plano Silver - 4'
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
      plano: newBusiness.custom_fields?.plano_atual
    });

    // 4. Testar atualização de plano
    console.log('🔄 Testando atualização de plano...');
    
    const { data: updatedBusiness, error: updateError } = await supabase
      .from('businesses')
      .update({
        custom_fields: {
          ...newBusiness.custom_fields,
          plano_atual: 'Gold - 6'
        }
      })
      .eq('id', newBusiness.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar plano:', updateError);
      return false;
    }

    console.log('✅ Plano atualizado para:', updatedBusiness.custom_fields?.plano_atual);

    // 5. Estatísticas por plano
    console.log('\n📈 Estatísticas por plano...');
    
    const { data: allBusinesses, error: statsError } = await supabase
      .from('businesses')
      .select('custom_fields, estimated_value')
      .eq('is_active', true);

    if (statsError) {
      console.error('❌ Erro ao buscar estatísticas:', statsError);
    } else {
      const planStats = allBusinesses.reduce((acc: any, business: any) => {
        const plano = business.custom_fields?.plano_atual || 'Não definido';
        if (!acc[plano]) {
          acc[plano] = { count: 0, totalValue: 0 };
        }
        acc[plano].count++;
        acc[plano].totalValue += business.estimated_value || 0;
        return acc;
      }, {});

      console.log('📊 Distribuição por plano:');
      Object.entries(planStats).forEach(([plano, stats]: [string, any]) => {
        console.log(`  - ${plano}: ${stats.count} negócios, R$ ${stats.totalValue.toFixed(2)} total`);
      });
    }

    // 6. Limpar dados de teste
    console.log('\n🗑️ Removendo dados de teste...');
    
    await supabase
      .from('businesses')
      .delete()
      .eq('id', newBusiness.id);

    console.log('✅ Dados de teste removidos');

    console.log('\n🎉 Todos os testes de planos passaram!');
    return true;

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testBusinessPlans()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { testBusinessPlans };
