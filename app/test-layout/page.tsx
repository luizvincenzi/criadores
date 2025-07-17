'use client';

import React, { useState } from 'react';
import CreatorSelectionModal from '@/components/CreatorSelectionModal';

export default function TestLayoutPage() {
  const [showModal, setShowModal] = useState(false);

  const mockCampaignData = {
    business: { name: 'Auto Posto Bela Suíça' },
    campaign: { title: 'Campanha de Verão 2025', month: 'jul 25' }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🎨 Teste do Novo Layout dos Cards
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Melhorias Implementadas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-green-600">✅ Antes (Problemas)</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Cards muito grandes (ocupavam muito espaço)</li>
                <li>• Apenas 2 colunas no desktop</li>
                <li>• Avatar 48px (muito grande)</li>
                <li>• Padding 16px (muito espaçoso)</li>
                <li>• Difícil ver muitos criadores</li>
                <li>• Scroll excessivo necessário</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-600">🚀 Depois (Melhorias)</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Cards compactos (mais criadores visíveis)</li>
                <li>• 4 colunas no desktop (xl:grid-cols-4)</li>
                <li>• Avatar 40px (tamanho otimizado)</li>
                <li>• Padding 12px (mais eficiente)</li>
                <li>• Fácil visualização e seleção</li>
                <li>• Menos scroll necessário</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📊 Comparação de Densidade</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="font-medium">Layout Anterior:</span></p>
                <p className="text-gray-600">~6-8 criadores visíveis</p>
              </div>
              <div>
                <p><span className="font-medium">Layout Novo:</span></p>
                <p className="text-gray-600">~12-16 criadores visíveis</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Responsividade Otimizada</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="font-semibold text-gray-900">Mobile</div>
              <div className="text-gray-600">1 coluna</div>
              <div className="text-xs text-gray-500">grid-cols-1</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="font-semibold text-gray-900">Tablet</div>
              <div className="text-gray-600">2 colunas</div>
              <div className="text-xs text-gray-500">md:grid-cols-2</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="font-semibold text-gray-900">Desktop</div>
              <div className="text-gray-600">3 colunas</div>
              <div className="text-xs text-gray-500">lg:grid-cols-3</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="font-semibold text-gray-900">Desktop XL</div>
              <div className="text-gray-600">4 colunas</div>
              <div className="text-xs text-gray-500">xl:grid-cols-4</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Testar Novo Layout</h2>
          
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            🎨 Abrir Modal com Novo Layout
          </button>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Como Testar:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Clique no botão acima para abrir o modal</li>
              <li>Observe que agora cabem mais criadores na tela</li>
              <li>Teste a seleção múltipla (mais fácil de navegar)</li>
              <li>Verifique a responsividade redimensionando a janela</li>
              <li>Compare com a experiência anterior</li>
            </ol>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">🎯 Benefícios do Novo Layout:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
              <li><strong>Mais eficiente:</strong> Dobrou a quantidade de criadores visíveis</li>
              <li><strong>Melhor UX:</strong> Menos scroll, seleção mais rápida</li>
              <li><strong>Responsivo:</strong> Adapta-se a diferentes tamanhos de tela</li>
              <li><strong>Compacto:</strong> Mantém informações essenciais</li>
              <li><strong>Profissional:</strong> Visual limpo e organizado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Teste */}
      <CreatorSelectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        campaignData={mockCampaignData}
        campaignUrl="http://localhost:3005/campaign/auto-posto-bela-suica/202507"
      />
    </div>
  );
}
