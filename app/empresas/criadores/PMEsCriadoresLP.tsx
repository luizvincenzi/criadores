'use client';

import React, { useState } from 'react';
import PMEsHeader from '../components/PMEsHeader';
import PMEsFooter from '../components/PMEsFooter';
import FormularioDiagnostico from '../components/FormularioDiagnostico';
import SectionMentor from '../components/SectionMentor';
import SectionUrgencia from '../components/SectionUrgencia';
import ProcessSteps from '../components/ProcessSteps';
import TestimonialsSection from '../components/TestimonialsSection';
import FAQSection from '../components/FAQSection';

export default function PMEsCriadoresLP() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <PMEsHeader />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-tertiary via-tertiary/95 to-error overflow-hidden">
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
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>Criadores locais • Autenticidade • Resultados reais</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Criadores Locais Que{' '}
                <span className="text-secondary-container">Vendem de Verdade</span>
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Conecte sua empresa a <strong>4 microinfluenciadores locais por mês</strong>. 
                Curadoria completa, aprovação de conteúdo e resultados mensuráveis.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary bg-white text-tertiary hover:bg-white/90 text-lg px-8 py-4"
                >
                  Agendar Diagnóstico Gratuito
                </button>
                <a
                  href="#o-que-inclui"
                  className="btn-secondary border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4 text-center"
                >
                  Ver Como Funciona
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>4 criadores/mês</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Curadoria completa</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Você aprova tudo</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card-elevated overflow-hidden bg-surface-container">
                <div className="aspect-square bg-gradient-to-br from-tertiary/20 to-error/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="w-20 h-20 bg-tertiary rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div className="w-20 h-20 bg-error rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                    </div>
                    <p className="text-on-surface-variant text-sm">
                      [Grid: 4 criadores locais]
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 card-elevated p-4 bg-white">
                <div className="text-3xl font-bold text-tertiary">4</div>
                <div className="text-sm text-on-surface-variant">Criadores/Mês</div>
              </div>

              <div className="absolute -top-6 -right-6 card-elevated p-4 bg-white">
                <div className="text-3xl font-bold text-error">100%</div>
                <div className="text-sm text-on-surface-variant">Locais</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O QUE INCLUI */}
      <section id="o-que-inclui" className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-tertiary-container text-tertiary text-sm font-semibold mb-6">
              O Que Você Recebe
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Visibilidade Local Com Autenticidade
            </h2>
            
            <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
              Criadores da sua região promovendo seu negócio de forma genuína
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Seleção e Curadoria */}
            <div className="card-elevated p-8">
              <div className="w-16 h-16 bg-tertiary-container rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-3">Seleção e Curadoria</h3>
              <p className="text-on-surface-variant mb-4">
                Nossa equipe seleciona 4 microinfluenciadores locais por mês, 
                alinhados com o perfil e valores da sua empresa.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Análise de engajamento e autenticidade</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verificação de histórico e reputação</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Match com seu público-alvo</span>
                </li>
              </ul>
            </div>

            {/* Reuniões Mensais */}
            <div className="card-elevated p-8">
              <div className="w-16 h-16 bg-error-container rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-error" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-3">Reuniões Mensais</h3>
              <p className="text-on-surface-variant mb-4">
                Alinhamento mensal para definir estratégia, revisar resultados 
                e planejar as próximas campanhas.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Apresentação dos criadores selecionados</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Análise de resultados da campanha anterior</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Planejamento estratégico do próximo mês</span>
                </li>
              </ul>
            </div>

            {/* Aprovação Total */}
            <div className="card-elevated p-8">
              <div className="w-16 h-16 bg-secondary-container rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-3">Aprovação Total dos Conteúdos</h3>
              <p className="text-on-surface-variant mb-4">
                Você aprova todos os conteúdos antes da publicação. 
                Sem surpresas, total controle sobre a mensagem.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Revisão de roteiros e conceitos</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Aprovação final antes da publicação</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Ajustes ilimitados até sua aprovação</span>
                </li>
              </ul>
            </div>

            {/* Suporte Completo */}
            <div className="card-elevated p-8">
              <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-3">Suporte Completo da Equipe</h3>
              <p className="text-on-surface-variant mb-4">
                Nossa equipe cuida de toda a gestão: briefing, negociação, 
                acompanhamento e relatórios.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Gestão completa das parcerias</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Relatórios mensais de performance</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Suporte via WhatsApp</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Preço */}
          <div className="mt-12 card-elevated p-8 bg-gradient-to-br from-tertiary-container/30 to-error-container/30 text-center">
            <h3 className="text-2xl font-bold text-on-surface mb-4">Investimento</h3>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="p-6 bg-surface rounded-2xl">
                <div className="text-sm text-on-surface-variant mb-2">Plano Mensal</div>
                <div className="text-4xl font-bold text-tertiary mb-2">R$ 2.300</div>
                <div className="text-sm text-on-surface-variant">/mês</div>
              </div>

              <div className="p-6 bg-surface rounded-2xl border-2 border-error">
                <div className="inline-block px-3 py-1 bg-error text-on-error text-xs rounded-full mb-2">
                  Mais Econômico
                </div>
                <div className="text-sm text-on-surface-variant mb-2">Plano Semestral</div>
                <div className="text-4xl font-bold text-error mb-2">R$ 1.300</div>
                <div className="text-sm text-on-surface-variant">/mês</div>
                <div className="text-xs text-error font-semibold mt-2">
                  Economize R$ 6.000 no semestre
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-lg px-12 py-4 mt-8"
            >
              Agendar Diagnóstico Gratuito
            </button>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <ProcessSteps />

      {/* MENTOR */}
      <SectionMentor />

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      {/* URGÊNCIA */}
      <SectionUrgencia variant="criadores" />

      {/* FAQ */}
      <FAQSection />

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-tertiary to-error">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Aproveite o Fim de Ano Com Criadores Locais
          </h2>
          
          <p className="text-xl text-white/90 mb-8">
            Últimas 6 vagas para campanhas de dezembro. Garanta sua visibilidade agora.
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="btn-primary bg-white text-tertiary hover:bg-white/90 text-xl px-12 py-5 mb-6"
          >
            Agendar Diagnóstico Gratuito
          </button>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
            <span>✓ 4 criadores locais/mês</span>
            <span>✓ Você aprova tudo</span>
            <span>✓ Garantia de 30 dias</span>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setShowForm(false)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/90 z-10"
              >
                ✕
              </button>
              <FormularioDiagnostico servicoPreSelecionado="criadores" />
            </div>
          </div>
        </div>
      )}

      <PMEsFooter />
    </div>
  );
}

