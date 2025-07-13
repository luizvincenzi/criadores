'use client';

import React, { useState } from 'react';
import AddCampaignModalNew from '@/components/AddCampaignModalNew';

export default function TestCampaignModalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    console.log('✅ Campanha criada com sucesso!');
    alert('✅ Campanha criada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Teste do Modal de Campanhas
        </h1>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Novo Sistema de Campanhas</h2>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">🎯 Funcionalidades Implementadas</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Seleção de business da aba "business" existente</li>
                <li>• Criação de múltiplas linhas baseado no número de criadores</li>
                <li>• Meses pré-configurados a partir do mês atual</li>
                <li>• Geração de datas completas (dia 1 + mês + ano)</li>
                <li>• Campaign_IDs únicos para cada slot de criador</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-2">📊 Estrutura de Dados</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• <strong>Business:</strong> Carregado da aba "business"</li>
                <li>• <strong>Quantidade de Criadores:</strong> Baseado no business selecionado</li>
                <li>• <strong>Mês:</strong> Janeiro 2025, Fevereiro 2025, etc.</li>
                <li>• <strong>Data Completa:</strong> 2025-01-01, 2025-02-01, etc.</li>
                <li>• <strong>Campaign_ID:</strong> camp_timestamp_slot_business_month_slotN</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🚀 Testar Modal de Nova Campanha
          </button>
        </div>

        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">📋 Como Testar</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-900 mb-2">1. Seleção de Business</h3>
              <p className="text-sm text-yellow-800">
                O modal carregará todos os businesses da aba "business" do Google Sheets.
                Selecione um business existente para vincular a campanha.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-medium text-purple-900 mb-2">2. Configuração da Campanha</h3>
              <p className="text-sm text-purple-800">
                O nome da campanha será preenchido automaticamente com o nome do business.
                A quantidade de criadores será baseada no número contratado pelo business.
              </p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="font-medium text-indigo-900 mb-2">3. Seleção de Mês</h3>
              <p className="text-sm text-indigo-800">
                Os meses disponíveis começam do mês atual e vão até 12 meses à frente.
                A data será gerada automaticamente como dia 1 do mês selecionado.
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-900 mb-2">4. Criação Múltipla</h3>
              <p className="text-sm text-red-800">
                Será criada uma linha na planilha para cada criador especificado.
                Cada linha terá um Campaign_ID único e campos pré-preenchidos.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">🔗 Links Úteis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/campaigns"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-900">📊 Página de Campanhas</div>
              <div className="text-sm text-blue-700">Ver campanhas existentes</div>
            </a>
            
            <a
              href="/api/get-businesses-for-campaigns"
              target="_blank"
              className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="font-medium text-green-900">🏢 API de Businesses</div>
              <div className="text-sm text-green-700">Ver businesses disponíveis</div>
            </a>
            
            <a
              href="/debug-campaign"
              className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="font-medium text-purple-900">🔧 Debug Tools</div>
              <div className="text-sm text-purple-700">Ferramentas de teste</div>
            </a>
            
            <a
              href="/jornada"
              className="block p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="font-medium text-orange-900">📋 Jornada</div>
              <div className="text-sm text-orange-700">Ver campanhas na jornada</div>
            </a>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddCampaignModalNew
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
