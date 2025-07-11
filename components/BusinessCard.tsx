import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';

interface BusinessCardProps {
  businessName: string;
  journeyStage: string;
  nextAction: string;
  creatorsCount?: number;
  value?: number;
  avatar?: string;
  lastUpdate?: string;
  onClick?: () => void;
}

export default function BusinessCard({
  businessName,
  journeyStage,
  nextAction,
  creatorsCount = 0,
  value = 0,
  avatar,
  lastUpdate = 'Hoje',
  onClick
}: BusinessCardProps) {
  // Função para determinar a variante do badge baseado no estágio
  const getBadgeVariant = (stage: string): 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'neutral' => {
    const stageVariants: Record<string, 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'neutral'> = {
      'Agendamentos': 'primary',
      'Reunião Briefing': 'warning',
      'Proposta': 'warning',
      'Negociação': 'warning',
      'Fechamento': 'success',
      'Entrega Final': 'success',
      'Pós-venda': 'secondary',
      'Perdido': 'error',
      'Pausado': 'neutral',
    };

    return stageVariants[stage] || 'neutral';
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

  // Gerar avatar com iniciais se não fornecido
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className="cursor-pointer group hover:scale-105 transition-all duration-300 animate-fade-in"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        {/* Avatar e Info Principal */}
        <div className="flex items-start space-x-4">
          <Avatar
            size="xl"
            variant="rounded"
            src={avatar}
            fallback={businessName}
            className="shadow-md"
          />

          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
              {businessName}
            </CardTitle>

            {/* Badge do estágio */}
            <div className="flex items-center space-x-2">
              <Badge
                variant={getBadgeVariant(journeyStage)}
                icon={getStageIcon(journeyStage)}
              >
                {journeyStage}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Métricas Visíveis */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-surface-container rounded-xl p-4 text-center hover:bg-surface-container-high transition-colors">
            <div className="text-2xl font-bold text-secondary mb-1">
              {creatorsCount}
            </div>
            <div className="text-sm text-on-surface-variant font-medium">
              Criadores
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-4 text-center hover:bg-surface-container-high transition-colors">
            <div className="text-2xl font-bold text-primary mb-1">
              R$ {(value / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-on-surface-variant font-medium">
              Valor
            </div>
          </div>
        </div>

        {/* Próxima ação */}
        <div className="bg-surface-variant rounded-xl p-4 border-l-4 border-primary">
          <div className="text-sm text-on-surface-variant mb-1 font-medium">
            Próxima ação:
          </div>
          <div className="text-sm text-on-surface font-medium">
            {nextAction}
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <div className="text-xs text-on-surface-variant">
          Atualizado {lastUpdate}
        </div>

        <div className="flex space-x-2">
          <Button variant="text" size="sm">
            Editar
          </Button>
          <Button variant="primary" size="sm">
            Ver Detalhes
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
