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
};

export default nextConfig;
