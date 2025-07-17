'use client';

import React, { useState } from 'react';
import CreatorSelectionModal from '@/components/CreatorSelectionModal';

export default function TestModalPage() {
  const [showModal, setShowModal] = useState(false);

  const mockCampaignData = {
    business: { name: 'Auto Posto Bela Suíça' },
    campaign: { title: 'Campanha Teste', month: 'jul 25' }
  };

  const handleSendToCreators = (selectedCreators: any[], template: string) => {
    console.log('📤 Enviando para criadores:', { count: selectedCreators.length, template });
    console.log('📋 Criadores selecionados:', selectedCreators.map(c => ({ nome: c.name, whatsapp: c.contact_info?.whatsapp })));
    // Não precisa fazer nada aqui, o modal já cuida do envio
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Teste do Modal de Criadores
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Status das APIs</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>API de Criadores Disponíveis: ✅ Funcionando (57 criadores)</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>API da Campanha: ✅ Funcionando (4 criadores na campanha)</span>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              🧪 Testar Modal de Criadores
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Instruções de Teste:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Clique no botão acima para abrir o modal</li>
              <li>Verifique se os criadores são carregados (deve mostrar 57 criadores)</li>
              <li>Teste os filtros por categoria e localização</li>
              <li>Selecione alguns criadores (pelo menos 2-3)</li>
              <li>Escolha um template de mensagem</li>
              <li>Clique em "Enviar para X Criador(es)"</li>
              <li><strong>NOVA:</strong> Verifique se aparece o modal de confirmação</li>
              <li><strong>NOVA:</strong> Confirme o envio e veja se abre WhatsApp Web para cada criador</li>
              <li><strong>NOVA:</strong> Observe o progresso do envio</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-800">🆕 Novas Funcionalidades:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
              <li><strong>Modal de Confirmação:</strong> Pergunta se você tem certeza antes de enviar</li>
              <li><strong>WhatsApp Web:</strong> Abre uma aba para cada criador automaticamente</li>
              <li><strong>Progresso do Envio:</strong> Mostra quantos foram enviados</li>
              <li><strong>Mensagens Personalizadas:</strong> Substitui {'{nome}'} pelo nome real do criador</li>
              <li><strong>Validação de WhatsApp:</strong> Verifica se o criador tem WhatsApp cadastrado</li>
              <li><strong>Formatação de Número:</strong> Adiciona código do país automaticamente</li>
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
        onSendToCreators={handleSendToCreators}
      />
    </div>
  );
}
