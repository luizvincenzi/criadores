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

        // Buscar posts relacionados e últimos posts em paralelo
        const [related, latest] = await Promise.all([
          blogService.getRelatedPosts(postData.id, postData.audience_target, 3),
          blogService.getAllPosts()
        ]);

        setRelatedPosts(related);
        setLatestPosts(latest.slice(0, 6)); // Últimos 6 posts

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
      <div className="pt-20">
        {/* Breadcrumb Melhorado */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

        {/* Layout Principal com Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Conteúdo Principal */}
            <main className="lg:col-span-8">
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

                  {/* CTA único ao final */}
                  {post.cta_text && post.cta_link ? (
                    <PostCTA
                      variant="custom"
                      customText={post.cta_text}
                      customLink={post.cta_link}
                      audience_target={post.audience_target}
                    />
                  ) : (
                    <PostCTA
                      variant="consultation"
                      audience_target={post.audience_target}
                    />
                  )}

                  {/* Newsletter Signup */}
                  <NewsletterSignup
                    variant="default"
                    audience_target={post.audience_target}
                  />
                </div>
              </article>
            </main>

            {/* Sidebar Desktop */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24">
                <PostSidebar
                  relatedPosts={relatedPosts}
                  latestPosts={latestPosts}
                  currentPost={post}
                />
              </div>
            </aside>
          </div>

          {/* Seção Mobile para Posts Relacionados */}
          <div className="lg:hidden mt-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Posts Relacionados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.slice(0, 4).map((relatedPost) => (
                  <a
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <div className="bg-gray-50 rounded-lg p-4 group-hover:bg-gray-100 transition-colors">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getCategoryColor(relatedPost.audience_target)}`}>
                        {getCategoryName(relatedPost.audience_target)}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span>{formatDate(relatedPost.published_at || '', 'short')}</span>
                        <span className="mx-1">•</span>
                        <span>{relatedPost.read_time_minutes} min</span>
                      </div>
                    </div>
                  </a>
                ))}
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
