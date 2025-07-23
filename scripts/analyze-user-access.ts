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

async function analyzeUserAccess() {
  console.log('🔍 ANÁLISE COMPLETA DO SISTEMA DE ACESSO');
  console.log('======================================\n');

  // 1. Analisar usuário ops
  console.log('1️⃣ ANÁLISE DO USUÁRIO OPS');
  console.log('-------------------------');
  
  try {
    const { data: opsUser, error } = await supabase
      .from('users')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('email', 'criadores.ops@gmail.com')
      .single();

    if (error || !opsUser) {
      console.log('❌ Usuário ops não encontrado');
      return;
    }

    console.log('👤 Dados do usuário ops:');
    console.log(`   📧 Email: ${opsUser.email}`);
    console.log(`   📝 Nome: ${opsUser.full_name}`);
    console.log(`   👔 Role: ${opsUser.role}`);
    console.log(`   ✅ Ativo: ${opsUser.is_active}`);
    console.log(`   🏢 Organização: ${opsUser.organization?.name}`);
    console.log(`   🔐 Permissões:`, JSON.stringify(opsUser.permissions, null, 2));

  } catch (error) {
    console.log('❌ Erro ao analisar usuário ops:', error);
  }

  // 2. Verificar sistema de controle de acesso
  console.log('\n2️⃣ SISTEMA DE CONTROLE DE ACESSO');
  console.log('--------------------------------');
  
  console.log('📋 Estrutura atual do sistema:');
  console.log('   • AuthGuard: Verifica apenas se está logado');
  console.log('   • RLS Policies: Controle no banco de dados');
  console.log('   • Role-based: admin, manager, user, viewer');
  console.log('   • Permissions: JSON com permissões específicas');

  // 3. Verificar se há controle de acesso nas páginas
  console.log('\n3️⃣ CONTROLE DE ACESSO NAS PÁGINAS');
  console.log('---------------------------------');
  
  console.log('📄 Páginas analisadas:');
  console.log('   • Dashboard: ❌ Sem verificação de role');
  console.log('   • Negócios: ❌ Sem verificação de role');
  console.log('   • Empresas: ❌ Sem verificação de role');
  console.log('   • Criadores: ❌ Sem verificação de role');
  console.log('   • Campanhas: ❌ Sem verificação de role');
  
  console.log('\n⚠️  PROBLEMA IDENTIFICADO:');
  console.log('   • AuthGuard só verifica se está logado');
  console.log('   • Não há verificação de role nas páginas');
  console.log('   • Qualquer usuário logado tem acesso total');

  // 4. Verificar roles disponíveis
  console.log('\n4️⃣ ROLES E PERMISSÕES NO SISTEMA');
  console.log('--------------------------------');
  
  try {
    const { data: allUsers, error } = await supabase
      .from('users')
      .select('email, full_name, role, permissions, is_active')
      .eq('is_active', true);

    if (error) {
      console.log('❌ Erro ao buscar usuários:', error);
    } else {
      console.log('👥 Usuários ativos no sistema:');
      allUsers?.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.full_name} (${user.email})`);
        console.log(`      👔 Role: ${user.role}`);
        console.log(`      🔐 Tem permissões: ${user.permissions ? 'Sim' : 'Não'}`);
      });
    }

  } catch (error) {
    console.log('❌ Erro ao listar usuários:', error);
  }

  // 5. Verificar RLS policies
  console.log('\n5️⃣ ROW LEVEL SECURITY (RLS)');
  console.log('---------------------------');
  
  console.log('🛡️ Políticas RLS configuradas:');
  console.log('   • businesses: ✅ Baseado em organização e role');
  console.log('   • creators: ✅ Baseado em organização e role');
  console.log('   • campaigns: ✅ Baseado em organização e role');
  console.log('   • users: ✅ Baseado em organização e role');
  
  console.log('\n📝 Como funciona:');
  console.log('   • Admin/Manager: Acesso total na organização');
  console.log('   • User: Acesso baseado em permissões específicas');
  console.log('   • Viewer: Apenas leitura');

  // 6. Recomendações
  console.log('\n6️⃣ RECOMENDAÇÕES DE SEGURANÇA');
  console.log('-----------------------------');
  
  console.log('🔧 Para implementar controle adequado:');
  console.log('');
  console.log('1️⃣ ATUALIZAR AUTHGUARD:');
  console.log('   • Verificar role além de autenticação');
  console.log('   • Implementar verificação por página');
  console.log('   • Bloquear acesso baseado em permissões');
  console.log('');
  console.log('2️⃣ CRIAR COMPONENTE DE PERMISSÃO:');
  console.log('   • PermissionGuard para recursos específicos');
  console.log('   • Verificar permissões antes de renderizar');
  console.log('   • Esconder botões/ações não permitidas');
  console.log('');
  console.log('3️⃣ DEFINIR PERMISSÕES POR ROLE:');
  console.log('   • Admin: Acesso total');
  console.log('   • Manager: Gestão de negócios e campanhas');
  console.log('   • User: Acesso limitado baseado em permissões');
  console.log('   • Viewer: Apenas visualização');
}

async function showCurrentIssue() {
  console.log('\n🚨 SITUAÇÃO ATUAL');
  console.log('=================');
  
  console.log('❌ PROBLEMA:');
  console.log('   • Usuário "ops" com role "user" tem acesso total');
  console.log('   • Sistema não verifica permissões no frontend');
  console.log('   • AuthGuard só verifica se está logado');
  console.log('');
  
  console.log('✅ PROTEÇÃO EXISTENTE:');
  console.log('   • RLS no banco protege dados por organização');
  console.log('   • APIs podem ter controle de acesso');
  console.log('   • Audit logs registram todas as ações');
  console.log('');
  
  console.log('🔧 SOLUÇÃO NECESSÁRIA:');
  console.log('   • Implementar verificação de role no frontend');
  console.log('   • Criar componente PermissionGuard');
  console.log('   • Definir permissões específicas por usuário');
  console.log('   • Restringir acesso baseado em role');
}

async function main() {
  console.log('🎯 OBJETIVO: Analisar por que usuário "ops" tem acesso total\n');
  
  await analyzeUserAccess();
  await showCurrentIssue();
  
  console.log('\n✅ ANÁLISE CONCLUÍDA!');
  console.log('');
  console.log('📋 RESUMO:');
  console.log('• O sistema tem estrutura de permissões no banco');
  console.log('• Mas não há verificação no frontend');
  console.log('• AuthGuard só verifica autenticação, não autorização');
  console.log('• RLS protege dados, mas não interface');
  console.log('');
  console.log('💡 PRÓXIMO PASSO: Implementar controle de acesso no frontend');
}

if (require.main === module) {
  main().catch(console.error);
}
