'use client';

import React, { useState } from 'react';
import Button from './ui/Button';

export default function DebugBusinessSheet() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkBusinessSheet = async () => {
    setLoading(true);
    setResult('🔍 Verificando estrutura da aba Business...');

    try {
      const response = await fetch('/api/debug-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'check_business_structure' })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        let output = `✅ Aba Business encontrada!\n\n`;
        output += `📊 Total de linhas: ${result.totalRows}\n`;
        output += `📋 Cabeçalhos: ${result.headers.join(', ')}\n\n`;
        
        if (result.businesses && result.businesses.length > 0) {
          output += `🏢 Businesses encontrados:\n`;
          result.businesses.forEach((business: any, index: number) => {
            output += `${index + 1}. "${business.name}" - Status: "${business.status}" (Linha ${business.row})\n`;
          });
        } else {
          output += `⚠️ Nenhum business encontrado na aba`;
        }

        setResult(output);
      } else {
        setResult(`❌ Erro: ${result.error}`);
      }

    } catch (error) {
      setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testBusinessUpdate = async () => {
    setLoading(true);
    setResult('🧪 Testando atualização específica...');

    try {
      const response = await fetch('/api/debug-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test_update_business',
          businessName: 'Loja de Roupas Fashion',
          newStatus: 'Agendamentos'
        })
      });

      const result = await response.json();

      if (result.success) {
        setResult(`✅ Teste de atualização concluído!
        
🔍 Business encontrado: ${result.found ? 'Sim' : 'Não'}
📍 Linha encontrada: ${result.rowIndex || 'N/A'}
🔄 Atualização realizada: ${result.updated ? 'Sim' : 'Não'}
📝 Detalhes: ${result.details || 'N/A'}`);
      } else {
        setResult(`❌ Falha no teste: ${result.error}`);
      }

    } catch (error) {
      setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
      <h3 className="font-bold text-red-800 mb-4">🔍 Debug da Aba Business</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outlined" 
          size="sm" 
          onClick={checkBusinessSheet}
          loading={loading}
          icon="🔍"
        >
          Verificar Estrutura
        </Button>
        
        <Button 
          variant="outlined" 
          size="sm" 
          onClick={testBusinessUpdate}
          loading={loading}
          icon="🧪"
        >
          Testar Atualização
        </Button>
      </div>

      {result && (
        <div className={`p-3 rounded text-sm whitespace-pre-line font-mono ${
          result.startsWith('✅') 
            ? 'bg-green-100 text-green-800' 
            : result.startsWith('❌')
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {result}
        </div>
      )}

      <div className="mt-4 p-3 bg-white rounded border text-xs text-gray-600">
        <strong>Este debug vai mostrar:</strong><br/>
        1. Se a aba "Business" existe<br/>
        2. Quantas linhas tem<br/>
        3. Quais são os cabeçalhos<br/>
        4. Quais businesses estão listados<br/>
        5. Se consegue encontrar e atualizar um business específico
      </div>
    </div>
  );
}
