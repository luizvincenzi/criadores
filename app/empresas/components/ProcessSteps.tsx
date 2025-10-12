import React from 'react';

export default function ProcessSteps() {
  const steps = [
    {
      numero: "01",
      titulo: "Reunião Inicial 360°",
      descricao: "Diagnóstico completo do marketing da sua empresa com auxílio de IA e especialistas.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      numero: "02",
      titulo: "Escolha do Perfil Ideal",
      descricao: "Selecionamos o melhor estrategista e criadores alinhados ao seu negócio e objetivos.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      )
    },
    {
      numero: "03",
      titulo: "Aprovação e Início",
      descricao: "Você valida tudo antes do início das ações. Sem surpresas, total transparência.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      numero: "04",
      titulo: "Acompanhamento Constante",
      descricao: "Reuniões, relatórios e otimizações semanais para garantir resultados crescentes.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      numero: "05",
      titulo: "Garantia de Satisfação",
      descricao: "Não gostou? Troque o profissional sem custo em até 30 dias. Seu sucesso é nossa prioridade.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-surface-container to-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container text-primary text-sm font-semibold mb-6">
            Processo Simples e Transparente
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
            Como Funciona na Prática
          </h2>
          
          <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
            Do primeiro contato aos resultados: um processo pensado para sua tranquilidade
          </p>
        </div>

        {/* Desktop - Timeline Horizontal */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Linha conectora */}
            <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-20" />
            
            <div className="grid grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Círculo do número */}
                  <div className="relative z-10 w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-28 h-28 bg-surface rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-primary mb-1">{step.icon}</div>
                        <div className="text-2xl font-bold text-primary">{step.numero}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-on-surface mb-2">
                      {step.titulo}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {step.descricao}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet - Timeline Vertical */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6">
              {/* Left - Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center">
                    <div className="text-primary">{step.icon}</div>
                  </div>
                </div>
                
                {/* Linha conectora vertical */}
                {index < steps.length - 1 && (
                  <div className="w-1 h-16 bg-gradient-to-b from-primary to-secondary opacity-20 mx-auto mt-4" />
                )}
              </div>
              
              {/* Right - Content */}
              <div className="flex-1 pt-2">
                <div className="text-sm font-bold text-primary mb-2">{step.numero}</div>
                <h3 className="text-xl font-bold text-on-surface mb-2">
                  {step.titulo}
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  {step.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Garantia em Destaque */}
        <div className="mt-16 card-elevated p-8 bg-gradient-to-r from-secondary-container/20 to-primary-container/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-on-surface mb-2">
                Garantia 100% de Satisfação
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                Se em até 30 dias você não estiver satisfeito com o profissional alocado, 
                trocamos sem custo adicional. Queremos que você tenha a melhor experiência possível.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <div className="px-6 py-3 bg-secondary text-on-secondary rounded-full font-bold text-lg">
                30 dias
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

