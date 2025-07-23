#!/usr/bin/env tsx

/**
 * Script para configurar modo demo sem Supabase
 * Permite testar a interface mesmo sem credenciais
 */

import fs from 'fs';
import path from 'path';

async function setupDemoMode() {
  console.log('🎭 CONFIGURANDO MODO DEMO');
  console.log('========================\n');

  // Criar arquivo de configuração demo
  const envContent = `# ===============================================
# CRM CRIADORES - MODO DEMO (SEM SUPABASE)
# ===============================================

# Modo demo - usa dados mock
NEXT_PUBLIC_DATA_SOURCE=mock
NODE_ENV=development

# Supabase desabilitado para demo
NEXT_PUBLIC_SUPABASE_URL=demo-mode
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-mode
SUPABASE_SERVICE_ROLE_KEY=demo-mode
`;

  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent);

  console.log('✅ Arquivo .env.local configurado para modo demo');
  console.log('📝 DATA_SOURCE definido como "mock"');
  console.log('');
  console.log('🎯 AGORA VOCÊ PODE:');
  console.log('   • Ver a interface completa funcionando');
  console.log('   • Testar o Kanban de negócios');
  console.log('   • Navegar entre todas as páginas');
  console.log('   • Usar dados de exemplo');
  console.log('');
  console.log('⚠️  LIMITAÇÕES DO MODO DEMO:');
  console.log('   • Dados não são salvos permanentemente');
  console.log('   • Algumas funcionalidades podem estar limitadas');
  console.log('   • Para funcionalidade completa, configure o Supabase');
  console.log('');
  console.log('🔄 REINICIE O SERVIDOR:');
  console.log('   • Pressione Ctrl+C no terminal do servidor');
  console.log('   • Execute: npm run dev');
  console.log('');
  console.log('✨ O erro "Nenhuma organização encontrada" será resolvido!');
}

if (require.main === module) {
  setupDemoMode().catch(console.error);
}
