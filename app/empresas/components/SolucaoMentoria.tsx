import React from 'react';
import Link from 'next/link';
import CTAButton from './CTAButton';

export default function SolucaoMentoria() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container text-primary text-sm font-semibold mb-6">
              Solução #1
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-6">
              De Empresário Sobrecarregado a{' '}
              <span className="text-primary">Estrategista do Próprio Negócio</span>
            </h2>

            <div className="prose prose-lg text-on-surface-variant mb-8">
              <p className="text-lg leading-relaxed mb-4">
                Imagine acordar sabendo <strong>EXATAMENTE</strong> o que fazer no marketing.
              </p>
              <p className="text-lg leading-relaxed mb-4">
                Sem depender de agências caras.<br />
                Sem ficar refém de "especialistas".<br />
                Você no controle, tomando decisões estratégicas com confiança.
              </p>
              <p className="text-lg leading-relaxed font-semibold text-primary">
                É isso que a Mentoria Estratégica entrega.
              </p>
            </div>

            {/* Benefícios */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Encontros Semanais ao Vivo</h3>
                  <p className="text-sm text-on-surface-variant">
                    1h30 por semana com especialistas e outros empresários
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
                  <h3 className="font-semibold text-on-surface mb-1">+35 Mentorias Gravadas</h3>
                  <p className="text-sm text-on-surface-variant">
                    Acesso imediato a todo conteúdo exclusivo
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
                  <h3 className="font-semibold text-on-surface mb-1">Aplicação Prática</h3>
                  <p className="text-sm text-on-surface-variant">
                    Tarefas semanais com feedback personalizado
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
                  <h3 className="font-semibold text-on-surface mb-1">Comunidade Exclusiva</h3>
                  <p className="text-sm text-on-surface-variant">
                    WhatsApp com suporte direto e networking
                  </p>
                </div>
              </div>
            </div>

            {/* Preço */}
            <div className="card-elevated p-6 bg-gradient-to-br from-primary-container/30 to-secondary-container/30 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-on-surface-variant mb-1">Investimento</div>
                  <div className="text-3xl font-bold text-primary">R$ 2.500<span className="text-lg text-on-surface-variant">/mês</span></div>
                  <div className="text-sm text-secondary font-semibold">ou R$ 1.500/mês no semestral</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-on-surface-variant mb-1">Economize</div>
                  <div className="text-2xl font-bold text-secondary">R$ 6.000</div>
                  <div className="text-xs text-on-surface-variant">no semestre</div>
                </div>
              </div>
            </div>

            <CTAButton chatbot="mentoria" className="w-full sm:w-auto" />
            
            <div className="mt-4">
              <Link href="/empresas/mentoria" className="text-primary hover:underline text-sm">
                Ver página completa da Mentoria →
              </Link>
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="card-elevated overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🎓</span>
                  </div>
                  <p className="text-on-surface-variant text-sm">
                    [Vídeo: Mentoria em ação]
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 card-elevated p-4 bg-white">
              <div className="text-3xl font-bold text-primary">+40</div>
              <div className="text-sm text-on-surface-variant">Empresários<br/>Mentorados</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

