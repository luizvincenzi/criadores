'use client';

import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

interface InstagramConnection {
  username: string;
  account_type: string;
  connected_at: string;
  last_sync: string | null;
  expires_at: string | null;
}

interface InstagramConnectionCardProps {
  businessId: string;
  businessName: string;
  onConnectionChange?: (connected: boolean) => void;
}

export default function InstagramConnectionCard({ 
  businessId, 
  businessName, 
  onConnectionChange 
}: InstagramConnectionCardProps) {
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [needsReconnection, setNeedsReconnection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkConnectionStatus();
  }, [businessId]);

  const checkConnectionStatus = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`/api/instagram/user-connect?businessId=${businessId}`);
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(data.connected);
        setNeedsReconnection(data.needsReconnection);
        setConnection(data.connection);
        onConnectionChange?.(data.connected && !data.needsReconnection);
      } else {
        setMessage(`Erro ao verificar conexão: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error);
      setMessage('Erro ao verificar status da conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const connectInstagram = async () => {
    setIsConnecting(true);
    setMessage('');
    
    try {
      const response = await authenticatedFetch('/api/instagram/user-connect', {
        method: 'POST',
        body: JSON.stringify({ businessId })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirecionar para URL de autorização do Instagram
        window.location.href = data.authUrl;
      } else {
        if (data.needsSetup) {
          setMessage('❌ Instagram API não configurado. Entre em contato com o administrador.');
        } else {
          setMessage(`❌ ${data.error}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao conectar Instagram:', error);
      setMessage('❌ Erro ao conectar com Instagram');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectInstagram = async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta do Instagram?')) {
      return;
    }

    setIsDisconnecting(true);
    setMessage('');
    
    try {
      const response = await authenticatedFetch(`/api/instagram/user-connect?businessId=${businessId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setIsConnected(false);
        setConnection(null);
        setNeedsReconnection(false);
        setMessage('✅ Instagram desconectado com sucesso');
        onConnectionChange?.(false);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao desconectar Instagram:', error);
      setMessage('❌ Erro ao desconectar Instagram');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Verificando conexão...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">Instagram Business</h3>
            <p className="text-sm text-gray-600">{businessName}</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isConnected && !needsReconnection
            ? 'bg-green-100 text-green-800'
            : needsReconnection
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isConnected && !needsReconnection ? 'Conectado' : 
           needsReconnection ? 'Reconexão necessária' : 'Não conectado'}
        </div>
      </div>

      {/* Informações da Conexão */}
      {connection && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Usuário:</span>
              <div className="font-medium">@{connection.username}</div>
            </div>
            <div>
              <span className="text-gray-600">Tipo:</span>
              <div className="font-medium">{connection.account_type}</div>
            </div>
            <div>
              <span className="text-gray-600">Conectado em:</span>
              <div className="font-medium">{formatDate(connection.connected_at)}</div>
            </div>
            {connection.last_sync && (
              <div>
                <span className="text-gray-600">Última sincronização:</span>
                <div className="font-medium">{formatDate(connection.last_sync)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensagem */}
      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${
          message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-3">
        {!isConnected || needsReconnection ? (
          <button
            onClick={connectInstagram}
            disabled={isConnecting}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Conectando...
              </>
            ) : (
              <>
                📱 {needsReconnection ? 'Reconectar' : 'Conectar'} Instagram
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={checkConnectionStatus}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              🔄 Verificar Status
            </button>
            <button
              onClick={disconnectInstagram}
              disabled={isDisconnecting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDisconnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Desconectando...
                </>
              ) : (
                <>
                  🔌 Desconectar
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Instruções */}
      {!isConnected && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Como conectar:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Clique em "Conectar Instagram"</li>
            <li>2. Faça login na sua conta Instagram Business</li>
            <li>3. Autorize o acesso aos dados da conta</li>
            <li>4. Você será redirecionado de volta automaticamente</li>
          </ol>
        </div>
      )}
    </div>
  );
}
