import { MetadataRoute } from 'next';
import { blogService } from '@/lib/supabase';

/**
 * Gera sitemap.xml dinâmico agregando todas as páginas do site
 * Inclui páginas estáticas e posts do blog do Supabase
 * Atualizado automaticamente a cada deploy
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.criadores.app';
  const currentDate = new Date();
  
  // Páginas estáticas principais
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sou-criador`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/criavoz-homepage`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/perguntas-frequentes`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/politica-privacidade`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    // Buscar todos os posts publicados do blog
    console.log('🗺️ [SITEMAP] Buscando posts do blog para sitemap...');
    const posts = await blogService.getAllPosts();
    
    // Converter posts para formato do sitemap
    const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => {
      // Usar updated_at se disponível, senão published_at, senão data atual
      const lastModified = post.updated_at 
        ? new Date(post.updated_at)
        : post.published_at 
        ? new Date(post.published_at)
        : currentDate;

      return {
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: post.is_featured ? 0.8 : 0.6,
      };
    });

    console.log(`✅ [SITEMAP] Sitemap gerado com ${staticRoutes.length} páginas estáticas e ${blogRoutes.length} posts do blog`);
    
    return [...staticRoutes, ...blogRoutes];
    
  } catch (error) {
    console.error('❌ [SITEMAP] Erro ao gerar sitemap:', error);
    
    // Em caso de erro, retornar apenas páginas estáticas
    console.log('⚠️ [SITEMAP] Retornando apenas páginas estáticas devido ao erro');
    return staticRoutes;
  }
}
