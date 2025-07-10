import React from 'react';
import Image from 'next/image';

interface InfluencerCardProps {
  avatarUrl: string;
  name: string;
  username: string;
  followers: number;
  engagementRate: number;
  businessName?: string;
}

export default function InfluencerCard({
  avatarUrl,
  name,
  username,
  followers,
  engagementRate,
  businessName
}: InfluencerCardProps) {
  // Função para formatar número de seguidores
  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="card-elevated p-6 hover:shadow-lg transition-all duration-200">
      {/* Avatar e informações principais */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="relative w-16 h-16 mb-3">
          <Image
            src={avatarUrl || '/placeholder-avatar.svg'}
            alt={`Avatar de ${name}`}
            fill
            className="rounded-full object-cover"
            sizes="64px"
          />
        </div>

        <h3 className="text-lg font-semibold text-on-surface mb-1">
          {name}
        </h3>

        <p className="text-sm text-on-surface-variant mb-1">
          @{username}
        </p>

        {businessName && (
          <p className="text-xs text-primary mb-3 font-medium">
            🏢 {businessName}
          </p>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center bg-surface-container rounded-lg p-3">
          <div className="text-xl font-bold text-primary mb-1">
            {formatFollowers(followers)}
          </div>
          <div className="text-xs text-on-surface-variant uppercase tracking-wide">
            Seguidores
          </div>
        </div>

        <div className="text-center bg-surface-container rounded-lg p-3">
          <div className="text-xl font-bold text-secondary mb-1">
            {engagementRate.toFixed(1)}%
          </div>
          <div className="text-xs text-on-surface-variant uppercase tracking-wide">
            Engajamento
          </div>
        </div>
      </div>

      {/* Indicador de status de engajamento */}
      <div className="flex items-center justify-center">
        <div
          className={`w-2 h-2 rounded-full mr-2 ${
            engagementRate >= 5
              ? 'bg-green-500'
              : engagementRate >= 2
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-on-surface-variant">
          {engagementRate >= 5
            ? 'Alto engajamento'
            : engagementRate >= 2
            ? 'Engajamento médio'
            : 'Baixo engajamento'
          }
        </span>
      </div>
    </div>
  );
}
