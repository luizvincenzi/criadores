'use client';

import React from 'react';
import Link from 'next/link';
import PMEsHeader from '../components/PMEsHeader';
import PMEsFooter from '../components/PMEsFooter';
import TestimonialsSection from '../components/TestimonialsSection';
import FAQSection from '../components/FAQSection';

export default function PMEsDataDrivenLP() {
  return (
    <div className="min-h-screen bg-surface">
      <PMEsHeader />

      {/* Hero Section - Data-Driven */}
      <section className="pt-24 md:pt-32 pb-20 bg-gradient-to-br from-primary/10 via-surface to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Value Proposition */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container text-secondary text-sm font-bold mb-6">
                ROI MÉDIO DE 380% COMPROVADO
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface mb-6 leading-tight">
                Reduza custos em <span className="text-primary">70%</span> e aumente vendas com criadores locais
              </h1>

              <p className="text-xl text-on-surface-variant mb-8 leading-relaxed">
                Plataforma completa de gestão de campanhas com influenciadores. 
                <strong className="text-on-surface"> 2.500+ criadores verificados, 15.000+ campanhas realizadas, resultados mensuráveis.</strong>
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-surface-container rounded-2xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">70%</div>
                  <div className="text-xs text-on-surface-variant">Redução de Custos</div>
                </div>
                <div className="text-center border-x border-outline-variant">
                  <div className="text-3xl font-bold text-primary mb-1">380%</div>
                  <div className="text-xs text-on-surface-variant">ROI Médio</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">48h</div>
                  <div className="text-xs text-on-surface-variant">Primeiros Resultados</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="btn-primary text-center text-lg px-8 py-4">
                  Começar Teste Gratuito
                </Link>
                <a href="#roi-calculator" className="btn-outlined text-center text-lg px-8 py-4">
                  Calcular Meu ROI
                </a>
              </div>
            </div>

            {/* Right - Metrics Dashboard Preview */}
            <div className="card-elevated p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-on-surface mb-2">Dashboard em Tempo Real</h3>
                <p className="text-sm text-on-surface-variant">Métricas que importam para seu negócio</p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-surface-container rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-on-surface-variant">Alcance Total</span>
                    <span className="text-sm font-semibold text-secondary">+127%</span>
                  </div>
                  <div className="text-2xl font-bold text-on-surface">245.8K</div>
                  <div className="mt-2 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary" style={{ width: '78%' }}></div>
                  </div>
                </div>

                <div className="p-4 bg-surface-container rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-on-surface-variant">Engajamento</span>
                    <span className="text-sm font-semibold text-secondary">+89%</span>
                  </div>
                  <div className="text-2xl font-bold text-on-surface">18.4K</div>
                  <div className="mt-2 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div className="p-4 bg-primary-container rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary">Conversões</span>
                    <span className="text-sm font-semibold text-primary">+156%</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">R$ 47.2K</div>
                  <div className="mt-2 h-2 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparativo - Antes vs Depois */}
      <section className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Compare: Agência Tradicional vs crIAdores
            </h2>
            <p className="text-lg text-on-surface-variant">
              Veja a diferença nos números
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Agência Tradicional */}
            <div className="card-elevated p-8 border-2 border-error/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-on-surface">Agência Tradicional</h3>
                <span className="px-3 py-1 bg-error-container text-error text-xs font-semibold rounded-full">
                  CARO
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-error mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-on-surface">R$ 15.000/mês</div>
                    <div className="text-sm text-on-surface-variant">Mensalidade + taxa de gestão</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-error mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-on-surface">Contrato de 12 meses</div>
                    <div className="text-sm text-on-surface-variant">Sem flexibilidade</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-error mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-on-surface">Relatórios mensais</div>
                    <div className="text-sm text-on-surface-variant">Dados atrasados</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-error mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-on-surface">Pouco controle</div>
                    <div className="text-sm text-on-surface-variant">Você não escolhe os criadores</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-error mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-on-surface">ROI incerto</div>
                    <div className="text-sm text-on-surface-variant">Difícil medir resultados reais</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-outline-variant">
                <div className="text-sm text-on-surface-variant">Investimento anual</div>
                <div className="text-3xl font-bold text-error">R$ 180.000</div>
              </div>
            </div>

            {/* crIAdores */}
            <div className="card-elevated p-8 border-2 border-secondary">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-on-surface">crIAdores</h3>
                <span className="px-3 py-1 bg-secondary-container text-secondary text-xs font-semibold rounded-full">
                  INTELIGENTE
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-on-surface">A partir de R$ 0/mês</div>
                    <div className="text-sm text-on-surface-variant">Pague apenas pelas campanhas</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-on-surface">Sem contrato</div>
                    <div className="text-sm text-on-surface-variant">Cancele quando quiser</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-on-surface">Dashboard em tempo real</div>
                    <div className="text-sm text-on-surface-variant">Dados atualizados 24/7</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-on-surface">Controle total</div>
                    <div className="text-sm text-on-surface-variant">Você escolhe cada criador</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-on-surface">ROI médio de 380%</div>
                    <div className="text-sm text-on-surface-variant">Resultados comprovados</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-outline-variant">
                <div className="text-sm text-on-surface-variant">Investimento anual médio</div>
                <div className="text-3xl font-bold text-secondary">R$ 48.000</div>
                <div className="text-sm text-secondary font-semibold mt-1">Economia de R$ 132.000/ano</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas e KPIs */}
      <section className="py-20 bg-gradient-to-br from-primary-container/20 to-secondary-container/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Resultados Mensuráveis, Crescimento Previsível
            </h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              Dados reais de mais de 15.000 campanhas realizadas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { metric: "380%", label: "ROI Médio", sublabel: "Retorno sobre investimento" },
              { metric: "70%", label: "Redução de Custos", sublabel: "vs agências tradicionais" },
              { metric: "48h", label: "Primeiros Resultados", sublabel: "Tempo médio" },
              { metric: "4.8/5", label: "Satisfação", sublabel: "Avaliação dos clientes" }
            ].map((item, index) => (
              <div key={index} className="card-elevated p-6 text-center hover:shadow-xl transition-all duration-300">
                <div className="text-4xl font-bold text-primary mb-2">{item.metric}</div>
                <div className="font-semibold text-on-surface mb-1">{item.label}</div>
                <div className="text-sm text-on-surface-variant">{item.sublabel}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Alcance Qualificado",
                description: "Média de 85K impressões por campanha com público-alvo segmentado",
                icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              },
              {
                title: "Engajamento Real",
                description: "Taxa média de 8.2% de engajamento, 4x superior à média do mercado",
                icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              },
              {
                title: "Conversão Comprovada",
                description: "Média de 3.5% de conversão em vendas diretas atribuídas",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              }
            ].map((item, index) => (
              <div key={index} className="card-elevated p-6">
                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">{item.title}</h3>
                <p className="text-on-surface-variant">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Plataforma - Features */}
      <section id="solucao" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Plataforma Completa de Gestão
            </h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar campanhas de sucesso
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "IA para Matching",
                description: "Algoritmo proprietário analisa 50+ variáveis para encontrar os criadores ideais para seu negócio",
                metric: "95% precisão"
              },
              {
                title: "Verificação Rigorosa",
                description: "Todos os criadores passam por análise de autenticidade, engajamento real e histórico profissional",
                metric: "100% verificados"
              },
              {
                title: "Gestão Centralizada",
                description: "Gerencie múltiplas campanhas, aprove conteúdos e acompanhe entregas em um único painel",
                metric: "Economia de 15h/semana"
              },
              {
                title: "Pagamentos Seguros",
                description: "Sistema de escrow protege ambas as partes. Pagamento liberado apenas após aprovação",
                metric: "100% seguro"
              },
              {
                title: "Analytics Avançado",
                description: "Dashboards em tempo real com métricas de alcance, engajamento, conversão e ROI",
                metric: "Dados 24/7"
              },
              {
                title: "Suporte Dedicado",
                description: "Time especializado disponível para ajudar em cada etapa da sua campanha",
                metric: "Resposta em 2h"
              }
            ].map((feature, index) => (
              <div key={index} className="card-elevated p-6 hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-on-surface mb-3">{feature.title}</h3>
                <p className="text-on-surface-variant mb-4 leading-relaxed">{feature.description}</p>
                <div className="inline-flex items-center px-3 py-1 bg-primary-container text-primary text-sm font-semibold rounded-full">
                  {feature.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-on-primary/20 text-on-primary text-sm font-bold mb-6">
              OFERTA LIMITADA: PRIMEIROS 30 DIAS GRÁTIS
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-on-primary mb-6">
            Comece Hoje. Veja Resultados em 48h.
          </h2>
          <p className="text-xl text-on-primary/90 mb-8 max-w-2xl mx-auto">
            Junte-se a 500+ PMEs que já reduziram custos em 70% e aumentaram vendas com a crIAdores
          </p>
          
          <Link 
            href="/login" 
            className="inline-block bg-surface text-primary px-10 py-4 rounded-full font-semibold text-lg hover:bg-surface/90 transition-all duration-200 hover:scale-105 shadow-xl mb-6"
          >
            Começar Teste Gratuito Agora
          </Link>

          <div className="flex items-center justify-center space-x-8 text-on-primary/80 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Sem cartão de crédito
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cancele quando quiser
            </div>
          </div>
        </div>
      </section>

      <PMEsFooter />
    </div>
  );
}

