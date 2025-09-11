import { MetadataRoute } from 'next';

/**
 * Gera robots.txt dinâmico para otimização de indexação
 * Permite indexação geral, bloqueia APIs e admin, aponta para sitemap
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.criadores.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/debug*',
          '/test*',
          '*.json',
          '/private/',
        ],
      },
      // Permitir especificamente para bots de busca principais
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: [
          '/',
          '/blog/',
          '/criavoz-homepage',
          '/politica-privacidade',
          '/privacy-policy',
          '/terms-of-service',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/debug*',
          '/test*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
