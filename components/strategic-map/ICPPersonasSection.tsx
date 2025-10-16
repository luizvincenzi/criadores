import React from 'react';
import type { ICPPersonasContent } from '@/types/strategic-map';

interface ICPPersonasSectionProps {
  content: ICPPersonasContent;
}

export function ICPPersonasSection({ content }: ICPPersonasSectionProps) {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-center mb-6 text-gray-800">🧠 Perfis de Clientes Ideais (ICP)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.personas?.map((persona, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{persona.icon || '👤'}</div>
              <h4 className="font-bold text-lg text-gray-800">{persona.name}</h4>
              {persona.status && (
                <p className="text-sm text-gray-500">{persona.status}</p>
              )}
            </div>

            <div className="space-y-3 text-sm">
              {persona.details && persona.details.length > 0 && (
                <div className="space-y-2">
                  {persona.details.map((detail, idx) => (
                    <div key={idx}>
                      <strong className="text-gray-700">{detail.label}:</strong>
                      <p className="text-gray-600">{detail.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {persona.motivations && (
                <div>
                  <strong className="text-gray-700">Motivações:</strong>
                  <p className="text-gray-600">{persona.motivations}</p>
                </div>
              )}

              {persona.pains && (
                <div>
                  <strong className="text-gray-700">Dores:</strong>
                  <p className="text-gray-600">{persona.pains}</p>
                </div>
              )}

              {persona.channels && (
                <div>
                  <strong className="text-gray-700">Canais:</strong>
                  <p className="text-gray-600">{persona.channels}</p>
                </div>
              )}

              {persona.quote && (
                <div className="bg-gray-50 p-3 rounded-lg italic text-gray-700 border-l-4 border-blue-500">
                  "{persona.quote}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {content.matrix && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {content.matrix.core && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✅ ICP Core</h4>
              <p className="text-sm text-green-800">{content.matrix.core}</p>
            </div>
          )}
          {content.matrix.premium && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💎 ICP Premium</h4>
              <p className="text-sm text-blue-800">{content.matrix.premium}</p>
            </div>
          )}
          {content.matrix.volume && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">🧩 ICP Volume</h4>
              <p className="text-sm text-orange-800">{content.matrix.volume}</p>
            </div>
          )}
          {content.matrix.anti && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">❌ Anti-ICP</h4>
              <p className="text-sm text-red-800">{content.matrix.anti}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

