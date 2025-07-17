'use client';

import React, { useState } from 'react';

export default function TestWhatsAppPage() {
  const [testResults, setTestResults] = useState<any[]>([]);

  const testWhatsAppIntegration = async () => {
    // Simular dados de criadores
    const mockCreators = [
      {
        id: '1',
        name: 'Ana Silva',
        contact_info: { whatsapp: '43999580203' }
      },
      {
        id: '2',
        name: 'João Santos',
        contact_info: { whatsapp: '11987654321' }
      },
      {
        id: '3',
        name: 'Maria Oliveira',
        contact_info: { whatsapp: '+55 43 99999-9999' }
      },
      {
        id: '4',
        name: 'Pedro Costa',
        contact_info: { whatsapp: '21988776655' }
      },
      {
        id: '5',
        name: 'Carla Mendes',
        contact_info: { whatsapp: '85977665544' }
      }
    ];

    const template = `🎯 *Nova Oportunidade de Campanha!*

Olá, {nome}! 

Temos uma nova oportunidade de campanha que pode ser perfeita para o seu perfil:

🏢 *Empresa:* Auto Posto Bela Suíça
📅 *Período:* jul 25
🎬 *Campanha:* Campanha de Verão

📊 *Veja todos os detalhes da campanha:*
http://localhost:3005/campaign/auto-posto-bela-suica/202507

Interessado(a)? Vamos conversar sobre essa oportunidade! 🚀

_Equipe CRM Criadores_`;

    const results = [];

    for (const creator of mockCreators) {
      // Personalizar mensagem
      const personalizedMessage = template.replace(/{nome}/g, creator.name);
      
      // Limpar e formatar número do WhatsApp
      const whatsappNumber = creator.contact_info?.whatsapp?.replace(/\D/g, '') || '';
      const formattedNumber = whatsappNumber.startsWith('55') ? whatsappNumber : `55${whatsappNumber}`;
      const encodedMessage = encodeURIComponent(personalizedMessage);
      
      // Criar URL do WhatsApp
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
      
      results.push({
        creator: creator.name,
        originalNumber: creator.contact_info?.whatsapp,
        formattedNumber,
        url: whatsappUrl,
        messagePreview: personalizedMessage.substring(0, 100) + '...'
      });
    }

    setTestResults(results);
  };

  const openWhatsApp = (url: string, creatorName: string) => {
    const windowName = `whatsapp_${creatorName.replace(/\s+/g, '_')}_${Date.now()}`;
    const newWindow = window.open(url, windowName);

    if (newWindow) {
      console.log(`✅ Aba aberta para ${creatorName}`);
    } else {
      console.error(`❌ Falha ao abrir aba para ${creatorName} - popup bloqueado?`);
      alert('⚠️ Popup bloqueado! Permita popups para este site e tente novamente.');
    }
  };

  const openAllWhatsApp = async () => {
    if (testResults.length === 0) {
      alert('Execute o teste primeiro para gerar os dados!');
      return;
    }

    const confirmed = confirm(`Deseja abrir ${testResults.length} abas do WhatsApp Web simultaneamente?`);
    if (!confirmed) return;

    console.log(`🚀 Abrindo ${testResults.length} abas do WhatsApp...`);

    for (let i = 0; i < testResults.length; i++) {
      const result = testResults[i];
      console.log(`📱 Abrindo aba ${i + 1}/${testResults.length} para ${result.creator}...`);

      openWhatsApp(result.url, result.creator);

      // Aguardar entre as aberturas
      if (i < testResults.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    alert(`✅ ${testResults.length} abas do WhatsApp foram abertas! Verifique seu navegador.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Teste de Integração WhatsApp
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Testar Funcionalidade</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={testWhatsAppIntegration}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              🧪 Testar Integração WhatsApp
            </button>

            {testResults.length > 0 && (
              <button
                onClick={openAllWhatsApp}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                📱 Abrir Todas as Abas ({testResults.length})
              </button>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Este teste simula o envio para {testResults.length || 5} criadores fictícios
          </p>
        </div>
        
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resultados do Teste</h2>
            
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{result.creator}</h3>
                    <button
                      onClick={() => openWhatsApp(result.url, result.creator)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      📱 Abrir WhatsApp
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Número Original:</span> {result.originalNumber}</p>
                      <p><span className="font-medium">Número Formatado:</span> {result.formattedNumber}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Preview da Mensagem:</span></p>
                      <p className="text-gray-600 italic">{result.messagePreview}</p>
                    </div>
                  </div>
                  
                  <details className="mt-3">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Ver URL completa do WhatsApp
                    </summary>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs break-all">
                      {result.url}
                    </div>
                  </details>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Teste Concluído!</h3>
              <p className="text-green-700 text-sm">
                {testResults.length} URLs do WhatsApp foram geradas com sucesso. 
                Clique nos botões "Abrir WhatsApp" para testar cada um.
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Como Funciona</h2>
          
          <div className="space-y-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold">Personalização da Mensagem</h3>
                <p className="text-gray-600">Substitui {'{nome}'} pelo nome real do criador</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold">Formatação do Número</h3>
                <p className="text-gray-600">Remove caracteres especiais e adiciona código do país (+55)</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold">Codificação da URL</h3>
                <p className="text-gray-600">Codifica a mensagem para URL do WhatsApp Web</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <div>
                <h3 className="font-semibold">Abertura do WhatsApp</h3>
                <p className="text-gray-600">Abre WhatsApp Web em nova aba com mensagem pré-preenchida</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Links para Teste Completo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/test-modal"
              target="_blank"
              className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold">Modal de Criadores</div>
              <div className="text-sm text-gray-600">Teste com dados reais</div>
            </a>
            
            <a
              href="/test-status"
              target="_blank"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">Status das APIs</div>
              <div className="text-sm text-gray-600">Verificar funcionamento</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
