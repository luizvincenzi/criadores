'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

export default function TestAddBusiness() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAddBusiness = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('🧪 Testando adição de negócio...');

    try {
      // Importar a função
      const { addBusinessToSheet } = await import('@/app/actions/sheetsActions');
      
      // Dados de teste
      const testBusinessData = [
        'Teste Negócio ' + Date.now(),  // A = Nome
        'Tecnologia',                   // B = Categoria
        'Premium',                      // C = Plano atual
        'João Silva',                   // D = Comercial
        'Maria Santos',                 // E = Nome Responsável
        'São Paulo',                    // F = Cidade
        '(11) 99999-9999',             // G = WhatsApp Responsável
        'Indicação',                    // H = Prospecção
        'Pedro Costa',                  // I = Responsável
        '@testnegocio',                 // J = Instagram
        'Não',                          // K = Grupo WhatsApp criado
        'Não',                          // L = Contrato assinado e enviado
        '',                             // M = Data assinatura do contrato
        '',                             // N = Contrato válido até
        '',                             // O = Related files
        'Negócio de teste criado automaticamente' // P = Notes
      ];

      addLog('📝 Dados preparados para envio...');
      addLog(`Nome: ${testBusinessData[0]}`);
      addLog(`Categoria: ${testBusinessData[1]}`);
      addLog(`Responsável: ${testBusinessData[4]}`);

      // Tentar adicionar
      await addBusinessToSheet(testBusinessData);
      
      addLog('✅ Negócio adicionado com sucesso!');
      addLog('🔍 Verifique a planilha Google Sheets para confirmar');

    } catch (error: any) {
      addLog(`❌ Erro ao adicionar negócio: ${error.message}`);
      console.error('Erro completo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Teste - Adicionar Negócio
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="outlined"
            size="sm"
            onClick={clearLogs}
            disabled={isLoading}
          >
            Limpar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={testAddBusiness}
            disabled={isLoading}
          >
            {isLoading ? 'Testando...' : 'Testar Adição'}
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        <div className="text-sm font-mono space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500">
              Clique em "Testar Adição" para verificar se a função de adicionar negócio está funcionando
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

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">O que este teste faz:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Cria um negócio de teste com dados válidos</li>
          <li>• Testa a função addBusinessToSheet diretamente</li>
          <li>• Mostra erros detalhados se houver problemas</li>
          <li>• Confirma se a integração com Google Sheets está funcionando</li>
        </ul>
      </div>
    </div>
  );
}
