import React from 'react';
import type { MarketAnalysisContent } from '@/types/strategic-map';

interface MarketAnalysisSectionProps {
  content: MarketAnalysisContent;
}

export function MarketAnalysisSection({ content }: MarketAnalysisSectionProps) {
  const getVolumeColor = (volume: string) => {
    switch (volume.toLowerCase()) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-orange-300 text-gray-800';
      case 'low':
        return 'bg-yellow-200 text-gray-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getVolumeLabel = (volume: string) => {
    switch (volume.toLowerCase()) {
      case 'high':
        return 'ALTA';
      case 'medium':
        return 'MÉDIA';
      case 'low':
        return 'BAIXA';
      default:
        return volume.toUpperCase();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {/* Mapa de Calor: Buscas Locais */}
      <div>
        <h3 className="font-bold text-lg mb-2 text-center">Mapa de Calor: Buscas Locais</h3>
        <p className="text-center text-sm text-gray-600 mb-4">
          Termos mais buscados relacionados ao seu negócio
        </p>
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          {content.search_terms?.map((term, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="font-medium">"{term.term}"</span>
              <span className={`font-bold px-3 py-1 rounded-full ${getVolumeColor(term.volume)}`}>
                {getVolumeLabel(term.volume)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Crescimento Digital */}
      <div>
        <h3 className="font-bold text-lg mb-2 text-center">Crescimento Digital do Setor</h3>
        <p className="text-center text-sm text-gray-600 mb-4">
          Tendência de crescimento no mercado
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          {content.digital_growth && (
            <div className="space-y-2">
              {content.digital_growth.labels?.map((label, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-12">{label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full flex items-center justify-end pr-2 text-xs text-white font-bold transition-all"
                      style={{
                        width: `${(content.digital_growth.data[index] / Math.max(...content.digital_growth.data)) * 100}%`
                      }}
                    >
                      {content.digital_growth.data[index]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Oportunidade e Diferencial */}
      <div className="md:col-span-2 grid md:grid-cols-2 gap-4 mt-4">
        <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-teal-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                <polyline points="16 7 22 7 22 13"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Oportunidade Principal</h3>
          </div>
          <p className="text-gray-600 text-sm">{content.main_opportunity}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                <path d="M6 3h12l4 6-10 13L2 9Z"/>
                <path d="M12 22V9"/>
                <path d="m3.29 9 8.71 13 8.71-13"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Diferencial Competitivo</h3>
          </div>
          <p className="text-gray-600 text-sm">{content.competitive_advantage}</p>
        </div>
      </div>
    </div>
  );
}

