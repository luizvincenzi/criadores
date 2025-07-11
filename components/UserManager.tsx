'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface User {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

export default function UserManager() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Usuários para criar
  const usersToCreate: User[] = [
    {
      email: 'connectcityops@gmail.com',
      password: 'admin2345',
      name: 'Connect City Ops',
      role: 'admin'
    },
    {
      email: 'pgabrieldavila@gmail.com',
      password: 'admin2345',
      name: 'Gabriel Davila',
      role: 'admin'
    },
    {
      email: 'marloncpascoal@gmail.com',
      password: 'admin2345',
      name: 'Marlon Pascoal',
      role: 'admin'
    }
  ];

  const createUsersSheet = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('🔧 Iniciando criação da aba Users e usuários...');

    try {
      // Primeiro, criar a aba Users se não existir
      addLog('📋 Criando aba Users...');
      
      const createSheetResponse = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'create_users_sheet'
        })
      });

      const createResult = await createSheetResponse.json();
      
      if (createResult.success) {
        addLog(`✅ ${createResult.message}`);
      } else {
        addLog(`❌ Erro ao criar aba Users: ${createResult.error}`);
        return;
      }

      // Aguardar um pouco para a aba ser criada
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Criar cada usuário
      for (const user of usersToCreate) {
        addLog(`👤 Criando usuário: ${user.email}...`);
        
        const createUserResponse = await fetch('/api/test-sheets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'create_user',
            data: user
          })
        });

        const userResult = await createUserResponse.json();
        
        if (userResult.success) {
          addLog(`✅ Usuário ${user.email} criado com sucesso!`);
        } else {
          addLog(`❌ Erro ao criar ${user.email}: ${userResult.error}`);
        }
      }

      addLog('🎉 Processo de criação de usuários concluído!');
      addLog('🔐 Agora você pode fazer login com qualquer um dos emails criados usando a senha: admin2345');

    } catch (error) {
      addLog(`❌ Erro durante o processo: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAllUsers = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('🧪 Testando login de todos os usuários...');

    try {
      for (const user of usersToCreate) {
        addLog(`🔐 Testando login: ${user.email}...`);
        
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            password: user.password
          })
        });

        const loginResult = await loginResponse.json();
        
        if (loginResult.success) {
          addLog(`✅ Login OK: ${user.email} (${loginResult.user.role})`);
        } else {
          addLog(`❌ Login falhou: ${user.email} - ${loginResult.error}`);
        }
      }

      addLog('🏁 Teste de todos os usuários concluído!');

    } catch (error) {
      addLog(`❌ Erro durante os testes: ${error}`);
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
          Gerenciador de Usuários - CRM Criadores
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
            onClick={testAllUsers}
            disabled={isLoading}
          >
            Testar Logins
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={createUsersSheet}
            disabled={isLoading}
          >
            {isLoading ? 'Criando...' : 'Criar Usuários'}
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        <div className="text-sm font-mono space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500">
              Clique em "Criar Usuários" para configurar a aba Users e criar as contas de administrador
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

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">Usuários que serão criados:</h4>
        <ul className="text-sm text-green-800 space-y-1">
          {usersToCreate.map((user, index) => (
            <li key={index}>
              • <strong>{user.email}</strong> - {user.name} ({user.role})
            </li>
          ))}
        </ul>
        <p className="text-xs text-green-700 mt-2">
          Todos com senha: <strong>admin2345</strong>
        </p>
      </div>
    </div>
  );
}
