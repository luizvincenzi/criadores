'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

interface ConfigStatus {
  configured: boolean;
  missingCount: number;
  readyForConnection: boolean;
}

interface DebugData {
  envVars: Record<string, string | undefined>;
  appConfig: Record<string, any>;
  missingConfigs: string[];
  metaBusinessUrls: Record<string, string>;
  testAuthUrl: string;
  status: ConfigStatus;
  instructions: Record<string, string>;
}

export default function InstagramSetupPage() {
  const { user } = useAuthStore();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState('');

  // Verificar se é administrador
  const isAdmin = user?.email === 'luizvincenzi@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadDebugInfo();
    }
  }, [isAdmin]);

  const loadDebugInfo = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/instagram/debug-config');
      const data = await response.json();
      
      if (data.success) {
        setDebugData(data.data);
        console.log('✅ Debug info carregada:', data.data);
      } else {
        setMessage(`Erro ao carregar configurações: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar debug info:', error);
      setMessage('Erro ao carregar informações de configuração');
    } finally {
      setIsLoading(false);
    }
  };

  const connectInstagram = async () => {
    setIsConnecting(true);
    setMessage('');
    
    try {
      const response = await authenticatedFetch('/api/instagram/connect', {
        method: 'POST',
        body: JSON.stringify({
          businessId: user?.business_id || process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirecionar para URL de autorização do Instagram
        window.location.href = data.authUrl;
      } else {
        setMessage(`❌ ${data.error}`);
        console.error('Erro na conexão:', data);
      }
    } catch (error) {
      console.error('❌ Erro ao conectar Instagram:', error);
      setMessage('❌ Erro ao conectar com Instagram');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              📱 Configuração do Instagram
            </h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                ⚠️ Esta página é apenas para administradores. Entre em contato com o suporte para configurar sua conta do Instagram.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📱 Configuração do Instagram Business
          </h1>
          <p className="text-gray-600 mb-6">
            Configure e teste a integração com o Instagram Business API
          </p>

          {/* Status da Configuração */}
          {debugData && (
            <div className={`p-4 rounded-lg mb-6 ${
              debugData.status.configured 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                <span className={`text-2xl mr-2 ${
                  debugData.status.configured ? 'text-green-600' : 'text-red-600'
                }`}>
                  {debugData.status.configured ? '✅' : '❌'}
                </span>
                <h3 className={`font-semibold ${
                  debugData.status.configured ? 'text-green-800' : 'text-red-800'
                }`}>
                  {debugData.status.configured 
                    ? 'Instagram API Configurado' 
                    : 'Instagram API Não Configurado'
                  }
                </h3>
              </div>
              
              {!debugData.status.configured && (
                <div className="text-red-700">
                  <p className="mb-2">
                    <strong>Configurações faltando ({debugData.missingConfigs.length}):</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4">
                    {debugData.missingConfigs.map((config, index) => (
                      <li key={index}>{config}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={loadDebugInfo}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Carregando...
                </>
              ) : (
                <>
                  🔄 Verificar Configuração
                </>
              )}
            </button>

            {debugData?.status.configured && (
              <button
                onClick={connectInstagram}
                disabled={isConnecting}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Conectando...
                  </>
                ) : (
                  <>
                    📱 Conectar Instagram
                  </>
                )}
              </button>
            )}
          </div>

          {/* Mensagem */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Informações de Debug */}
          {debugData && (
            <div className="grid gap-6">
              {/* Variáveis de Ambiente */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">🔧 Variáveis de Ambiente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {Object.entries(debugData.envVars).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-mono text-gray-600">{key}:</span>
                      <span className={`font-mono ${value ? 'text-green-600' : 'text-red-600'}`}>
                        {value || 'NÃO CONFIGURADO'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links do Meta Business */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">🔗 Links do Meta Business</h3>
                <div className="grid gap-2">
                  {Object.entries(debugData.metaBusinessUrls).map(([key, url]) => (
                    <div key={key}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {key}: {url} 🔗
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">📋 Instruções</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  {Object.entries(debugData.instructions).map(([key, instruction]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {instruction}
                    </div>
                  ))}
                </div>
              </div>

              {/* URL de Teste */}
              {debugData.testAuthUrl && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-3">🧪 URL de Teste</h3>
                  <div className="text-sm text-yellow-800">
                    <p className="mb-2">Use esta URL para testar a autorização do Instagram:</p>
                    <a
                      href={debugData.testAuthUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {debugData.testAuthUrl} 🔗
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
