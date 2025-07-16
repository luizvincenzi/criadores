import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function verifyMigration() {
  console.log('🔍 Verificando dados migrados...\n');

  try {
    // 1. Verificar organizações
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*');

    if (orgError) {
      console.error('❌ Erro ao buscar organizações:', orgError);
    } else {
      console.log(`📋 Organizações: ${orgs.length}`);
      orgs.forEach(org => console.log(`  - ${org.name} (${org.id})`));
    }

    // 2. Verificar usuários
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*');

    if (userError) {
      console.error('❌ Erro ao buscar usuários:', userError);
    } else {
      console.log(`\n👤 Usuários: ${users.length}`);
      users.forEach(user => console.log(`  - ${user.full_name} (${user.email}) - ${user.role}`));
    }

    // 3. Verificar negócios
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (businessError) {
      console.error('❌ Erro ao buscar negócios:', businessError);
    } else {
      console.log(`\n🏢 Negócios: ${businesses.length}`);
      businesses.slice(0, 5).forEach(business => 
        console.log(`  - ${business.name} (${business.address?.city || 'Sem cidade'}) - ${business.status}`)
      );
      if (businesses.length > 5) {
        console.log(`  ... e mais ${businesses.length - 5} negócios`);
      }
    }

    // 4. Verificar criadores
    const { data: creators, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (creatorError) {
      console.error('❌ Erro ao buscar criadores:', creatorError);
    } else {
      console.log(`\n👥 Criadores: ${creators.length}`);
      creators.slice(0, 5).forEach(creator => 
        console.log(`  - ${creator.name} (${creator.profile_info?.location?.city || 'Sem cidade'}) - ${creator.status}`)
      );
      if (creators.length > 5) {
        console.log(`  ... e mais ${creators.length - 5} criadores`);
      }
    }

    // 5. Verificar campanhas
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (campaignError) {
      console.error('❌ Erro ao buscar campanhas:', campaignError);
    } else {
      console.log(`\n📋 Campanhas: ${campaigns.length}`);
      campaigns.forEach(campaign => 
        console.log(`  - ${campaign.title} (${campaign.month}) - ${campaign.status}`)
      );
    }

    // 6. Verificar relacionamentos campaign_creators
    const { data: campaignCreators, error: ccError } = await supabase
      .from('campaign_creators')
      .select('*');

    if (ccError) {
      console.error('❌ Erro ao buscar campaign_creators:', ccError);
    } else {
      console.log(`\n🔗 Relacionamentos Campaign-Creator: ${campaignCreators.length}`);
    }

    // 7. Estatísticas por cidade (criadores)
    const creatorsByCityQuery = await supabase
      .from('creators')
      .select('profile_info')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (creatorsByCityQuery.data) {
      const cityCounts = new Map<string, number>();
      creatorsByCityQuery.data.forEach(creator => {
        const city = creator.profile_info?.location?.city || 'Sem cidade';
        cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
      });

      console.log(`\n🌍 Criadores por cidade:`);
      Array.from(cityCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([city, count]) => console.log(`  - ${city}: ${count} criadores`));
    }

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar verificação
verifyMigration();
