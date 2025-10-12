'use client';

import React from 'react';
import PMEsHeader from '../components/PMEsHeader';
import PMEsFooter from '../components/PMEsFooter';
import CTAButton from '../components/CTAButton';
import ProcessSteps from '../components/ProcessSteps';
import FAQSection from '../components/FAQSection';
import SectionUrgencia from '../components/SectionUrgencia';

export default function SocialMediaAdvogadosLP() {
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
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% Compliance OAB • Marketing Ético • Captação de Clientes</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Construa Autoridade e Atraia{' '}
              <span className="text-secondary-container">Clientes Qualificados</span> Para Seu Escritório
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Social media especializada para <strong>advogados e escritórios de advocacia</strong>.
              Conteúdo jurídico, compliance total e captação de clientes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <CTAButton chatbot="advogados" size="lg" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Compliance OAB</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Conteúdo Jurídico</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Captação de Clientes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POR QUE ADVOGADOS PRECISAM DE MARKETING DIGITAL */}
      <section className="py-20 bg-surface-container">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container text-primary text-sm font-semibold mb-6">
              Cenário Atual
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Por Que Advogados Precisam de Marketing Digital?
            </h2>
            
            <p className="text-xl text-on-surface-variant leading-relaxed mb-8">
              O cliente moderno pesquisa online antes de contratar um advogado.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card-elevated p-6 text-center">
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="font-bold text-on-surface mb-2">82% Pesquisam Online</h3>
              <p className="text-sm text-on-surface-variant">
                Antes de escolher um advogado ou escritório
              </p>
            </div>

            <div className="card-elevated p-6 text-center">
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚖️</span>
              </div>
              <h3 className="font-bold text-on-surface mb-2">Autoridade Digital</h3>
              <p className="text-sm text-on-surface-variant">
                Conteúdo jurídico gera confiança e credibilidade
              </p>
            </div>

            <div className="card-elevated p-6 text-center">
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="font-bold text-on-surface mb-2">Captação Qualificada</h3>
              <p className="text-sm text-on-surface-variant">
                Clientes chegam mais informados e prontos para contratar
              </p>
            </div>
          </div>

          <div className="card-elevated p-8 bg-gradient-to-br from-primary-container/30 to-secondary-container/30 text-center">
            <h3 className="text-2xl font-bold text-on-surface mb-4">
              Mas você não tem tempo para criar conteúdo
            </h3>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Por isso criamos uma solução completa de <strong>marketing jurídico</strong> —
              ético, profissional e que gera clientes qualificados.
            </p>
          </div>
        </div>
      </section>

      {/* O QUE INCLUI */}
      <section className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container text-secondary text-sm font-semibold mb-6">
              O Que Você Recebe
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Marketing Jurídico Completo
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="card-elevated p-8">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Conteúdo Jurídico</h3>
                  <p className="text-on-surface-variant">
                    2 Reels/semana + stories diários com dicas jurídicas, análises de casos e orientações.
                    100% compliance OAB.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-elevated p-8">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Planejamento Estratégico</h3>
                  <p className="text-on-surface-variant">
                    Calendário editorial completo com temas relevantes para sua área de atuação.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-elevated p-8">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Gestão de Comunidade</h3>
                  <p className="text-on-surface-variant">
                    Respondemos comentários e DMs (sem consultoria jurídica), direcionando para contato.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-elevated p-8">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Relatórios Mensais</h3>
                  <p className="text-on-surface-variant">
                    Análise de alcance, engajamento e leads gerados pelo Instagram.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-elevated p-8">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Compliance Total</h3>
                  <p className="text-on-surface-variant">
                    Todo conteúdo segue as normas da OAB. Você aprova tudo antes de publicar.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-elevated p-8">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Captação de Clientes</h3>
                  <p className="text-on-surface-variant">
                    Estratégias para converter seguidores em clientes qualificados.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preço */}
          <div className="max-w-2xl mx-auto">
            <div className="card-elevated p-8 bg-gradient-to-br from-primary-container/30 to-secondary-container/30 text-center mb-8">
              <div className="text-sm text-on-surface-variant mb-2">Investimento</div>
              <div className="text-5xl font-bold text-primary mb-2">R$ 2.800<span className="text-2xl text-on-surface-variant">/mês</span></div>
              <div className="text-lg text-secondary font-semibold mb-4">ou R$ 1.800/mês no semestral</div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary text-white text-sm font-semibold">
                Economize R$ 6.000 no semestre
              </div>
            </div>

            <div className="text-center">
              <CTAButton chatbot="advogados" size="lg" className="mb-4" />
              <p className="text-sm text-on-surface-variant">
                Sem taxa de adesão • Sem fidelidade • Garantia de 30 dias
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESSO */}
      <section className="py-20 bg-surface-container">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Como Funciona
            </h2>
          </div>
          <ProcessSteps />
        </div>
      </section>

      {/* URGÊNCIA */}
      <SectionUrgencia variant="social-media" />

      {/* FAQ */}
      <FAQSection />

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/95 to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto Para Captar Mais Clientes?
          </h2>
          
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Fale com um especialista agora e descubra como podemos ajudar seu escritório.
          </p>

          <CTAButton chatbot="advogados" size="lg" className="mb-4" />
          
          <p className="text-sm text-white/80">
            Resposta em até 24 horas • 100% gratuito • Sem compromisso
          </p>
        </div>
      </section>

      <PMEsFooter />
    </div>
  );
}

