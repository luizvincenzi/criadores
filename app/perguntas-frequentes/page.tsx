import { Metadata } from 'next';
import { FAQPageSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes | crIAdores - Social Media Estratégico',
  description: 'Dúvidas sobre social media estratégico, gestão de redes sociais e estrategistas de marketing. Saiba como funciona, preços, resultados e diferenciais do crIAdores.',
  keywords: [
    // Primary
    'perguntas frequentes social media',
    'dúvidas social media estratégico',
    'quanto custa social media',
    'como funciona gestão de redes sociais',
    'contratar estrategista de marketing',
    // Nicho
    'social media para médicos',
    'social media para advogados',
    'marketing digital empresas',
    // Terciário
    'mentoria marketing digital',
    'criadores de conteúdo',
    'influenciadores locais',
    'campanhas marketing',
  ],
  alternates: {
    canonical: 'https://www.criadores.app/perguntas-frequentes',
  },
  openGraph: {
    title: 'Perguntas Frequentes | crIAdores - Social Media Estratégico',
    description: 'Dúvidas sobre social media estratégico, gestão de redes sociais e estrategistas de marketing.',
    url: 'https://www.criadores.app/perguntas-frequentes',
    type: 'website',
  },
  twitter: {
    title: 'Perguntas Frequentes | crIAdores - Social Media Estratégico',
    description: 'Dúvidas sobre social media estratégico, gestão de redes sociais e estrategistas de marketing.',
  },
};

