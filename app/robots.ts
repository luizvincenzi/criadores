import { MetadataRoute } from 'next';

/**
 * Gera robots.txt dinâmico para controle de indexação
 * Permite indexação de páginas públicas e bloqueia rotas sensíveis
 */
export default function robots(): MetadataRoute.Robots {
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
          '/(dashboard)/',
          '/login',
          '/unauthorized',
        ],
      },
      // Regras específicas para bots de busca principais
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: [
          '/',
          '/blog/',
          '/criavoz-homepage',
          '/politica-privacidade',
          '/privacy-policy',
          '/terms-of-service',
          '/perguntas-frequentes',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/debug*',
          '/test*',
          '/(dashboard)/',
          '/login',
          '/unauthorized',
        ],
      },
    ],
    sitemap: 'https://www.criadores.app/sitemap.xml',
    host: 'https://www.criadores.app',
  };
}
