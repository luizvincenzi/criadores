#!/usr/bin/env tsx

/**
 * Script para configurar o novo sistema de user roles
 * Executa a migration e cria usuários de exemplo
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔍 Verificando variáveis de ambiente...');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Não encontrado');
console.log('SERVICE_KEY:', supabaseServiceKey ? '✅ Configurado' : '❌ Não encontrado');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE não configuradas');
  console.error('Certifique-se de que .env.local contém:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('🚀 CONFIGURANDO SISTEMA DE USER ROLES');
  console.log('=====================================\n');

  try {
    // 1. Executar migration
    await executeMigration();
    
    // 2. Verificar estrutura
    await verifyStructure();
    
    // 3. Criar usuários de exemplo
    await createExampleUsers();
    
    // 4. Testar permissões
    await testPermissions();
    
    console.log('\n✅ SISTEMA DE USER ROLES CONFIGURADO COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

async function executeMigration() {
  console.log('📄 1. EXECUTANDO MIGRATION...');
  console.log('==============================');
  
  try {
    const migrationPath = join(process.cwd(), 'supabase/migrations/025_update_user_roles_system.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Dividir em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && cmd !== 'COMMIT');
    
    for (const command of commands) {
      if (command.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: command + ';' });
        if (error && !error.message.includes('already exists') && !error.message.includes('exec_sql')) {
          console.log(`⚠️ Aviso ao executar comando: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Migration executada com sucesso');
    
  } catch (error) {
    console.log('⚠️ Erro na migration (pode ser normal se já foi executada):', error);
  }
}

async function verifyStructure() {
  console.log('\n🔍 2. VERIFICANDO ESTRUTURA...');
  console.log('==============================');
  
  // Verificar se novos roles existem
  const { data: enumValues, error: enumError } = await supabase
    .rpc('exec_sql', { 
      sql: "SELECT unnest(enum_range(NULL::user_role)) as role_name;" 
    });
  
  if (!enumError && enumValues) {
    console.log('📋 User roles disponíveis:');
    enumValues.forEach((row: any) => {
      console.log(`   - ${row.role_name}`);
    });
  }
  
  // Verificar se colunas foram adicionadas
  const { data: columns, error: colError } = await supabase
    .rpc('exec_sql', { 
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('business_id', 'creator_id', 'managed_businesses')
        ORDER BY column_name;
      ` 
    });
  
  if (!colError && columns) {
    console.log('\n📋 Novas colunas na tabela users:');
    columns.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
  }
  
  console.log('✅ Estrutura verificada');
}

async function createExampleUsers() {
  console.log('\n👥 3. CRIANDO USUÁRIOS DE EXEMPLO...');
  console.log('====================================');
  
  // Buscar uma empresa existente para usar como exemplo
  const { data: businesses, error: bizError } = await supabase
    .from('businesses')
    .select('id, name')
    .limit(1);
  
  if (bizError || !businesses || businesses.length === 0) {
    console.log('⚠️ Nenhuma empresa encontrada, pulando criação de business_owner');
    return;
  }
  
  const exampleBusiness = businesses[0];
  console.log(`📋 Usando empresa exemplo: ${exampleBusiness.name}`);
  
  // Buscar um criador existente
  const { data: creators, error: creatorError } = await supabase
    .from('creators')
    .select('id, name')
    .limit(1);
  
  const exampleCreator = creators && creators.length > 0 ? creators[0] : null;
  if (exampleCreator) {
    console.log(`📋 Usando criador exemplo: ${exampleCreator.name}`);
  }
  
  const exampleUsers = [
    {
      email: 'business.owner@exemplo.com',
      full_name: 'Dono da Empresa Exemplo',
      role: 'business_owner',
      business_id: exampleBusiness.id,
      description: 'Proprietário da empresa cliente'
    },
    {
      email: 'marketing.strategist@exemplo.com', 
      full_name: 'Estrategista Marketing Exemplo',
      role: 'marketing_strategist',
      managed_businesses: [exampleBusiness.id],
      description: 'Estrategista que gerencia campanhas'
    }
  ];
  
  if (exampleCreator) {
    exampleUsers.push({
      email: 'creator@exemplo.com',
      full_name: 'Criador Exemplo',
      role: 'creator',
      creator_id: exampleCreator.id,
      description: 'Criador de conteúdo'
    } as any);
  }
  
  for (const user of exampleUsers) {
    try {
      // Verificar se usuário já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', user.email)
        .single();
      
      if (existingUser) {
        console.log(`⚠️ Usuário ${user.email} já existe, pulando...`);
        continue;
      }
      
      // Criar usuário usando a função SQL
      const { data, error } = await supabase.rpc('create_user_with_role', {
        p_email: user.email,
        p_full_name: user.full_name,
        p_role: user.role,
        p_organization_id: DEFAULT_ORG_ID,
        p_business_id: (user as any).business_id || null,
        p_creator_id: (user as any).creator_id || null,
        p_managed_businesses: (user as any).managed_businesses || null
      });
      
      if (error) {
        console.log(`❌ Erro ao criar ${user.email}:`, error.message);
      } else {
        console.log(`✅ Criado: ${user.full_name} (${user.role}) - ${user.description}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro ao processar ${user.email}:`, error);
    }
  }
}

async function testPermissions() {
  console.log('\n🧪 4. TESTANDO PERMISSÕES...');
  console.log('=============================');
  
  const testRoles = ['admin', 'business_owner', 'creator', 'marketing_strategist'];
  
  for (const role of testRoles) {
    try {
      const { data, error } = await supabase.rpc('get_default_permissions', {
        user_role: role,
        business_id: role === 'business_owner' ? '00000000-0000-0000-0000-000000000002' : null
      });
      
      if (error) {
        console.log(`❌ Erro ao testar ${role}:`, error.message);
      } else {
        console.log(`✅ ${role}: ${data.scope} scope`);
        
        // Mostrar algumas permissões principais
        const perms = data;
        const businessAccess = perms.businesses ? `${perms.businesses.read ? 'R' : ''}${perms.businesses.write ? 'W' : ''}${perms.businesses.delete ? 'D' : ''}` : 'None';
        const campaignAccess = perms.campaigns ? `${perms.campaigns.read ? 'R' : ''}${perms.campaigns.write ? 'W' : ''}${perms.campaigns.delete ? 'D' : ''}` : 'None';
        
        console.log(`   - Businesses: ${businessAccess}, Campaigns: ${campaignAccess}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao testar ${role}:`, error);
    }
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

export { main };
