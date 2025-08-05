'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface DebugInfo {
  appId: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
}

export default function InstagramDebugPage() {
  const { user } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const businessId = user?.business_id || process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID || '00000000-0000-0000-0000-000000000002';
      
      const response = await fetch('/api/instagram/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Extrair informações da URL de autorização
        const url = new URL(data.authUrl);
        const params = new URLSearchParams(url.search);
        
        setDebugInfo({
          appId: params.get('client_id') || '',
          redirectUri: params.get('redirect_uri') || '',
          scopes: (params.get('scope') || '').split(','),
          authUrl: data.authUrl
        });
      }
    } catch (error) {
      console.error('Erro ao carregar debug info:', error);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      const businessId = user?.business_id || process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID || '00000000-0000-0000-0000-000000000002';
      
      const response = await fetch('/api/instagram/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult('✅ Conexão configurada corretamente! URL de autorização gerada.');
      } else {
        setTestResult(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Erro de rede: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openInstagramAuth = () => {
    if (debugInfo?.authUrl) {
      window.open(debugInfo.authUrl, 'instagram-auth', 'width=600,height=700');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Instagram Debug</h1>
          <p className="text-gray-600">Ferramenta para testar e debugar a integração Instagram</p>
        </div>

        {/* Configuração Atual */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuração Atual</h2>
          
          {debugInfo ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App ID</label>
                <code className="block p-3 bg-gray-100 rounded-lg text-sm font-mono">
                  {debugInfo.appId}
                </code>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URI</label>
                <code className="block p-3 bg-gray-100 rounded-lg text-sm font-mono">
                  {debugInfo.redirectUri}
                </code>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scopes</label>
                <div className="flex flex-wrap gap-2">
                  {debugInfo.scopes.map((scope, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Carregando configuração...</p>
            </div>
          )}
        </div>

        {/* Teste de Conexão */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Teste de Conexão</h2>
          
          <div className="space-y-4">
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Testando...
                </>
              ) : (
                'Testar Configuração'
              )}
            </button>
            
            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.startsWith('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Autorização Instagram */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Autorização Instagram</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Clique no botão abaixo para abrir a janela de autorização do Instagram em uma nova aba.
            </p>
            
            <button
              onClick={openInstagramAuth}
              disabled={!debugInfo}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Abrir Autorização Instagram
            </button>
            
            {debugInfo && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Autorização</label>
                <textarea
                  value={debugInfo.authUrl}
                  readOnly
                  className="w-full p-3 bg-gray-100 rounded-lg text-sm font-mono h-24 resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Instruções para Configuração</h3>
          
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Acesse o Facebook Developers e configure seu app com o App ID: <code className="bg-blue-100 px-2 py-1 rounded">582288514801639</code></span>
            </div>
            
            <div className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Adicione a URL de callback: <code className="bg-blue-100 px-2 py-1 rounded">https://criadores.app/api/instagram/callback</code></span>
            </div>
            
            <div className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Configure as permissões: instagram_graph_user_profile, instagram_graph_user_media, instagram_basic, pages_show_list</span>
            </div>
            
            <div className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Adicione sua conta Instagram como usuário de teste</span>
            </div>
            
            <div className="flex items-start">
              <span className="font-bold mr-2">5.</span>
              <span>Teste a autorização usando o botão acima</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
