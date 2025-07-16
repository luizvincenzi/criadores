const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function checkCreatorsStructure() {
  console.log('🔍 Verificando estrutura da tabela creators...');

  try {
    // Buscar um criador para ver a estrutura
    const { data: creators, error } = await supabase
      .from('creators')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);

    if (error) {
      console.error('❌ Erro ao buscar criadores:', error);
      return;
    }

    if (!creators || creators.length === 0) {
      console.log('❌ Nenhum criador encontrado');
      return;
    }

    const creator = creators[0];
    console.log('📋 Estrutura do criador:');
    console.log('Campos disponíveis:', Object.keys(creator));
    
    console.log('\n📊 Dados do primeiro criador:');
    console.log(`Nome: ${creator.name}`);
    console.log(`Status: ${creator.status}`);
    console.log(`Social Media:`, creator.social_media);
    console.log(`Contact Info:`, creator.contact_info);
    console.log(`Profile Info:`, creator.profile_info);

    // Verificar se tem dados de Instagram nos campos JSON
    if (creator.social_media) {
      console.log('\n📱 Social Media detalhes:');
      console.log(JSON.stringify(creator.social_media, null, 2));
    }

    if (creator.contact_info) {
      console.log('\n📞 Contact Info detalhes:');
      console.log(JSON.stringify(creator.contact_info, null, 2));
    }

    if (creator.profile_info) {
      console.log('\n👤 Profile Info detalhes:');
      console.log(JSON.stringify(creator.profile_info, null, 2));
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
checkCreatorsStructure();
