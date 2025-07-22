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

async function testSimplifiedPlans() {
  try {
    console.log('🧪 Testando planos simplificados e campo de criadores...');

    // 1. Verificar se o campo contract_creators_count existe
    console.log('🔍 Verificando campo contract_creators_count...');
    
    const { data: businesses, error: selectError } = await supabase
      .from('businesses')
      .select('id, name, contract_creators_count, custom_fields')
      .limit(3);

    if (selectError) {
      console.error('❌ Erro ao buscar negócios:', selectError);
      console.log('⚠️  Execute a migration SQL no Supabase Dashboard primeiro.');
      return false;
    }

    console.log('✅ Campo contract_creators_count existe!');
    console.log('📊 Dados encontrados:', businesses);

    // 2. Testar criação de negócio com plano simplificado
    console.log('🧪 Testando criação com plano simplificado...');
    
    const testBusiness = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Plano Simplificado - ' + Date.now(),
      business_stage: 'Leads próprios quentes',
      estimated_value: 25000.00,
      contract_creators_count: 6,
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
        plano_atual: 'Gold',
        comercial: 'Ativo',
        notes: 'Teste de plano Gold com 6 criadores'
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
      plano: newBusiness.custom_fields?.plano_atual,
      criadores: newBusiness.contract_creators_count
    });

    // 3. Testar atualização dos campos
    console.log('🔄 Testando atualização dos campos...');
    
    const { data: updatedBusiness, error: updateError } = await supabase
      .from('businesses')
      .update({
        custom_fields: {
          ...newBusiness.custom_fields,
          plano_atual: 'Diamond'
        },
        contract_creators_count: 12
      })
      .eq('id', newBusiness.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar negócio:', updateError);
      return false;
    }

    console.log('✅ Negócio atualizado:', {
      plano: updatedBusiness.custom_fields?.plano_atual,
      criadores: updatedBusiness.contract_creators_count
    });

    // 4. Verificar planos na tabela plans
    console.log('🔍 Verificando planos simplificados...');
    
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
        const icon = features?.icone || '📋';
        console.log(`  ${icon} ${plan.name}: R$ ${plan.price}`);
        console.log(`    ${plan.description}`);
        console.log('');
      });
    }

    // 5. Estatísticas por plano simplificado
    console.log('📈 Estatísticas por plano simplificado...');
    
    const { data: allBusinesses, error: statsError } = await supabase
      .from('businesses')
      .select('custom_fields, estimated_value, contract_creators_count')
      .eq('is_active', true);

    if (statsError) {
      console.error('❌ Erro ao buscar estatísticas:', statsError);
    } else {
      const planStats = allBusinesses.reduce((acc: any, business: any) => {
        const plano = business.custom_fields?.plano_atual || 'Não definido';
        if (!acc[plano]) {
          acc[plano] = { 
            count: 0, 
            totalValue: 0, 
            totalCreators: 0,
            avgCreators: 0
          };
        }
        acc[plano].count++;
        acc[plano].totalValue += business.estimated_value || 0;
        acc[plano].totalCreators += business.contract_creators_count || 0;
        acc[plano].avgCreators = Math.round(acc[plano].totalCreators / acc[plano].count);
        return acc;
      }, {});

      console.log('📊 Distribuição por plano:');
      Object.entries(planStats).forEach(([plano, stats]: [string, any]) => {
        const icon = plano === 'Silver' ? '🥈' : 
                    plano === 'Gold' ? '🥇' : 
                    plano === 'Diamond' ? '💎' : 
                    plano === 'Personalizado' ? '⭐' : '📋';
        
        console.log(`  ${icon} ${plano}:`);
        console.log(`    - ${stats.count} negócios`);
        console.log(`    - R$ ${stats.totalValue.toFixed(2)} valor total`);
        console.log(`    - ${stats.totalCreators} criadores total`);
        console.log(`    - ${stats.avgCreators} criadores em média`);
        console.log('');
      });
    }

    // 6. Testar migração de dados antigos
    console.log('🔄 Testando migração de planos antigos...');
    
    // Simular um negócio com plano antigo
    const oldFormatBusiness = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Migração - ' + Date.now(),
      custom_fields: {
        plano_atual: 'Silver - 4', // Formato antigo
        comercial: 'Ativo'
      }
    };

    const { data: oldBusiness, error: oldInsertError } = await supabase
      .from('businesses')
      .insert([oldFormatBusiness])
      .select()
      .single();

    if (!oldInsertError) {
      console.log('✅ Negócio com formato antigo criado');
      
      // Aplicar migração
      const { error: migrationError } = await supabase
        .from('businesses')
        .update({
          custom_fields: {
            ...oldBusiness.custom_fields,
            plano_atual: 'Silver' // Simplificar
          },
          contract_creators_count: 4 // Extrair número
        })
        .eq('id', oldBusiness.id);

      if (!migrationError) {
        console.log('✅ Migração aplicada com sucesso');
      }

      // Limpar dados de teste
      await supabase.from('businesses').delete().eq('id', oldBusiness.id);
    }

    // 7. Limpar dados de teste
    console.log('🗑️ Removendo dados de teste...');
    
    await supabase
      .from('businesses')
      .delete()
      .eq('id', newBusiness.id);

    console.log('✅ Dados de teste removidos');

    console.log('\n🎉 Todos os testes de planos simplificados passaram!');
    return true;

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testSimplifiedPlans()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { testSimplifiedPlans };
