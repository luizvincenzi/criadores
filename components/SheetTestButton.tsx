'use client';

import React, { useState } from 'react';
import Button from './ui/Button';

export default function SheetTestButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testSheetConnection = async () => {
    setLoading(true);
    setError(null);
    setResult([]);

    try {
      const { getBusinessNames } = await import('@/app/actions/sheetsActions');
      const businessNames = await getBusinessNames();
      
      if (businessNames.length > 0) {
        setResult(businessNames);
      } else {
        setError('Nenhum dado encontrado na coluna A da aba Business');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-surface-container rounded-xl">
      <div className="mb-4">
        <Button 
          onClick={testSheetConnection}
          loading={loading}
          variant="primary"
          icon="🔗"
        >
          Testar Conexão com Planilha
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-tertiary-container text-on-tertiary-container rounded-lg mb-4">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {result.length > 0 && (
        <div className="p-3 bg-secondary-container text-on-secondary-container rounded-lg">
          <strong>Negócios encontrados ({result.length}):</strong>
          <ul className="mt-2 space-y-1">
            {result.map((name, index) => (
              <li key={index} className="text-sm">
                {index + 1}. {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
