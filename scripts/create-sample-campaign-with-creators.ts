import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function createSampleCampaignWithCreators() {
  console.log('🎬 Criando campanha de exemplo com criadores...');

  try {
    // 1. Buscar um usuário existente para created_by
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .limit(1);

    if (userError || !users?.length) {
      console.error('❌ Erro ao buscar usuário:', userError);
      return;
    }

    const user = users[0];
    console.log(`✅ Usuário selecionado: ${user.full_name || user.email}`);

    // 2. Buscar um business existente
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .limit(1);

    if (businessError || !businesses?.length) {
      console.error('❌ Erro ao buscar business:', businessError);
      return;
    }

    const business = businesses[0];
    console.log(`✅ Business selecionado: ${business.name}`);

    // 3. Buscar alguns criadores
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('id, name, profile_info')
      .eq('status', 'Ativo')
      .limit(3);

    if (creatorsError || !creators?.length) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return;
    }

    console.log(`✅ ${creators.length} criadores encontrados`);

    // 4. Criar campanha
    const campaignData = {
      organization_id: DEFAULT_ORG_ID,
      business_id: business.id,
      created_by: user.id,
      title: 'Campanha Julho 2025 - Exemplo',
      description: 'Campanha de exemplo com dados de visualizações',
      month: '2025-07',
      budget: 5000,
      status: 'Agendamentos',
      objectives: {
        primary: 'Aumentar awareness da marca',
        secondary: ['Engajamento', 'Conversões'],
        kpis: { reach: 10000, engagement: 500, conversions: 50 }
      },
      deliverables: {
        posts: 3,
        stories: 5,
        reels: 2,
        events: 0,
        requirements: ['Mencionar marca', 'Usar hashtag oficial']
      }
    };

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();

    if (campaignError) {
      console.error('❌ Erro ao criar campanha:', campaignError);
      return;
    }

    console.log(`✅ Campanha criada: ${campaign.title}`);

    // 5. Associar criadores à campanha com dados de visualizações
    for (let i = 0; i < creators.length; i++) {
      const creator = creators[i];
      
      // Gerar dados de visualizações diferentes para cada criador
      const baseViews = 2000 + (i * 1500); // 2000, 3500, 5000
      
      const campaignCreatorData = {
        campaign_id: campaign.id,
        creator_id: creator.id,
        role: 'primary',
        fee: 800 + (i * 200),
        status: 'Confirmado',
        deliverables: {
          briefing_complete: 'Concluído',
          visit_datetime: new Date().toISOString(),
          guest_quantity: 2,
          visit_confirmed: 'Confirmado',
          post_datetime: new Date().toISOString(),
          video_approved: 'Aprovado',
          video_posted: 'Sim',
          content_links: [`https://instagram.com/p/exemplo${i + 1}`],
          // Dados de visualizações
          total_views: baseViews,
          post_views: Math.floor(baseViews * 0.4),
          story_views: Math.floor(baseViews * 0.3),
          reel_views: Math.floor(baseViews * 0.3),
          engagement_rate: (3.5 + i * 0.8).toFixed(2),
          reach: Math.floor(baseViews * 1.3),
          impressions: Math.floor(baseViews * 1.8),
          likes: Math.floor(baseViews * 0.05),
          comments: Math.floor(baseViews * 0.01),
          shares: Math.floor(baseViews * 0.005)
        }
      };

      const { error: ccError } = await supabase
        .from('campaign_creators')
        .insert(campaignCreatorData);

      if (ccError) {
        console.error(`❌ Erro ao associar criador ${creator.name}:`, ccError);
      } else {
        console.log(`  ✅ ${creator.name}: ${baseViews.toLocaleString('pt-BR')} visualizações`);
      }
    }

    // 6. Criar mais duas campanhas para ter dados no ranking
    const additionalCampaigns = [
      {
        title: 'Campanha Agosto 2025 - Exemplo',
        month: '2025-08',
        baseViews: 1500
      },
      {
        title: 'Campanha Setembro 2025 - Exemplo', 
        month: '2025-09',
        baseViews: 3000
      }
    ];

    for (const additionalCampaign of additionalCampaigns) {
      const { data: newCampaign, error: newCampaignError } = await supabase
        .from('campaigns')
        .insert({
          ...campaignData,
          title: additionalCampaign.title,
          month: additionalCampaign.month
        })
        .select()
        .single();

      if (newCampaignError) {
        console.error(`❌ Erro ao criar ${additionalCampaign.title}:`, newCampaignError);
        continue;
      }

      // Associar 2 criadores a cada campanha adicional
      for (let i = 0; i < 2; i++) {
        const creator = creators[i];
        const views = additionalCampaign.baseViews + (i * 500);

        await supabase
          .from('campaign_creators')
          .insert({
            campaign_id: newCampaign.id,
            creator_id: creator.id,
            role: 'primary',
            fee: 600,
            status: 'Confirmado',
            deliverables: {
              total_views: views,
              post_views: Math.floor(views * 0.4),
              story_views: Math.floor(views * 0.3),
              reel_views: Math.floor(views * 0.3),
              engagement_rate: (2.5 + i * 0.5).toFixed(2)
            }
          });
      }

      console.log(`✅ ${additionalCampaign.title} criada com dados de exemplo`);
    }

    console.log('\n🎉 Campanhas de exemplo criadas com sucesso!');
    console.log('📊 Agora você pode ver os cards com dados reais de visualizações');
    console.log('🔄 Recarregue a página de campanhas para ver os novos dados');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createSampleCampaignWithCreators();
}

export { createSampleCampaignWithCreators };