const faqs = [
  {
    question: 'O que é o crIAdores?',
    answer: 'O crIAdores é uma plataforma que oferece social media estratégico para empresas. Nosso serviço principal é disponibilizar um estrategista de marketing dedicado que vai presencialmente ao seu negócio toda semana para produzir conteúdo profissional (fotos, vídeos, reels), planejar estratégias de crescimento e gerenciar suas redes sociais. Também oferecemos mentoria de marketing e campanhas com criadores de conteúdo.',
  },
  {
    question: 'Como funciona o social media estratégico?',
    answer: 'O estrategista é designado exclusivamente para seu negócio e faz visitas presenciais toda semana. Durante as visitas, ele produz todo o conteúdo necessário (fotos, vídeos, stories, reels), conhece profundamente seu negócio e público, planeja a estratégia de postagens, gerencia as redes sociais e analisa métricas para otimizar continuamente os resultados.',
  },
  {
    question: 'Quanto custa ter um social media estratégico?',
    answer: 'O plano de Social Media Estratégico começa em R$ 997/mês e inclui: visitas presenciais semanais ao seu estabelecimento, produção ilimitada de conteúdo (fotos, vídeos, reels, stories), planejamento estratégico personalizado, gestão completa de todas as suas redes sociais (Instagram, Facebook, TikTok), análise de métricas e relatórios mensais de desempenho.',
  },
  {
    question: 'Qual a diferença entre social media e agência de marketing?',
    answer: 'O social media estratégico oferece um profissional dedicado exclusivamente ao seu negócio com visitas presenciais semanais. Agências tradicionais atendem múltiplos clientes simultaneamente, raramente visitam presencialmente e produzem conteúdo de forma genérica. Nosso modelo garante conteúdo autêntico, conhecimento profundo do seu negócio e resultados mais rápidos, com custo similar ao de uma agência mas dedicação de um funcionário interno.',
  },
  {
    question: 'Quanto tempo leva para ver resultados?',
    answer: 'A maioria dos clientes começa a ver resultados perceptíveis em 30-45 dias: aumento de seguidores, mais engajamento nos posts e stories, e maior reconhecimento local. Resultados de faturamento geralmente aparecem entre 60-90 dias. O diferencial do modelo presencial é que o estrategista entende profundamente seu negócio, criando conteúdo mais autêntico que acelera os resultados.',
  },
  {
    question: 'Que resultados posso esperar?',
    answer: 'Nossos clientes veem em média: 40% de aumento no faturamento, crescimento de 200-500% em seguidores qualificados, aumento de 300% em engajamento (curtidas, comentários, compartilhamentos), maior reconhecimento da marca na região e redução de até 70% no tempo que gastavam tentando gerenciar redes sociais sozinhos.',
  },
  {
    question: 'O estrategista vai presencialmente ao meu negócio?',
    answer: 'Sim! As visitas presenciais semanais são o grande diferencial do crIAdores. O estrategista vai ao seu estabelecimento toda semana para produzir conteúdo autêntico (fotos, vídeos do dia a dia, bastidores, produtos, equipe), conhecer profundamente o negócio e criar estratégias personalizadas. Isso garante conteúdo muito mais genuíno do que agências que trabalham remotamente.',
  },
  {
    question: 'Posso cancelar o serviço a qualquer momento?',
    answer: 'Sim, não há fidelidade. O serviço funciona por assinatura mensal e você pode cancelar quando quiser. Recomendamos no mínimo 3 meses para ver resultados consistentes, mas a decisão é sua. Avisando com 30 dias de antecedência, não há multa ou taxa de cancelamento.',
  },
  {
    question: 'Vocês atendem que tipos de negócio?',
    answer: 'Atendemos qualquer tipo de negócio local que queira crescer nas redes sociais: restaurantes, bares, cafeterias, lojas de roupas, salões de beleza, barbearias, academias, clínicas médicas e odontológicas, escritórios de advocacia, contabilidade, arquitetura, pet shops, escolas, eventos e muito mais. Temos estrategistas especializados em diferentes segmentos.',
  },
  {
    question: 'O que está incluído no plano de R$ 997/mês?',
    answer: 'Está incluído: 1 visita presencial semanal ao seu estabelecimento (4-5 visitas por mês), produção ilimitada de conteúdo (fotos, vídeos, reels, stories), planejamento estratégico mensal, gestão completa de até 3 redes sociais (Instagram, Facebook, TikTok), publicação diária de conteúdo, resposta a comentários e mensagens, análise de métricas, relatório mensal de desempenho e suporte via WhatsApp.',
  },
  {
    question: 'E se eu quiser produzir meu próprio conteúdo?',
    answer: 'Nesse caso, a mentoria de marketing é ideal para você. Na mentoria, ensinamos você a criar estratégias, produzir conteúdo profissional e gerenciar suas próprias redes sociais. Você aprende a fazer tudo sozinho com acompanhamento de um especialista. O investimento é menor e você ganha autonomia total.',
  },
  {
    question: 'Vocês gerenciam quais redes sociais?',
    answer: 'Gerenciamos Instagram (feed, stories, reels), Facebook (posts, stories), TikTok (vídeos curtos), LinkedIn (para empresas B2B) e Google Meu Negócio. O plano padrão inclui até 3 redes sociais. Se você precisar de mais redes ou plataformas específicas (YouTube, Twitter, Pinterest), podemos incluir no plano personalizado.',
  },
  {
    question: 'O estrategista vai responder mensagens de clientes?',
    answer: 'Sim, o estrategista responde comentários nos posts e mensagens diretas básicas (dúvidas sobre horário, localização, cardápio, preços). Para negociações comerciais ou questões técnicas específicas, ele direciona para você ou sua equipe. Isso mantém suas redes sempre ativas e aumenta o engajamento.',
  },
  {
    question: 'Preciso fornecer equipamento para o estrategista?',
    answer: 'Não, o estrategista usa equipamento profissional próprio: câmera ou smartphone de alta qualidade, microfone para vídeos, tripé, iluminação portátil e softwares de edição profissionais. Você só precisa estar disponível durante as visitas e dar acesso ao negócio para produção do conteúdo.',
  },
  {
    question: 'Como vocês garantem que o conteúdo representa minha marca?',
    answer: 'Antes de começar, fazemos uma reunião de alinhamento para entender a identidade da sua marca, tom de voz, cores, valores e público-alvo. O estrategista cria um guia de conteúdo personalizado e apresenta os primeiros posts para aprovação. Depois do alinhamento inicial, ele tem autonomia para publicar, mas você pode revisar e solicitar ajustes sempre que quiser.',
  },
];

// FAQs segmentadas por vertical (AEO - featured snippets por segmento)
const faqsMedicos = [
  {
    question: 'Como funciona o marketing digital para medicos?',
    answer: 'O marketing medico no crIAdores segue as normas eticas do CFM. Criamos conteudo educativo e profissional que posiciona o medico como autoridade, atrai pacientes qualificados e fortalece a presenca digital da clinica ou consultorio.',
  },
  {
    question: 'O marketing para clinicas e etico?',
    answer: 'Sim, todo conteudo e criado seguindo as diretrizes do Conselho Federal de Medicina. Focamos em conteudo educativo, informativo e de autoridade, sem promessas de resultados ou comparacoes com outros profissionais.',
  },
];

const faqsAdvogados = [
  {
    question: 'Advogados podem fazer marketing digital?',
    answer: 'Sim, dentro das normas da OAB. O crIAdores cria conteudo que constroi autoridade juridica sem publicidade direta. Focamos em educacao juridica, artigos de opiniao e presenca profissional nas redes sociais.',
  },
  {
    question: 'Como atrair clientes para escritorio de advocacia?',
    answer: 'Atraves de marketing de conteudo estrategico: artigos sobre temas juridicos relevantes, presenca no Google com SEO local, conteudo educativo nas redes sociais e posicionamento como autoridade na area de atuacao.',
  },
];

