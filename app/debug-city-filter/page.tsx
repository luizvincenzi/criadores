'use client';

import { useState, useEffect } from 'react';

export default function DebugCityFilter() {
  const [businessData, setBusinessData] = useState<any>(null);
  const [creatorsData, setCreatorsData] = useState<any[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testCityFilter = async () => {
    setLoading(true);
    try {
      // Testar com Sonkey
      const response = await fetch('/api/get-creator-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: 'Sonkey',
          mes: 'Julho 2025',
          quantidadeContratada: 6
        })
      });

      const result = await response.json();
      console.log('🔍 Resultado do teste:', result);

      if (result.success) {
        setFilteredCreators(result.availableCreators);
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    try {
      // Carregar dados do business
      const businessResponse = await fetch('/api/get-businesses');
      const businessResult = await businessResponse.json();
      const sonkey = businessResult.businesses?.find((b: any) => 
        b.nome?.toLowerCase() === 'sonkey'
      );
      setBusinessData(sonkey);

      // Carregar todos os criadores
      const creatorsResponse = await fetch('/api/get-creators');
      const creatorsResult = await creatorsResponse.json();
      setCreatorsData(creatorsResult.creators || []);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Debug: Filtro de Criadores por Cidade
        </h1>

        {/* Dados do Business */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🏢 Dados do Business: Sonkey
          </h2>
          {businessData ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nome:</label>
                <p className="text-lg font-semibold">{businessData.nome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cidade:</label>
                <p className="text-lg font-semibold text-blue-600">{businessData.cidade}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Categoria:</label>
                <p className="text-lg">{businessData.categoria}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Plano:</label>
                <p className="text-lg">{businessData.planoAtual}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Carregando dados do business...</p>
          )}
        </div>

        {/* Teste do Filtro */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🎯 Teste do Filtro por Cidade
          </h2>
          <button
            onClick={testCityFilter}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? '🔄 Testando...' : '🧪 Testar Filtro Sonkey'}
          </button>

          {filteredCreators.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-green-600 mb-3">
                ✅ Criadores Filtrados ({filteredCreators.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCreators.map((creator, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">{creator.nome}</h4>
                    <p className="text-sm text-gray-600">📍 {creator.cidade}</p>
                    <p className="text-sm text-gray-600">📱 {creator.whatsapp}</p>
                    <p className="text-sm text-gray-600">📊 {creator.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Todos os Criadores */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            👥 Todos os Criadores ({creatorsData.length})
          </h2>
          
          {/* Agrupados por cidade */}
          {creatorsData.length > 0 && (
            <div className="space-y-6">
              {Object.entries(
                creatorsData.reduce((acc: any, creator) => {
                  const city = creator.cidade || 'Sem cidade';
                  if (!acc[city]) acc[city] = [];
                  acc[city].push(creator);
                  return acc;
                }, {})
              ).map(([city, creators]: [string, any]) => (
                <div key={city} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    📍 {city} ({(creators as any[]).length} criadores)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(creators as any[]).map((creator, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 text-sm">{creator.nome}</h4>
                        <p className="text-xs text-gray-600">📊 {creator.status}</p>
                        <p className="text-xs text-gray-600">📱 {creator.whatsapp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
