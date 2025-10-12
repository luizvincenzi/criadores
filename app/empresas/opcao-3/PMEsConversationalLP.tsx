'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PMEsHeader from '../components/PMEsHeader';
import PMEsFooter from '../components/PMEsFooter';
import TestimonialsSection from '../components/TestimonialsSection';
import FAQSection from '../components/FAQSection';

export default function PMEsConversationalLP() {
  const [activeTab, setActiveTab] = useState<'encontrar' | 'gerenciar' | 'medir'>('encontrar');

  return (
    <div className="min-h-screen bg-surface">
      <PMEsHeader />

      {/* Hero Section - Conversacional com Vídeo */}
      <section className="pt-24 md:pt-32 pb-20 bg-gradient-to-br from-primary-container/30 via-surface to-secondary-container/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface mb-6 leading-tight">
              Quer fazer seu negócio <span className="text-primary">crescer</span> com criadores locais?
            </h1>
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-4xl mx-auto leading-relaxed mb-8">
              Nós facilitamos tudo. <strong className="text-on-surface">Encontre criadores, gerencie campanhas e veja resultados</strong> — sem complicação, sem agência cara.
            </p>
          </div>

          {/* Video Hero */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="card-elevated overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative group cursor-pointer">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-on-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10 text-primary ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <p className="text-on-primary font-semibold text-lg">
                    Veja como funciona em 90 segundos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="text-center">
            <Link 
              href="/login" 
              className="btn-primary text-lg px-10 py-4 inline-block mb-4"
            >
              Começar Agora Grátis
            </Link>
            <p className="text-sm text-on-surface-variant">
              Sem cartão de crédito • Configuração em 5 minutos
            </p>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-on-surface-variant">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>500+ empresas ativas</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>2.500+ criadores verificados</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Avaliação 4.8/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Interativa - Tabs */}
      <section id="como-funciona" className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Como a crIAdores Funciona?
            </h2>
            <p className="text-lg text-on-surface-variant">
              Escolha o que você quer saber:
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab('encontrar')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                activeTab === 'encontrar'
                  ? 'bg-primary text-on-primary shadow-lg'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              🔍 Como Encontrar Criadores
            </button>
            <button
              onClick={() => setActiveTab('gerenciar')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                activeTab === 'gerenciar'
                  ? 'bg-primary text-on-primary shadow-lg'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              ⚙️ Como Gerenciar Campanhas
            </button>
            <button
              onClick={() => setActiveTab('medir')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                activeTab === 'medir'
                  ? 'bg-primary text-on-primary shadow-lg'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              📊 Como Medir Resultados
            </button>
          </div>

          {/* Tab Content */}
          <div className="card-elevated p-8 md:p-12">
            {activeTab === 'encontrar' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-on-surface mb-4">
                    Nossa IA Encontra os Criadores Perfeitos para Você
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface mb-1">Conte sobre seu negócio</h4>
                        <p className="text-on-surface-variant">Nossa IA faz perguntas simples para entender seu objetivo</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface mb-1">Receba sugestões personalizadas</h4>
                        <p className="text-on-surface-variant">Veja criadores que fazem sentido para seu público e região</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface mb-1">Compare e escolha</h4>
                        <p className="text-on-surface-variant">Veja perfis, engajamento, avaliações e histórico de cada um</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-secondary-container rounded-xl">
                    <p className="text-secondary font-semibold">
                      ✨ Todos os criadores são verificados e têm público real
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container rounded-2xl p-6 h-80 flex items-center justify-center">
                  <p className="text-on-surface-variant text-center">
                    [Ilustração: Interface de busca de criadores]
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'gerenciar' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-on-surface mb-4">
                    Tudo em Um Só Lugar, Simples e Organizado
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface mb-1">Crie sua campanha</h4>
                        <p className="text-on-surface-variant">Defina objetivos, orçamento e prazos em minutos</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface mb-1">Aprove conteúdos</h4>
                        <p className="text-on-surface-variant">Criadores enviam antes de publicar. Você aprova ou pede ajustes</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface mb-1">Pagamento seguro</h4>
                        <p className="text-on-surface-variant">Nós gerenciamos tudo. Você só paga após aprovação</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-secondary-container rounded-xl">
                    <p className="text-secondary font-semibold">
                      ⏱️ Economize até 15 horas por semana
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container rounded-2xl p-6 h-80 flex items-center justify-center">
                  <p className="text-on-surface-variant text-center">
                    [Ilustração: Dashboard de gestão]
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'medir' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-on-surface mb-4">
                    Veja o Impacto Real no Seu Negócio
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">📈</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface mb-1">Alcance e engajamento</h4>
                        <p className="text-on-surface-variant">Quantas pessoas viram e interagiram com seu conteúdo</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">💰</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface mb-1">Conversões e vendas</h4>
                        <p className="text-on-surface-variant">Rastreie vendas diretas atribuídas à campanha</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">📊</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface mb-1">ROI em tempo real</h4>
                        <p className="text-on-surface-variant">Saiba exatamente quanto você ganhou vs quanto investiu</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-secondary-container rounded-xl">
                    <p className="text-secondary font-semibold">
                      🎯 ROI médio de 380% nas nossas campanhas
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container rounded-2xl p-6 h-80 flex items-center justify-center">
                  <p className="text-on-surface-variant text-center">
                    [Ilustração: Dashboard de métricas]
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefícios Rápidos */}
      <section id="beneficios" className="py-20 bg-gradient-to-br from-primary-container/20 to-secondary-container/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Por Que Empresas Como a Sua Escolhem a crIAdores?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: "💰",
                title: "Economize 70%",
                description: "Muito mais barato que agências tradicionais"
              },
              {
                emoji: "⚡",
                title: "Resultados em 48h",
                description: "Veja impacto desde o primeiro post"
              },
              {
                emoji: "🎯",
                title: "Criadores Verificados",
                description: "Todos com público real e engajamento autêntico"
              },
              {
                emoji: "📱",
                title: "Gestão Simples",
                description: "Tudo em um painel intuitivo e fácil"
              },
              {
                emoji: "🔒",
                title: "Pagamento Seguro",
                description: "Você só paga após aprovar o conteúdo"
              },
              {
                emoji: "📊",
                title: "Dados em Tempo Real",
                description: "Acompanhe resultados 24/7"
              },
              {
                emoji: "🚀",
                title: "Sem Contrato",
                description: "Cancele quando quiser, sem burocracia"
              },
              {
                emoji: "💬",
                title: "Suporte Dedicado",
                description: "Time pronto para ajudar você"
              }
            ].map((benefit, index) => (
              <div key={index} className="card-elevated p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-3">{benefit.emoji}</div>
                <h3 className="font-bold text-on-surface mb-2">{benefit.title}</h3>
                <p className="text-sm text-on-surface-variant">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ Interativo */}
      <FAQSection />

      {/* CTA Progressivo */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-elevated p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Pronto para Começar?
            </h2>
            <p className="text-xl text-on-surface-variant mb-8 max-w-2xl mx-auto">
              Crie sua conta grátis e veja como é fácil trabalhar com criadores locais
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center text-on-surface-variant">
                <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Configuração em 5 minutos</span>
              </div>
              <div className="flex items-center justify-center text-on-surface-variant">
                <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Sem cartão de crédito necessário</span>
              </div>
              <div className="flex items-center justify-center text-on-surface-variant">
                <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cancele quando quiser</span>
              </div>
            </div>

            <Link href="/login" className="btn-primary text-lg px-10 py-4 inline-block">
              Criar Minha Conta Grátis
            </Link>

            <p className="mt-6 text-sm text-on-surface-variant">
              Ainda tem dúvidas?{' '}
              <a href="https://wa.me/554391936400" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                Fale com um especialista
              </a>
            </p>
          </div>
        </div>
      </section>

      <PMEsFooter />
    </div>
  );
}

