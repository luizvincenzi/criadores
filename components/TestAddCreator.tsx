'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

export default function TestAddCreator() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAddCreator = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('🧪 Testando adição de criador...');

    try {
      // Dados de teste
      const testCreatorData = {
        nome: `Teste Criador ${Date.now()}`,
        status: 'Ativo',
        whatsapp: '(11) 99999-9999',
        cidade: 'São Paulo',
        prospeccao: 'Indicação',
        responsavel: 'João Silva',
        instagram: '@testecriador',
        seguidoresInstagram: '10000',
        tiktok: '@testecriador_tiktok',
        seguidoresTiktok: '5000',
        onboardingInicial: 'Sim',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        relatedFiles: '',
        notes: 'Criador de teste criado automaticamente',
        perfil: 'Micro',
        preferencias: 'Lifestyle, Moda',
        naoAceita: 'Bebidas alcoólicas',
        descricaoCriador: 'Criador focado em lifestyle e moda para público jovem'
      };

      addLog('📝 Dados preparados para envio...');
      addLog(`Nome: ${testCreatorData.nome}`);
      addLog(`Status: ${testCreatorData.status}`);
      addLog(`Instagram: ${testCreatorData.instagram}`);

      // Testar via API
      addLog('🚀 Enviando via API /api/add-creator...');
      
      const response = await fetch('/api/add-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCreatorData)
      });

      addLog(`📡 Status da resposta: ${response.status}`);
      
      const result = await response.json();
      addLog(`📊 Resposta da API: ${JSON.stringify(result)}`);
      
      if (result.success) {
        addLog('✅ Criador adicionado com sucesso!');
        addLog('🔍 Verifique a planilha Google Sheets aba "Creators"');
      } else {
        addLog(`❌ Falha na API: ${result.error}`);
      }

    } catch (error: any) {
      addLog(`❌ Erro durante o teste: ${error.message}`);
      console.error('Erro completo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFunction = async () => {
    setIsLoading(true);
    addLog('🔧 Testando função direta addCreatorToSheet...');

    try {
      // Importar a função
      const { addCreatorToSheet } = await import('@/app/actions/sheetsActions');
      
      // Dados de teste seguindo a ordem exata da planilha
      const testCreatorData = [
        `Teste Direto ${Date.now()}`,  // A = Nome
        'Ativo',                       // B = Status
        '(11) 88888-8888',            // C = WhatsApp
        'Rio de Janeiro',              // D = Cidade
        'Rede social',                 // E = Prospecção
        'Maria Santos',                // F = Responsável
        '@testedireto',                // G = Instagram
        '15000',                       // H = Seguidores instagram - Maio 2025
        '@testedireto_tt',             // I = TikTok
        '8000',                        // J = Seguidores TikTok - julho 25
        'Não',                         // K = Onboarding Inicial
        '2024-02-01',                  // L = Start date
        '2024-11-30',                  // M = End date
        '',                            // N = Related files
        'Teste função direta',         // O = Notes
        'Nano',                        // P = Perfil
        'Beleza, Skincare',            // Q = Preferências
        'Produtos testados em animais', // R = Não aceita
        'Criador especializado em beleza natural' // S = Descrição do criador
      ];

      addLog('📝 Dados preparados para função direta...');
      addLog(`Nome: ${testCreatorData[0]}`);
      addLog(`Status: ${testCreatorData[1]}`);
      addLog(`Instagram: ${testCreatorData[6]}`);

      // Tentar adicionar
      await addCreatorToSheet(testCreatorData);
      
      addLog('✅ Criador adicionado via função direta!');
      addLog('🔍 Verifique a planilha Google Sheets aba "Creators"');

    } catch (error: any) {
      addLog(`❌ Erro na função direta: ${error.message}`);
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
          Teste - Adicionar Criador
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
            variant="secondary"
            size="sm"
            onClick={testDirectFunction}
            disabled={isLoading}
          >
            Teste Direto
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={testAddCreator}
            disabled={isLoading}
          >
            {isLoading ? 'Testando...' : 'Testar API'}
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        <div className="text-sm font-mono space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500">
              Clique em "Testar API" para verificar se a função de adicionar criador está funcionando
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

      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <h4 className="font-medium text-purple-900 mb-2">O que este teste faz:</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• <strong>Testar API:</strong> Testa o endpoint /api/add-creator completo</li>
          <li>• <strong>Teste Direto:</strong> Testa a função addCreatorToSheet diretamente</li>
          <li>• Mostra erros detalhados se houver problemas</li>
          <li>• Confirma se a integração com Google Sheets está funcionando</li>
          <li>• Verifica se a aba "Creators" existe e está acessível</li>
        </ul>
      </div>
    </div>
  );
}
