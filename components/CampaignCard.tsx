import React from 'react';

interface CampaignCardProps {
  campaignTitle: string;
  brief: string;
  startDate: string;
  endDate: string;
  status: string;
  businessName?: string;
}

export default function CampaignCard({
  campaignTitle,
  brief,
  startDate,
  endDate,
  status,
  businessName
}: CampaignCardProps) {
  // Função para determinar a cor do badge baseado no status
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'Ativa': 'bg-green-100 text-green-800 border-green-200',
      'Planejamento': 'bg-blue-100 text-blue-800 border-blue-200',
      'Em Aprovação': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Pausada': 'bg-orange-100 text-orange-800 border-orange-200',
      'Finalizada': 'bg-gray-100 text-gray-800 border-gray-200',
      'Cancelada': 'bg-red-100 text-red-800 border-red-200',
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Função para determinar o ícone baseado no status
  const getStatusIcon = (status: string): string => {
    const statusIcons: Record<string, string> = {
      'Ativa': '🚀',
      'Planejamento': '📋',
      'Em Aprovação': '⏳',
      'Pausada': '⏸️',
      'Finalizada': '✅',
      'Cancelada': '❌',
    };
    
    return statusIcons[status] || '📊';
  };

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Função para calcular duração da campanha
  const calculateDuration = (start: string, end: string): string => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 dia';
      if (diffDays < 30) return `${diffDays} dias`;
      if (diffDays < 365) return `${Math.round(diffDays / 30)} meses`;
      return `${Math.round(diffDays / 365)} anos`;
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="card-elevated p-6 hover:shadow-lg transition-all duration-200">
      {/* Cabeçalho */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-on-surface flex-1 mr-3">
            {campaignTitle}
          </h3>

          {/* Badge de status */}
          <div className="flex items-center">
            <span className="text-lg mr-2">
              {getStatusIcon(status)}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Negócio associado */}
      {businessName && (
        <div className="mb-3">
          <span className="text-xs text-primary font-medium bg-primary-container px-2 py-1 rounded-full">
            🏢 {businessName}
          </span>
        </div>
      )}

      {/* Brief da campanha */}
      <div className="mb-4">
        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
          {brief}
        </p>
      </div>

      {/* Informações de período */}
      <div className="bg-surface-container rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-on-surface-variant font-medium block mb-1">
              Início:
            </span>
            <span className="text-on-surface">
              {formatDate(startDate)}
            </span>
          </div>

          <div>
            <span className="text-on-surface-variant font-medium block mb-1">
              Fim:
            </span>
            <span className="text-on-surface">
              {formatDate(endDate)}
            </span>
          </div>

          <div>
            <span className="text-on-surface-variant font-medium block mb-1">
              Duração:
            </span>
            <span className="text-on-surface">
              {calculateDuration(startDate, endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer com indicadores */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-on-surface-variant">
          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
          <span>Campanha de Marketing</span>
        </div>

        {/* Indicador de urgência baseado no status e datas */}
        <div className="flex items-center">
          {status === 'Ativa' && (
            <span className="text-xs text-green-600 font-medium">
              🟢 Em execução
            </span>
          )}
          {status === 'Em Aprovação' && (
            <span className="text-xs text-yellow-600 font-medium">
              ⏳ Aguardando
            </span>
          )}
          {status === 'Planejamento' && (
            <span className="text-xs text-primary font-medium">
              📋 Em preparação
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
