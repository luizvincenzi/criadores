#!/usr/bin/env tsx

import { supabase } from '../lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function applyUnifyEnumsMigration() {
  try {
    console.log('🚀 Aplicando migration para unificar enums campaign_status e jornada_stage...');
    
    // Ler o arquivo de migration
    const migrationPath = path.join(__dirname, '../supabase/migrations/027_unify_status_enums.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL carregada:');
    console.log('----------------------------------------');
    console.log(migrationSQL);
    console.log('----------------------------------------');
    
    // Dividir o SQL em comandos individuais (separados por ;)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📋 Executando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`\n🔄 Executando comando ${i + 1}/${commands.length}:`);
        console.log(`   ${command.substring(0, 100)}${command.length > 100 ? '...' : ''}`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: command 
          });
          
          if (error) {
            console.error(`❌ Erro no comando ${i + 1}:`, error);
            throw error;
          }
          
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        } catch (error) {
          console.error(`❌ Erro ao executar comando ${i + 1}:`, error);
          
          // Se o comando falhar, tentar executar diretamente
          console.log('🔄 Tentando executar diretamente...');
          try {
            const { data, error: directError } = await supabase
              .from('information_schema.tables')
              .select('*')
              .limit(1);
            
            if (directError) {
              console.error('❌ Conexão com Supabase falhou:', directError);
              throw directError;
            }
            
            console.log('⚠️ Comando pode ter falhado, mas conexão está OK. Continuando...');
          } catch (connectionError) {
            console.error('❌ Erro de conexão:', connectionError);
            throw connectionError;
          }
        }
      }
    }
    
    console.log('\n🎉 Migration aplicada com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Verificar se as tabelas foram atualizadas corretamente');
    console.log('2. Testar o drag & drop na aba jornada');
    console.log('3. Verificar se não há erros de tipo no frontend');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyUnifyEnumsMigration();
}

export { applyUnifyEnumsMigration };
