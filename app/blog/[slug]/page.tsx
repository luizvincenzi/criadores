'use client';

import React, { useState } from 'react';
import { notFound } from 'next/navigation';

interface BlogPostData {
  title: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
  image: string;
  content: {
    context: string;
    data: string;
    application: string;
    conclusion: string;
  };
  cta: {
    text: string;
    link: string;
  };
  relatedPosts?: Array<{
    title: string;
    slug: string;
    category: string;
    image: string;
  }>;
}

// Mock data - em produção viria de CMS ou API
const mockPosts: Record<string, BlogPostData> = {
  'padaria-bh-whatsapp-business': {
    title: 'Padaria de BH dobra vendas com WhatsApp Business em 90 dias',
    excerpt: 'Automatização simples de pedidos e delivery transformou negócio familiar em referência do bairro. Estratégia pode ser replicada por qualquer PME com investimento zero.',
    category: 'Para Empresas',
    categoryColor: 'bg-blue-100 text-blue-800',
    date: '15 Jan 2025',
    readTime: '3 min',
    image: '/blog/whatsapp-business-padaria.jpg',
    content: {
      context: `
        <p>A Padaria São José, no bairro Savassi em Belo Horizonte, enfrentava o mesmo problema de milhares de PMEs brasileiras: dificuldade para organizar pedidos por telefone, perda de clientes por demora no atendimento e falta de controle sobre delivery.</p>
        
        <p>Com 25 anos de tradição familiar, o negócio precisava se modernizar sem perder a proximidade com os clientes. A solução veio através do WhatsApp Business, ferramenta gratuita que revolucionou a operação em apenas três meses.</p>
      `,
      data: `
        <p>Os resultados da Padaria São José impressionam:</p>
        <ul>
          <li><strong>Vendas:</strong> Aumento de 120% no faturamento</li>
          <li><strong>Pedidos:</strong> De 50 para 180 pedidos diários</li>
          <li><strong>Tempo de atendimento:</strong> Redução de 8 para 2 minutos</li>
          <li><strong>Satisfação:</strong> 95% de avaliações positivas no delivery</li>
        </ul>
        
        <p>Segundo pesquisa da Sebrae 2024, 78% das PMEs que implementaram WhatsApp Business relataram crescimento nas vendas. No setor alimentício, o impacto é ainda maior: empresas registram aumento médio de 85% no faturamento.</p>
        
        <p>A ferramenta permite criar catálogo digital, automatizar respostas, organizar pedidos e integrar com sistemas de pagamento - tudo gratuitamente.</p>
      `,
      application: `
        <h3>Passo 1: Configure o perfil comercial</h3>
        <ul>
          <li>Baixe WhatsApp Business (gratuito)</li>
          <li>Complete informações: endereço, horário, descrição</li>
          <li>Adicione foto profissional da empresa</li>
        </ul>
        
        <h3>Passo 2: Crie catálogo digital</h3>
        <ul>
          <li>Fotografe produtos com boa iluminação</li>
          <li>Organize por categorias (pães, doces, salgados)</li>
          <li>Inclua preços e descrições claras</li>
        </ul>
        
        <h3>Passo 3: Automatize respostas</h3>
        <ul>
          <li>Configure mensagem de boas-vindas</li>
          <li>Crie respostas rápidas para perguntas frequentes</li>
          <li>Defina mensagem de ausência</li>
        </ul>
        
        <h3>Passo 4: Organize o atendimento</h3>
        <ul>
          <li>Use etiquetas para categorizar conversas</li>
          <li>Defina horários específicos para pedidos</li>
          <li>Integre com delivery próprio ou apps</li>
        </ul>
        
        <p><strong>Ferramentas complementares gratuitas:</strong></p>
        <ul>
          <li>Google Meu Negócio (divulgação)</li>
          <li>Canva (criação de cardápios)</li>
          <li>PicPay/Pix (pagamentos)</li>
        </ul>
      `,
      conclusion: `
        <p>A transformação digital não precisa ser complexa ou cara. O caso da Padaria São José mostra que ferramentas simples, quando bem implementadas, podem revolucionar um negócio local.</p>
        
        <p>O WhatsApp Business é apenas o primeiro passo. Empresas que investem em presença digital organizada e atendimento automatizado estão se posicionando para o futuro do comércio local.</p>
      `
    },
    cta: {
      text: 'Quer implementar WhatsApp Business na sua empresa? Nossa equipe oferece consultoria gratuita de 30 minutos para PMEs.',
      link: '/criavoz-homepage'
    },
    relatedPosts: [
      {
        title: 'IA aumenta vendas de PMEs em 40% no interior paulista',
        slug: 'ia-aumenta-vendas-pmes-interior',
        category: 'Para Empresas',
        image: '/blog/ia-pmes-interior.jpg'
      },
      {
        title: 'Google Meu Negócio: 5 dicas que funcionam',
        slug: 'google-meu-negocio-dicas',
        category: 'Para Empresas',
        image: '/blog/google-meu-negocio.jpg'
      },
      {
        title: 'Instagram muda algoritmo: prioridade para conteúdo local',
        slug: 'instagram-algoritmo-conteudo-local',
        category: 'Tendências',
        image: '/blog/instagram-algoritmo-local.jpg'
      }
    ]
  },
  'ia-aumenta-vendas-pmes-interior': {
    title: 'IA aumenta vendas de PMEs em 40% no interior paulista',
    excerpt: 'Chatbots simples e automação de redes sociais transformam pequenos negócios em Ribeirão Preto. Tecnologia acessível democratiza marketing digital.',
    category: 'Para Empresas',
    categoryColor: 'bg-blue-100 text-blue-800',
    date: '12 Jan 2025',
    readTime: '4 min',
    image: '/blog/ia-pmes-interior.jpg',
    content: {
      context: `
        <p>No interior de São Paulo, pequenas empresas estão descobrindo que inteligência artificial não é privilégio de grandes corporações. Em Ribeirão Preto, PMEs implementaram soluções simples de IA e registraram crescimento médio de 40% nas vendas.</p>

        <p>O movimento começou com a Associação Comercial local oferecendo workshops gratuitos sobre automação. Hoje, mais de 200 empresas da região usam chatbots, automação de redes sociais e análise de dados para competir em igualdade com grandes players.</p>
      `,
      data: `
        <p>Resultados das PMEs de Ribeirão Preto com IA:</p>
        <ul>
          <li><strong>Vendas online:</strong> Crescimento de 40% em 6 meses</li>
          <li><strong>Atendimento:</strong> 24h automatizado com 85% de satisfação</li>
          <li><strong>Custos:</strong> Redução de 30% em marketing digital</li>
          <li><strong>Produtividade:</strong> 3h diárias economizadas por empresa</li>
        </ul>

        <p>Segundo estudo da FGV, PMEs que adotam IA básica crescem 2,3x mais rápido que concorrentes tradicionais. No interior, onde mão de obra especializada é escassa, a automação se torna ainda mais vantajosa.</p>
      `,
      application: `
        <h3>Ferramentas de IA para PMEs (gratuitas/baratas):</h3>
        <ul>
          <li><strong>ChatGPT:</strong> Criação de conteúdo e atendimento</li>
          <li><strong>Canva Magic:</strong> Design automatizado</li>
          <li><strong>Google Analytics Intelligence:</strong> Insights automáticos</li>
          <li><strong>Facebook Creator Studio:</strong> Agendamento inteligente</li>
        </ul>

        <p>Implementação em 4 passos:</p>
        <ol>
          <li>Identifique tarefas repetitivas</li>
          <li>Teste ferramentas gratuitas</li>
          <li>Automatize gradualmente</li>
          <li>Meça resultados constantemente</li>
        </ol>
      `,
      conclusion: `
        <p>A revolução da IA chegou ao interior brasileiro. PMEs que se adaptarem agora terão vantagem competitiva decisiva nos próximos anos.</p>
      `
    },
    cta: {
      text: 'Quer implementar IA na sua PME? Consultoria gratuita para empresas do interior.',
      link: '/criavoz-homepage'
    }
  },
  'criador-tiktok-monetiza-ugc': {
    title: 'Criadora de TikTok fatura R$ 15k/mês com UGC para empresas locais',
    excerpt: 'Estudante de Curitiba transforma hobby em profissão criando conteúdo autêntico para PMEs. Estratégia simples pode ser replicada por qualquer criador.',
    category: 'Para Criadores',
    categoryColor: 'bg-purple-100 text-purple-800',
    date: '10 Jan 2025',
    readTime: '5 min',
    image: '/blog/criadora-ugc-curitiba.jpg',
    content: {
      context: `
        <p>Júlia Santos, 22 anos, estudante de Marketing em Curitiba, transformou sua paixão por criar conteúdo em uma fonte de renda consistente. Especializada em UGC (User Generated Content) para empresas locais, ela fatura R$ 15 mil mensais trabalhando apenas 20 horas por semana.</p>

        <p>O segredo? Focar em negócios locais que precisam de conteúdo autêntico mas não têm orçamento para agências tradicionais. Júlia criou um modelo escalável que beneficia tanto criadores quanto PMEs.</p>
      `,
      data: `
        <p>Números da Júlia em 8 meses:</p>
        <ul>
          <li><strong>Faturamento:</strong> R$ 15.000/mês</li>
          <li><strong>Clientes ativos:</strong> 12 empresas locais</li>
          <li><strong>Conteúdos/mês:</strong> 60 vídeos</li>
          <li><strong>Taxa de retenção:</strong> 95% dos clientes</li>
        </ul>

        <p>Mercado de UGC no Brasil cresce 180% ao ano. Empresas pagam entre R$ 200-800 por vídeo de UGC, dependendo da complexidade e alcance do criador.</p>
      `,
      application: `
        <h3>Como começar no UGC local:</h3>
        <ol>
          <li><strong>Defina seu nicho:</strong> Restaurantes, moda, beleza, fitness</li>
          <li><strong>Crie portfólio:</strong> 5-10 vídeos demonstrando seu estilo</li>
          <li><strong>Precifique serviços:</strong> R$ 200-500 por vídeo inicial</li>
          <li><strong>Prospecte localmente:</strong> Visite empresas do seu bairro</li>
        </ol>

        <h3>Estrutura de preços sugerida:</h3>
        <ul>
          <li>Vídeo simples (produto): R$ 200-300</li>
          <li>Vídeo elaborado (storytelling): R$ 400-600</li>
          <li>Pacote mensal (4 vídeos): R$ 1.200-1.800</li>
        </ul>
      `,
      conclusion: `
        <p>UGC é a ponte perfeita entre criadores e empresas locais. Com autenticidade e consistência, qualquer criador pode construir uma carreira sustentável neste mercado em expansão.</p>
      `
    },
    cta: {
      text: 'Quer conectar-se com empresas locais? Nossa plataforma facilita essas parcerias.',
      link: '/criavoz-homepage'
    }
  }
};

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [isSharing, setIsSharing] = useState(false);

  // Unwrap params usando React.use()
  const { slug } = React.use(params);
  const post = mockPosts[slug];
  
  if (!post) {
    notFound();
  }

  const sharePost = async (platform: string) => {
    const url = window.location.href;
    const text = `${post.title} - ${post.excerpt}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      copy: url
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setIsSharing(true);
        setTimeout(() => setIsSharing(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar link:', err);
      }
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Espaçamento para header fixo */}
      <div className="pt-20">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
              <span>/</span>
              <a href="/blog" className="hover:text-blue-600 transition-colors">Blog</a>
              <span>/</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.categoryColor}`}>
                {post.category}
              </span>
            </nav>
          </div>
        </div>

        {/* Article Header - Estilo The News */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="py-12 border-b border-gray-200">
            {/* Meta info */}
            <div className="flex items-center space-x-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${post.categoryColor}`}>
                {post.category}
              </span>
              <span className="text-gray-500 text-sm">{post.date}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 text-sm">{post.readTime} de leitura</span>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {post.title}
            </h1>
            
            {/* Excerpt */}
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {post.excerpt}
            </p>

            {/* Share buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 font-medium">Compartilhar:</span>
                <button
                  onClick={() => sharePost('twitter')}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-gray-100"
                  title="Compartilhar no Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
                <button
                  onClick={() => sharePost('linkedin')}
                  className="p-2 text-gray-400 hover:text-blue-700 transition-colors rounded-full hover:bg-gray-100"
                  title="Compartilhar no LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
                <button
                  onClick={() => sharePost('whatsapp')}
                  className="p-2 text-gray-400 hover:text-green-500 transition-colors rounded-full hover:bg-gray-100"
                  title="Compartilhar no WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </button>
                <button
                  onClick={() => sharePost('copy')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  title="Copiar link"
                >
                  {isSharing ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Article Content - Estilo The News */}
          <div className="py-12">
            {/* Hero Image */}
            <div className="mb-12">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <div className="text-2xl font-bold">WhatsApp Business</div>
                  <div className="text-lg opacity-90">Transformação Digital</div>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="prose prose-lg max-w-none">
              {/* Context Section */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">📍</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Contexto</h2>
                </div>
                <div
                  className="text-gray-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: post.content.context }}
                />
              </div>

              {/* Data Section */}
              <div className="mb-12 bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold text-sm">📊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Dados & Insights</h2>
                </div>
                <div
                  className="text-gray-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: post.content.data }}
                />
              </div>

              {/* Application Section */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-bold text-sm">💡</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Aplicação Prática</h2>
                </div>
                <div
                  className="text-gray-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: post.content.application }}
                />
              </div>

              {/* Conclusion */}
              <div className="mb-12 border-l-4 border-blue-500 pl-6 bg-blue-50 py-6 rounded-r-xl">
                <div
                  className="text-gray-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: post.content.conclusion }}
                />
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white mb-12">
              <h3 className="text-2xl font-bold mb-4">Pronto para transformar seu negócio?</h3>
              <p className="text-blue-100 mb-6 text-lg">
                {post.cta.text}
              </p>
              <a
                href={post.cta.link}
                className="inline-flex items-center justify-center bg-white text-blue-600 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors text-lg"
              >
                Falar com Especialista
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            {/* Related Posts */}
            {post.relatedPosts && post.relatedPosts.length > 0 && (
              <div className="border-t border-gray-200 pt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Leia também</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {post.relatedPosts.map((relatedPost, index) => (
                    <a
                      key={index}
                      href={`/blog/${relatedPost.slug}`}
                      className="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <div className="text-gray-500 text-center">
                          <div className="text-3xl mb-2">📄</div>
                          <div className="text-sm">{relatedPost.category}</div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="text-sm text-blue-600 font-medium mb-2">{relatedPost.category}</div>
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                          {relatedPost.title}
                        </h4>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Signup */}
            <div className="bg-gray-50 rounded-xl p-8 text-center mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                📧 Receba insights semanais
              </h3>
              <p className="text-gray-600 mb-6">
                Estratégias práticas de marketing local direto no seu e-mail. Sem spam, apenas conteúdo que funciona.
              </p>
              <form className="max-w-md mx-auto flex gap-3">
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
                >
                  Inscrever
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-3">
                Mais de 2.500 empresários já recebem nossos insights
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
