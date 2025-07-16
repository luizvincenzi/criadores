import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyCampaignDateMigration() {
  console.log('🔄 Aplicando migração do campo campaign_date...');

  try {
    // 1. Adicionar campo campaign_date se não existir
    console.log('📅 Adicionando campo campaign_date...');
    
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE campaigns 
        ADD COLUMN IF NOT EXISTS campaign_date TIMESTAMP WITH TIME ZONE;
      `
    });

    if (addColumnError) {
      console.error('❌ Erro ao adicionar coluna:', addColumnError);
    } else {
      console.log('✅ Campo campaign_date adicionado');
    }

    // 2. Criar índice se não existir
    console.log('📊 Criando índice para campaign_date...');
    
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_date 
        ON campaigns(campaign_date);
      `
    });

    if (indexError) {
      console.error('❌ Erro ao criar índice:', indexError);
    } else {
      console.log('✅ Índice criado');
    }

    // 3. Atualizar campaign_date baseado no campo month
    console.log('🔄 Atualizando campaign_date baseado no campo month...');
    
    const { data: campaigns, error: selectError } = await supabase
      .from('campaigns')
      .select('id, month, campaign_date')
      .is('campaign_date', null);

    if (selectError) {
      console.error('❌ Erro ao buscar campanhas:', selectError);
      return;
    }

    console.log(`📋 ${campaigns?.length || 0} campanhas precisam de campaign_date`);

    if (campaigns && campaigns.length > 0) {
      for (const campaign of campaigns) {
        let campaignDate: string | null = null;

        // Tentar converter o campo month para timestamp
        if (campaign.month) {
          try {
            // Formatos possíveis: "2025-07", "julho de 2025", "Jul", etc.
            const monthStr = campaign.month.toString().toLowerCase();
            
            if (monthStr.match(/^\d{4}-\d{2}$/)) {
              // Formato "2025-07"
              campaignDate = `${campaign.month}-01T00:00:00Z`;
            } else if (monthStr.includes('2025')) {
              // Formato "julho de 2025" ou similar
              const year = '2025';
              let month = '01';
              
              if (monthStr.includes('jan')) month = '01';
              else if (monthStr.includes('fev')) month = '02';
              else if (monthStr.includes('mar')) month = '03';
              else if (monthStr.includes('abr')) month = '04';
              else if (monthStr.includes('mai')) month = '05';
              else if (monthStr.includes('jun')) month = '06';
              else if (monthStr.includes('jul')) month = '07';
              else if (monthStr.includes('ago')) month = '08';
              else if (monthStr.includes('set')) month = '09';
              else if (monthStr.includes('out')) month = '10';
              else if (monthStr.includes('nov')) month = '11';
              else if (monthStr.includes('dez')) month = '12';
              
              campaignDate = `${year}-${month}-01T00:00:00Z`;
            } else {
              // Assumir mês atual se não conseguir parsear
              const now = new Date();
              campaignDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01T00:00:00Z`;
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao parsear month "${campaign.month}" para campanha ${campaign.id}`);
            // Usar data atual como fallback
            const now = new Date();
            campaignDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01T00:00:00Z`;
          }
        }

        if (campaignDate) {
          const { error: updateError } = await supabase
            .from('campaigns')
            .update({ campaign_date: campaignDate })
            .eq('id', campaign.id);

          if (updateError) {
            console.error(`❌ Erro ao atualizar campanha ${campaign.id}:`, updateError);
          } else {
            console.log(`✅ Campanha ${campaign.id}: ${campaign.month} → ${campaignDate}`);
          }
        }
      }
    }

    console.log('🎉 Migração do campo campaign_date concluída!');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyCampaignDateMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export { applyCampaignDateMigration };
