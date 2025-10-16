import { createClient } from '../lib/supabase/server';

async function createRelatorio360LP() {
  const supabase = await createClient();

  console.log('🚀 Criando Landing Page Relatório 360º...');

  // 1. Criar entrada na tabela landing_pages
  const { data: lp, error: lpError } = await supabase
    .from('landing_pages')
    .insert({
      slug: 'relatorio360',
      name: 'Relatório 360º de Marketing',
      category: 'marketing',
      template_id: '10000000-0000-0000-0000-000000000002',
      status: 'active',
      is_active: true,
      variables: {
        hero: {
          title: '🚀 Ganhe um Raio-X 360º de Marketing do seu negócio',
          subtitle: 'Descubra o que está travando seu crescimento e o que fazer pra vender mais. Receba um relatório completo com os principais pontos fortes e fracos do seu marketing + 1h de consultoria estratégica gratuita com um especialista da crIAdores.',
          cta_text: 'Solicitar meu Relatório 360º sem custo',
          urgency_badge: 'Relatório Gratuito',
          trust_badges: [
            '100% Confidencial',
            'Entrega em 48h',
            'Sem compromisso'
          ]
        },
        problema: {
          title: 'Por que esse diagnóstico é diferente?',
          problems: [
            {
              icon: '🔍',
              title: 'Análise Completa',
              description: 'Analisamos seu posicionamento, conteúdo, anúncios e presença local.'
            },
            {
              icon: '🤖',
              title: 'Inteligência Artificial',
              description: 'Usamos IA e benchmarks do seu setor para insights precisos.'
            },
            {
              icon: '📊',
              title: 'Relatório Detalhado',
              description: 'Você recebe um PDF com insights práticos e plano de ação imediato.'
            },
            {
              icon: '👥',
              title: 'Consultoria 1-a-1',
              description: 'Conversa com um estrategista da crIAdores — sem custo, sem compromisso.'
            }
          ]
        },
        solucoes: [
          {
            order: 1,
            product_id: null,
            title: 'Seu Relatório 360º inclui:',
            description: 'Um diagnóstico completo do seu marketing digital',
            benefits: [
              '📈 Análise de Performance Digital — alcance, engajamento, seguidores e tendências',
              '🎯 Posicionamento de Marca — clareza da mensagem e diferenciais frente à concorrência',
              '💬 Comunicação e Conteúdo — avaliação do impacto e tom das suas postagens',
              '🧠 Recomendações Estratégicas — próximos passos práticos para aumentar resultados'
            ],
            cta_text: 'Solicitar meu Relatório 360º agora'
          }
        ],
        cta_final: {
          title: '💡 Pronto pra descobrir o que o seu marketing está deixando na mesa?',
          subtitle: 'Receba seu relatório personalizado em até 48 horas',
          cta_text: 'Solicitar meu Relatório 360º agora — 100% gratuito'
        }
      },
      config: {
        chatbot_url: null,
        conversion_goal: 'lead_generation',
        analytics: {
          ga4_id: null,
          meta_pixel_id: null
        },
        features: {
          show_urgency: false,
          show_countdown: false,
          show_mentor: false,
          show_compliance: false
        },
        segment: 'marketing_diagnostic'
      },
      seo: {
        title: 'Relatório 360º de Marketing Gratuito | crIAdores',
        description: 'Receba um diagnóstico completo do seu marketing digital. Descubra pontos fortes e fracos + 1h de consultoria gratuita. 100% confidencial.',
        keywords: ['relatório marketing', 'diagnóstico marketing', 'marketing digital', 'consultoria marketing', 'análise marketing'],
        og_image: 'https://criadores.app/images/relatorio360-og.jpg',
        og_type: 'website',
        canonical: 'https://criadores.app/relatorio360',
        robots: 'index,follow'
      }
    })
    .select()
    .single();

  if (lpError) {
    console.error('❌ Erro ao criar LP:', lpError);
    return;
  }

  console.log('✅ LP criada com ID:', lp.id);

  // 2. Aguardar um pouco para garantir que a LP foi inserida no banco
  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. Verificar se a LP foi realmente criada
  const { data: verifyLp, error: verifyError } = await supabase
    .from('landing_pages')
    .select('id')
    .eq('id', lp.id)
    .single();

  if (verifyError || !verifyLp) {
    console.error('❌ LP não foi encontrada após inserção:', verifyError);
    return;
  }

  console.log('✅ LP verificada no banco');

  // 4. Criar primeira versão
  const { data: version, error: versionError } = await supabase
    .from('lp_versions')
    .insert({
      lp_id: lp.id,
      version_number: 1,
      snapshot: {
        variables: lp.variables,
        config: lp.config,
        seo: lp.seo,
        products: []
      },
      change_description: 'Versão inicial do Relatório 360º',
      created_by: null
    })
    .select()
    .single();

  if (versionError) {
    console.error('❌ Erro ao criar versão:', versionError);
    return;
  }

  console.log('✅ Versão criada:', version.version_number);
  console.log('🎉 Landing Page Relatório 360º criada com sucesso!');
  console.log('📍 URL: https://criadores.app/relatorio360');
}

createRelatorio360LP().catch(console.error);