const faqsSocialMedia = [
  {
    question: 'O que faz um social media estratégico?',
    answer: 'O social media estratégico do crIAdores vai além de publicar posts. Ele visita presencialmente seu negócio toda semana, produz conteúdo profissional (fotos, vídeos, reels), define estratégia de crescimento alinhada aos objetivos do negócio, gerencia as redes sociais diariamente, responde comentários e mensagens, analisa métricas de desempenho e ajusta a abordagem continuamente para maximizar resultados.',
  },
  {
    question: 'Qual a diferença entre social media e marketing de influência?',
    answer: 'Social media é a gestão profissional das redes sociais do próprio negócio (publicação de posts, stories, reels, interação com seguidores). Marketing de influência conecta a marca a criadores externos (influenciadores) que promovem seus produtos para a audiência deles. No crIAdores oferecemos ambos os serviços: o social media estratégico como produto principal e campanhas com influenciadores como serviço complementar.',
  },
  {
    question: 'Social media estratégico ou contratar funcionário interno?',
    answer: 'O social media estratégico oferece vantagens sobre contratar CLT: custo menor (sem encargos trabalhistas), expertise especializada em marketing digital e criação de conteúdo, equipamento profissional incluído, visão externa e estratégica do negócio, e flexibilidade para cancelar se não funcionar. Um funcionário interno custa em média R$ 3.500/mês (salário + encargos) sem garantia de expertise, enquanto o crIAdores oferece um profissional especializado por R$ 997/mês.',
  },
  {
    question: 'Preciso estar presente durante as visitas do estrategista?',
    answer: 'Idealmente sim, mas não o tempo todo. É importante estar presente no início para alinhar expectativas e mostrar o negócio. Depois, o estrategista precisa de você disponível 30-60 minutos durante a visita semanal para capturar conteúdo específico, tirar fotos com a equipe ou gravar depoimentos. O resto do tempo ele trabalha de forma autônoma.',
  },
  {
    question: 'O que é social media presencial?',
    answer: 'Social media presencial é o modelo do crIAdores onde o estrategista vai fisicamente ao seu estabelecimento toda semana. Isso permite produzir conteúdo autêntico do dia a dia do negócio (bastidores, produtos, equipe, clientes satisfeitos), conhecer profundamente a realidade da empresa e criar estratégias muito mais personalizadas do que agências remotas que nunca visitam o cliente.',
  },
  {
    question: 'Quanto custa contratar um social media para minha empresa?',
    answer: 'No crIAdores, o social media estratégico com visitas presenciais semanais custa R$ 997/mês. Agências tradicionais cobram entre R$ 2.000 e R$ 5.000/mês sem visitas presenciais. Freelancers cobram R$ 800-1.500/mês mas geralmente têm menos experiência e atendem muitos clientes ao mesmo tempo. Nosso modelo oferece o melhor custo-benefício: profissional especializado, visitas presenciais e dedicação exclusiva.',
  },
  {
    question: 'Social media estratégico funciona para pequenas empresas?',
    answer: 'Sim! Na verdade, pequenas empresas são as que mais se beneficiam. Negócios locais precisam de presença digital forte para competir com grandes marcas, e o modelo presencial do crIAdores é perfeito para capturar a autenticidade de pequenos negócios. A maioria dos nossos clientes são restaurantes, lojas, salões, clínicas e escritórios de pequeno e médio porte.',
  },
  {
    question: 'Vocês criam anúncios pagos no Instagram e Facebook?',
    answer: 'O plano padrão foca em crescimento orgânico (posts, stories, reels, engajamento). Anúncios pagos (Meta Ads) são um serviço adicional que pode ser contratado separadamente. Muitos clientes começam com orgânico e depois adicionam anúncios quando querem acelerar ainda mais os resultados. Podemos criar e gerenciar campanhas pagas mediante orçamento adicional.',
  },
  {
    question: 'Qual a diferença entre posts, stories e reels?',
    answer: 'Posts são publicações permanentes no feed do Instagram (fotos ou vídeos curtos), ideais para conteúdo institucional. Stories são vídeos/fotos temporários (24h) que geram mais engajamento e proximidade com seguidores. Reels são vídeos curtos (15-90s) com alta viralização, ideais para alcançar novos seguidores. O estrategista do crIAdores produz e gerencia os três formatos de forma balanceada.',
  },
  {
    question: 'Quanto tempo o estrategista fica no meu negócio durante a visita?',
    answer: 'A visita presencial dura em média 2-3 horas. Nesse tempo, o estrategista: captura fotos e vídeos do estabelecimento, produtos, equipe e clientes (com autorização), grava reels e stories, conversa com você sobre resultados da semana, alinha estratégias e tira dúvidas. Depois da visita, ele edita o conteúdo e gerencia as redes remotamente durante a semana.',
  },
];

