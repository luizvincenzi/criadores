import { Metadata } from 'next';
import { FAQPageSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes | crIAdores',
  description: 'Tire suas dúvidas sobre como conectar seu negócio local a criadores de conteúdo. Respostas sobre campanhas, preços, resultados e muito mais.',
  keywords: [
    'perguntas frequentes',
    'dúvidas criadores',
    'marketing local',
    'influenciadores',
    'campanhas',
    'preços',
    'resultados',
    'marketing medico',
    'marketing advogados',
    'social media empresas',
    'mentoria marketing digital',
  ],
  alternates: {
    canonical: 'https://www.criadores.app/perguntas-frequentes',
  },
  openGraph: {
    title: 'Perguntas Frequentes | crIAdores',
    description: 'Tire suas dúvidas sobre como conectar seu negócio local a criadores de conteúdo.',
    url: 'https://www.criadores.app/perguntas-frequentes',
    type: 'website',
  },
  twitter: {
    title: 'Perguntas Frequentes | crIAdores',
    description: 'Tire suas dúvidas sobre como conectar seu negócio local a criadores de conteúdo.',
  },
};

const faqs = [
  {
    question: 'O que é o crIAdores?',
    answer: 'O crIAdores é uma plataforma que conecta negócios locais a criadores de conteúdo autênticos da região. Facilitamos campanhas de marketing com micro influenciadores que geram resultados reais para pequenas e médias empresas.',
  },
  {
    question: 'Como funciona o processo de campanha?',
    answer: 'O processo é simples: 1) Você define seus objetivos e orçamento, 2) Selecionamos criadores alinhados com sua marca e região, 3) Os criadores produzem conteúdo autêntico, 4) Acompanhamos os resultados e métricas em tempo real.',
  },
  {
    question: 'Quanto custa uma campanha?',
    answer: 'Os valores variam conforme o escopo da campanha, número de criadores e tipo de conteúdo. Oferecemos pacotes a partir de R$ 500 para pequenos negócios, com opções personalizadas para empresas maiores.',
  },
  {
    question: 'Que tipo de resultados posso esperar?',
    answer: 'Nossos clientes veem em média 40% de aumento no faturamento, maior reconhecimento da marca na região e crescimento significativo nas redes sociais. Os resultados variam conforme o setor e estratégia aplicada.',
  },
  {
    question: 'Como vocês selecionam os criadores?',
    answer: 'Selecionamos criadores baseado em: localização geográfica, alinhamento com valores da marca, engajamento autêntico da audiência, qualidade do conteúdo e histórico de parcerias bem-sucedidas.',
  },
  {
    question: 'Posso escolher os criadores para minha campanha?',
    answer: 'Sim! Apresentamos uma seleção de criadores pré-qualificados e você pode escolher aqueles que mais se alinham com sua marca. Também consideramos suas preferências e feedback.',
  },
  {
    question: 'Quanto tempo dura uma campanha?',
    answer: 'As campanhas podem durar de 1 semana a 3 meses, dependendo dos objetivos. Campanhas pontuais (eventos, promoções) são mais curtas, enquanto campanhas de branding podem ser mais longas.',
  },
  {
    question: 'Vocês trabalham com que tipos de negócio?',
    answer: 'Trabalhamos com diversos segmentos: restaurantes, lojas, salões de beleza, academias, clínicas, escolas, eventos e qualquer negócio que queira aumentar sua presença local.',
  },
  {
    question: 'Como acompanho os resultados?',
    answer: 'Fornecemos relatórios detalhados com métricas de alcance, engajamento, conversões e ROI. Você tem acesso a um dashboard em tempo real para acompanhar o progresso da campanha.',
  },
  {
    question: 'Posso cancelar uma campanha?',
    answer: 'Sim, oferecemos flexibilidade nos contratos. Campanhas podem ser pausadas ou canceladas com aviso prévio, respeitando os compromissos já assumidos com os criadores.',
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
    question: 'O que faz um social media estrategico?',
    answer: 'O social media estrategico do crIAdores vai alem de publicar posts. Ele planeja conteudo semanal presencialmente, define estrategia de crescimento, analisa metricas e ajusta a abordagem para maximizar resultados do negocio.',
  },
  {
    question: 'Qual a diferenca entre social media e marketing de influencia?',
    answer: 'Social media e a gestao profissional das redes sociais do negocio (posts, stories, reels). Marketing de influencia conecta a marca a criadores externos que promovem seus produtos. No crIAdores oferecemos ambos os servicos.',
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
              Tire suas dúvidas sobre como conectar seu negócio local a criadores de conteúdo 
              e potencializar seus resultados com marketing autêntico.
            </p>
          </div>

          {/* TL;DR Section para GEO */}
          <div className="bg-blue-50 rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Resumo Rápido (TL;DR)</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">O que fazemos:</h3>
                <p className="text-gray-700">Conectamos negócios locais a criadores de conteúdo para campanhas autênticas e eficazes.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Resultados típicos:</h3>
                <p className="text-gray-700">40% de aumento no faturamento e maior reconhecimento da marca na região.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Investimento:</h3>
                <p className="text-gray-700">A partir de R$ 500, com pacotes personalizados para cada negócio.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Duração:</h3>
                <p className="text-gray-700">De 1 semana a 3 meses, dependendo dos objetivos da campanha.</p>
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
              criar a campanha perfeita para seu negócio.
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
