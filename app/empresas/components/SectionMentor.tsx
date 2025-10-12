import React from 'react';
import Image from 'next/image';

export default function SectionMentor() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-container/20 to-secondary-container/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div className="order-2 md:order-1">
            <div className="card-elevated overflow-hidden">
              <div className="aspect-[4/5] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-5xl font-bold text-primary">GD</span>
                  </div>
                  <p className="text-on-surface-variant text-sm">
                    [Foto profissional de Gabriel D'Ávila]
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container text-secondary text-sm font-semibold mb-6">
              Mentoria com Autoridade Real
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              Conheça Gabriel D'Ávila
            </h2>

            <p className="text-lg text-on-surface-variant mb-6 leading-relaxed">
              Fundador da crIAdores e mentor de mais de 40 empresários que transformaram seus negócios com marketing estratégico.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Empreendedor Serial</h3>
                  <p className="text-sm text-on-surface-variant">
                    Fundador de Rezendog, Boussolé Rooftop, Folks Pub e Cartagena Bar
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Formação Sólida</h3>
                  <p className="text-sm text-on-surface-variant">
                    Pós-graduação em Marketing e MBA em Gestão Estratégica pela FGV
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Experiência Prática</h3>
                  <p className="text-sm text-on-surface-variant">
                    +40 empresários mentorados e dezenas de cases de sucesso locais
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface-container rounded-2xl border-l-4 border-primary">
              <p className="text-on-surface italic leading-relaxed">
                "Nosso propósito é fazer o marketing voltar a gerar resultado para quem mais precisa: 
                o pequeno empresário que faz tudo acontecer."
              </p>
              <p className="text-sm text-on-surface-variant mt-3 font-semibold">
                — Gabriel D'Ávila, Fundador da crIAdores
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

