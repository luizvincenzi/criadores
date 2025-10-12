import React from 'react';

interface SectionUrgenciaProps {
  variant?: 'combo' | 'mentoria' | 'social-media' | 'criadores';
}

export default function SectionUrgencia({ variant = 'combo' }: SectionUrgenciaProps) {
  const urgenciaContent = {
    combo: {
      badge: "🔥 Últimas Vagas de 2025",
      titulo: "Garanta Sua Vaga Ainda Este Ano",
      subtitulo: "Não perca a chance de estar preparado para um 2026 extraordinário",
      beneficios: [
        "Comece 2026 com estratégia completa já rodando",
        "Aproveite o fim de ano para estruturar seu marketing",
        "Garanta desconto exclusivo do combo completo",
        "Prioridade no atendimento para clientes de dezembro"
      ],
      vagas: "Apenas 3 vagas disponíveis para o combo completo em dezembro"
    },
    mentoria: {
      badge: "📚 Turma de Dezembro",
      titulo: "Últimas 8 Vagas para a Mentoria",
      subtitulo: "Comece 2026 dominando o marketing do seu negócio",
      beneficios: [
        "Acesso imediato ao canal com +35 mentorias gravadas",
        "Participe da turma de dezembro e janeiro",
        "Networking com outros empresários locais",
        "Bônus: Planejamento estratégico 2026 incluso"
      ],
      vagas: "Apenas 8 vagas disponíveis para manter a qualidade da mentoria"
    },
    'social-media': {
      badge: "⚡ Vagas Limitadas",
      titulo: "Apenas 5 Vagas Disponíveis",
      subtitulo: "Garanta seu estrategista dedicado para começar em dezembro",
      beneficios: [
        "Comece dezembro com planejamento de fim de ano pronto",
        "Aproveite as festas para criar conteúdo estratégico",
        "Estratégia 2026 já definida antes do ano começar",
        "Prioridade para campanhas de Natal e Ano Novo"
      ],
      vagas: "Apenas 5 vagas para garantir dedicação exclusiva de cada estrategista"
    },
    criadores: {
      badge: "🎄 Campanha de Fim de Ano",
      titulo: "Últimas Vagas para Dezembro",
      subtitulo: "Aproveite o fim de ano com criadores locais promovendo seu negócio",
      beneficios: [
        "Campanha especial de Natal e Ano Novo",
        "Criadores já selecionados e prontos para começar",
        "Aproveite o movimento de fim de ano",
        "Comece 2026 com visibilidade local consolidada"
      ],
      vagas: "Apenas 6 vagas para campanhas de dezembro"
    }
  };

  const content = urgenciaContent[variant];

  return (
    <section className="py-20 bg-gradient-to-br from-error-container/10 via-tertiary-container/10 to-primary-container/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-error-container text-error text-sm font-bold mb-6 animate-pulse">
            {content.badge}
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-on-surface mb-4">
            {content.titulo}
          </h2>
          
          <p className="text-xl text-on-surface-variant mb-8">
            {content.subtitulo}
          </p>

          {/* Countdown Timer Visual */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container rounded-full mb-8">
            <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-on-surface">
              {content.vagas}
            </span>
          </div>
        </div>

        {/* Benefícios */}
        <div className="card-elevated p-8 mb-8">
          <h3 className="text-xl font-bold text-on-surface mb-6 text-center">
            Por que garantir sua vaga agora?
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {content.beneficios.map((beneficio, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-on-surface-variant">{beneficio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual de Vagas */}
        <div className="card-elevated p-6 bg-gradient-to-r from-error-container/20 to-tertiary-container/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-on-surface">Vagas Disponíveis</span>
            <span className="text-sm font-bold text-error">
              {variant === 'combo' ? '3' : variant === 'mentoria' ? '8' : variant === 'social-media' ? '5' : '6'} restantes
            </span>
          </div>
          
          <div className="flex gap-2">
            {Array.from({ length: variant === 'combo' ? 10 : variant === 'mentoria' ? 15 : variant === 'social-media' ? 10 : 12 }).map((_, index) => {
              const vagasRestantes = variant === 'combo' ? 3 : variant === 'mentoria' ? 8 : variant === 'social-media' ? 5 : 6;
              const totalVagas = variant === 'combo' ? 10 : variant === 'mentoria' ? 15 : variant === 'social-media' ? 10 : 12;
              const isPreenchida = index < (totalVagas - vagasRestantes);
              
              return (
                <div
                  key={index}
                  className={`flex-1 h-3 rounded-full ${
                    isPreenchida ? 'bg-outline-variant' : 'bg-error'
                  }`}
                  title={isPreenchida ? 'Vaga preenchida' : 'Vaga disponível'}
                />
              );
            })}
          </div>
          
          <p className="text-xs text-on-surface-variant mt-3 text-center">
            Vagas limitadas para garantir qualidade no atendimento
          </p>
        </div>
      </div>
    </section>
  );
}

