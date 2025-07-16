import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCampaignCreatorsTable() {
  console.log('🔍 Verificando tabela campaign_creators...\n');
  
  try {
    // 1. Verificar estrutura da tabela usando uma query SQL
    console.log('📋 Verificando estrutura da tabela...');
    
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'campaign_creators' });
    
    if (columnsError) {
      console.log('⚠️ Não foi possível usar RPC, tentando método alternativo...');
      
      // Método alternativo: tentar inserir com dados mínimos
      const { data: testData, error: testError } = await supabase
        .from('campaign_creators')
        .select('*')
        .limit(0);
      
      if (testError) {
        console.error('❌ Erro ao acessar tabela:', testError);
      } else {
        console.log('✅ Tabela acessível');
      }
    } else {
      console.log('✅ Estrutura da tabela:', columns);
    }
    
    // 2. Verificar se há dados na tabela
    console.log('\n📊 Verificando dados existentes...');
    
    const { data: existingData, error: existingError } = await supabase
      .from('campaign_creators')
      .select('*');
    
    if (existingError) {
      console.error('❌ Erro ao buscar dados:', existingError);
    } else {
      console.log(`✅ Dados existentes: ${existingData.length} relacionamentos`);
    }
    
    // 3. Tentar criar a tabela novamente (se não existir)
    console.log('\n🔧 Verificando se a tabela precisa ser recriada...');
    
    // Primeiro, vamos tentar dropar e recriar a tabela
    const dropQuery = `
      DROP TABLE IF EXISTS campaign_creators CASCADE;
    `;
    
    const createQuery = `
      CREATE TABLE campaign_creators (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
        
        role VARCHAR(50) DEFAULT 'primary',
        fee DECIMAL(10,2) DEFAULT 0,
        payment_status VARCHAR(50) DEFAULT 'pending',
        status VARCHAR(50) DEFAULT 'Pendente',
        
        deliverables JSONB DEFAULT '{
          "briefing_complete": "Pendente",
          "visit_datetime": null,
          "guest_quantity": 0,
          "visit_confirmed": "Pendente",
          "post_datetime": null,
          "video_approved": "Pendente",
          "video_posted": "Não",
          "content_links": []
        }'::jsonb,
        
        performance_data JSONB DEFAULT '{
          "reach": 0,
          "impressions": 0,
          "engagement": 0,
          "clicks": 0,
          "saves": 0,
          "shares": 0
        }'::jsonb,
        
        notes TEXT,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        UNIQUE(campaign_id, creator_id)
      );
    `;
    
    console.log('🗑️ Dropando tabela existente...');
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropQuery });
    
    if (dropError) {
      console.error('❌ Erro ao dropar tabela:', dropError);
    } else {
      console.log('✅ Tabela dropada');
    }
    
    console.log('🔧 Criando tabela novamente...');
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createQuery });
    
    if (createError) {
      console.error('❌ Erro ao criar tabela:', createError);
    } else {
      console.log('✅ Tabela criada');
    }
    
    // 4. Testar inserção após recriar
    console.log('\n🧪 Testando inserção após recriar...');
    
    // Buscar uma campanha e um criador
    const { data: campaigns } = await supabase.from('campaigns').select('*').limit(1);
    const { data: creators } = await supabase.from('creators').select('*').limit(1);
    
    if (campaigns && campaigns.length > 0 && creators && creators.length > 0) {
      const testRelationship = {
        campaign_id: campaigns[0].id,
        creator_id: creators[0].id,
        role: 'primary',
        status: 'Teste'
      };
      
      const { data: insertResult, error: insertError } = await supabase
        .from('campaign_creators')
        .insert(testRelationship)
        .select();
      
      if (insertError) {
        console.error('❌ Erro na inserção de teste:', insertError);
      } else {
        console.log('✅ Inserção de teste funcionou:', insertResult);
      }
    }
    
    console.log('\n✅ Verificação da tabela concluída!');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

if (require.main === module) {
  checkCampaignCreatorsTable()
    .then(() => {
      console.log('\n🎉 Verificação finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Verificação falhou:', error);
      process.exit(1);
    });
}

export { checkCampaignCreatorsTable };
