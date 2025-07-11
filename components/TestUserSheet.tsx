'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

export default function TestUserSheet() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testUserSheet = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('🔍 Iniciando verificação da aba Users...');

    try {
      // Teste 1: Verificar se a aba Users existe e tem dados
      addLog('📋 Buscando dados da aba Users...');
      
      const response = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'get_users_data'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        addLog(`✅ Aba Users encontrada com ${result.data.length} linhas`);
        
        // Mostrar estrutura da aba
        if (result.data.length > 0) {
          addLog(`📊 Cabeçalho: ${JSON.stringify(result.data[0])}`);
          
          // Procurar pelo usuário específico
          const userEmail = 'connectcityops@gmail.com';
          let userFound = false;

          for (let i = 1; i < result.data.length; i++) {
            const row = result.data[i];
            const emailInSheet = row[1];

            addLog(`🔍 Verificando linha ${i + 1}: "${emailInSheet}" vs "${userEmail}"`);

            if (emailInSheet && emailInSheet.toString().trim().toLowerCase() === userEmail.toLowerCase()) {
              userFound = true;
              addLog(`✅ Usuário encontrado na linha ${i + 1}:`);
              addLog(`   📧 Email: "${row[1]}"`);
              addLog(`   🔑 Senha: "${row[2] || 'NÃO DEFINIDA'}"`);
              addLog(`   👤 Nome: "${row[3] || 'NÃO DEFINIDO'}"`);
              addLog(`   🎭 Role: "${row[4] || 'NÃO DEFINIDO'}"`);
              addLog(`   📊 Status: "${row[5] || 'NÃO DEFINIDO'}"`);
              addLog(`   📅 Criado em: "${row[6] || 'NÃO DEFINIDO'}"`);
              addLog(`   🕐 Último login: "${row[7] || 'NUNCA'}"`);

              // Teste de login com a senha exata da planilha
              addLog('🔐 Testando login com senha da planilha...');
              const testLoginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: row[1].toString().trim(),
                  password: row[2].toString().trim()
                })
              });

              const testLoginResult = await testLoginResponse.json();

              if (testLoginResult.success) {
                addLog('✅ Login com senha da planilha funcionou!');
              } else {
                addLog(`❌ Login com senha da planilha falhou: ${testLoginResult.error}`);
                addLog(`🔍 Senha na planilha: "${row[2]}" (length: ${row[2]?.length})`);
              }

              break;
            }
          }
          
          if (!userFound) {
            addLog(`❌ Usuário ${userEmail} NÃO encontrado na aba Users`);
            addLog('📝 Usuários encontrados:');
            for (let i = 1; i < result.data.length; i++) {
              const row = result.data[i];
              if (row[1]) {
                addLog(`   - ${row[1]} (${row[3] || 'Sem nome'})`);
              }
            }
          }
        } else {
          addLog('⚠️ Aba Users está vazia (só cabeçalho ou sem dados)');
        }
      } else {
        addLog(`❌ Erro ao buscar aba Users: ${result.error}`);
      }

      // Teste 2: Tentar fazer login com as credenciais
      addLog('🔐 Testando login com as credenciais...');
      
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'connectcityops@gmail.com',
          password: 'admin2345'
        })
      });

      const loginResult = await loginResponse.json();
      
      if (loginResult.success) {
        addLog('✅ Login realizado com sucesso!');
        addLog(`👤 Usuário: ${loginResult.user.name}`);
        addLog(`🎭 Role: ${loginResult.user.role}`);
        addLog(`📊 Status: ${loginResult.user.status}`);
      } else {
        addLog(`❌ Falha no login: ${loginResult.error}`);
      }

    } catch (error) {
      addLog(`❌ Erro durante o teste: ${error}`);
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
          Verificação de Usuário - Google Sheets
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
            onClick={testUserSheet}
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Verificar Usuário'}
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        <div className="text-sm font-mono space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500">
              Clique em "Verificar Usuário" para testar o usuário connectcityops@gmail.com
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
        <h4 className="font-medium text-blue-900 mb-2">Informações do Teste:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Email:</strong> connectcityops@gmail.com</li>
          <li>• <strong>Senha:</strong> admin2345</li>
          <li>• <strong>Planilha:</strong> 14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI</li>
          <li>• <strong>Aba:</strong> Users</li>
        </ul>
      </div>
    </div>
  );
}
