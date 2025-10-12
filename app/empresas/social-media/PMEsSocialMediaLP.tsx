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

export default function PMEsSocialMediaLP() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <PMEsHeader />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-secondary via-secondary/95 to-tertiary overflow-hidden">
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
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Profissional dedicado • Constância garantida • Resultados mensuráveis</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Seu Estrategista Dedicado de{' '}
                <span className="text-primary-container">Marketing Digital</span>
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Terceirize seu marketing com um <strong>profissional dedicado</strong> que cuida de tudo: 
                estratégia, criação, publicação e análise de resultados.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary bg-white text-secondary hover:bg-white/90 text-lg px-8 py-4"
                >
                  Agendar Diagnóstico Gratuito
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
                  <svg className="w-5 h-5 text-primary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>2 Reels por semana</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Stories diários</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Reuniões semanais</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card-elevated overflow-hidden bg-surface-container">
                <div className="aspect-video bg-gradient-to-br from-secondary/20 to-tertiary/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">📱</span>
                    </div>
                    <p className="text-on-surface-variant text-sm">
                      [Mockup: Feed Instagram com conteúdos]
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 card-elevated p-4 bg-white">
                <div className="text-3xl font-bold text-secondary">2x</div>
                <div className="text-sm text-on-surface-variant">Reels/Semana</div>
              </div>

              <div className="absolute -top-6 -right-6 card-elevated p-4 bg-white">
                <div className="text-3xl font-bold text-tertiary">7x</div>
                <div className="text-sm text-on-surface-variant">Stories/Semana</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O QUE INCLUI */}
      <section id="o-que-inclui" className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container text-secondary text-sm font-semibold mb-6">
              O Que Você Recebe
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Tudo Que Sua Empresa Precisa Para Crescer no Digital
            </h2>
            
            <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
              Um profissional dedicado cuidando de todo o seu marketing digital
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Planejamento Mensal */}
            <div className="card-elevated p-6">
              <div className="w-14 h-14 bg-secondary-container rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Planejamento Mensal</h3>
              <p className="text-sm text-on-surface-variant">
                Calendário editorial completo com campanhas e conteúdos estratégicos
              </p>
            </div>

            {/* 2 Reels/Semana */}
            <div className="card-elevated p-6">
              <div className="w-14 h-14 bg-tertiary-container rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">2 Reels por Semana</h3>
              <p className="text-sm text-on-surface-variant">
                Criação e publicação de vídeos curtos otimizados para engajamento
              </p>
            </div>

            {/* Stories Diários */}
            <div className="card-elevated p-6">
              <div className="w-14 h-14 bg-primary-container rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Stories Diários</h3>
              <p className="text-sm text-on-surface-variant">
                Presença constante com stories estratégicos todos os dias
              </p>
            </div>

            {/* Reuniões Semanais */}
            <div className="card-elevated p-6">
              <div className="w-14 h-14 bg-secondary-container rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Reuniões Semanais</h3>
              <p className="text-sm text-on-surface-variant">
                Alinhamento semanal para revisar resultados e próximos passos
              </p>
            </div>

            {/* Análise de Resultados */}
            <div className="card-elevated p-6">
              <div className="w-14 h-14 bg-tertiary-container rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Análise de Resultados</h3>
              <p className="text-sm text-on-surface-variant">
                Relatórios mensais com métricas e insights para otimização
              </p>
            </div>

            {/* Gestão de Comunidade */}
            <div className="card-elevated p-6">
              <div className="w-14 h-14 bg-primary-container rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Gestão de Comunidade</h3>
              <p className="text-sm text-on-surface-variant">
                Resposta a comentários e mensagens para engajar sua audiência
              </p>
            </div>
          </div>

          {/* Preço */}
          <div className="mt-12 card-elevated p-8 bg-gradient-to-br from-secondary-container/30 to-tertiary-container/30 text-center">
            <h3 className="text-2xl font-bold text-on-surface mb-4">Investimento</h3>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="p-6 bg-surface rounded-2xl">
                <div className="text-sm text-on-surface-variant mb-2">Plano Mensal</div>
                <div className="text-4xl font-bold text-secondary mb-2">R$ 2.800</div>
                <div className="text-sm text-on-surface-variant">/mês</div>
              </div>

              <div className="p-6 bg-surface rounded-2xl border-2 border-tertiary">
                <div className="inline-block px-3 py-1 bg-tertiary text-on-tertiary text-xs rounded-full mb-2">
                  Mais Econômico
                </div>
                <div className="text-sm text-on-surface-variant mb-2">Plano Semestral</div>
                <div className="text-4xl font-bold text-tertiary mb-2">R$ 1.800</div>
                <div className="text-sm text-on-surface-variant">/mês</div>
                <div className="text-xs text-tertiary font-semibold mt-2">
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
      <SectionUrgencia variant="social-media" />

      {/* FAQ */}
      <FAQSection />

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-secondary to-tertiary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Terceirize Seu Marketing Com Quem Entende
          </h2>
          
          <p className="text-xl text-white/90 mb-8">
            Apenas 5 vagas disponíveis para começar em dezembro. Garanta a sua agora.
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="btn-primary bg-white text-secondary hover:bg-white/90 text-xl px-12 py-5 mb-6"
          >
            Agendar Diagnóstico Gratuito
          </button>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
            <span>✓ Profissional dedicado</span>
            <span>✓ Sem fidelidade</span>
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
              <FormularioDiagnostico servicoPreSelecionado="social-media" />
            </div>
          </div>
        </div>
      )}

      <PMEsFooter />
    </div>
  );
}

