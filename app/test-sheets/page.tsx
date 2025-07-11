'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TestSheetsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
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
    <div className="min-h-screen bg-surface-dim p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Teste Google Sheets</h1>
          <p className="text-on-surface-variant">
            Teste a conexão com a planilha: 14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Conexão com Google Sheets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testConnection}
              loading={loading}
              variant="primary"
              icon="🔗"
            >
              Testar Conexão
            </Button>

            {error && (
              <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-xl">
                <strong>Erro:</strong> {error}
              </div>
            )}

            {result.length > 0 && (
              <div className="p-4 bg-secondary-container text-on-secondary-container rounded-xl">
                <strong>✅ Sucesso! Negócios encontrados ({result.length}):</strong>
                <ul className="mt-3 space-y-1 max-h-60 overflow-y-auto">
                  {result.map((name, index) => (
                    <li key={index} className="text-sm p-2 bg-surface rounded">
                      {index + 1}. {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Planilha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>ID da Planilha:</strong> 14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI</p>
              <p><strong>Aba:</strong> Business</p>
              <p><strong>Range:</strong> A:A (apenas coluna A)</p>
              <p><strong>Formato esperado:</strong> Nomes dos negócios na coluna A, linha 1 = cabeçalho</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
