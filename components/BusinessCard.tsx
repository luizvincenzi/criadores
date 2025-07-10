import React from 'react';

interface BusinessCardProps {
  businessName: string;
  journeyStage: string;
  nextAction: string;
  creatorsCount?: number;
  value?: number;
}

export default function BusinessCard({
  businessName,
  journeyStage,
  nextAction,
  creatorsCount = 0,
  value = 0
}: BusinessCardProps) {
  // Função para determinar a cor do badge baseado no estágio
  const getBadgeColor = (stage: string): string => {
    const stageColors: Record<string, string> = {
      'Agendamento': 'bg-blue-100 text-blue-800 border-blue-200',
      'Proposta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Negociação': 'bg-orange-100 text-orange-800 border-orange-200',
      'Fechamento': 'bg-green-100 text-green-800 border-green-200',
      'Pós-venda': 'bg-purple-100 text-purple-800 border-purple-200',
      'Perdido': 'bg-red-100 text-red-800 border-red-200',
      'Pausado': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return stageColors[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Função para determinar o ícone baseado no estágio
  const getStageIcon = (stage: string): string => {
    const stageIcons: Record<string, string> = {
      'Agendamento': '📅',
      'Proposta': '📋',
      'Negociação': '🤝',
      'Fechamento': '✅',
      'Pós-venda': '🎯',
      'Perdido': '❌',
      'Pausado': '⏸️',
    };
    
    return stageIcons[stage] || '📊';
  };

  return (
    <div className="card-elevated p-6 hover:shadow-lg transition-all duration-200">
      {/* Cabeçalho com nome do negócio */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-on-surface mb-3">
          {businessName}
        </h3>

        {/* Badge do estágio */}
        <div className="flex items-center mb-3">
          <span className="text-lg mr-2">
            {getStageIcon(journeyStage)}
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(journeyStage)}`}
          >
            {journeyStage}
          </span>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface-container rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-secondary mb-1">
            {creatorsCount}
          </div>
          <div className="text-xs text-on-surface-variant">
            Influenciadores
          </div>
        </div>

        <div className="bg-surface-container rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-primary mb-1">
            R$ {(value / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-on-surface-variant">
            Valor
          </div>
        </div>
      </div>

      {/* Próxima ação */}
      <div className="bg-surface-container rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3"></div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-on-surface-variant mb-1">
              Próxima ação:
            </h4>
            <p className="text-sm text-on-surface">
              {nextAction}
            </p>
          </div>
        </div>
      </div>

      {/* Footer com indicador de prioridade */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-on-surface-variant">
          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
          <span>Em andamento</span>
        </div>

        {/* Indicador de urgência baseado no estágio */}
        <div className="flex items-center">
          {(journeyStage === 'Fechamento' || journeyStage === 'Negociação') && (
            <span className="text-xs text-orange-600 font-medium">
              🔥 Urgente
            </span>
          )}
          {journeyStage === 'Agendamento' && (
            <span className="text-xs text-primary font-medium">
              ⏰ Agendar
            </span>
          )}
          {journeyStage === 'Proposta' && (
            <span className="text-xs text-yellow-600 font-medium">
              📝 Aguardando
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