const faqsMentoria = [
  {
    question: 'O que e a mentoria de marketing do crIAdores?',
    answer: 'A mentoria e um acompanhamento personalizado onde um estrategista ensina o empreendedor a gerenciar seu proprio marketing. Inclui planejamento de conteudo, estrategia de redes sociais e analise de resultados.',
  },
  {
    question: 'Mentoria ou contratar social media: qual escolher?',
    answer: 'Se voce tem tempo e quer aprender, a mentoria e ideal. Se prefere delegar, o social media estrategico e a melhor opcao. Tambem oferecemos um combo com desconto de 22% que combina os dois servicos.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: 'https://www.criadores.app/' },
  { name: 'Perguntas Frequentes', url: 'https://www.criadores.app/perguntas-frequentes' },
];

export default function PerguntasFrequentesPage() {
  return (
    <>
      {/* Dados Estruturados para SEO/AEO - inclui FAQs gerais + segmentadas */}
      <FAQPageSchema faqs={[...faqs, ...faqsMedicos, ...faqsAdvogados, ...faqsSocialMedia, ...faqsMentoria]} />
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-onest tracking-tight">
                <span className="text-gray-600 font-light">cr</span>
                <span className="text-black font-bold">IA</span>
                <span className="text-gray-600 font-light">dores</span>
              </a>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="/#about" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Sobre</a>
              <a href="/#services" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Serviços</a>
              <a href="/#mission" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Missão</a>
              <a href="/#why" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Por que</a>
              <a href="/#process" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Processo</a>
              <a href="/blog" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Blog</a>
              <a href="/sou-criador" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Sou crIAdor</a>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200 border border-gray-300 rounded-full hover:border-gray-400">Entrar</button>
              <button className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-4 py-2 text-xs rounded-full">
                <span className="hidden sm:inline">Começar Agora</span>
                <span className="sm:hidden">Começar</span>
              </button>
            </div>
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-black focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Perguntas Frequentes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Tire suas dúvidas sobre social media estratégico, gestão de redes sociais,
              estrategistas de marketing e nossos serviços para empresas.
            </p>
          </div>

          {/* TL;DR Section para GEO */}
          <div className="bg-blue-50 rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Resumo Rápido (TL;DR)</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">O que fazemos:</h3>
                <p className="text-gray-700">Oferecemos social media estratégico: um profissional dedicado que vai presencialmente ao seu negócio toda semana para produzir conteúdo e gerenciar suas redes sociais.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Resultados típicos:</h3>
                <p className="text-gray-700">40% de aumento no faturamento, crescimento de 200-500% em seguidores qualificados e maior reconhecimento local.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Investimento:</h3>
                <p className="text-gray-700">R$ 997/mês com visitas presenciais semanais, produção ilimitada de conteúdo e gestão completa incluídos.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Como funciona:</h3>
                <p className="text-gray-700">Estrategista designado ao seu negócio, visitas semanais para produção de conteúdo, planejamento estratégico e gestão completa das redes.</p>
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* FAQs por Segmento - AEO (featured snippets por vertical) */}
          <div className="mt-20 space-y-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Perguntas por Segmento
            </h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
              Respostas especificas para cada area de atuacao
            </p>

            {/* Medicos */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg">🏥</span>
                Para Medicos e Clinicas
              </h3>
              <div className="space-y-6">
                {faqsMedicos.map((faq, index) => (
                  <div key={`med-${index}`} className="bg-white border border-green-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h4>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Advogados */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">⚖️</span>
                Para Advogados e Escritorios
              </h3>
              <div className="space-y-6">
                {faqsAdvogados.map((faq, index) => (
                  <div key={`adv-${index}`} className="bg-white border border-blue-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h4>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg">📱</span>
                Sobre Social Media
              </h3>
              <div className="space-y-6">
                {faqsSocialMedia.map((faq, index) => (
                  <div key={`sm-${index}`} className="bg-white border border-purple-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h4>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentoria */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg">🎯</span>
                Sobre Mentoria
              </h3>
              <div className="space-y-6">
                {faqsMentoria.map((faq, index) => (
                  <div key={`ment-${index}`} className="bg-white border border-amber-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h4>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-[#0b3553] to-[#0d4a6b] rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ainda tem dúvidas?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Nossa equipe está pronta para esclarecer qualquer questão e ajudar você a
              encontrar a melhor solução de social media para seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/554391936400?text=Olá! Tenho dúvidas sobre as campanhas do crIAdores"
                className="bg-white text-[#0b3553] px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar no WhatsApp
              </a>
              <a
                href="mailto:contato@criadores.app"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-[#0b3553] transition-colors text-lg"
              >
                Enviar E-mail
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
