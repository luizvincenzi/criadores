/**
 * Script para verificar quais businesses não têm Instagram ou Website
 * e sugerir onde encontrar essas informações
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBusinessSocialMedia() {
  console.log('🔍 Verificando dados de Instagram e Website dos businesses...\n');

  try {
    // Buscar todos os businesses ativos
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        contact_info,
        address
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Erro ao buscar businesses:', error);
      return;
    }

    console.log(`📊 Total de businesses encontrados: ${businesses.length}\n`);

    let missingInstagram = 0;
    let missingWebsite = 0;
    let missingBoth = 0;
    let complete = 0;

    const businessesNeedingUpdate = [];

    businesses.forEach((business) => {
      const contactInfo = business.contact_info || {};
      const hasInstagram = contactInfo.instagram && contactInfo.instagram.trim() !== '';
      const hasWebsite = contactInfo.website && contactInfo.website.trim() !== '';

      const status = {
        name: business.name,
        city: business.address?.city || 'Não informada',
        instagram: hasInstagram ? `✅ ${contactInfo.instagram}` : '❌ Não informado',
        website: hasWebsite ? `✅ ${contactInfo.website}` : '❌ Não informado',
        needsUpdate: !hasInstagram || !hasWebsite
      };

      if (!hasInstagram && !hasWebsite) {
        missingBoth++;
        businessesNeedingUpdate.push({ ...status, priority: 'ALTA' });
      } else if (!hasInstagram) {
        missingInstagram++;
        businessesNeedingUpdate.push({ ...status, priority: 'MÉDIA' });
      } else if (!hasWebsite) {
        missingWebsite++;
        businessesNeedingUpdate.push({ ...status, priority: 'MÉDIA' });
      } else {
        complete++;
      }

      console.log(`📋 ${business.name}`);
      console.log(`   📍 Cidade: ${status.city}`);
      console.log(`   📱 Instagram: ${status.instagram}`);
      console.log(`   🌐 Website: ${status.website}`);
      console.log('');
    });

    // Resumo
    console.log('📊 RESUMO:');
    console.log(`✅ Completos (Instagram + Website): ${complete}`);
    console.log(`❌ Sem Instagram: ${missingInstagram}`);
    console.log(`❌ Sem Website: ${missingWebsite}`);
    console.log(`❌ Sem ambos: ${missingBoth}`);
    console.log(`🔄 Total precisando atualização: ${businessesNeedingUpdate.length}\n`);

    // Prioridades
    if (businessesNeedingUpdate.length > 0) {
      console.log('🎯 PRIORIDADES DE ATUALIZAÇÃO:\n');
      
      const highPriority = businessesNeedingUpdate.filter(b => b.priority === 'ALTA');
      const mediumPriority = businessesNeedingUpdate.filter(b => b.priority === 'MÉDIA');

      if (highPriority.length > 0) {
        console.log('🔴 PRIORIDADE ALTA (sem Instagram e Website):');
        highPriority.forEach(business => {
          console.log(`   • ${business.name} (${business.city})`);
        });
        console.log('');
      }

      if (mediumPriority.length > 0) {
        console.log('🟡 PRIORIDADE MÉDIA (faltando Instagram ou Website):');
        mediumPriority.forEach(business => {
          console.log(`   • ${business.name} (${business.city}) - Falta: ${!business.instagram.includes('✅') ? 'Instagram' : 'Website'}`);
        });
        console.log('');
      }

      console.log('💡 SUGESTÕES PARA ENCONTRAR AS INFORMAÇÕES:');
      console.log('1. 📱 Instagram: Pesquisar no Google "[nome da empresa] instagram"');
      console.log('2. 🌐 Website: Pesquisar no Google "[nome da empresa] site oficial"');
      console.log('3. 📞 Contato direto: Perguntar via WhatsApp do responsável');
      console.log('4. 🔍 Redes sociais: Verificar outras redes que podem ter links');
      console.log('');

      // Gerar comandos SQL para atualização
      console.log('🛠️ COMANDOS SQL PARA ATUALIZAÇÃO:');
      console.log('-- Copie e cole no SQL Editor do Supabase\n');
      
      businessesNeedingUpdate.slice(0, 5).forEach((business, index) => {
        console.log(`-- ${index + 1}. ${business.name}`);
        console.log(`UPDATE businesses SET contact_info = jsonb_set(jsonb_set(contact_info, '{instagram}', '"@INSTAGRAM_AQUI"'), '{website}', '"https://WEBSITE_AQUI"') WHERE name = '${business.name.replace("'", "''")}';`);
        console.log('');
      });

      if (businessesNeedingUpdate.length > 5) {
        console.log(`-- ... e mais ${businessesNeedingUpdate.length - 5} businesses`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
checkBusinessSocialMedia();
