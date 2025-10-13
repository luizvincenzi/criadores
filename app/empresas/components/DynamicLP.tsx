'use client';

import React, { useState } from 'react';
import PMEsHeader from './PMEsHeader';
import PMEsFooter from './PMEsFooter';
import FormularioDiagnostico from './FormularioDiagnostico';
import SectionMentor from './SectionMentor';
import SectionUrgencia from './SectionUrgencia';
import ProcessSteps from './ProcessSteps';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import type { LandingPageWithProducts } from '@/lib/services/landingPagesService';

interface DynamicLPProps {
  lp: LandingPageWithProducts;
}

export default function DynamicLP({ lp }: DynamicLPProps) {
  const [showForm, setShowForm] = useState(false);
  const { variables, products } = lp;
  const { hero, problema, solucoes, combo, processo, depoimentos, urgencia, faq, cta_final, theme, mentor } = variables;

  return (
    <div className="min-h-screen bg-surface">
      <PMEsHeader />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary via-primary/95 to-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {hero.urgency_badge && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold mb-6">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  <span>{hero.urgency_badge}</span>
                </div>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {hero.title}
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
                >
                  {hero.cta_text}
                </button>
                <a
                  href="#o-que-inclui"
                  className="btn-secondary border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4 text-center"
                >
                  Ver O Que Inclui
                </a>
              </div>

              {hero.trust_badges && hero.trust_badges.length > 0 && (
                <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
                  {hero.trust_badges.map((badge, idx) => (
                    <div key={idx} className="flex items-center">
                      <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="card-elevated overflow-hidden bg-surface-container">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">🎓</span>
                    </div>
                    <p className="text-on-surface-variant text-sm">
                      [Vídeo ou imagem do hero]
                    </p>
                  </div>
                </div>
              </div>

              {hero.social_proof && (
                <>
                  {hero.social_proof.mentorias && (
                    <div className="absolute -bottom-6 -left-6 card-elevated p-4 bg-white">
                      <div className="text-3xl font-bold text-primary">+{hero.social_proof.mentorias}</div>
                      <div className="text-sm text-on-surface-variant">Mentorias Gravadas</div>
                    </div>
                  )}

                  {hero.social_proof.empresas && (
                    <div className="absolute -top-6 -right-6 card-elevated p-4 bg-white">
                      <div className="text-3xl font-bold text-secondary">+{hero.social_proof.empresas}</div>
                      <div className="text-sm text-on-surface-variant">Empresários Mentorados</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA SECTION */}
      {problema && (
        <section className="py-20 bg-surface-container">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
                {problema.title}
              </h2>
              {problema.subtitle && (
                <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
                  {problema.subtitle}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {problema.problems.map((problem, idx) => (
                <div key={idx} className="card-elevated p-8 text-center">
                  <div className="text-5xl mb-4">{problem.icon}</div>
                  <h3 className="text-xl font-bold text-on-surface mb-3">{problem.title}</h3>
                  <p className="text-on-surface-variant">{problem.description}</p>
                </div>
              ))}
            </div>

            {problema.agitation && (
              <div className="mt-12 text-center">
                <p className="text-lg text-on-surface-variant max-w-3xl mx-auto italic">
                  {problema.agitation}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SOLUÇÕES SECTION */}
      {solucoes && solucoes.length > 0 && (
        <section id="o-que-inclui" className="py-20 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {solucoes.map((solucao, idx) => {
              // Buscar produto relacionado do banco
              const product = products?.find(p => p.id === solucao.product_id);
              
              return (
                <div key={idx} className="mb-16">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container text-primary text-sm font-semibold mb-6">
                      O Que Você Recebe
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
                      {solucao.title}
                    </h2>
                    
                    <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
                      {solucao.description}
                    </p>
                  </div>

                  {/* Grid de Benefícios */}
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {solucao.benefits.slice(0, 8).map((benefit, benefitIdx) => (
                      <div key={benefitIdx} className="card-elevated p-8">
                        <div className="flex items-start">
                          <svg className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-on-surface">{benefit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preço e CTA */}
                  <div className="card-elevated p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold text-on-surface mb-4">Investimento</h3>
                        
                        {/* Usar preço do banco se disponível, senão usar do JSONB */}
                        {product ? (
                          <div className="mb-4">
                            <div className="text-4xl font-bold text-primary mb-2">
                              R$ {product.default_price.toFixed(2).replace('.', ',')}
                              <span className="text-lg text-on-surface-variant">/mês</span>
                            </div>
                            <p className="text-sm text-on-surface-variant">
                              Produto: {product.name}
                            </p>
                          </div>
                        ) : (
                          <>
                            {solucao.price_monthly && (
                              <div className="mb-4">
                                <div className="text-sm text-on-surface-variant line-through mb-1">
                                  De R$ {solucao.price_monthly.toFixed(2).replace('.', ',')}/mês
                                </div>
                                {solucao.price_semestral && (
                                  <div className="text-4xl font-bold text-primary">
                                    R$ {solucao.price_semestral.toFixed(2).replace('.', ',')}
                                    <span className="text-lg text-on-surface-variant">/mês</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {solucao.urgency && (
                          <p className="text-sm text-error font-semibold">
                            ⚠️ {solucao.urgency}
                          </p>
                        )}
                      </div>

                      <div className="text-center md:text-right">
                        <button
                          onClick={() => setShowForm(true)}
                          className="btn-primary text-lg px-8 py-4 w-full md:w-auto"
                        >
                          {solucao.cta_text}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PROCESSO */}
      {processo && <ProcessSteps steps={processo.steps} title={processo.title} />}

      {/* MENTOR */}
      {mentor?.show && <SectionMentor mentor={mentor} />}

      {/* DEPOIMENTOS */}
      {depoimentos && depoimentos.length > 0 && <TestimonialsSection testimonials={depoimentos} />}

      {/* URGÊNCIA */}
      {urgencia && <SectionUrgencia urgencia={urgencia} />}

      {/* FAQ */}
      {faq && faq.length > 0 && <FAQSection faqs={faq} />}

      {/* CTA FINAL */}
      {cta_final && (
        <section className="py-20 bg-gradient-to-br from-primary to-secondary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {cta_final.title}
            </h2>
            {cta_final.subtitle && (
              <p className="text-xl text-white/90 mb-8">
                {cta_final.subtitle}
              </p>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
            >
              {cta_final.cta_text}
            </button>
          </div>
        </section>
      )}

      <PMEsFooter />

      {showForm && <FormularioDiagnostico onClose={() => setShowForm(false)} />}
    </div>
  );
}

