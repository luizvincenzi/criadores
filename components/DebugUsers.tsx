'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

export default function DebugUsers() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const debugUsersData = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('🔍 Iniciando debug detalhado da aba Users...');

    try {
      // Buscar dados brutos da aba Users
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
        addLog(`✅ Dados obtidos: ${result.data.length} linhas`);
        
        // Mostrar cada linha em detalhes
        result.data.forEach((row: any[], index: number) => {
          addLog(`📋 Linha ${index + 1}:`);
          row.forEach((cell: any, cellIndex: number) => {
            const headers = ['ID', 'Email', 'Password', 'Name', 'Role', 'Status', 'Created_At', 'Last_Login'];
            const header = headers[cellIndex] || `Col${cellIndex + 1}`;
            addLog(`   ${header}: "${cell}" (tipo: ${typeof cell}, length: ${cell?.length || 0})`);
          });
          addLog('   ---');
        });

        // Teste específico para connectcityops@gmail.com
        addLog('🔍 Procurando connectcityops@gmail.com...');
        const targetEmail = 'connectcityops@gmail.com';
        
        for (let i = 1; i < result.data.length; i++) {
          const row = result.data[i];
          const email = row[1];
          
          addLog(`🔎 Linha ${i + 1}: Email="${email}"`);
          addLog(`   Comparação: "${email}" === "${targetEmail}"`);
          addLog(`   toLowerCase: "${email?.toLowerCase()}" === "${targetEmail.toLowerCase()}"`);
          addLog(`   Match exato: ${email === targetEmail}`);
          addLog(`   Match case-insensitive: ${email?.toLowerCase() === targetEmail.toLowerCase()}`);
          
          if (email?.toLowerCase() === targetEmail.toLowerCase()) {
            addLog(`✅ ENCONTRADO! Dados completos:`);
            addLog(`   ID: "${row[0]}"`);
            addLog(`   Email: "${row[1]}"`);
            addLog(`   Password: "${row[2]}"`);
            addLog(`   Name: "${row[3]}"`);
            addLog(`   Role: "${row[4]}"`);
            addLog(`   Status: "${row[5]}"`);
            addLog(`   Created_At: "${row[6]}"`);
            addLog(`   Last_Login: "${row[7]}"`);
            
            // Teste de login direto
            addLog('🔐 Testando login direto...');
            const loginResponse = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: row[1], // Usar o email exato da planilha
                password: 'admin2345'
              })
            });

            const loginResult = await loginResponse.json();
            
            if (loginResult.success) {
              addLog('✅ Login direto funcionou!');
            } else {
              addLog(`❌ Login direto falhou: ${loginResult.error}`);
              
              // Testar com diferentes senhas
              const possiblePasswords = ['admin2345', 'Admin2345', 'ADMIN2345', row[2]];
              
              for (const pwd of possiblePasswords) {
                addLog(`🔑 Testando senha: "${pwd}"`);
                
                const testResponse = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: row[1],
                    password: pwd
                  })
                });

                const testResult = await testResponse.json();
                
                if (testResult.success) {
                  addLog(`✅ Senha correta encontrada: "${pwd}"`);
                  break;
                } else {
                  addLog(`❌ Senha "${pwd}" não funcionou`);
                }
              }
            }
            
            break;
          }
        }

      } else {
        addLog(`❌ Erro: ${result.error}`);
      }

    } catch (error) {
      addLog(`❌ Erro durante debug: ${error}`);
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
          Debug Detalhado - Aba Users
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
            onClick={debugUsersData}
            disabled={isLoading}
          >
            {isLoading ? 'Analisando...' : 'Debug Completo'}
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        <div className="text-sm font-mono space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500">
              Clique em "Debug Completo" para analisar em detalhes os dados da aba Users
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
        <h4 className="font-medium text-yellow-900 mb-2">O que este debug faz:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Mostra cada linha da aba Users em detalhes</li>
          <li>• Analisa tipos de dados e comprimentos</li>
          <li>• Testa comparações de email (case-sensitive e insensitive)</li>
          <li>• Tenta login com diferentes variações de senha</li>
          <li>• Identifica exatamente onde está o problema</li>
        </ul>
      </div>
    </div>
  );
}
