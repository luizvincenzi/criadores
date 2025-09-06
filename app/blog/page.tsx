'use client';

import { useState } from 'react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
  image: string;
  slug: string;
  featured?: boolean;
}

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - em produção viria de CMS ou API
  const posts: BlogPost[] = [
    {
      id: '1',
      title: 'Padaria de BH dobra vendas com WhatsApp Business em 90 dias',
      excerpt: 'Automatização simples de pedidos e delivery transformou negócio familiar em referência do bairro. Estratégia pode ser replicada por qualquer PME.',
      category: 'Empresas',
      categoryColor: 'bg-blue-100 text-[#0b3553]',
      date: '15 Jan 2025',
      readTime: '3 min',
      image: '/blog/whatsapp-business-padaria.jpg',
      slug: 'padaria-bh-whatsapp-business',
      featured: true
    },
    {
      id: '2',
      title: 'IA aumenta vendas de PMEs em 40% no interior paulista',
      excerpt: 'Chatbots simples e automação de redes sociais transformam pequenos negócios em Ribeirão Preto. Tecnologia acessível democratiza marketing digital.',
      category: 'Empresas',
      categoryColor: 'bg-blue-100 text-[#0b3553]',
      date: '12 Jan 2025',
      readTime: '4 min',
      image: '/blog/ia-pmes-interior.jpg',
      slug: 'ia-aumenta-vendas-pmes-interior'
    },
    {
      id: '3',
      title: 'Criadora de TikTok fatura R$ 15k/mês com UGC para empresas locais',
      excerpt: 'Estudante de Curitiba transforma hobby em profissão criando conteúdo autêntico para PMEs. Estratégia simples pode ser replicada por qualquer criador.',
      category: 'Criadores',
      categoryColor: 'bg-purple-100 text-purple-800',
      date: '10 Jan 2025',
      readTime: '5 min',
      image: '/blog/criadora-ugc-curitiba.jpg',
      slug: 'criador-tiktok-monetiza-ugc'
    },
    {
      id: '4',
      title: 'Instagram muda algoritmo: prioridade para conteúdo local em 2025',
      excerpt: 'Atualização favorece negócios e criadores regionais. Mudança pode revolucionar marketing de proximidade no Brasil.',
      category: 'Tendências',
      categoryColor: 'bg-green-100 text-green-800',
      date: '20 Jan 2025',
      readTime: '3 min',
      image: '/blog/instagram-algoritmo-local.jpg',
      slug: 'instagram-algoritmo-conteudo-local'
    },
    {
      id: '6',
      title: 'IA aumenta vendas de PMEs em 40% no interior paulista',
      excerpt: 'Estudo com 200 empresas mostra impacto da automação inteligente em negócios locais. Ferramentas gratuitas lideram adoção.',
      category: 'Empresas',
      categoryColor: 'bg-blue-100 text-[#0b3553]',
      date: '22 Jan 2025',
      readTime: '4 min',
      image: '/blog/ia-pmes-interior.jpg',
      slug: 'ia-aumenta-vendas-pmes-interior'
    },
    {
      id: '7',
      title: '5 ferramentas gratuitas para criadores locais em 2025',
      excerpt: 'Seleção de apps e plataformas que estão transformando a criação de conteúdo regional. Todas com versão gratuita robusta.',
      category: 'Ferramentas',
      categoryColor: 'bg-gray-100 text-gray-800',
      date: '25 Jan 2025',
      readTime: '5 min',
      image: '/blog/ferramentas-criadores-2025.jpg',
      slug: 'ferramentas-gratuitas-criadores-locais'
    }
  ];

  const categories = [
    { id: 'all', name: 'Todos os Posts', color: 'bg-gray-100 text-gray-800' },
    { id: 'empresas', name: 'Para Empresas', color: 'bg-blue-100 text-[#0b3553]' },
    { id: 'criadores', name: 'Para Criadores', color: 'bg-purple-100 text-purple-800' },
    { id: 'tendencias', name: 'Tendências', color: 'bg-green-100 text-green-800' },
    { id: 'ferramentas', name: 'Ferramentas', color: 'bg-gray-100 text-gray-800' }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category.toLowerCase() === selectedCategory);

  const featuredPost = posts.find(post => post.featured);

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-20 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Blog <span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Insights, tendências e estratégias para empresas locais e criadores de conteúdo.
            Conectamos negócios aos melhores criadores da região.
          </p>
        </div>

      {/* Featured Post */}
      {featuredPost && (
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${featuredPost.categoryColor}`}>
                    {featuredPost.category}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-500 text-sm">{featuredPost.date}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-500 text-sm">{featuredPost.readTime}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <a 
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center text-[#0b3553] font-semibold hover:text-[#0d4a6b] transition-colors"
                >
                  Ler artigo completo
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-[#0b3553] text-white'
                  : `${category.color} hover:opacity-80`
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${post.categoryColor}`}>
                  {post.category}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-500 text-xs">{post.date}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-500 text-xs">{post.readTime}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <a 
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-[#0b3553] font-medium hover:text-[#0d4a6b] transition-colors text-sm"
              >
                Ler mais
                <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter CTA */}
      <div className="mt-32 mb-32 bg-gradient-to-r from-[#0b3553] to-[#0d4a6b] rounded-2xl p-12 text-center">
        <h3 className="text-3xl font-bold text-white mb-6">
          Não perca nenhum insight
        </h3>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
          Receba semanalmente as melhores estratégias de marketing local e criação de conteúdo direto no seu e-mail.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="Seu melhor e-mail"
            className="flex-1 px-6 py-4 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-lg"
          />
          <button className="bg-white text-[#0b3553] px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg">
            Inscrever
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default BlogPage;
