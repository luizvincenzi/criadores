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

async function testBusinessStageFields() {
  try {
    console.log('🧪 Testando novos campos business_stage e estimated_value...');

    // 1. Verificar se as colunas existem
    console.log('🔍 Verificando se as colunas existem...');
    
    const { data: businesses, error: selectError } = await supabase
      .from('businesses')
      .select('id, name, business_stage, estimated_value')
      .limit(3);

    if (selectError) {
      console.error('❌ Erro ao buscar negócios:', selectError);
      console.log('⚠️  As colunas ainda não foram criadas. Execute os comandos SQL no Supabase Dashboard.');
      return false;
    }

    console.log('✅ Colunas existem! Dados encontrados:', businesses);

    // 2. Testar inserção de um negócio com os novos campos
    console.log('🧪 Testando inserção com novos campos...');
    
    const testBusiness = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Business Stage - ' + Date.now(),
      business_stage: 'Leads próprios quentes',
      estimated_value: 25000.50,
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
      status: 'Reunião de briefing'
    };

    const { data: insertedBusiness, error: insertError } = await supabase
      .from('businesses')
      .insert([testBusiness])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir negócio de teste:', insertError);
      return false;
    }

    console.log('✅ Negócio de teste inserido:', insertedBusiness);

    // 3. Testar atualização dos campos
    console.log('🔄 Testando atualização dos campos...');
    
    const { data: updatedBusiness, error: updateError } = await supabase
      .from('businesses')
      .update({
        business_stage: 'Contrato assinado',
        estimated_value: 30000.00
      })
      .eq('id', insertedBusiness.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar negócio:', updateError);
      return false;
    }

    console.log('✅ Negócio atualizado:', updatedBusiness);

    // 4. Testar busca por etapa
    console.log('🔍 Testando busca por etapa...');
    
    const { data: businessesByStage, error: stageError } = await supabase
      .from('businesses')
      .select('id, name, business_stage, estimated_value')
      .eq('business_stage', 'Contrato assinado')
      .limit(5);

    if (stageError) {
      console.error('❌ Erro ao buscar por etapa:', stageError);
      return false;
    }

    console.log('✅ Negócios com contrato assinado:', businessesByStage);

    // 5. Calcular estatísticas
    console.log('📊 Calculando estatísticas...');
    
    const { data: allBusinesses, error: allError } = await supabase
      .from('businesses')
      .select('business_stage, estimated_value')
      .eq('is_active', true);

    if (allError) {
      console.error('❌ Erro ao buscar todos os negócios:', allError);
      return false;
    }

    const stats = allBusinesses.reduce((acc: any, business: any) => {
      const stage = business.business_stage || 'Leads próprios frios';
      if (!acc.byStage[stage]) {
        acc.byStage[stage] = { count: 0, totalValue: 0 };
      }
      acc.byStage[stage].count++;
      acc.byStage[stage].totalValue += business.estimated_value || 0;
      acc.totalValue += business.estimated_value || 0;
      return acc;
    }, { byStage: {}, totalValue: 0 });

    console.log('📈 Estatísticas por etapa:', stats);

    // 6. Limpar dados de teste
    console.log('🗑️ Removendo dados de teste...');
    
    await supabase
      .from('businesses')
      .delete()
      .eq('id', insertedBusiness.id);

    console.log('✅ Dados de teste removidos');

    console.log('🎉 Todos os testes passaram! Os novos campos estão funcionando corretamente.');
    return true;

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testBusinessStageFields()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { testBusinessStageFields };
