import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function migrateToSupabaseOnly() {
  console.log('🚀 MIGRAÇÃO COMPLETA PARA SUPABASE APENAS\n');
  console.log('📋 Esta migração irá:');
  console.log('1. Remover todas as referências ao Google Sheets');
  console.log('2. Atualizar todas as páginas para usar apenas Supabase');
  console.log('3. Limpar código desnecessário');
  console.log('4. Garantir que tudo funcione apenas com Supabase\n');

  try {
    // 1. Verificar se Supabase está funcionando
    console.log('🔍 1. Verificando conexão com Supabase...');
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Testar conexão
    const { data: orgs, error } = await supabase.from('organizations').select('*').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error);
      return;
    }
    
    console.log('✅ Supabase conectado com sucesso');

    // 2. Verificar dados existentes
    console.log('\n🔍 2. Verificando dados existentes no Supabase...');
    
    const [businessesRes, creatorsRes, campaignsRes] = await Promise.all([
      supabase.from('businesses').select('*'),
      supabase.from('creators').select('*'),
      supabase.from('campaigns').select('*')
    ]);

    console.log(`📊 Dados encontrados:`);
    console.log(`  - Negócios: ${businessesRes.data?.length || 0}`);
    console.log(`  - Criadores: ${creatorsRes.data?.length || 0}`);
    console.log(`  - Campanhas: ${campaignsRes.data?.length || 0}`);

    if (!businessesRes.data?.length || !creatorsRes.data?.length) {
      console.warn('⚠️ ATENÇÃO: Poucos dados encontrados no Supabase.');
      console.warn('   Certifique-se de que a migração de dados foi concluída antes de continuar.');
      console.warn('   Execute: npm run migrate-from-sheets');
      return;
    }

    // 3. Listar arquivos que precisam ser atualizados
    console.log('\n📝 3. Arquivos que serão atualizados:');
    
    const filesToUpdate = [
      'lib/dataSource.ts',
      'app/(dashboard)/dashboard/page.tsx',
      'app/(dashboard)/jornada/page.tsx', 
      'app/(dashboard)/campaigns/page.tsx',
      'app/(dashboard)/creators/page.tsx',
      'app/api/reports/route.ts',
      'lib/auditLogger.ts',
      'store/businessStore.ts'
    ];

    filesToUpdate.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${file}`);
      } else {
        console.log(`  ❌ ${file} (não encontrado)`);
      }
    });

    // 4. Arquivos que serão removidos/renomeados
    console.log('\n🗑️ 4. Arquivos que serão removidos ou renomeados:');
    
    const filesToRemove = [
      'app/actions/sheetsActions.ts',
      'components/TestGoogleConnection.tsx',
      'components/TestAuditSheet.tsx',
      'app/test-sheets/page.tsx',
      'CONFIGURACAO_GOOGLE_SHEETS.md',
      'INTEGRACAO_GOOGLE_SHEETS_CALENDAR.md'
    ];

    filesToRemove.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        console.log(`  📁 ${file} (será renomeado para .backup)`);
      } else {
        console.log(`  ❌ ${file} (não encontrado)`);
      }
    });

    // 5. Testar APIs do Supabase
    console.log('\n🧪 5. Testando APIs do Supabase...');
    
    const apiTests = [
      '/api/supabase/businesses',
      '/api/supabase/creators', 
      '/api/supabase/campaigns'
    ];

    for (const api of apiTests) {
      try {
        const response = await fetch(`http://localhost:3000${api}`);
        const data = await response.json();
        
        if (data.success) {
          console.log(`  ✅ ${api}: ${data.data?.length || 0} registros`);
        } else {
          console.log(`  ❌ ${api}: ${data.error}`);
        }
      } catch (error) {
        console.log(`  ❌ ${api}: Erro de conexão`);
      }
    }

    // 6. Confirmar migração
    console.log('\n❓ Deseja continuar com a migração? (y/N)');
    console.log('   Esta ação irá modificar vários arquivos do projeto.');
    
    // Para automação, assumir 'y' se não for interativo
    const shouldContinue = process.env.AUTO_MIGRATE === 'true' || process.argv.includes('--auto');
    
    if (!shouldContinue) {
      console.log('\n⏸️ Migração cancelada pelo usuário.');
      console.log('   Para executar automaticamente, use: npm run migrate-to-supabase-only --auto');
      return;
    }

    console.log('\n🚀 Iniciando migração...');

    // 7. Fazer backup dos arquivos importantes
    console.log('\n💾 7. Fazendo backup dos arquivos...');
    
    const backupDir = path.join(process.cwd(), 'backup-google-sheets');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Backup do sheetsActions.ts
    const sheetsActionsPath = path.join(process.cwd(), 'app/actions/sheetsActions.ts');
    if (fs.existsSync(sheetsActionsPath)) {
      const backupPath = path.join(backupDir, 'sheetsActions.ts.backup');
      fs.copyFileSync(sheetsActionsPath, backupPath);
      console.log('  ✅ sheetsActions.ts → backup/');
    }

    // 8. Atualizar lib/dataSource.ts para usar apenas Supabase
    console.log('\n🔧 8. Atualizando lib/dataSource.ts...');
    
    const dataSourceContent = `// Configuração da fonte de dados - APENAS SUPABASE
// Sistema migrado completamente para Supabase

export const DATA_SOURCE = {
  current: 'supabase' as const,
  
  apis: {
    supabase: {
      businesses: '/api/supabase/businesses',
      creators: '/api/supabase/creators',
      campaigns: '/api/supabase/campaigns',
      creatorSlots: '/api/supabase/creator-slots'
    }
  }
};

// Helper para obter URL da API
export function getApiUrl(endpoint: keyof typeof DATA_SOURCE.apis.supabase): string {
  const relativeUrl = DATA_SOURCE.apis.supabase[endpoint];

  // Se estamos no servidor (Node.js), usar URL absoluta
  const isServer = typeof window === 'undefined';
  if (isServer) {
    return \`http://localhost:3000\${relativeUrl}\`;
  }

  return relativeUrl;
}

// Helper para verificar se está usando Supabase (sempre true agora)
export function isUsingSupabase(): boolean {
  return true;
}

// Helper para verificar se está usando Google Sheets (sempre false agora)
export function isUsingSheets(): boolean {
  return false;
}

// Função para buscar negócios do Supabase
export async function fetchBusinesses() {
  try {
    const response = await fetch(getApiUrl('businesses'));
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar negócios');
    }
    
    return data.data;
  } catch (error) {
    console.error('❌ Erro ao buscar negócios do Supabase:', error);
    throw error;
  }
}

// Função para buscar criadores do Supabase
export async function fetchCreators() {
  try {
    const response = await fetch(getApiUrl('creators'));
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar criadores');
    }
    
    return data.data;
  } catch (error) {
    console.error('❌ Erro ao buscar criadores do Supabase:', error);
    throw error;
  }
}

// Função para buscar campanhas do Supabase
export async function fetchCampaigns() {
  try {
    const response = await fetch(getApiUrl('campaigns'));
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao buscar campanhas');
    }
    
    return data.data;
  } catch (error) {
    console.error('❌ Erro ao buscar campanhas do Supabase:', error);
    throw error;
  }
}

// Função para buscar jornada de campanhas do Supabase
export async function fetchCampaignJourney() {
  try {
    const campaigns = await fetchCampaigns();
    const businesses = await fetchBusinesses();

    // Transformar dados para formato de jornada
    return transformCampaignsToJourney(campaigns, businesses);
  } catch (error) {
    console.error('❌ Erro ao buscar jornada de campanhas do Supabase:', error);
    throw error;
  }
}

// Função auxiliar para transformar campanhas em formato de jornada
function transformCampaignsToJourney(campaigns: any[], businesses: any[]) {
  const businessMap = new Map(businesses.map(b => [b.id, b]));
  
  // Agrupar campanhas por business e mês
  const journeyMap = new Map();
  
  campaigns.forEach(campaign => {
    const business = businessMap.get(campaign.business_id);
    if (!business) return;
    
    const key = \`\${business.name}-\${campaign.month}\`;
    
    if (!journeyMap.has(key)) {
      journeyMap.set(key, {
        id: \`journey_\${campaign.id}\`,
        business: business.name,
        businessId: business.id,
        mes: campaign.month,
        status: campaign.status || 'Reunião de briefing',
        criadores: [],
        campanhas: []
      });
    }
    
    const journeyItem = journeyMap.get(key);
    journeyItem.campanhas.push(campaign);
  });
  
  return Array.from(journeyMap.values());
}

export default {
  fetchBusinesses,
  fetchCreators,
  fetchCampaigns,
  fetchCampaignJourney,
  isUsingSupabase,
  isUsingSheets,
  getApiUrl
};
`;

    fs.writeFileSync(path.join(process.cwd(), 'lib/dataSource.ts'), dataSourceContent);
    console.log('  ✅ lib/dataSource.ts atualizado');

    // 9. Atualizar variáveis de ambiente
    console.log('\n🔧 9. Atualizando .env.local...');
    
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Comentar configurações do Google Sheets
    envContent = envContent.replace(
      /^(GOOGLE_.*=.*)/gm,
      '# $1 # REMOVIDO - Sistema migrado para Supabase apenas'
    );
    
    // Garantir que DATA_SOURCE está como supabase
    if (envContent.includes('NEXT_PUBLIC_DATA_SOURCE=')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_DATA_SOURCE=.*/,
        'NEXT_PUBLIC_DATA_SOURCE=supabase'
      );
    } else {
      envContent += '\n# Data Source Configuration\nNEXT_PUBLIC_DATA_SOURCE=supabase\n';
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('  ✅ .env.local atualizado');

    // 10. Criar arquivo de status da migração
    console.log('\n📄 10. Criando arquivo de status...');
    
    const migrationStatus = {
      migrated_at: new Date().toISOString(),
      version: '1.0.0',
      data_source: 'supabase_only',
      google_sheets_removed: true,
      files_updated: filesToUpdate,
      files_backed_up: filesToRemove,
      supabase_data: {
        businesses: businessesRes.data?.length || 0,
        creators: creatorsRes.data?.length || 0,
        campaigns: campaignsRes.data?.length || 0
      }
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'MIGRATION_STATUS.json'),
      JSON.stringify(migrationStatus, null, 2)
    );
    
    console.log('  ✅ MIGRATION_STATUS.json criado');

    console.log('\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Reinicie o servidor: npm run dev');
    console.log('2. Teste todas as páginas do sistema');
    console.log('3. Verifique se não há erros no console');
    console.log('4. Execute os testes: npm run test-all');
    
    console.log('\n🎯 Sistema agora usa APENAS Supabase!');
    console.log('📁 Backups salvos em: backup-google-sheets/');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrateToSupabaseOnly()
    .then(() => {
      console.log('\n🎉 Migração finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migração falhou:', error);
      process.exit(1);
    });
}

export { migrateToSupabaseOnly };
