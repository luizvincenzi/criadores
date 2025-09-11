'use client';

import { useState, useEffect } from 'react';
import { blogService, BlogPost } from '@/lib/supabase';

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar posts do Supabase
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await blogService.getAllPosts();
        setPosts(data);
      } catch (error) {
        console.error('Erro ao carregar posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const categories = [
    { id: 'all', name: 'Todos os Posts', color: 'bg-gray-100 text-gray-800' },
    { id: 'empresas', name: 'Para Empresas', color: 'bg-blue-100 text-[#0b3553]' },
    { id: 'criadores', name: 'Para Criadores', color: 'bg-purple-100 text-purple-800' },
    { id: 'ambos', name: 'Geral', color: 'bg-green-100 text-green-800' }
  ];

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => {
        if (selectedCategory === 'empresas') return post.audience_target === 'EMPRESAS' || post.audience_target === 'AMBOS';
        if (selectedCategory === 'criadores') return post.audience_target === 'CRIADORES' || post.audience_target === 'AMBOS';
        if (selectedCategory === 'ambos') return post.audience_target === 'AMBOS';
        return false;
      });

  const featuredPost = posts.find(post => post.is_featured);

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Função para obter cor da categoria baseada no audience_target
  const getCategoryColor = (audience: string) => {
    const colors: Record<string, string> = {
      'EMPRESAS': 'bg-blue-100 text-[#0b3553]',
      'CRIADORES': 'bg-purple-100 text-purple-800',
      'AMBOS': 'bg-green-100 text-green-800'
    };
    return colors[audience] || 'bg-gray-100 text-gray-800';
  };

  // Função para obter nome da categoria
  const getCategoryName = (audience: string) => {
    const names: Record<string, string> = {
      'EMPRESAS': 'Para Empresas',
      'CRIADORES': 'Para Criadores',
      'AMBOS': 'Geral'
    };
    return names[audience] || 'Geral';
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando posts...</p>
        </div>
      </div>
    );
  }

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

          {/* TL;DR Section para GEO */}
          <div className="bg-blue-50 rounded-xl p-8 mt-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <span className="mr-3">📋</span>
              Resumo Rápido (TL;DR)
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Conteúdo:</h3>
                <p className="text-gray-700">Estratégias práticas de marketing local e criação de conteúdo para empresas e criadores.</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Público:</h3>
                <p className="text-gray-700">Empresários locais, criadores de conteúdo e profissionais de marketing digital.</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Objetivo:</h3>
                <p className="text-gray-700">Ajudar negócios locais a crescer através de parcerias autênticas com criadores.</p>
              </div>
            </div>
          </div>
        </div>

      {/* Featured Post */}
      {featuredPost && (
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={featuredPost.featured_image_url || '/blog/default-image.jpg'}
                  alt={featuredPost.featured_image_alt || featuredPost.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(featuredPost.audience_target)}`}>
                    {getCategoryName(featuredPost.audience_target)}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-500 text-sm">{formatDate(featuredPost.published_at || '')}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-500 text-sm">{featuredPost.read_time_minutes} min</span>
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
              src={post.featured_image_url || '/blog/default-image.jpg'}
              alt={post.featured_image_alt || post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.audience_target)}`}>
                  {getCategoryName(post.audience_target)}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-500 text-xs">{formatDate(post.published_at || '')}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-500 text-xs">{post.read_time_minutes} min</span>
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
