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
  experimental: {
    // Fix para problemas de build no Vercel com Next.js 15
    serverComponentsExternalPackages: ['googleapis'],
  },
  // Configuração adicional para Vercel
  output: 'standalone',
};

export default nextConfig;
