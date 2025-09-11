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
import { BlogPostSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

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

        // Tentar carregar o post principal primeiro
        console.log('🔍 [BLOG] Tentando carregar post:', slug);
        const postData = await blogService.getPostBySlug(slug);
        console.log('📊 [BLOG] Post encontrado:', postData ? 'SIM' : 'NÃO');

        if (!postData) {
          console.log('❌ [BLOG] Post não encontrado, redirecionando para 404');
          notFound();
          return;
        }

        setPost(postData);

        // Carregar posts relacionados do banco de dados
        console.log('🔍 [BLOG] Carregando posts relacionados...');
        try {
          // Buscar posts relacionados baseados na audiência do post atual
          const relatedPostsData = await blogService.getRelatedPosts(
            postData.id,
            postData.audience_target,
            3
          );

          console.log('📊 [BLOG] Posts relacionados encontrados:', relatedPostsData.length);
          setRelatedPosts(relatedPostsData);

          // Se não houver posts relacionados suficientes, buscar posts gerais
          if (relatedPostsData.length < 3) {
            console.log('🔍 [BLOG] Buscando posts adicionais...');
            const allPosts = await blogService.getAllPosts();
            const additionalPosts = allPosts
              .filter(p => p.id !== postData.id)
              .slice(0, 3 - relatedPostsData.length);

            setRelatedPosts([...relatedPostsData, ...additionalPosts]);
            console.log('📊 [BLOG] Total de posts relacionados:', relatedPostsData.length + additionalPosts.length);
          }
        } catch (relatedError) {
          console.warn('⚠️ [BLOG] Erro ao carregar posts relacionados:', relatedError);
          // Fallback: usar posts estáticos apenas se houver erro
          const staticPosts = [
            {
              id: 'marketing-local-vendas-2025',
              title: 'Como aumentar vendas com marketing local em 2025',
              slug: 'marketing-local-vendas-2025',
              excerpt: 'Estratégias comprovadas para empresas locais aumentarem suas vendas através de parcerias com criadores de conteúdo da região.',
              featured_image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
              featured_image_alt: 'Marketing Local para Vendas',
              audience_target: 'EMPRESAS',
              published_at: '2025-01-08T00:00:00Z',
              read_time_minutes: 4
            },
            {
              id: 'monetizar-conteudo-criadores-locais',
              title: 'Monetize seu conteúdo: Guia completo para criadores locais',
              slug: 'monetizar-conteudo-criadores-locais',
              excerpt: 'Transforme sua paixão por criar conteúdo em uma fonte de renda sustentável através de parcerias com empresas locais.',
              featured_image_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
              featured_image_alt: 'Monetização para Criadores',
              audience_target: 'CRIADORES',
              published_at: '2025-01-05T00:00:00Z',
              read_time_minutes: 6
            },
            {
              id: 'futuro-parcerias-empresas-criadores',
              title: 'O futuro das parcerias entre empresas e criadores',
              slug: 'futuro-parcerias-empresas-criadores',
              excerpt: 'Como a colaboração entre empresas locais e criadores de conteúdo está moldando o futuro do marketing digital.',
              featured_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
              featured_image_alt: 'Futuro das Parcerias',
              audience_target: 'AMBOS',
              published_at: '2025-01-09T00:00:00Z',
              read_time_minutes: 5
            }
          ].filter(staticPost => staticPost.slug !== slug);

          setRelatedPosts(staticPosts.slice(0, 3));
          console.log('📊 [BLOG] Usando posts estáticos como fallback');
        }

        // Tentar incrementar view count (não crítico se falhar)
        try {
          await blogService.incrementViewCount(postData.id);
        } catch (viewError) {
          console.warn('Erro ao incrementar view count:', viewError);
        }

        // Track blog view no Google Analytics
        try {
          trackBlogView(postData.title, slug);
        } catch (trackError) {
          console.warn('Erro ao fazer track GA:', trackError);
        }

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

  // Gerar breadcrumbs para o post
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.criadores.app/' },
    { name: 'Blog', url: 'https://www.criadores.app/blog' },
    { name: post.title, url: `https://www.criadores.app/blog/${slug}` },
  ];

  return (
    <>
      {/* Dados Estruturados para SEO/AEO/GEO */}
      <BlogPostSchema
        title={post.title}
        description={post.excerpt}
        image={post.featured_image_url}
        datePublished={post.published_at || post.created_at}
        dateModified={post.updated_at}
        slug={slug}
        readTime={post.read_time_minutes}
        tags={post.tags}
      />
      <BreadcrumbSchema items={breadcrumbs} />

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
                {(() => {
                  console.log('📊 [BLOG] Renderizando - relatedPosts:', relatedPosts, 'length:', relatedPosts?.length);
                  return relatedPosts && relatedPosts.length > 0;
                })() ? (
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
    </>
  );
}
