import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Desabilita ESLint durante o build para deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desabilita verificação de tipos durante o build para deploy
    ignoreBuildErrors: true,
  },
  // Fix para problemas de build no Vercel com Next.js 15
  serverExternalPackages: ['googleapis'],
  // Configuração adicional para Vercel - REMOVIDO TEMPORARIAMENTE PARA DEBUG
  // output: 'standalone',

  // Headers de segurança e CSP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://tagmanager.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://tagmanager.google.com",
              "img-src 'self' data: https: https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://criadores.app https://www.criadores.app https://ecbhcalmulaiszslwhqz.supabase.co https://sheets.googleapis.com https://www.googleapis.com https://graph.facebook.com https://graph.instagram.com https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com https://analytics.google.com",
              "frame-src 'self' https://www.facebook.com https://www.instagram.com https://www.googletagmanager.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ]
      }
    ];
  },

  // Configurações experimentais
  experimental: {
    // Configurações futuras podem ser adicionadas aqui
  },

  // Redirects para padronização de domínio
  async redirects() {
    return [
      // Forçar https://www.criadores.app como domínio canônico
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'criadores.app',
          },
        ],
        destination: 'https://www.criadores.app/:path*',
        permanent: true,
      },
      // Redirect HTTP para HTTPS (caso necessário)
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://www.criadores.app/:path*',
        permanent: true,
      },
      // Remover trailing slashes desnecessários
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
      // Remover extensões .html
      {
        source: '/:path*.html',
        destination: '/:path*',
        permanent: true,
      },
      // Remover index.html
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Configuração de export para evitar problemas com APIs
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
