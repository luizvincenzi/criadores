'use client';

import React from 'react';

interface HeroSectionProps {
  hero: {
    title: string;
    subtitle: string;
    cta_text: string;
    cta_url: string;
    urgency_badge?: string;
    social_proof?: {
      compliance?: number;
      advogados_atendidos?: number;
      clientes_ativos?: number;
      anos_mercado?: number;
    };
    trust_badges?: string[];
  };
  onCTAClick?: () => void;
}

export default function HeroSection({ hero, onCTAClick }: HeroSectionProps) {
  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else if (hero.cta_url) {
      window.location.href = hero.cta_url;
    }
  };

  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary via-primary/95 to-secondary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            {/* Urgency Badge */}
            {hero.urgency_badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold mb-6">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <span>{hero.urgency_badge}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {hero.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              {hero.subtitle}
            </p>

            {/* CTA Button */}
            <button
              onClick={handleCTAClick}
              className="btn-primary bg-white text-primary hover:bg-white/90 text-lg px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {hero.cta_text}
            </button>

            {/* Trust Badges */}
            {hero.trust_badges && hero.trust_badges.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-4">
                {hero.trust_badges.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-white/80 text-sm">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Social Proof */}
            {hero.social_proof && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                {hero.social_proof.compliance !== undefined && (
                  <div className="text-white">
                    <div className="text-3xl font-bold">{hero.social_proof.compliance}%</div>
                    <div className="text-sm text-white/80">Compliance</div>
                  </div>
                )}
                {hero.social_proof.advogados_atendidos !== undefined && (
                  <div className="text-white">
                    <div className="text-3xl font-bold">+{hero.social_proof.advogados_atendidos}</div>
                    <div className="text-sm text-white/80">Advogados</div>
                  </div>
                )}
                {hero.social_proof.clientes_ativos !== undefined && (
                  <div className="text-white">
                    <div className="text-3xl font-bold">{hero.social_proof.clientes_ativos}+</div>
                    <div className="text-sm text-white/80">Clientes Ativos</div>
                  </div>
                )}
                {hero.social_proof.anos_mercado !== undefined && (
                  <div className="text-white">
                    <div className="text-3xl font-bold">{hero.social_proof.anos_mercado}+</div>
                    <div className="text-sm text-white/80">Anos de Mercado</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="card-elevated overflow-hidden bg-surface-container">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🎯</span>
                  </div>
                  <p className="text-on-surface-variant text-sm">
                    [Vídeo ou imagem do hero]
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-4 max-w-[200px]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-on-surface">5.0</div>
                  <div className="text-xs text-on-surface-variant">Avaliação</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

