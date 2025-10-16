import React from 'react';
import type { KPITableContent } from '@/types/strategic-map';
import { RadarChart } from './RadarChart';

interface KPITableSectionProps {
  content: KPITableContent;
}

const getStatusIcon = (matrix: string): string => {
  switch (matrix) {
    case 'core': return '✅';
    case 'premium': return '🚀';
    case 'volume': return '🌱';
    case 'anti': return '❌';
    default: return '📊';
  }
};

const getStatusLabel = (matrix: string): { text: string; color: string } => {
  switch (matrix) {
    case 'core': return { text: 'Core', color: 'bg-green-100 text-green-800 border-green-300' };
    case 'premium': return { text: 'Crescimento', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'volume': return { text: 'Em expansão', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    case 'anti': return { text: 'Evitar', color: 'bg-red-100 text-red-800 border-red-300' };
    default: return { text: 'Indefinido', color: 'bg-gray-100 text-gray-800 border-gray-300' };
  }
};

export function KPITableSection({ content }: KPITableSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-center mb-6 text-gray-800">� Tabela de Indicadores</h3>

      {/* Radar de Performance por ICP */}
      {content.icps && content.icps.length > 0 && (
        <RadarChart
          title="Radar de Performance por ICP"
          labels={['LTV / Retenção', 'Ticket Médio', 'Fit de Marca', 'Rentabilidade', 'Satisfação (NPS)']}
          datasets={content.icps.slice(0, 3).map((icp) => {
            // Normalizar métricas para escala 0-5
            const ltv = Math.min((icp.metrics.ltv_6m.value / 200), 5);
            const ticket = Math.min((icp.metrics.avg_ticket.value / 40), 5);
            const fit = Math.min((icp.metrics.base_percentage.value / 20), 5);
            const rentability = Math.min(((icp.metrics.ltv_6m.value / icp.metrics.cac.value)), 5);
            const nps = icp.metrics.nps.value / 2; // NPS de 0-10 para 0-5

            return {
              label: icp.name,
              data: [ltv, ticket, fit, rentability, nps],
            };
          })}
          maxScale={5}
          size="large"
        />
      )}

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 border-b-2 border-gray-300">
            <tr>
              <th className="p-3 font-semibold text-gray-700">ICP</th>
              <th className="p-3 text-center font-semibold text-gray-700">% Base</th>
              <th className="p-3 text-center font-semibold text-gray-700">Ticket Médio</th>
              <th className="p-3 text-center font-semibold text-gray-700">LTV (6m)</th>
              <th className="p-3 text-center font-semibold text-gray-700">CAC</th>
              <th className="p-3 font-semibold text-gray-700">Canal Principal</th>
              <th className="p-3 text-center font-semibold text-gray-700">NPS ⭐</th>
              <th className="p-3 text-center font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {content.icps?.map((icp, index) => {
              const status = getStatusLabel(icp.matrix || 'core');
              const icon = getStatusIcon(icp.matrix || 'core');

              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icp.icon || '👤'}</span>
                      <span className="font-medium text-gray-800">{icp.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center text-gray-600 font-medium">{icp.metrics.base_percentage.value}%</td>
                  <td className="p-3 text-center text-gray-600 font-medium">
                    R$ {icp.metrics.avg_ticket.value.toFixed(0)}
                  </td>
                  <td className="p-3 text-center text-gray-600 font-medium">
                    R$ {icp.metrics.ltv_6m.value.toFixed(0)}
                  </td>
                  <td className="p-3 text-center text-gray-600 font-medium">
                    R$ {icp.metrics.cac.value.toFixed(0)}
                  </td>
                  <td className="p-3 text-gray-600">{icp.metrics.main_channel.value}</td>
                  <td className="p-3 text-center">
                    <span className={`font-bold text-lg ${
                      icp.metrics.nps.value >= 8 ? 'text-green-600' :
                      icp.metrics.nps.value >= 6 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {icp.metrics.nps.value.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                      {icon} {status.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {content.insights && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {content.insights.most_profitable && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-1 text-sm">🏆 Mais Lucrativo</h4>
              <p className="text-xs text-blue-800">{content.insights.most_profitable}</p>
            </div>
          )}
          {content.insights.expansion_potential && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-1 text-sm">🚀 Potencial de Expansão</h4>
              <p className="text-xs text-green-800">{content.insights.expansion_potential}</p>
            </div>
          )}
          {content.insights.main_channels && content.insights.main_channels.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-1 text-sm">📱 Canais Principais</h4>
              <p className="text-xs text-purple-800">{content.insights.main_channels.join(', ')}</p>
            </div>
          )}
          {content.insights.maturity_score && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-1 text-sm">📊 Maturidade do ICP</h4>
              <p className="text-xs text-orange-800">Score: {content.insights.maturity_score}/10</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

