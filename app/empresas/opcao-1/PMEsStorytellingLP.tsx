'use client';

import React from 'react';
import Link from 'next/link';
import PMEsHeader from '../components/PMEsHeader';
import PMEsFooter from '../components/PMEsFooter';
import TestimonialsSection from '../components/TestimonialsSection';
import FAQSection from '../components/FAQSection';

export default function PMEsStorytellingLP() {
  return (
    <div className="min-h-screen bg-surface">
      <PMEsHeader />

      {/* Hero Section - Storytelling Emocional */}
      <section className="pt-24 md:pt-32 pb-20 bg-gradient-to-br from-primary-container/40 via-surface to-secondary-container/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Story */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container text-secondary text-sm font-semibold mb-6">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Mais de 500 PMEs já transformaram seus resultados
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface mb-6 leading-tight">
                A nova forma das PMEs <span className="text-primary">crescerem</span> com marketing de criadores
              </h1>

              <p className="text-xl text-on-surface-variant mb-8 leading-relaxed">
                Você não precisa de uma agência cara ou de uma equipe de marketing. 
                <strong className="text-on-surface"> Encontre, gerencie e escale campanhas com influenciadores que vendem de verdade</strong> — tudo em um só lugar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/login" className="btn-primary text-center text-lg px-8 py-4">
                  Criar Conta Gratuita
                </Link>
                <a href="#como-funciona" className="btn-outlined text-center text-lg px-8 py-4">
                  Ver Como Funciona
                </a>
              </div>

              <div className="flex items-center space-x-6 text-sm text-on-surface-variant">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Sem cartão de crédito
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cancele quando quiser
                </div>
              </div>
            </div>

            {/* Right - Visual Proof */}
            <div className="relative">
              <div className="card-elevated p-8 bg-surface">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-on-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-on-surface-variant text-sm">
                      Vídeo de demonstração da plataforma
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">2.5k+</div>
                    <div className="text-xs text-on-surface-variant">Criadores</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">15k+</div>
                    <div className="text-xs text-on-surface-variant">Campanhas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">4.8★</div>
                    <div className="text-xs text-on-surface-variant">Avaliação</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling - O Problema */}
      <section className="py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Você já tentou trabalhar com influenciadores e...
            </h2>
            <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
              Sabemos que não é fácil. Conversamos com centenas de donos de PMEs e ouvimos as mesmas frustrações:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-3">
                "Não sei onde encontrar criadores confiáveis"
              </h3>
              <p className="text-on-surface-variant">
                Você perde horas no Instagram procurando, sem saber se o engajamento é real ou se a pessoa é profissional.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-3">
                "Não tenho tempo para gerenciar tudo isso"
              </h3>
              <p className="text-on-surface-variant">
                Entre negociar, criar briefing, acompanhar entregas e medir resultados, você já tem um negócio para tocar.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-3">
                "Como sei se está dando resultado?"
              </h3>
              <p className="text-on-surface-variant">
                Curtidas e comentários são legais, mas você precisa de vendas. E não sabe como medir o retorno real.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-2xl font-semibold text-on-surface mb-4">
              E se existisse uma forma <span className="text-primary">mais simples</span>?
            </p>
          </div>
        </div>
      </section>

      {/* A Solução - Transformação */}
      <section id="solucao" className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Apresentamos a <span className="text-primary">crIAdores</span>
            </h2>
            <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
              A plataforma que nasceu para resolver exatamente esses problemas. 
              Criada por quem entende de PME, para quem vive a realidade de PME.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-elevated p-8 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-4">
                Encontre Criadores Certos
              </h3>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                Nossa IA analisa milhares de criadores e te mostra apenas os que fazem sentido para seu negócio. 
                Todos verificados, com público real e histórico comprovado.
              </p>
              <div className="inline-flex items-center text-primary font-semibold text-sm">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Economia de 15h/semana
              </div>
            </div>

            <div className="card-elevated p-8 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-4">
                Gerencie Tudo em Um Painel
              </h3>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                Crie campanhas, aprove conteúdos, gerencie pagamentos e acompanhe entregas. 
                Tudo centralizado, simples e sem complicação.
              </p>
              <div className="inline-flex items-center text-primary font-semibold text-sm">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Redução de 70% em custos
              </div>
            </div>

            <div className="card-elevated p-8 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-4">
                Veja Resultados em Tempo Real
              </h3>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                Dashboards claros mostram alcance, engajamento e, mais importante, 
                o impacto real nas suas vendas e no crescimento do negócio.
              </p>
              <div className="inline-flex items-center text-primary font-semibold text-sm">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ROI médio de 380%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Como Funciona - Processo Simples */}
      <section id="como-funciona" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Como Funciona? Simples Assim:
            </h2>
            <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
              Em 4 passos você já está rodando sua primeira campanha
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Conte Seu Objetivo",
                description: "Nossa IA conversacional te faz perguntas simples para entender seu negócio e criar a campanha perfeita.",
                icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              },
              {
                step: "2",
                title: "Escolha Criadores",
                description: "Veja uma lista personalizada de criadores ideais para você. Compare perfis, engajamento e histórico.",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              },
              {
                step: "3",
                title: "Aprove Conteúdos",
                description: "Os criadores enviam o material antes de publicar. Você aprova ou pede ajustes direto na plataforma.",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              },
              {
                step: "4",
                title: "Acompanhe Resultados",
                description: "Veja em tempo real o desempenho da campanha e o impacto no seu negócio. Simples e transparente.",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-on-primary font-bold text-2xl">{item.step}</span>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-primary/20" style={{ transform: 'translateX(50%)' }} />
                  )}
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">{item.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/login" className="btn-primary text-lg px-10 py-4 inline-block">
              Começar Minha Primeira Campanha
            </Link>
            <p className="mt-4 text-sm text-on-surface-variant">
              Leva menos de 5 minutos para configurar
            </p>
          </div>
        </div>
      </section>

      {/* Benefícios Tangíveis */}
      <section id="beneficios" className="py-20 bg-gradient-to-br from-secondary-container/20 to-primary-container/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Por Que PMEs Escolhem a crIAdores?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Reduza Custos com Agências",
                description: "Economize até 70% comparado a contratar uma agência. Você tem controle total e paga apenas pelo que usar.",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              },
              {
                title: "Tenha Mais Previsibilidade",
                description: "Saiba exatamente quanto vai investir e qual o retorno esperado. Sem surpresas, sem custos escondidos.",
                icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              },
              {
                title: "Acompanhe Resultados em Tempo Real",
                description: "Dashboards intuitivos mostram o que está funcionando. Tome decisões baseadas em dados, não em achismos.",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              },
              {
                title: "Escale Sua Marca com Segurança",
                description: "Comece pequeno e vá crescendo conforme os resultados aparecem. Sem riscos, sem compromissos longos.",
                icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              }
            ].map((benefit, index) => (
              <div key={index} className="card-elevated p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={benefit.icon} />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-on-surface mb-3">{benefit.title}</h3>
                    <p className="text-on-surface-variant leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA - Urgência */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-on-primary mb-6">
            Garanta Sua Conta Gratuita Agora
          </h2>
          <p className="text-xl text-on-primary/90 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 500 PMEs que já estão crescendo com marketing de criadores. 
            Sem cartão de crédito. Sem compromisso.
          </p>
          
          <Link 
            href="/login" 
            className="inline-block bg-surface text-primary px-10 py-4 rounded-full font-semibold text-lg hover:bg-surface/90 transition-all duration-200 hover:scale-105 shadow-xl"
          >
            Criar Conta Gratuita Agora
          </Link>

          <div className="mt-8 flex items-center justify-center space-x-8 text-on-primary/80 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Configuração em 5 minutos
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Suporte dedicado
            </div>
          </div>
        </div>
      </section>

      <PMEsFooter />
    </div>
  );
}

