'use client';

import { useEffect, useState } from 'react';
import { landingPagesService, type LandingPageWithProducts } from '@/lib/services/landingPagesService';

export default function TestLPDatabase() {
  const [lps, setLps] = useState<LandingPageWithProducts[]>([]);
  const [selectedLP, setSelectedLP] = useState<LandingPageWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLPs() {
      try {
        setLoading(true);
        const data = await landingPagesService.getActiveLandingPages();
        setLps(data as LandingPageWithProducts[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar LPs');
      } finally {
        setLoading(false);
      }
    }

    loadLPs();
  }, []);

  async function loadLPDetails(slug: string) {
    try {
      console.log('🔍 Carregando detalhes da LP:', slug);
      setLoadingDetails(true);
      setError(null);
      const lp = await landingPagesService.getLandingPageBySlug(slug);
      console.log('✅ LP carregada:', lp);
      setSelectedLP(lp);
    } catch (err) {
      console.error('❌ Erro ao carregar LP:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar LP');
    } finally {
      setLoadingDetails(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">🔄 Carregando LPs do banco...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-red-600">❌ Erro</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Teste - LPs do Banco de Dados</h1>

        {/* Lista de LPs */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            ✅ {lps.length} Landing Pages Encontradas
          </h2>

          <div className="space-y-4">
            {lps.map((lp) => (
              <div
                key={lp.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => loadLPDetails(lp.slug)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{lp.name}</h3>
                    <p className="text-sm text-gray-600">/{lp.slug}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {lp.category}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {lp.status}
                      </span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Ver Detalhes →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Details */}
        {loadingDetails && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-center text-gray-600">🔄 Carregando detalhes...</p>
          </div>
        )}

        {/* Detalhes da LP Selecionada */}
        {!loadingDetails && selectedLP && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">📄 Detalhes da LP</h2>

            <div className="space-y-4">
              {/* Hero */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-bold text-lg mb-2">Hero</h3>
                <p className="text-2xl font-bold mb-2">{selectedLP.variables.hero.title}</p>
                <p className="text-gray-600 mb-2">{selectedLP.variables.hero.subtitle}</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded">
                  {selectedLP.variables.hero.cta_text}
                </button>
              </div>

              {/* Produtos */}
              {selectedLP.products && selectedLP.products.length > 0 && (
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-bold text-lg mb-2">Produtos ({selectedLP.products.length})</h3>
                  <ul className="space-y-2">
                    {selectedLP.products.map((product) => (
                      <li key={product.id} className="flex items-center justify-between">
                        <span>{product.name}</span>
                        <span className="font-bold">
                          R$ {product.default_price.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Soluções */}
              {selectedLP.variables.solucoes && selectedLP.variables.solucoes.length > 0 && (
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-bold text-lg mb-2">
                    Soluções ({selectedLP.variables.solucoes.length})
                  </h3>
                  {selectedLP.variables.solucoes.map((solucao, idx) => (
                    <div key={idx} className="mb-4">
                      <h4 className="font-bold">{solucao.title}</h4>
                      <p className="text-sm text-gray-600">{solucao.description}</p>
                      <p className="text-sm mt-2">
                        <strong>Benefícios:</strong> {solucao.benefits.length}
                      </p>
                      {solucao.price_monthly && (
                        <p className="text-sm">
                          <strong>Preço:</strong> R$ {solucao.price_monthly}/mês
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* FAQ */}
              {selectedLP.variables.faq && selectedLP.variables.faq.length > 0 && (
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-bold text-lg mb-2">
                    FAQ ({selectedLP.variables.faq.length} perguntas)
                  </h3>
                  <ul className="space-y-2">
                    {selectedLP.variables.faq.map((faq, idx) => (
                      <li key={idx}>
                        <strong>Q:</strong> {faq.question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SEO */}
              <div className="border-l-4 border-gray-500 pl-4">
                <h3 className="font-bold text-lg mb-2">SEO</h3>
                <p className="text-sm">
                  <strong>Title:</strong> {selectedLP.seo.title}
                </p>
                <p className="text-sm">
                  <strong>Description:</strong> {selectedLP.seo.description}
                </p>
              </div>

              {/* JSON Completo */}
              <details className="border rounded p-4">
                <summary className="font-bold cursor-pointer">
                  Ver JSON Completo
                </summary>
                <pre className="mt-4 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(selectedLP, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

