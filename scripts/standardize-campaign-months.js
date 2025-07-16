const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Mapeamento de conversão para formato padrão "MMM YY"
const monthMappings = {
  // Formatos ISO
  '2025-07': 'jul 25',
  '2025-08': 'ago 25', 
  '2025-09': 'set 25',
  '2025-06': 'jun 25',
  
  // Português com barra
  'julho/2025': 'jul 25',
  'agosto/2025': 'ago 25',
  'setembro/2025': 'set 25',
  'junho/2025': 'jun 25',
  
  // Português extenso
  'julho de 2025': 'jul 25',
  'agosto de 2025': 'ago 25',
  'setembro de 2025': 'set 25',
  'junho de 2025': 'jun 25',
  
  // Abreviado inglês
  'Jun': 'jun 25', // Assumindo 2025
  'Jul': 'jul 25',
  'Aug': 'ago 25',
  'Sep': 'set 25',
  
  // Valores inválidos - converter para mês atual
  'Teste': 'jul 25',
  '': 'jul 25',
  null: 'jul 25'
};

async function standardizeCampaignMonths() {
  console.log('🔧 Padronizando formatos de mês das campanhas...');
  console.log('📋 Formato padrão: "MMM YY" (ex: jul 25, ago 25)');

  try {
    // 1. Buscar todas as campanhas
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, month, campaign_date, business:businesses(name)')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }

    console.log(`📊 ${campaigns?.length || 0} campanhas encontradas`);

    // 2. Analisar formatos atuais
    const formatCounts = {};
    campaigns?.forEach(campaign => {
      const month = campaign.month || 'null';
      formatCounts[month] = (formatCounts[month] || 0) + 1;
    });

    console.log('\n📈 Formatos atuais encontrados:');
    Object.entries(formatCounts).forEach(([format, count]) => {
      const standardized = monthMappings[format] || 'PRECISA MAPEAR';
      console.log(`  "${format}" → "${standardized}" (${count} campanhas)`);
    });

    // 3. Identificar campanhas que precisam de atualização
    const campaignsToUpdate = [];
    campaigns?.forEach(campaign => {
      const currentMonth = campaign.month;
      const standardMonth = monthMappings[currentMonth];
      
      if (standardMonth && standardMonth !== currentMonth) {
        campaignsToUpdate.push({
          id: campaign.id,
          title: campaign.title,
          businessName: campaign.business?.name,
          currentMonth,
          standardMonth
        });
      }
    });

    console.log(`\n🔄 ${campaignsToUpdate.length} campanhas precisam de atualização:`);
    campaignsToUpdate.forEach((campaign, i) => {
      console.log(`  ${i + 1}. ${campaign.businessName} - "${campaign.title}"`);
      console.log(`      "${campaign.currentMonth}" → "${campaign.standardMonth}"`);
    });

    if (campaignsToUpdate.length === 0) {
      console.log('\n✅ Todas as campanhas já estão no formato padrão!');
      return;
    }

    // 4. Aplicar atualizações
    console.log('\n🔧 Aplicando padronização...');
    
    let updatedCount = 0;
    for (const campaign of campaignsToUpdate) {
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ month: campaign.standardMonth })
        .eq('id', campaign.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar ${campaign.title}:`, updateError);
      } else {
        console.log(`✅ ${campaign.businessName} - "${campaign.currentMonth}" → "${campaign.standardMonth}"`);
        updatedCount++;
      }
    }

    console.log(`\n🎉 Padronização concluída!`);
    console.log(`✅ ${updatedCount} campanhas atualizadas`);
    console.log(`❌ ${campaignsToUpdate.length - updatedCount} falhas`);

    // 5. Verificar resultado final
    const { data: finalCampaigns } = await supabase
      .from('campaigns')
      .select('month')
      .eq('organization_id', DEFAULT_ORG_ID);

    const finalFormats = {};
    finalCampaigns?.forEach(campaign => {
      const month = campaign.month || 'null';
      finalFormats[month] = (finalFormats[month] || 0) + 1;
    });

    console.log('\n📊 Formatos finais:');
    Object.entries(finalFormats).forEach(([format, count]) => {
      const isStandard = /^[a-z]{3} \d{2}$/.test(format);
      const status = isStandard ? '✅' : '⚠️';
      console.log(`  ${status} "${format}" (${count} campanhas)`);
    });

    // 6. Verificar duplicatas após padronização
    console.log('\n🔍 Verificando duplicatas após padronização...');
    
    const { data: groupedCampaigns } = await supabase
      .from('campaigns')
      .select('business_id, month')
      .eq('organization_id', DEFAULT_ORG_ID);

    const duplicateCheck = {};
    groupedCampaigns?.forEach(campaign => {
      const key = `${campaign.business_id}-${campaign.month}`;
      duplicateCheck[key] = (duplicateCheck[key] || 0) + 1;
    });

    const duplicates = Object.entries(duplicateCheck).filter(([key, count]) => count > 1);
    
    if (duplicates.length > 0) {
      console.log(`⚠️ ${duplicates.length} duplicatas encontradas após padronização:`);
      duplicates.forEach(([key, count]) => {
        console.log(`  ${key}: ${count} campanhas`);
      });
      console.log('💡 Execute o script de limpeza novamente se necessário');
    } else {
      console.log('✅ Nenhuma duplicata encontrada!');
    }

  } catch (error) {
    console.error('❌ Erro na padronização:', error);
  }
}

// Executar
standardizeCampaignMonths();
