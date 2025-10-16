import { readFileSync } from 'fs';
import { resolve } from 'path';

async function runMigration() {
  const sqlPath = resolve(__dirname, '../database/migrations/002_seed_relatorio360.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  console.log('🚀 Executando migration de criação da LP Relatório 360º...');
  console.log('📄 Arquivo:', sqlPath);
  console.log('');

  // Usar fetch para chamar o Supabase REST API com admin credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltam variáveis NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
    console.log('💡 Execute esta migration manualmente via Supabase SQL Editor');
    process.exit(1);
  }

  // Unfortunately, Supabase doesn't provide a direct SQL execution endpoint for scripts
  // We need to use Postgres directly via socket or use their dashboard

  console.log('⚠️ Supabase JavaScript SDK não suporta execução de raw SQL');
  console.log('');
  console.log('💡 Para executar esta migration, faça um dos seguintes:');
  console.log('');
  console.log('OPÇÃO 1: Usar Supabase Dashboard');
  console.log('  1. Acesse https://app.supabase.com');
  console.log('  2. Selecione seu projeto');
  console.log('  3. Vá para "SQL Editor"');
  console.log('  4. Cole o conteúdo de: database/migrations/002_seed_relatorio360.sql');
  console.log('  5. Execute');
  console.log('');
  console.log('OPÇÃO 2: Usar psql via terminal (se tiver acesso ao banco)');
  console.log('  psql -h <host> -U <user> -d <database> -f database/migrations/002_seed_relatorio360.sql');
  console.log('');
  console.log('OPÇÃO 3: Usar migrations com Next.js (se configurado)');
  console.log('  npm run migrate');
  console.log('');
  console.log('SQL a executar:');
  console.log('─'.repeat(80));
  console.log(sql);
  console.log('─'.repeat(80));
}

runMigration().catch(console.error);
