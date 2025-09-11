import React from 'react';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User, Home, ChevronRight } from 'lucide-react';
import { blogService, BlogPost } from '@/lib/supabase';
import { formatDate } from '@/lib/dateUtils';
import { Metadata } from 'next';

// Importar componentes
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
import ClientTracker from '@/components/blog/ClientTracker';

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

// Gerar metadados dinâmicos para SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await blogService.getPostBySlug(slug);

    if (!post) {
      return {
        title: 'Post não encontrado - Blog crIAdores',
        description: 'O post que você está procurando não foi encontrado.',
      };
    }

    const baseUrl = 'https://www.criadores.app';
    const postUrl = `${baseUrl}/blog/${slug}`;

    return {
      title: `${post.title} - Blog crIAdores`,
      description: post.excerpt,
      keywords: post.tags,
      authors: [{ name: 'crIAdores', url: baseUrl }],
      creator: 'crIAdores',
      publisher: 'crIAdores',
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
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: postUrl,
        siteName: 'crIAdores',
        images: [
          {
            url: post.featured_image_url || `${baseUrl}/og-image.jpg`,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: 'pt_BR',
        type: 'article',
        publishedTime: post.published_at || post.created_at,
        modifiedTime: post.updated_at || post.published_at || post.created_at,
        authors: ['crIAdores'],
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: [post.featured_image_url || `${baseUrl}/og-image.jpg`],
        creator: '@criadores.app',
        site: '@criadores.app',
      },
      alternates: {
        canonical: postUrl,
      },
    };
  } catch (error) {
    console.error('Erro ao gerar metadados:', error);
    return {
      title: 'Blog crIAdores',
      description: 'Insights, tendências e estratégias para empresas locais e criadores de conteúdo.',
    };
  }
}

// Gerar parâmetros estáticos para SSG
export async function generateStaticParams() {
  try {
    const posts = await blogService.getAllPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Erro ao gerar parâmetros estáticos:', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params
  const { slug } = await params;

  // Carregar dados no servidor
  let post: BlogPost | null = null;
  let relatedPosts: BlogPost[] = [];
  let latestPosts: BlogPost[] = [];

  try {
    // Carregar post principal
    post = await blogService.getPostBySlug(slug);

    if (!post) {
      notFound();
    }

    // Carregar posts relacionados e mais recentes em paralelo
    const [related, latest] = await Promise.all([
      blogService.getRelatedPosts(post.id, post.audience_target, 3),
      blogService.getLatestPosts(4)
    ]);

    relatedPosts = related;
    latestPosts = latest.filter(p => p.id !== post.id).slice(0, 3);

  } catch (error) {
    console.error('Erro ao carregar post:', error);
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

      {/* Client-side tracking */}
      <ClientTracker postTitle={post.title} postSlug={post.slug} />

      <div className="min-h-screen bg-gray-50">
        {/* Botões de Compartilhamento Fixos */}
        <FixedSocialShare
          title={post.title}
          excerpt={post.excerpt}
        />

        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200 pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Home className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" />
              <a href="/blog" className="hover:text-gray-700 transition-colors">Blog</a>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium truncate">{post.title}</span>
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

                  {/* Título */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    {post.title}
                  </h1>

                  {/* Excerpt */}
                  <p className="text-xl text-gray-600 leading-relaxed mb-8">
                    {post.excerpt}
                  </p>

                  {/* Autor e Compartilhamento */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">crIAdores</p>
                        <p className="text-sm text-gray-500">Especialistas em Marketing Local</p>
                      </div>
                    </div>

                    <SocialShare
                      title={post.title}
                      excerpt={post.excerpt}
                    />
                  </div>
                </header>

                {/* Imagem Featured */}
                {post.featured_image_url && (
                  <div className="px-8 mb-8">
                    <div className="relative aspect-video rounded-xl overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.featured_image_alt || post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Resumo do Post */}
                <PostSummary content={post.content} />

                {/* Conteúdo do Post */}
                <div className="px-8 pb-12">
                  <div className="prose prose-lg max-w-none">
                    <PostSection content={post.content} />
                  </div>
                </div>
              </article>
          </main>
        </div>
      </div>
    </>
  );
}
