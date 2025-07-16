import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCampaignDateField() {
  console.log('🔧 Adicionando campo campaign_date à tabela campaigns...');

  try {
    // 1. Adicionar campo campaign_date
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE campaigns 
        ADD COLUMN IF NOT EXISTS campaign_date TIMESTAMP WITH TIME ZONE;
      `
    });

    if (addColumnError) {
      console.error('❌ Erro ao adicionar coluna:', addColumnError);
      return;
    }

    console.log('✅ Campo campaign_date adicionado com sucesso');

    // 2. Criar índice
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_date ON campaigns(campaign_date);
      `
    });

    if (indexError) {
      console.error('❌ Erro ao criar índice:', indexError);
      return;
    }

    console.log('✅ Índice criado com sucesso');

    // 3. Atualizar campanhas existentes
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE campaigns 
        SET campaign_date = CASE 
          WHEN month ~ '^\\d{4}-\\d{2}$' THEN 
            (month || '-01')::date::timestamp with time zone
          WHEN month ~ '^\\w+ de \\d{4}$' THEN 
            CASE 
              WHEN month ILIKE 'janeiro%' THEN (SUBSTRING(month FROM '\\d{4}') || '-01-01')::date::timestamp with time zone
              WHEN month ILIKE 'fevereiro%' THEN (SUBSTRING(month FROM '\\d{4}') || '-02-01')::date::timestamp with time zone
              WHEN month ILIKE 'março%' THEN (SUBSTRING(month FROM '\\d{4}') || '-03-01')::date::timestamp with time zone
              WHEN month ILIKE 'abril%' THEN (SUBSTRING(month FROM '\\d{4}') || '-04-01')::date::timestamp with time zone
              WHEN month ILIKE 'maio%' THEN (SUBSTRING(month FROM '\\d{4}') || '-05-01')::date::timestamp with time zone
              WHEN month ILIKE 'junho%' THEN (SUBSTRING(month FROM '\\d{4}') || '-06-01')::date::timestamp with time zone
              WHEN month ILIKE 'julho%' THEN (SUBSTRING(month FROM '\\d{4}') || '-07-01')::date::timestamp with time zone
              WHEN month ILIKE 'agosto%' THEN (SUBSTRING(month FROM '\\d{4}') || '-08-01')::date::timestamp with time zone
              WHEN month ILIKE 'setembro%' THEN (SUBSTRING(month FROM '\\d{4}') || '-09-01')::date::timestamp with time zone
              WHEN month ILIKE 'outubro%' THEN (SUBSTRING(month FROM '\\d{4}') || '-10-01')::date::timestamp with time zone
              WHEN month ILIKE 'novembro%' THEN (SUBSTRING(month FROM '\\d{4}') || '-11-01')::date::timestamp with time zone
              WHEN month ILIKE 'dezembro%' THEN (SUBSTRING(month FROM '\\d{4}') || '-12-01')::date::timestamp with time zone
              ELSE NOW()
            END
          ELSE NOW()
        END
        WHERE campaign_date IS NULL;
      `
    });

    if (updateError) {
      console.error('❌ Erro ao atualizar campanhas:', updateError);
      return;
    }

    console.log('✅ Campanhas existentes atualizadas com sucesso');

    // 4. Verificar resultado
    const { data: campaigns, error: selectError } = await supabase
      .from('campaigns')
      .select('id, month, campaign_date')
      .limit(5);

    if (selectError) {
      console.error('❌ Erro ao verificar campanhas:', selectError);
      return;
    }

    console.log('📊 Campanhas atualizadas:');
    campaigns?.forEach(campaign => {
      console.log(`  - Mês: ${campaign.month} → Data: ${campaign.campaign_date}`);
    });

    console.log('🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addCampaignDateField();
}

export { addCampaignDateField };
