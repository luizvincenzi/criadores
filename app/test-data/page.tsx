'use client';

import React, { useState, useEffect } from 'react';

export default function TestDataPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/supabase/creators/available');
      const result = await response.json();
      
      if (result.success) {
        setCreators(result.data.slice(0, 10)); // Primeiros 10 para teste
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao carregar criadores');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando dados do Supabase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🗄️ Teste de Dados do Supabase
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Resumo dos Dados</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{creators.length}</div>
              <div className="text-sm text-gray-600">Criadores Carregados</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {creators.filter(c => c.contact_info?.whatsapp?.trim()).length}
              </div>
              <div className="text-sm text-gray-600">Com WhatsApp</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {creators.filter(c => c.social_media?.instagram?.followers > 0).length}
              </div>
              <div className="text-sm text-gray-600">Com Seguidores</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {creators.filter(c => c.profile_info?.category?.trim()).length}
              </div>
              <div className="text-sm text-gray-600">Com Categoria</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Dados dos Criadores (Primeiros 10)</h2>
          
          <div className="space-y-4">
            {creators.map((creator, index) => (
              <div key={creator.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Informações Básicas */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {index + 1}. {creator.name || 'Nome não informado'}
                    </h3>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium w-20">Categoria:</span>
                        <span className={creator.profile_info?.category?.trim() ? 'text-green-600' : 'text-gray-400'}>
                          {creator.profile_info?.category?.trim() || 'Não informada'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="font-medium w-20">Cidade:</span>
                        <span className={creator.profile_info?.location?.city?.trim() ? 'text-green-600' : 'text-gray-400'}>
                          {creator.profile_info?.location?.city?.trim() || 'Não informada'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="font-medium w-20">WhatsApp:</span>
                        <span className={creator.contact_info?.whatsapp?.trim() ? 'text-green-600' : 'text-gray-400'}>
                          {creator.contact_info?.whatsapp?.trim() || 'Não informado'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Redes Sociais */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Redes Sociais</h4>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium w-20">Instagram:</span>
                        <span className={creator.social_media?.instagram?.username ? 'text-blue-600' : 'text-gray-400'}>
                          {creator.social_media?.instagram?.username || 'Não informado'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="font-medium w-20">Seguidores:</span>
                        <span className={creator.social_media?.instagram?.followers > 0 ? 'text-purple-600 font-semibold' : 'text-gray-400'}>
                          {creator.social_media?.instagram?.followers > 0 
                            ? creator.social_media.instagram.followers.toLocaleString() 
                            : '0'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="font-medium w-20">TikTok:</span>
                        <span className={creator.social_media?.tiktok?.username ? 'text-pink-600' : 'text-gray-400'}>
                          {creator.social_media?.tiktok?.username || 'Não informado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status de Completude */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-xs">
                    <span className={`px-2 py-1 rounded ${creator.name?.trim() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {creator.name?.trim() ? '✅ Nome' : '❌ Nome'}
                    </span>
                    
                    <span className={`px-2 py-1 rounded ${creator.contact_info?.whatsapp?.trim() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {creator.contact_info?.whatsapp?.trim() ? '✅ WhatsApp' : '❌ WhatsApp'}
                    </span>
                    
                    <span className={`px-2 py-1 rounded ${creator.social_media?.instagram?.followers > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {creator.social_media?.instagram?.followers > 0 ? '✅ Seguidores' : '❌ Seguidores'}
                    </span>
                    
                    <span className={`px-2 py-1 rounded ${creator.profile_info?.location?.city?.trim() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {creator.profile_info?.location?.city?.trim() ? '✅ Cidade' : '❌ Cidade'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📊 Análise dos Dados</h3>
            <p className="text-blue-700 text-sm">
              Os dados estão sendo carregados diretamente do Supabase. Criadores com informações incompletas 
              são tratados com valores padrão no modal de seleção para garantir uma experiência consistente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
