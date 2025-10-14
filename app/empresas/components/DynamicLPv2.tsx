'use client';

import React, { useState } from 'react';
import PMEsHeader from './PMEsHeader';
import PMEsFooter from './PMEsFooter';
import FormularioDiagnostico from './FormularioDiagnostico';
import HeroSection from './lp-sections/HeroSection';
import ProblemaSection from './lp-sections/ProblemaSection';
import ProcessSteps from './ProcessSteps';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import SectionMentor from './SectionMentor';
import SectionUrgencia from './SectionUrgencia';
import type { LandingPageWithProducts } from '@/lib/services/landingPagesService';

interface DynamicLPv2Props {
  lp: LandingPageWithProducts;
}

export default function DynamicLPv2({ lp }: DynamicLPv2Props) {
  const [showForm, setShowForm] = useState(false);
  const { variables, products } = lp;

  // Destructure variables com fallbacks
  const {
    hero,
    problema,
    solucoes,
    combo,
    processo,
    depoimentos,
    urgencia,
    faq,
    cta_final,
    theme,
    mentor
  } = variables || {};

  console.log('🎨 DynamicLPv2 - Renderizando LP:', {
    slug: lp.slug,
    version: lp.version_number,
    hero_title: hero?.title?.substring(0, 50),
    has_problema: !!problema,
    has_solucoes: !!solucoes,
    has_processo: !!processo,
    has_depoimentos: !!depoimentos,
    has_faq: !!faq,
  });

  return (
    <div className="min-h-screen bg-surface">
      <PMEsHeader />

      {/* HERO SECTION */}
      {hero && (
        <HeroSection 
          hero={hero} 
          onCTAClick={() => setShowForm(true)} 
        />
      )}

      {/* PROBLEMA SECTION */}
      {problema && <ProblemaSection problema={problema} />}

      {/* SOLUÇÕES SECTION */}
      {solucoes && solucoes.length > 0 && (
        <section id="o-que-inclui" className="py-20 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {solucoes.map((solucao: any, idx: number) => {
              // Buscar produto relacionado do banco
              const product = products?.find((p: any) => p.id === solucao.product_id);
              
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

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {solucao.features?.map((feature: any, featureIdx: number) => (
                      <div key={featureIdx} className="card-elevated p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center">
                            <span className="text-2xl">{feature.icon}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-on-surface mb-2">{feature.title}</h3>
                            <p className="text-sm text-on-surface-variant">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Card */}
                  {product && (
                    <div className="mt-12 max-w-md mx-auto">
                      <div className="card-elevated p-8 text-center bg-gradient-to-br from-primary-container/20 to-secondary-container/20">
                        <div className="text-sm text-on-surface-variant mb-2">Investimento</div>
                        <div className="text-4xl font-bold text-primary mb-4">
                          R$ {product.default_price?.toLocaleString('pt-BR')}
                          <span className="text-lg text-on-surface-variant">/mês</span>
                        </div>
                        <button
                          onClick={() => setShowForm(true)}
                          className="btn-primary w-full"
                        >
                          Quero Começar Agora
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* COMBO SECTION */}
      {combo && (
        <section className="py-20 bg-gradient-to-br from-primary-container/10 to-secondary-container/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container text-secondary text-sm font-bold mb-6">
                {combo.badge || '🎁 Oferta Especial'}
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-on-surface mb-4">
                {combo.title}
              </h2>
              
              <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
                {combo.description}
              </p>
            </div>

            {/* Combo Benefits */}
            {combo.benefits && (
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {combo.benefits.map((benefit: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-on-surface">{benefit}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Combo Pricing */}
            {combo.pricing && (
              <div className="max-w-2xl mx-auto card-elevated p-8 bg-gradient-to-br from-secondary-container/20 to-primary-container/20">
                <div className="text-center">
                  {combo.pricing.original_price && (
                    <div className="text-lg text-on-surface-variant line-through mb-2">
                      De R$ {combo.pricing.original_price.toLocaleString('pt-BR')}
                    </div>
                  )}
                  <div className="text-5xl font-bold text-secondary mb-4">
                    R$ {combo.pricing.combo_price.toLocaleString('pt-BR')}
                    <span className="text-xl text-on-surface-variant">/mês</span>
                  </div>
                  {combo.pricing.economy && (
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container text-secondary text-sm font-bold mb-6">
                      💰 Economia de R$ {combo.pricing.economy.toLocaleString('pt-BR')}/mês
                    </div>
                  )}
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary bg-secondary hover:bg-secondary/90 w-full text-lg py-4"
                  >
                    {combo.cta_text || 'Quero o Combo Completo'}
                  </button>
                </div>
              </div>
            )}
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

