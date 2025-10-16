'use client';

import React, { useState } from 'react';
import PMEsHeader from '../../empresas/components/PMEsHeader';
import PMEsFooter from '../../empresas/components/PMEsFooter';
import FormularioDiagnostico from '../../empresas/components/FormularioDiagnostico';

export default function RaioXDaMinhaEmpresaLP() {
  const [showForm, setShowForm] = useState(false);

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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold mb-6">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <span>Relatório Gratuito</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                🚀 Ganhe um Raio-X 360º de Marketing do seu negócio
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Descubra o que está travando seu crescimento e o que fazer pra vender mais. Receba um relatório completo com os principais pontos fortes e fracos do seu marketing + 1h de consultoria estratégica gratuita com um especialista da crIAdores.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
                >
                  Solicitar meu Relatório 360º sem custo
                </button>
                <a
                  href="#o-que-inclui"
                  className="btn-secondary border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4 text-center"
                >
                  Ver O Que Inclui
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Confidencial</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Entrega em 48h</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Sem compromisso</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card-elevated overflow-hidden bg-surface-container">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">📊</span>
                    </div>
                    <p className="text-on-surface-variant text-sm">
                      [Relatório de Análise]
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 card-elevated p-4 bg-white">
                <div className="text-3xl font-bold text-primary">+300</div>
                <div className="text-sm text-on-surface-variant">Empresas Avaliadas</div>
              </div>

              <div className="absolute -top-6 -right-6 card-elevated p-4 bg-white">
                <div className="text-3xl font-bold text-secondary">48h</div>
                <div className="text-sm text-on-surface-variant">Prazo de Entrega</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO "POR QUE ESSE DIAGNÓSTICO É DIFERENTE" */}
      <section className="py-20 bg-surface-container">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Por que esse diagnóstico é diferente?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-elevated p-8 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Análise Completa</h3>
              <p className="text-on-surface-variant">Analisamos seu posicionamento, conteúdo, anúncios e presença local.</p>
            </div>

            <div className="card-elevated p-8 text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Inteligência Artificial</h3>
              <p className="text-on-surface-variant">Usamos IA e benchmarks do seu setor para insights precisos.</p>
            </div>

            <div className="card-elevated p-8 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Relatório Detalhado</h3>
              <p className="text-on-surface-variant">Você recebe um PDF com insights práticos e plano de ação imediato.</p>
            </div>

            <div className="card-elevated p-8 text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Consultoria 1-a-1</h3>
              <p className="text-on-surface-variant">Conversa com um estrategista da crIAdores — sem custo, sem compromisso.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO "SEU RELATÓRIO 360º INCLUI" */}
      <section id="o-que-inclui" className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container text-primary text-sm font-semibold mb-6">
              O Que Você Recebe
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Seu Relatório 360º inclui:
            </h2>

            <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
              Um diagnóstico completo do seu marketing digital
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="card-elevated p-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-on-surface">📈 Análise de Performance Digital — alcance, engajamento, seguidores e tendências</span>
              </div>
            </div>

            <div className="card-elevated p-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-on-surface">🎯 Posicionamento de Marca — clareza da mensagem e diferenciais frente à concorrência</span>
              </div>
            </div>

            <div className="card-elevated p-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-on-surface">💬 Comunicação e Conteúdo — avaliação do impacto e tom das suas postagens</span>
              </div>
            </div>

            <div className="card-elevated p-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-on-surface">🧠 Recomendações Estratégicas — próximos passos práticos para aumentar resultados</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-lg px-8 py-4"
            >
              Solicitar meu Relatório 360º agora
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO "FEITO POR QUEM ENTENDE DO JOGO LOCAL" */}
      <section className="py-20 bg-surface-container">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
            Feito por quem entende do jogo local
          </h2>

          <p className="text-xl text-on-surface-variant mb-8">
            A crIAdores ajuda negócios locais de todos os tamanhos a crescer com marketing inteligente — usando dados, IA e criatividade humana.
            Já mapeamos +300 empresas e geramos resultados em cidades como Londrina e Belém.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">R$ 2.8M</div>
              <div className="text-on-surface-variant">Faturamento Gerado</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">48h</div>
              <div className="text-on-surface-variant">Prazo de Entrega</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-on-surface-variant">Confidencial</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            💡 Pronto pra descobrir o que o seu marketing está deixando na mesa?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Receba seu relatório personalizado em até 48 horas
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
          >
            Solicitar meu Relatório 360º agora — 100% gratuito
          </button>
          <p className="text-white/80 text-sm mt-4">
            📄 Entregamos em até 48h | Sem compromisso | Dados 100% confidenciais
          </p>
        </div>
      </section>

      <PMEsFooter />

      {showForm && <FormularioDiagnostico />}
    </div>
  );
}