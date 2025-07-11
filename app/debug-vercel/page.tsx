'use client';

import React, { useState } from 'react';

export default function DebugVercelPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEnvironmentVariables = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('🔍 Testando variáveis de ambiente no Vercel...');

    try {
      const response = await fetch('/api/debug-vercel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test_env' })
      });

      const result = await response.json();
      
      if (result.success) {
        addLog('✅ Variáveis de ambiente OK');
        Object.entries(result.env).forEach(([key, value]) => {
          addLog(`   ${key}: ${value ? '✅ Configurado' : '❌ Não configurado'}`);
        });
      } else {
        addLog(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Erro na requisição: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGoogleSheetsConnection = async () => {
    setIsLoading(true);
    addLog('🔗 Testando conexão com Google Sheets...');

    try {
      const response = await fetch('/api/debug-vercel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test_sheets' })
      });

      const result = await response.json();
      
      if (result.success) {
        addLog('✅ Conexão com Google Sheets OK');
        addLog(`📊 Planilha: ${result.title}`);
        addLog(`📋 Abas encontradas: ${result.sheets.join(', ')}`);
      } else {
        addLog(`❌ Erro na conexão: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Erro na requisição: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAddBusiness = async () => {
    setIsLoading(true);
    addLog('📝 Testando adição de negócio no Vercel...');

    try {
      const response = await fetch('/api/debug-vercel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test_add_business',
          data: {
            businessName: `Teste Vercel ${Date.now()}`,
            category: 'Tecnologia',
            nomeResponsavel: 'Teste Responsável',
            whatsappResponsavel: '(11) 99999-9999'
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        addLog('✅ Negócio adicionado com sucesso no Vercel!');
        addLog('🔍 Verifique a planilha Google Sheets');
      } else {
        addLog(`❌ Erro ao adicionar: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Erro na requisição: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug Vercel - CRM Criadores</h1>
          <p className="text-gray-600">
            Página para testar funcionalidades específicas no ambiente Vercel
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Testes de Produção
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={clearLogs}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Limpar
              </button>
              <button
                onClick={testEnvironmentVariables}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Testar Env Vars
              </button>
              <button
                onClick={testGoogleSheetsConnection}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Testar Sheets
              </button>
              <button
                onClick={testAddBusiness}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Testar Adicionar
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="text-sm font-mono space-y-1">
              {logs.length === 0 ? (
                <p className="text-gray-500">
                  Clique nos botões acima para testar as funcionalidades no Vercel
                </p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-gray-700">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Como usar:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>Testar Env Vars:</strong> Verifica se todas as variáveis de ambiente estão configuradas</li>
              <li>• <strong>Testar Sheets:</strong> Testa a conexão com Google Sheets</li>
              <li>• <strong>Testar Adicionar:</strong> Tenta adicionar um negócio de teste</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
