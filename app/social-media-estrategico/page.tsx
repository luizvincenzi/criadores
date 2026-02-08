import type { Metadata } from 'next';
import { BreadcrumbSchema, ServiceSchema, FAQPageSchema } from '@/components/seo/JsonLd';
import SocialMediaEstrategicoClient from './SocialMediaEstrategicoClient';

// --- SEO Metadata (Server-side) ---
export const metadata: Metadata = {
  title: 'Social Media Estratégico Para Empresas | Conteúdo Presencial Semanal',
  description: 'Contrate um estrategista de social media dedicado ao seu negócio. Visitas presenciais semanais, produção de conteúdo profissional e gestão completa das redes sociais.',
  keywords: [
    'social media estratégico', 'social media para empresas', 'contratar social media',
    'gestão de redes sociais', 'social media presencial', 'estrategista de marketing digital',
    'gerenciamento de redes sociais', 'social media para pequenas empresas',
    'quanto custa social media', 'agência de social media', 'social media dedicado',
    'conteúdo presencial', 'marketing digital para empresas', 'social media restaurante',
    'social media clínica', 'social media salão de beleza'
  ],
  openGraph: {
    title: 'Social Media Estratégico | crIAdores',
    description: 'Estrategista dedicado ao seu negócio. Visitas presenciais semanais, conteúdo profissional e gestão completa das redes sociais.',
    url: 'https://www.criadores.app/social-media-estrategico',
    siteName: 'crIAdores',
    type: 'website',
    locale: 'pt_BR',
    images: [
      {
        url: 'https://www.criadores.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'crIAdores - Social Media Estratégico Para Empresas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media Estratégico Para Empresas | crIAdores',
    description: 'Estrategista dedicado com visitas presenciais semanais. Gestão completa das redes sociais para seu negócio.',
  },
  alternates: {
    canonical: 'https://www.criadores.app/social-media-estrategico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// --- FAQ Data (used by both Schema and Client) ---
export const pageFaqs = [
  {
    question: 'Como sei se social media estratégico é para meu negócio?',
    answer: 'Se você tem um negócio local (restaurante, clínica, salão, loja, escritório) e precisa de presença profissional nas redes sociais, o social media estratégico é para você. Atendemos desde pequenos comércios até redes com múltiplas unidades. O diagnóstico gratuito ajuda a entender se o modelo se encaixa no seu momento.'
  },
  {
    question: 'O que acontece na primeira semana após a contratação?',
    answer: 'Na primeira semana, realizamos um onboarding completo: visita ao seu negócio para conhecer o ambiente, alinhamento de identidade visual e tom de voz, definição do calendário editorial do primeiro mês e a primeira sessão de produção de conteúdo. Você já começa a ver conteúdo profissional sendo publicado.'
  },
  {
    question: 'Posso escolher o estrategista que vai ao meu negócio?',
    answer: 'Nós selecionamos o estrategista mais adequado para o seu segmento e região. Se por qualquer motivo você não se adaptar ao profissional, trocamos sem custo adicional em até 30 dias — é a nossa garantia de satisfação.'
  },
  {
    question: 'Vocês atendem aos finais de semana?',
    answer: 'As visitas presenciais são agendadas de segunda a sexta em horário comercial. Para negócios que funcionam principalmente aos finais de semana (como restaurantes e bares), adaptamos o calendário para incluir visitas em horários estratégicos que capturem o melhor conteúdo.'
  },
  {
    question: 'E se eu não gostar do conteúdo produzido?',
    answer: 'Todo conteúdo passa por um processo de aprovação antes de ser publicado. Você tem acesso ao material e pode solicitar ajustes. Além disso, nossa garantia de satisfação permite trocar o estrategista em até 30 dias sem custo, caso o alinhamento não esteja adequado.'
  },
  {
    question: 'Quantas redes sociais estão incluídas no plano?',
    answer: 'O plano inclui gestão de até 3 redes sociais (Instagram, TikTok, Facebook, LinkedIn ou Google Meu Negócio). O conteúdo é adaptado para cada plataforma, respeitando os formatos e melhores práticas de cada uma. Para saber os valores, fale com nosso especialista.'
  },
  {
    question: 'O estrategista também responde comentários e DMs?',
    answer: 'Sim! A gestão inclui resposta a comentários e interação básica com seguidores. Para mensagens que envolvam vendas, agendamentos ou atendimento específico, o estrategista direciona para você ou sua equipe, garantindo que nenhuma oportunidade seja perdida.'
  },
  {
    question: 'Vocês fazem anúncios pagos (tráfego pago)?',
    answer: 'O plano de social media estratégico foca na gestão orgânica das redes sociais. Tráfego pago (Meta Ads, Google Ads) é um serviço complementar que pode ser contratado à parte. Muitos clientes começam com o orgânico e adicionam tráfego pago depois de validar o posicionamento.'
  },
  {
    question: 'Posso acompanhar os resultados em tempo real?',
    answer: 'Sim. Você recebe um relatório mensal completo com métricas de crescimento, engajamento, alcance e comparativo com o mês anterior. Além disso, na reunião mensal de estratégia, revisamos juntos os números e ajustamos o plano para o próximo período.'
  },
  {
    question: 'Como começo?',
    answer: 'É simples: clique em "Falar com Especialista" para agendar seu diagnóstico gratuito. Em uma conversa de 15 minutos, analisamos seu negócio e explicamos como o social media estratégico pode funcionar para você. Sem compromisso, sem pressão. Se fizer sentido, você pode começar na mesma semana.'
  },
];

export default function SocialMediaEstrategicoPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.criadores.app' },
          { name: 'Social Media Estratégico', url: 'https://www.criadores.app/social-media-estrategico' },
        ]}
      />
      <ServiceSchema
        name="Social Media Estratégico"
        description="Estrategista de social media dedicado ao seu negócio com visitas presenciais semanais. Inclui produção de conteúdo profissional (fotos, vídeos, reels, stories), planejamento estratégico, calendário editorial, gestão de até 3 redes sociais e relatórios mensais de performance."
        url="https://www.criadores.app/social-media-estrategico"
        category="Gestão de Redes Sociais"
        areaServed="Brazil"
      />
      <FAQPageSchema faqs={pageFaqs} />

      {/* Client Component with interactive elements */}
      <SocialMediaEstrategicoClient faqs={pageFaqs} />
    </>
  );
}
