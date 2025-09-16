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
import { trackBlogView } from '@/lib/gtag';
import BlogViewTracker from '@/components/blog/BlogViewTracker';
// import ClientTracker from '@/components/blog/ClientTracker';

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

// Gerar parâmetros estáticos para SSG com ISR
export async function generateStaticParams() {
  try {
    const posts = await blogService.getAllPosts();
    console.log(`📝 [SSG] Gerando ${posts.length} páginas estáticas do blog`);
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('❌ [SSG] Erro ao gerar parâmetros estáticos:', error);
    // Retornar array vazio para permitir ISR dinâmico
    return [];
  }
}

// Configurar ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidar a cada 1 hora
export const dynamicParams = true; // Permitir geração dinâmica de páginas não pré-renderizadas

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params
  const { slug } = await params;

  console.log(`📖 [BLOG] Carregando post: ${slug}`);

  // Carregar dados no servidor
  let post: BlogPost | null = null;
  let relatedPosts: BlogPost[] = [];
  let latestPosts: BlogPost[] = [];

  try {
    // Carregar post principal
    post = await blogService.getPostBySlug(slug);

    if (!post) {
      console.warn(`⚠️ [BLOG] Post não encontrado: ${slug}`);
      notFound();
    }

    console.log(`✅ [BLOG] Post carregado: ${post.title}`);

    // Carregar posts relacionados e mais recentes em paralelo
    const [related, allPosts] = await Promise.all([
      blogService.getRelatedPosts(post.id, post.audience_target, 3),
      blogService.getAllPosts()
    ]);

    relatedPosts = related;
    latestPosts = allPosts.filter(p => p.id !== post.id).slice(0, 3);

  } catch (error) {
    console.error(`❌ [BLOG] Erro ao carregar post ${slug}:`, error);
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
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'view_blog_post', {
                event_category: 'Blog',
                event_label: '${post.title} (${slug})',
                page_title: '${post.title}',
                page_location: window.location.href
              });
            }
          `
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Tracking de visualização */}
        <BlogViewTracker
          postSlug={post.slug}
          postTitle={post.title}
          postId={post.id}
        />

        {/* Botões de Compartilhamento Fixos */}
        <FixedSocialShare
          title={post.title}
          excerpt={post.excerpt}
          postSlug={post.slug}
          postId={post.id}
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

                  {/* Título em destaque */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-8">
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
                    postSlug={post.slug}
                    postId={post.id}
                  />
                </header>

                {/* Conteúdo do Artigo */}
                <div className="px-8 py-8">
                  {/* Sumário Dinâmico */}
                  <PostSummary
                    content={post.content}
                    audience_target={post.audience_target}
                    tags={post.tags}
                    excerpt={post.excerpt}
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
    </>
  );

}
