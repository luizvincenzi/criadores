import React from 'react';
import Link from 'next/link';
import CTAButton from './CTAButton';

export default function SolucaoSocialMedia() {
  return (
    <section className="py-20 bg-surface-container">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="card-elevated overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📱</span>
                  </div>
                  <p className="text-on-surface-variant text-sm">
                    [Mockup: Feed Instagram profissional]
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -left-6 card-elevated p-4 bg-white">
              <div className="text-3xl font-bold text-secondary">2x</div>
              <div className="text-sm text-on-surface-variant">Reels/Semana</div>
            </div>

            <div className="absolute -bottom-6 -right-6 card-elevated p-4 bg-white">
              <div className="text-3xl font-bold text-primary">7x</div>
              <div className="text-sm text-on-surface-variant">Stories/Semana</div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container text-secondary text-sm font-semibold mb-6">
              Solução #2
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Presença Digital Profissional{' '}
              <span className="text-secondary">Sem Contratar Uma Equipe Inteira</span>
            </h2>

            <div className="prose prose-lg text-on-surface-variant mb-8">
              <p className="text-lg leading-relaxed mb-4">
                Para ter presença digital profissional, você precisaria contratar:
              </p>
              <ul className="text-base space-y-2 mb-4">
                <li>✓ Social Media profissional</li>
                <li>✓ Designer gráfico</li>
                <li>✓ Estrategista de marketing</li>
                <li className="font-bold text-on-surface mt-2">= Equipe completa com custo elevado</li>
              </ul>
              <div className="p-4 bg-secondary-container rounded-xl">
                <p className="text-lg font-bold text-secondary mb-2">
                  Com a crIAdores você tem tudo isso em um único serviço
                </p>
                <p className="text-sm text-on-surface">
                  Estrategista dedicado + Conteúdo constante + Reuniões semanais + Relatórios mensais
                </p>
              </div>
            </div>

            {/* Benefícios */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Profissional Dedicado</h3>
                  <p className="text-sm text-on-surface-variant">
                    Estrategista exclusivo para sua empresa
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Conteúdo Constante</h3>
                  <p className="text-sm text-on-surface-variant">
                    2 Reels/semana + stories diários
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Planejamento Estratégico</h3>
                  <p className="text-sm text-on-surface-variant">
                    Calendário editorial mensal completo
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Reuniões Semanais</h3>
                  <p className="text-sm text-on-surface-variant">
                    Alinhamento e análise de resultados
                  </p>
                </div>
              </div>
            </div>

            {/* Preço */}
            <div className="card-elevated p-6 bg-gradient-to-br from-secondary-container/30 to-primary-container/30 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-on-surface-variant mb-1">Investimento</div>
                  <div className="text-3xl font-bold text-secondary">R$ 2.800<span className="text-lg text-on-surface-variant">/mês</span></div>
                  <div className="text-sm text-primary font-semibold">ou R$ 1.800/mês no semestral</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-on-surface-variant mb-1">Economize</div>
                  <div className="text-2xl font-bold text-primary">R$ 6.000</div>
                  <div className="text-xs text-on-surface-variant">no semestre</div>
                </div>
              </div>
            </div>

            <CTAButton chatbot="social-media" className="w-full sm:w-auto" />
            
            <div className="mt-4">
              <Link href="/empresas/social-media" className="text-secondary hover:underline text-sm">
                Ver página completa de Social Media →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

