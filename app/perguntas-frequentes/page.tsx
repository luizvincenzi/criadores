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

const breadcrumbs = [
  { name: 'Home', url: 'https://www.criadores.app/' },
  { name: 'Perguntas Frequentes', url: 'https://www.criadores.app/perguntas-frequentes' },
];

export default function PerguntasFrequentesPage() {
  return (
    <>
      {/* Dados Estruturados para SEO/AEO */}
      <FAQPageSchema faqs={faqs} />
      <BreadcrumbSchema items={breadcrumbs} />

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
                href="https://wa.me/5511999999999?text=Olá! Tenho dúvidas sobre as campanhas do crIAdores"
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
