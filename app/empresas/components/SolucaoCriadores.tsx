import React from 'react';
import Link from 'next/link';
import CTAButton from './CTAButton';

export default function SolucaoCriadores() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container text-primary text-sm font-semibold mb-6">
              Solução #3
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              O Segredo dos Negócios Locais{' '}
              <span className="text-primary">Que Estão Lotando</span>
            </h2>

            <div className="prose prose-lg text-on-surface-variant mb-8">
              <p className="text-lg leading-relaxed mb-4">
                Tráfego pago traz cliques. <strong>Criadores locais trazem clientes.</strong>
              </p>
              <p className="text-lg leading-relaxed mb-4">
                A diferença está na <strong>autenticidade</strong>: pessoas reais da sua cidade
                recomendando seu negócio para seguidores que confiam nelas.
              </p>
              <div className="p-4 bg-primary-container rounded-xl">
                <p className="text-lg font-bold text-primary mb-2">
                  Por que funciona melhor?
                </p>
                <p className="text-base text-on-surface">
                  Criadores locais têm conexão real com o público da sua região.
                  Quando eles recomendam, as pessoas vão até você.
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
                  <h3 className="font-semibold text-on-surface mb-1">4 Criadores Locais/Mês</h3>
                  <p className="text-sm text-on-surface-variant">
                    Microinfluenciadores da sua cidade
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
                  <h3 className="font-semibold text-on-surface mb-1">Curadoria Completa</h3>
                  <p className="text-sm text-on-surface-variant">
                    Selecionamos os criadores ideais para seu público
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
                  <h3 className="font-semibold text-on-surface mb-1">Aprovação Total</h3>
                  <p className="text-sm text-on-surface-variant">
                    Você aprova todos os conteúdos antes da publicação
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
                  <h3 className="font-semibold text-on-surface mb-1">Suporte Completo</h3>
                  <p className="text-sm text-on-surface-variant">
                    Gerenciamos toda a negociação e logística
                  </p>
                </div>
              </div>
            </div>

            {/* Benefícios dos Criadores Locais */}
            <div className="card-elevated p-6 mb-6 bg-gradient-to-br from-primary-container/20 to-secondary-container/20">
              <h3 className="font-bold text-on-surface mb-3">Por Que Criadores Locais Funcionam Melhor?</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    <strong className="text-on-surface">Autenticidade:</strong> Pessoas reais da sua cidade recomendando
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    <strong className="text-on-surface">Confiança:</strong> Seguidores locais confiam mais em criadores da região
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    <strong className="text-on-surface">Custo-benefício:</strong> Investimento menor com impacto maior
                  </p>
                </div>
              </div>
            </div>

            {/* Preço */}
            <div className="card-elevated p-6 bg-gradient-to-br from-primary-container/30 to-secondary-container/30 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-on-surface-variant mb-1">Investimento</div>
                  <div className="text-3xl font-bold text-primary">R$ 2.300<span className="text-lg text-on-surface-variant">/mês</span></div>
                  <div className="text-sm text-secondary font-semibold">ou R$ 1.300/mês no semestral</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-on-surface-variant mb-1">Economize</div>
                  <div className="text-2xl font-bold text-secondary">R$ 6.000</div>
                  <div className="text-xs text-on-surface-variant">no semestre</div>
                </div>
              </div>
            </div>

            <CTAButton chatbot="criadores" className="w-full sm:w-auto" />
            
            <div className="mt-4">
              <Link href="/empresas/criadores" className="text-primary hover:underline text-sm">
                Ver página completa de Criadores Locais →
              </Link>
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="card-elevated overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-white rounded-xl shadow-md flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary-container rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                        <div className="text-xs text-on-surface-variant">Criador {i}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 card-elevated p-4 bg-white">
              <div className="text-3xl font-bold text-primary">+1k</div>
              <div className="text-sm text-on-surface-variant">Conteúdos<br/>Publicados</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

