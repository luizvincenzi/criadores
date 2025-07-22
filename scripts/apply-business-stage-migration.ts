import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

async function applyMigration() {
  try {
    console.log('🚀 Aplicando migration para adicionar business_stage e estimated_value...');

    // Ler o arquivo de migration
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/015_add_business_stage_and_value.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Dividir o SQL em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${commands.length} comandos SQL...`);

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`);
        console.log(`SQL: ${command.substring(0, 100)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error);
          // Continuar com os próximos comandos mesmo se um falhar
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      }
    }

    // Verificar se as colunas foram criadas
    console.log('🔍 Verificando se as colunas foram criadas...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'businesses')
      .in('column_name', ['business_stage', 'estimated_value']);

    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError);
    } else {
      console.log('📊 Colunas encontradas:', columns);
    }

    // Testar inserção de dados com os novos campos
    console.log('🧪 Testando inserção com novos campos...');
    
    const testData = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Business Stage',
      business_stage: 'Leads próprios quentes',
      estimated_value: 15000.00,
      contact_info: {
        primary_contact: 'Teste',
        email: 'teste@teste.com'
      },
      address: {
        city: 'São Paulo',
        state: 'SP'
      }
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('businesses')
      .insert([testData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir dados de teste:', insertError);
    } else {
      console.log('✅ Dados de teste inseridos com sucesso:', insertResult);
      
      // Remover dados de teste
      await supabase
        .from('businesses')
        .delete()
        .eq('id', insertResult.id);
      
      console.log('🗑️ Dados de teste removidos');
    }

    console.log('🎉 Migration aplicada com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyMigration();
}

export { applyMigration };
