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

export default function PMEsMentoriaLP() {
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
                <span>+40 empresários mentorados • +35 mentorias gravadas</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Domine o Marketing e{' '}
                <span className="text-secondary-container">Transforme</span> Seu Negócio
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Mentoria estratégica com <strong>Gabriel D'Ávila</strong> para empresários que querem 
                aprender e aplicar marketing de verdade no seu negócio.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
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
                  <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Encontros semanais</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Aplicação prática</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-secondary-container mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Comunidade exclusiva</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card-elevated overflow-hidden bg-surface-container">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">🎓</span>
                    </div>
                    <p className="text-on-surface-variant text-sm">
                      [Vídeo: Gabriel D'Ávila em mentoria]
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 card-elevated p-4 bg-white">
                <div className="text-3xl font-bold text-primary">+35</div>
                <div className="text-sm text-on-surface-variant">Mentorias Gravadas</div>
              </div>

              <div className="absolute -top-6 -right-6 card-elevated p-4 bg-white">
                <div className="text-3xl font-bold text-secondary">+40</div>
                <div className="text-sm text-on-surface-variant">Empresários Mentorados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O QUE INCLUI */}
      <section id="o-que-inclui" className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container text-primary text-sm font-semibold mb-6">
              O Que Você Recebe
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Tudo Que Você Precisa Para Dominar o Marketing
            </h2>
            
            <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
              Uma mentoria completa, prática e focada em resultados reais
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Encontros Semanais */}
            <div className="card-elevated p-8">
              <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-3">Encontros Semanais ao Vivo</h3>
              <p className="text-on-surface-variant mb-4">
                Reuniões online toda semana com Gabriel D'Ávila e outros empresários. 
                Tire dúvidas, compartilhe desafios e aprenda com casos reais.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>1h30 de mentoria por semana</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Networking com outros empresários</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Gravações disponíveis para rever</span>
                </li>
              </ul>
            </div>

            {/* Canal Exclusivo */}
            <div className="card-elevated p-8">
              <div className="w-16 h-16 bg-secondary-container rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-3">Canal com +35 Mentorias Gravadas</h3>
              <p className="text-on-surface-variant mb-4">
                Acesso imediato a mais de 35 horas de conteúdo exclusivo sobre marketing, 
                vendas, gestão e crescimento de negócios locais.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Assista quando e onde quiser</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Conteúdo novo adicionado mensalmente</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Materiais de apoio e templates</span>
                </li>
              </ul>
            </div>

            {/* Aplicação Prática */}
            <div className="card-elevated p-8">
              <div className="w-16 h-16 bg-tertiary-container rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-3">Aplicação Prática no Seu Negócio</h3>
              <p className="text-on-surface-variant mb-4">
                Não é só teoria. Você aplica o que aprende direto no seu negócio, 
                com acompanhamento e feedback do Gabriel e do grupo.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Tarefas semanais práticas</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Feedback personalizado</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Resultados mensuráveis</span>
                </li>
              </ul>
            </div>

            {/* Suporte Direto */}
            <div className="card-elevated p-8">
              <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-3">Suporte Direto via WhatsApp</h3>
              <p className="text-on-surface-variant mb-4">
                Comunidade exclusiva no WhatsApp para tirar dúvidas, compartilhar conquistas 
                e trocar experiências com outros empresários.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Resposta em até 24h</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Networking valioso</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Parcerias entre mentorados</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Preço */}
          <div className="mt-12 card-elevated p-8 bg-gradient-to-br from-primary-container/30 to-secondary-container/30 text-center">
            <h3 className="text-2xl font-bold text-on-surface mb-4">Investimento</h3>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="p-6 bg-surface rounded-2xl">
                <div className="text-sm text-on-surface-variant mb-2">Plano Mensal</div>
                <div className="text-4xl font-bold text-primary mb-2">R$ 2.500</div>
                <div className="text-sm text-on-surface-variant">/mês</div>
              </div>

              <div className="p-6 bg-surface rounded-2xl border-2 border-secondary">
                <div className="inline-block px-3 py-1 bg-secondary text-on-secondary text-xs rounded-full mb-2">
                  Mais Econômico
                </div>
                <div className="text-sm text-on-surface-variant mb-2">Plano Semestral</div>
                <div className="text-4xl font-bold text-secondary mb-2">R$ 1.500</div>
                <div className="text-sm text-on-surface-variant">/mês</div>
                <div className="text-xs text-secondary font-semibold mt-2">
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
      <SectionUrgencia variant="mentoria" />

      {/* FAQ */}
      <FAQSection />

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Comece 2026 Dominando o Marketing
          </h2>
          
          <p className="text-xl text-white/90 mb-8">
            Últimas 8 vagas para a turma de dezembro. Garanta sua vaga agora.
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="btn-primary bg-white text-primary hover:bg-white/90 text-xl px-12 py-5 mb-6"
          >
            Agendar Diagnóstico Gratuito
          </button>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
            <span>✓ Sem taxa de adesão</span>
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
              <FormularioDiagnostico servicoPreSelecionado="mentoria" />
            </div>
          </div>
        </div>
      )}

      <PMEsFooter />
    </div>
  );
}

