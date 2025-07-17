import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function createAutoPostoCampaign() {
  console.log('🚀 Criando campanha para Auto Posto Bela Suíça...');

  try {
    // 1. Buscar o business "Auto Posto Bela Suíça"
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .ilike('name', '%auto posto%');

    if (businessError) {
      console.error('❌ Erro ao buscar business:', businessError);
      return;
    }

    console.log('📊 Businesses encontrados:', businesses?.length || 0);
    
    if (!businesses || businesses.length === 0) {
      console.log('❌ Auto Posto Bela Suíça não encontrado. Criando...');
      
      // Criar o business primeiro
      const { data: newBusiness, error: createError } = await supabase
        .from('businesses')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          name: 'Auto Posto Bela Suíça',
          contact_info: {
            phone: '43 99999-9999',
            whatsapp: '43 99999-9999',
            email: 'contato@autopostobela.com.br'
          },
          address: {
            city: 'Londrina',
            state: 'PR',
            country: 'Brasil'
          },
          category_id: 1,
          current_plan_id: 1,
          status: 'Ativo'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar business:', createError);
        return;
      }

      businesses.push(newBusiness);
      console.log('✅ Business criado:', newBusiness.name);
    }

    const business = businesses[0];
    console.log('✅ Business encontrado:', business.name);

    // 2. Verificar se já existe campanha para julho 2025
    const { data: existingCampaigns, error: campaignCheckError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('business_id', business.id)
      .eq('month', '2025-07');

    if (campaignCheckError) {
      console.error('❌ Erro ao verificar campanhas existentes:', campaignCheckError);
      return;
    }

    if (existingCampaigns && existingCampaigns.length > 0) {
      console.log('⚠️ Já existe campanha para julho 2025. Atualizando...');
      
      // Atualizar campanha existente
      const { data: updatedCampaign, error: updateError } = await supabase
        .from('campaigns')
        .update({
          title: 'Campanha Julho 2025 - Auto Posto Bela Suíça',
          description: 'Campanha de marketing digital para promover os serviços do Auto Posto Bela Suíça',
          budget: 5000,
          objectives: {
            primary: 'Aumentar awareness da marca',
            secondary: ['Atrair novos clientes', 'Promover serviços'],
            kpis: { reach: 15000, engagement: 750, conversions: 100 }
          },
          deliverables: {
            posts: 3,
            stories: 5,
            reels: 2,
            events: 0,
            requirements: ['Mencionar localização', 'Destacar qualidade dos combustíveis'],
            creators_count: 4
          },
          briefing_details: {
            formatos: ['Reels', 'Stories', 'Posts'],
            perfil_criador: 'Criadores locais de Londrina e região, com foco em lifestyle e automotivo',
            comunicacao_secundaria: 'Destacar a qualidade dos combustíveis e conveniência da localização',
            datas_gravacao: {
              data_inicio: '2025-07-01',
              data_fim: '2025-07-15',
              horarios_preferenciais: ['Manhã', 'Tarde'],
              observacoes: 'Evitar horários de pico para não atrapalhar o movimento'
            },
            roteiro_video: {
              o_que_falar: 'Falar sobre a qualidade dos combustíveis, atendimento diferenciado e localização estratégica do Auto Posto Bela Suíça',
              historia: 'Contar sobre a tradição familiar do posto e o compromisso com a qualidade',
              promocao_cta: 'Venha conhecer o Auto Posto Bela Suíça e comprove a diferença na qualidade!'
            }
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCampaigns[0].id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar campanha:', updateError);
        return;
      }

      console.log('✅ Campanha atualizada com sucesso:', updatedCampaign.title);
      return;
    }

    // 3. Criar nova campanha
    const campaignData = {
      organization_id: DEFAULT_ORG_ID,
      business_id: business.id,
      title: 'Campanha Julho 2025 - Auto Posto Bela Suíça',
      description: 'Campanha de marketing digital para promover os serviços do Auto Posto Bela Suíça',
      month: '2025-07',
      month_year_id: 202507,
      budget: 5000,
      status: 'Reunião de briefing',
      objectives: {
        primary: 'Aumentar awareness da marca',
        secondary: ['Atrair novos clientes', 'Promover serviços'],
        kpis: { reach: 15000, engagement: 750, conversions: 100 }
      },
      deliverables: {
        posts: 3,
        stories: 5,
        reels: 2,
        events: 0,
        requirements: ['Mencionar localização', 'Destacar qualidade dos combustíveis'],
        creators_count: 4
      },
      briefing_details: {
        formatos: ['Reels', 'Stories', 'Posts'],
        perfil_criador: 'Criadores locais de Londrina e região, com foco em lifestyle e automotivo',
        comunicacao_secundaria: 'Destacar a qualidade dos combustíveis e conveniência da localização',
        datas_gravacao: {
          data_inicio: '2025-07-01',
          data_fim: '2025-07-15',
          horarios_preferenciais: ['Manhã', 'Tarde'],
          observacoes: 'Evitar horários de pico para não atrapalhar o movimento'
        },
        roteiro_video: {
          o_que_falar: 'Falar sobre a qualidade dos combustíveis, atendimento diferenciado e localização estratégica do Auto Posto Bela Suíça',
          historia: 'Contar sobre a tradição familiar do posto e o compromisso com a qualidade',
          promocao_cta: 'Venha conhecer o Auto Posto Bela Suíça e comprove a diferença na qualidade!'
        }
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

    console.log('✅ Campanha criada com sucesso:', campaign.title);
    console.log('📋 ID da campanha:', campaign.id);

    // 4. Testar busca da campanha
    console.log('\n🔍 Testando busca da campanha...');
    
    const { data: searchResult, error: searchError } = await supabase
      .from('campaigns')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('business_id', business.id)
      .eq('month', '2025-07');

    if (searchError) {
      console.error('❌ Erro na busca:', searchError);
      return;
    }

    console.log('✅ Campanha encontrada na busca:', searchResult?.length || 0);
    if (searchResult && searchResult.length > 0) {
      console.log('📊 Dados da campanha:', {
        title: searchResult[0].title,
        business_name: searchResult[0].business?.name,
        month: searchResult[0].month,
        briefing_details: !!searchResult[0].briefing_details
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createAutoPostoCampaign();
}

export default createAutoPostoCampaign;
