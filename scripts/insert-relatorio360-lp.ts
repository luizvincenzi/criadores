import { createClient } from '@supabase/supabase-js';

async function insertLP() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !key) {
    console.error('❌ Faltam variáveis de ambiente');
    return;
  }

  const supabase = createClient(url, key);

  console.log('🚀 Inserindo LP via service role...');

  const lpData = {
    id: '20000000-0000-0000-0000-000000000007',
    slug: 'relatorio360',
    name: 'Relatório 360º de Marketing',
    category: 'marketing',
    template_id: '10000000-0000-0000-0000-000000000002',
    status: 'active',
    is_active: true,
    organization_id: '00000000-0000-0000-0000-000000000001',
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
  };

  const { data, error } = await supabase
    .from('landing_pages')
    .insert(lpData)
    .select();

  if (error) {
    console.error('❌ Erro:', error.message);
    console.error('Detalhes:', error.details);
  } else {
    console.log('✅ LP inserida com sucesso!');
    console.log('ID:', data[0].id);
  }
}

insertLP().catch(console.error);
