'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User, Home, ChevronRight } from 'lucide-react';
import { blogService, BlogPost } from '@/lib/supabase';
import { formatDate } from '@/lib/dateUtils';
import { trackBlogView } from '@/lib/gtag';

// Importar novos componentes
import PostSummary from '@/components/blog/PostSummary';
import PostSection from '@/components/blog/PostSection';
import SocialShare from '@/components/blog/SocialShare';
import FixedSocialShare from '@/components/blog/FixedSocialShare';
import NewsletterSignup from '@/components/blog/NewsletterSignup';
import PostSidebar from '@/components/blog/PostSidebar';
import PostCTA from '@/components/blog/PostCTA';
import YouTubeEmbed from '@/components/blog/YouTubeEmbed';
import ChatbotCTA from '@/components/blog/ChatbotCTA';

// Funções auxiliares

const getCategoryColor = (audience: string) => {
  const colors: Record<string, string> = {
    'EMPRESAS': 'bg-blue-100 text-blue-800',
    'CRIADORES': 'bg-purple-100 text-purple-800',
    'AMBOS': 'bg-green-100 text-green-800'
  };
  return colors[audience] || 'bg-gray-100 text-gray-800';
};

const getCategoryName = (audience: string) => {
  const names: Record<string, string> = {
    'EMPRESAS': 'Para Empresas',
    'CRIADORES': 'Para Criadores',
    'AMBOS': 'Geral'
  };
  return names[audience] || 'Geral';
};

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Unwrap params usando React.use()
  const { slug } = React.use(params);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const postData = await blogService.getPostBySlug(slug);

        if (!postData) {
          notFound();
          return;
        }

        setPost(postData);

        // Incrementar view count
        await blogService.incrementViewCount(postData.id);

        // Track blog view no Google Analytics
        trackBlogView(postData.title, slug);

        // Buscar apenas os últimos posts (não mais posts relacionados por audiência)
        const latest = await blogService.getAllPosts();
        console.log('📊 [BLOG] Total de posts encontrados:', latest.length);

        // Filtrar para excluir o post atual e garantir pelo menos 3 posts
        const filteredLatest = latest.filter(post => post.id !== postData.id);
        console.log('📊 [BLOG] Posts após filtrar atual:', filteredLatest.length);

        // Se não tiver pelo menos 3 posts, usar posts estáticos conhecidos
        let postsToShow = filteredLatest.length >= 3 ? filteredLatest.slice(0, 3) : filteredLatest;

        // Fallback para posts estáticos se não houver posts suficientes
        if (postsToShow.length < 3) {
          const staticPosts = [
            {
              id: 'static-1',
              title: 'Como sua empresa pode crescer com crIAdores Locais 🌎✨',
              slug: 'como-crescer-crIAdores-locais',
              excerpt: 'Como sua empresa pode crescer com crIAdores Locais 🌎✨',
              featured_image_url: 'https://ecbhcalmulaiszslwhqz.supabase.co/storage/v1/object/public/blog/00000000-0000-0000-0000-000000000002/1757281328042-i5l5a3pstzg.png',
              featured_image_alt: 'Como sua empresa pode crescer com crIAdores Locais',
              audience_target: 'EMPRESAS',
              published_at: '2025-01-15T00:00:00Z',
              read_time_minutes: 1
            },
            {
              id: 'static-2',
              title: 'IA aumenta vendas de PMEs do interior em 300%',
              slug: 'ia-aumenta-vendas-pmes-interior',
              excerpt: 'Descubra como pequenas empresas estão usando inteligência artificial para triplicar suas vendas.',
              featured_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
              featured_image_alt: 'IA para PMEs',
              audience_target: 'EMPRESAS',
              published_at: '2025-01-10T00:00:00Z',
              read_time_minutes: 3
            },
            {
              id: 'static-3',
              title: 'Marketing Local: O Futuro dos Negócios',
              slug: 'marketing-local-futuro-negocios',
              excerpt: 'Por que o marketing local está revolucionando a forma como empresas se conectam com clientes.',
              featured_image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
              featured_image_alt: 'Marketing Local',
              audience_target: 'AMBOS',
              published_at: '2025-01-05T00:00:00Z',
              read_time_minutes: 4
            }
          ].filter(staticPost => staticPost.slug !== slug); // Excluir o post atual se for um dos estáticos

          postsToShow = staticPosts.slice(0, 3);
        }

        console.log('📊 [BLOG] Posts finais para mostrar:', postsToShow.length, postsToShow.map(p => p.title));

        setRelatedPosts(postsToShow); // Usar os últimos posts como "relacionados"
        setLatestPosts(latest.slice(0, 6)); // Manter para outras seções se necessário

      } catch (error) {
        console.error('Erro ao carregar post:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando post...</h2>
          <p className="text-gray-600">Preparando o melhor conteúdo para você</p>
        </div>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botões de Compartilhamento Fixos */}
      <FixedSocialShare
        title={post.title}
        excerpt={post.excerpt}
      />

      {/* Espaçamento para header fixo */}
      <div className="pt-14">
        {/* Breadcrumb Melhorado */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <nav className="flex items-center space-x-2 text-sm">
              <a href="/" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                <Home className="w-4 h-4 mr-1" />
                Home
              </a>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <a href="/blog" className="text-gray-500 hover:text-blue-600 transition-colors">
                Blog
              </a>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.audience_target)}`}>
                {getCategoryName(post.audience_target)}
              </span>
            </nav>
          </div>
        </div>

        {/* Layout Principal Centralizado */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Conteúdo Principal */}
          <main>
              <article className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header do Artigo */}
                <header className="px-8 py-12">
                  {/* Meta informações */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(post.audience_target)}`}>
                      {getCategoryName(post.audience_target)}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(post.published_at || '', 'full')}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{post.read_time_minutes} min de leitura</span>
                    </div>
                  </div>

                  {/* Título em destaque */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
                    {post.title}
                  </h1>

                  {/* Excerpt */}
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8">
                    {post.excerpt}
                  </p>

                  {/* Compartilhamento Social */}
                  <SocialShare
                    title={post.title}
                    excerpt={post.excerpt}
                    viewCount={post.view_count}
                    variant="full"
                  />
                </header>


                {/* Conteúdo do Artigo */}
                <div className="px-8 py-8">
                  {/* Sumário Dinâmico */}
                  <PostSummary
                    content={post.content}
                    audience_target={post.audience_target}
                    tags={post.tags}
                  />

                  {/* Imagem em Destaque */}
                  {post.featured_image_url && (
                    <div className="mb-12">
                      <img
                        src={post.featured_image_url}
                        alt={post.featured_image_alt || post.title}
                        className="w-full h-96 object-cover rounded-xl shadow-lg"
                      />
                      {post.featured_image_credit && (
                        <p className="text-sm text-gray-500 mt-3 text-center italic">
                          {post.featured_image_credit}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Conteúdo Principal */}
                  <PostSection
                    title={post.title}
                    content={post.content}
                    variant="default"
                  />

                  {/* Vídeo do YouTube (se disponível) */}
                  {post.youtube_video_url && (
                    <div className="mb-12">
                      <YouTubeEmbed
                        url={post.youtube_video_url}
                        title={`Vídeo: ${post.title}`}
                      />
                    </div>
                  )}

                  {/* CTA do Chatbot */}
                  <ChatbotCTA audience_target={post.audience_target} />

                  {/* Newsletter Signup */}
                  <NewsletterSignup
                    variant="default"
                    audience_target={post.audience_target}
                  />
                </div>
              </article>
            </main>

          {/* Seção para Posts Relacionados */}
          <div className="mt-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📰 Últimas Publicações</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts && relatedPosts.length > 0 ? (
                  relatedPosts.slice(0, 3).map((relatedPost) => (
                    <a
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="group block bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-all duration-200 hover:shadow-md"
                    >
                      <img
                        src={relatedPost.featured_image_url || '/blog/default-image.jpg'}
                        alt={relatedPost.featured_image_alt || relatedPost.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getCategoryColor(relatedPost.audience_target)}`}>
                          {getCategoryName(relatedPost.audience_target)}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{formatDate(relatedPost.published_at || '', 'short')}</span>
                          <span className="mx-1">•</span>
                          <span>{relatedPost.read_time_minutes} min</span>
                        </div>
                      </div>
                    </a>
                  ))
                ) : (
                  // Fallback quando não há posts relacionados
                  <div className="col-span-full text-center py-8">
                    <div className="text-gray-500 mb-4">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      <p className="text-sm">Nenhum post adicional encontrado</p>
                      <a href="/blog" className="inline-block mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Ver todos os posts →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Espaço extra no final */}
      <div className="h-32"></div>
    </div>
  );
}
