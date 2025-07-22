#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('📞 Adicionando dados de contato...');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('organization_id', '00000000-0000-0000-0000-000000000001')
    .limit(3);

  if (error) {
    console.error('Erro:', error);
    return;
  }

  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    
    const contactInfo = {
      whatsapp: `1199988776${i}`,
      instagram: `@${business.name.toLowerCase().replace(/\s+/g, '')}`,
      website: `https://${business.name.toLowerCase().replace(/\s+/g, '')}.com.br`,
      email: `contato@${business.name.toLowerCase().replace(/\s+/g, '')}.com.br`,
      phone: `1133334${i}${i}${i}`,
      primary_contact: `Responsável ${i + 1}`
    };

    const customFields = {
      responsavel: contactInfo.primary_contact,
      categoria: 'Alimentação'
    };

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        contact_info: contactInfo,
        custom_fields: customFields
      })
      .eq('id', business.id);

    if (updateError) {
      console.error(`Erro ao atualizar ${business.name}:`, updateError);
    } else {
      console.log(`✅ ${business.name} atualizado`);
    }
  }

  console.log('✅ Concluído!');
}

main().catch(console.error);
