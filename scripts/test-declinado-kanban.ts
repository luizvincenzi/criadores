#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function createDeclinadoBusiness() {
  console.log('🚀 CRIANDO NEGÓCIO DE TESTE COM ETAPA "DECLINADO"');
  console.log('===============================================\n');

  try {
    // Criar um business com etapa "Declinado"
    const businessData = {
      organization_id: DEFAULT_ORG_ID,
      name: 'Empresa Teste Declinado',
      business_stage: 'Declinado',
      estimated_value: 10000,
      priority: 'Média',
      contact_info: {
        primary_contact: 'João Silva',
        email: 'joao@empresateste.com',
        phone: '(11) 99999-9999'
      },
      custom_fields: {
        plano_atual: 'Silver',
        motivo_declinado: 'Orçamento não aprovado'
      },
      is_active: true
    };

    const { data: business, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar business:', error);
      return null;
    }

    console.log('✅ Business criado com sucesso:');
    console.log(`   📝 ID: ${business.id}`);
    console.log(`   📝 Nome: ${business.name}`);
    console.log(`   📝 Etapa: ${business.business_stage}`);
    console.log(`   📝 Valor: R$ ${business.estimated_value}`);
    console.log(`   📝 Prioridade: ${business.priority}`);

    return business;

  } catch (error) {
    console.error('❌ Erro ao criar business de teste:', error);
    return null;
  }
}

async function testDealsAPI() {
  console.log('\n🧪 TESTANDO API DE DEALS...');
  
  try {
    // Testar a API que o frontend usa
    const response = await fetch('http://localhost:3002/api/deals');
    
    if (!response.ok) {
      console.error('❌ Erro na API:', response.statusText);
      return false;
    }

    const data = await response.json();
    
    if (!data.deals) {
      console.error('❌ Resposta da API inválida:', data);
      return false;
    }

    console.log(`✅ API funcionando! ${data.deals.length} deals encontrados`);
    
    // Procurar por deals com etapa "Declinado"
    const declinadoDeals = data.deals.filter((deal: any) => deal.stage === 'Declinado');
    
    if (declinadoDeals.length > 0) {
      console.log(`🎯 ${declinadoDeals.length} deal(s) com etapa "Declinado" encontrado(s):`);
      declinadoDeals.forEach((deal: any, index: number) => {
        console.log(`   ${index + 1}. ${deal.business_name} - R$ ${deal.estimated_value}`);
      });
    } else {
      console.log('⚠️ Nenhum deal com etapa "Declinado" encontrado');
    }

    return true;

  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
    return false;
  }
}

async function main() {
  console.log('🎯 OBJETIVO: Testar a nova etapa "Declinado" no Kanban\n');

  // 1. Criar business de teste
  const business = await createDeclinadoBusiness();
  if (!business) {
    console.log('❌ Falha ao criar business de teste. Abortando.');
    process.exit(1);
  }

  // 2. Testar API
  const apiWorking = await testDealsAPI();
  if (!apiWorking) {
    console.log('⚠️ API com problemas, mas o business foi criado.');
  }

  console.log('\n✅ TESTE CONCLUÍDO!');
  console.log('🎯 Agora você pode:');
  console.log('   • Acessar http://localhost:3002/deals');
  console.log('   • Ver a nova coluna "Declinado" no Kanban');
  console.log('   • Arrastar negócios para a etapa "Declinado"');
  console.log('   • Criar novos negócios com etapa "Declinado"');
  
  console.log('\n🧹 Para limpar o teste:');
  console.log(`   • Business ID: ${business.id}`);
  console.log('   • Você pode deletar pelo dashboard ou deixar como exemplo');
}

if (require.main === module) {
  main().catch(console.error);
}
