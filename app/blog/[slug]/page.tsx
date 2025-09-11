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

// Temporariamente removido SSG para debug - usar página dinâmica
// export async function generateStaticParams() {
//   try {
//     const posts = await blogService.getAllPosts();
//     console.log(`📝 [SSG] Gerando ${posts.length} páginas estáticas do blog`);
//     return posts.map((post) => ({
//       slug: post.slug,
//     }));
//   } catch (error) {
//     console.error('❌ [SSG] Erro ao gerar parâmetros estáticos:', error);
//     return [];
//   }
// }

// Configurar como página dinâmica para debug
export const dynamic = 'force-dynamic'; // Força renderização dinâmica
// export const revalidate = 3600; // Revalidar a cada 1 hora
// export const dynamicParams = true; // Permitir geração dinâmica de páginas não pré-renderizadas

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params
  const { slug } = await params;

  console.log(`📖 [BLOG] Carregando post: ${slug}`);

  // Carregar dados no servidor
  let post: BlogPost | null = null;

  try {
    // Carregar post principal
    post = await blogService.getPostBySlug(slug);

    if (!post) {
      console.warn(`⚠️ [BLOG] Post não encontrado: ${slug}`);
      notFound();
    }

    console.log(`✅ [BLOG] Post carregado: ${post.title}`);

  } catch (error) {
    console.error(`❌ [BLOG] Erro ao carregar post ${slug}:`, error);
    notFound();
  }

  // VERSÃO SIMPLIFICADA PARA DEBUG
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ✅ PÁGINA FUNCIONANDO!
          </h1>
          <div className="bg-gray-100 p-6 rounded-lg text-left max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Dados do Post:</h2>
            <p><strong>Slug:</strong> {slug}</p>
            <p><strong>Título:</strong> {post.title}</p>
            <p><strong>Status:</strong> {post.status}</p>
            <p><strong>Excerpt:</strong> {post.excerpt}</p>
            <p><strong>Audience:</strong> {post.audience_target}</p>
          </div>
        </div>
      </div>
    </div>
  );

}
