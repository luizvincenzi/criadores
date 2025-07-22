#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.log('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function createDefaultOrganization() {
  console.log('🏢 Criando organização padrão...');

  try {
    // Verificar se a organização já existe
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', DEFAULT_ORG_ID)
      .single();

    if (existingOrg) {
      console.log('✅ Organização padrão já existe:', existingOrg.name);
      return existingOrg;
    }

    // Criar organização padrão
    const { data: newOrg, error } = await supabase
      .from('organizations')
      .insert([{
        id: DEFAULT_ORG_ID,
        name: 'CRM Criadores',
        slug: 'crm-criadores',
        description: 'Organização padrão do CRM Criadores',
        settings: {
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          language: 'pt-BR'
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar organização:', error);
      return null;
    }

    console.log('✅ Organização padrão criada:', newOrg.name);
    return newOrg;

  } catch (error) {
    console.error('❌ Erro ao criar organização padrão:', error);
    return null;
  }
}

async function testAuditLog() {
  console.log('\n📝 Testando audit log após criar organização...');

  try {
    const response = await fetch('http://localhost:3000/api/supabase/audit-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entity_type: 'system',
        entity_id: 'test_after_org_creation',
        entity_name: 'Teste após criação da organização',
        action: 'create',
        user_email: 'sistema@crmcriadores.com'
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Audit log funcionando após criação da organização');
      console.log(`   📝 ID: ${data.data.id}`);
    } else {
      console.log('❌ Audit log ainda falhando:', data.error);
    }
  } catch (error) {
    console.log('❌ Erro ao testar audit log:', error);
  }
}

async function main() {
  console.log('🚀 Configurando organização padrão para resolver audit logs...\n');

  // 1. Criar organização padrão
  const org = await createDefaultOrganization();
  
  if (!org) {
    console.log('❌ Falha ao criar organização. Abortando.');
    process.exit(1);
  }

  // 2. Testar audit log
  await testAuditLog();

  console.log('\n✅ Configuração concluída!');
  console.log('🎯 Os audit logs agora devem funcionar corretamente.');
}

if (require.main === module) {
  main().catch(console.error);
}
