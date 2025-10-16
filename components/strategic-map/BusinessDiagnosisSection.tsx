import React from 'react';
import type { BusinessDiagnosisContent } from '@/types/strategic-map';
import { RadarChart } from './RadarChart';

interface BusinessDiagnosisSectionProps {
  content: BusinessDiagnosisContent;
}

export function BusinessDiagnosisSection({ content }: BusinessDiagnosisSectionProps) {
  const dimensions = [
    {
      key: 'customer_experience',
      icon: '👥',
      label: 'Experiência do Cliente',
      description: 'Entregar uma vivência memorável e coerente com o propósito da marca.'
    },
    {
      key: 'marketing_promotions',
      icon: '📣',
      label: 'Marketing & Promoções',
      description: 'Atração e fidelização de clientes; performance de influência e mídia.'
    },
    {
      key: 'commercial_relationship',
      icon: '💰',
      label: 'Comercial & Relacionamento',
      description: 'Expansão de receita e relacionamento B2B/B2C.'
    },
    {
      key: 'price_value_perception',
      icon: '💵',
      label: 'Preço & Percepção de Valor',
      description: 'Equilíbrio entre valor percebido, custos e rentabilidade.'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Radar Chart */}
      <div className="w-full">
        <RadarChart
          title="Qualidade do Produto"
          labels={dimensions.map(d => d.label)}
          datasets={[
            {
              label: 'Score Atual',
              data: dimensions.map(d => {
                const score = content.dimensions?.[d.key as keyof typeof content.dimensions] || 0;
                // Converter de 0-10 para 0-5
                return score / 2;
              }),
              backgroundColor: 'rgba(20, 184, 166, 0.2)',
              borderColor: 'rgb(20, 184, 166)',
            },
          ]}
          maxScale={5}
          size="large"
        />
      </div>

      {/* Tabela de Dimensões */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 font-semibold text-gray-700">Dimensão</th>
              <th className="p-3 font-semibold text-gray-700">Foco principal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {dimensions.map((dim) => {
              // Find matching focus area for this dimension
              const focusArea = content.focus_areas?.find(
                (area) => area.dimension.toLowerCase().includes(dim.label.toLowerCase().split(' ')[0])
              );
              return (
                <tr key={dim.key} className="group hover:bg-slate-50">
                  <td className="p-3 font-semibold text-gray-800">
                    {dim.icon} {dim.label}
                  </td>
                  <td className="p-3 text-gray-600">
                    {focusArea?.description || dim.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>


    </div>
  );
}

