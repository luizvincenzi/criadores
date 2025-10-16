import React from 'react';
import type { ProductAnalysisContent } from '@/types/strategic-map';

interface ProductAnalysisSectionProps {
  content: ProductAnalysisContent;
}

export function ProductAnalysisSection({ content }: ProductAnalysisSectionProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          <path d="M5 3v4"/>
          <path d="M19 17v4"/>
          <path d="M3 5h4"/>
          <path d="M17 19h4"/>
        </svg>
        Análise do Produto/Serviço
      </h3>
      <div className="text-sm text-gray-700 space-y-4">
        {content.menu_analysis && (
          <p>{content.menu_analysis}</p>
        )}

        {content.strengths && content.strengths.length > 0 && (
          <div>
            <strong className="text-green-600 font-bold block mb-2">[Pontos Fortes]</strong>
            <ul className="list-disc list-inside space-y-1 ml-2">
              {content.strengths.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {content.opportunities && content.opportunities.length > 0 && (
          <div>
            <strong className="text-sky-600 font-bold block mb-2">[Oportunidades de Melhoria]</strong>
            <ul className="list-disc list-inside space-y-1 ml-2">
              {content.opportunities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

