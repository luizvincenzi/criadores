/**
 * Script para atualizar dados de Instagram e Website dos businesses
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

const businessUpdates = [
  {
    name: 'Auto Posto Bela Suíça',
    instagram: '@autopostobelasuica',
    website: ''
  },
  {
    name: 'Govinda',
    instagram: '@govindarestaurante',
    website: ''
  },
  {
    name: 'Porks',
    instagram: '@porkslondrina',
    website: 'https://www.porksfranquia.com'
  },
  {
    name: 'Cartagena',
    instagram: '@cartagenabar.londrina',
    website: ''
  },
  {
    name: 'Boussolé',
    instagram: '@boussolerooftop',
    website: ''
  }
];

async function updateBusinessData() {
  console.log('🔄 Atualizando dados de Instagram e Website dos businesses...\n');

  for (const business of businessUpdates) {
    try {
      console.log(`📝 Atualizando: ${business.name}`);
      console.log(`   📱 Instagram: ${business.instagram || 'Não informado'}`);
      console.log(`   🌐 Website: ${business.website || 'Não informado'}`);

      // Buscar o business atual
      const { data: currentBusiness, error: fetchError } = await supabase
        .from('businesses')
        .select('id, name, contact_info')
        .eq('name', business.name)
        .single();

      if (fetchError) {
        console.error(`   ❌ Erro ao buscar ${business.name}:`, fetchError.message);
        continue;
      }

      if (!currentBusiness) {
        console.error(`   ❌ Business não encontrado: ${business.name}`);
        continue;
      }

      // Preparar novos dados de contato
      const currentContactInfo = currentBusiness.contact_info || {};
      const updatedContactInfo = {
        ...currentContactInfo,
        instagram: business.instagram,
        website: business.website
      };

      // Atualizar o business
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          contact_info: updatedContactInfo,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentBusiness.id);

      if (updateError) {
        console.error(`   ❌ Erro ao atualizar ${business.name}:`, updateError.message);
      } else {
        console.log(`   ✅ Atualizado com sucesso!`);
      }

      console.log('');

    } catch (error) {
      console.error(`   ❌ Erro geral para ${business.name}:`, error.message);
      console.log('');
    }
  }

  // Verificar resultados
  console.log('📊 Verificando resultados...\n');

  const { data: updatedBusinesses, error } = await supabase
    .from('businesses')
    .select('name, contact_info')
    .in('name', businessUpdates.map(b => b.name))
    .order('name');

  if (error) {
    console.error('❌ Erro ao verificar resultados:', error);
    return;
  }

  updatedBusinesses.forEach(business => {
    const contactInfo = business.contact_info || {};
    console.log(`📋 ${business.name}`);
    console.log(`   📱 Instagram: ${contactInfo.instagram || 'Não informado'}`);
    console.log(`   🌐 Website: ${contactInfo.website || 'Não informado'}`);
    console.log('');
  });

  console.log('✅ Atualização concluída!');
}

// Executar o script
updateBusinessData();
