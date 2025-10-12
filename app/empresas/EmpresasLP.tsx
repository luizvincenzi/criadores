'use client';

import React from 'react';
import Link from 'next/link';
import PMEsHeader from './components/PMEsHeader';
import PMEsFooter from './components/PMEsFooter';
import CTAButton from './components/CTAButton';
import ComparisonTable from './components/ComparisonTable';
import ProcessSteps from './components/ProcessSteps';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import SectionUrgencia from './components/SectionUrgencia';
import SolucaoMentoria from './components/SolucaoMentoria';
import SolucaoSocialMedia from './components/SolucaoSocialMedia';
import SolucaoCriadores from './components/SolucaoCriadores';

export default function EmpresasLP() {
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
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>+40 empresas transformadas • +1.000 conteúdos publicados • Resultados reais</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Transforme Sua Empresa Numa{' '}
              <span className="text-secondary-container">Referência Regional</span>
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Escolha a solução ideal para o seu negócio crescer no digital: 
              <strong> Mentoria Estratégica</strong>, <strong>Social Media Profissional</strong> ou{' '}
              <strong>Criadores Locais</strong>. Ou combine todas e economize 22%.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <CTAButton chatbot="empresas" size="lg" />
              <a
                href="#solucoes"
                className="btn-secondary border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4 text-center"
              >
                Conhecer as Soluções
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Sem taxa de adesão</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Sem fidelidade</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Resultados mensuráveis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POR QUE NASCEMOS */}
      <section className="py-20 bg-surface-container">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container text-primary text-sm font-semibold mb-6">
              Nossa História
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Por Que a crIAdores Nasceu?
            </h2>
            
            <p className="text-xl text-on-surface-variant leading-relaxed mb-8">
              A crIAdores nasceu para resolver um desafio que toda empresa local enfrenta:{' '}
              <strong>crescer no digital sem tempo, equipe ou estratégia.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card-elevated p-6 text-center">
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="font-bold text-on-surface mb-2">Publicações Improvisadas</h3>
              <p className="text-sm text-on-surface-variant">
                Sem planejamento, sem consistência, sem resultado
              </p>
            </div>

            <div className="card-elevated p-6 text-center">
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="font-bold text-on-surface mb-2">Parcerias Sem Resultado</h3>
              <p className="text-sm text-on-surface-variant">
                Criadores que não geram vendas, só curtidas
              </p>
            </div>

            <div className="card-elevated p-6 text-center">
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="font-bold text-on-surface mb-2">Falta de Consistência</h3>
              <p className="text-sm text-on-surface-variant">
                Marketing feito nas horas vagas, sem foco
              </p>
            </div>
          </div>

          <div className="card-elevated p-8 bg-gradient-to-br from-primary-container/30 to-secondary-container/30 text-center">
            <h3 className="text-2xl font-bold text-on-surface mb-4">
              Por isso, criamos um modelo simples e prático
            </h3>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Que une <strong>estratégia</strong>, <strong>execução</strong> e{' '}
              <strong>influência local</strong> — tudo acompanhado por especialistas.
            </p>
          </div>
        </div>
      </section>

      {/* O PODER DOS CRIADORES */}
      <section className="py-20 bg-gradient-to-br from-secondary-container/20 to-primary-container/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container text-secondary text-sm font-semibold mb-6">
                Dados do Mercado
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
                O Poder dos Criadores de Conteúdo
              </h2>
              
              <p className="text-lg text-on-surface-variant mb-6 leading-relaxed">
                crIAdores de conteúdo são o <strong>novo canal de vendas local</strong>.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-secondary">$21B</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface mb-1">Mercado Global</h3>
                    <p className="text-sm text-on-surface-variant">
                      Em 2023, o mercado global de influência movimentou US$ 21 bilhões
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-secondary">#1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface mb-1">Brasil Líder</h3>
                    <p className="text-sm text-on-surface-variant">
                      O Brasil se tornou líder mundial em engajamento com criadores
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-secondary">80%</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface mb-1">Confiança do Consumidor</h3>
                    <p className="text-sm text-on-surface-variant">
                      Mais de 80% dos consumidores confiam mais em criadores do que em anúncios tradicionais
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-primary-container rounded-2xl">
                <p className="text-on-surface font-semibold text-lg">
                  É o momento de colocar o poder dos criadores para trabalhar a favor da sua empresa.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="card-elevated p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-on-surface-variant">
                      [Infográfico: Crescimento do mercado de criadores]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUÇÕES INDIVIDUAIS */}
      <div id="solucoes">
        <SolucaoMentoria />
        <SolucaoSocialMedia />
        <SolucaoCriadores />
      </div>

      {/* COMBO COMPLETO - A OFERTA IRRESISTÍVEL */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container text-secondary text-sm font-semibold mb-6">
              🔥 Oferta Especial
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-on-surface mb-6">
              Mas E Se Você Pudesse Ter{' '}
              <span className="text-primary">TUDO Isso?</span>
            </h2>

            <p className="text-xl text-on-surface-variant leading-relaxed max-w-3xl mx-auto mb-8">
              Imagine ter <strong>mentoria estratégica</strong>, <strong>social media profissional</strong> e{' '}
              <strong>criadores locais</strong> trabalhando juntos para o seu negócio crescer.
            </p>

            <div className="card-elevated p-8 bg-gradient-to-br from-secondary-container/30 to-primary-container/30 max-w-2xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-sm text-on-surface-variant mb-2">Combo Completo</div>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-2xl text-on-surface-variant line-through">R$ 7.600/mês</div>
                  <div className="text-5xl font-bold text-primary">R$ 5.900<span className="text-2xl text-on-surface-variant">/mês</span></div>
                </div>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary text-white font-semibold mb-4">
                  Economize R$ 1.700/mês (22%)
                </div>
                <div className="text-sm text-secondary font-semibold">
                  ou R$ 3.900/mês no semestral (economize R$ 12.000 no semestre!)
                </div>
              </div>
            </div>
          </div>

          <ComparisonTable />

          <div className="text-center mt-12">
            <CTAButton chatbot="empresas" size="lg" />
            <p className="text-sm text-on-surface-variant mt-4">
              Sem taxa de adesão • Sem fidelidade • Garantia de 30 dias
            </p>
          </div>
        </div>
      </section>

      {/* PROCESSO */}
      <section className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container text-primary text-sm font-semibold mb-6">
              Como Funciona
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Do Primeiro Contato ao Resultado
            </h2>

            <p className="text-xl text-on-surface-variant leading-relaxed max-w-3xl mx-auto">
              Um processo simples, transparente e focado em resultado.
            </p>
          </div>

          <ProcessSteps />
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <TestimonialsSection />

      {/* URGÊNCIA */}
      <SectionUrgencia variant="combo" />

      {/* FAQ */}
      <FAQSection />

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/95 to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto Para Transformar Seu Negócio?
          </h2>

          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Fale com um especialista agora e descubra qual solução é ideal para você.
          </p>

          <CTAButton chatbot="empresas" size="lg" className="mb-4" />

          <p className="text-sm text-white/80">
            Resposta em até 24 horas • 100% gratuito • Sem compromisso
          </p>
        </div>
      </section>

      <PMEsFooter />
    </div>
  );
}

