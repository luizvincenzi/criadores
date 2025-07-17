'use client';

import React, { useState, useEffect } from 'react';

interface CampaignSharePanelProps {
  businessName: string;
  month: string;
  campaignUrl?: string;
  onUrlGenerated?: (url: string) => void;
}

export default function CampaignSharePanel({ 
  businessName, 
  month, 
  campaignUrl: initialUrl,
  onUrlGenerated 
}: CampaignSharePanelProps) {
  const [campaignUrl, setCampaignUrl] = useState<string | null>(initialUrl || null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [shareTemplates, setShareTemplates] = useState({
    whatsapp: '',
    email: '',
    social: ''
  });

  useEffect(() => {
    if (campaignUrl) {
      generateQRCode(campaignUrl);
      generateShareTemplates(campaignUrl);
    }
  }, [campaignUrl]);

  const generateCampaignUrl = async () => {
    try {
      setIsGeneratingUrl(true);

      const response = await fetch('/api/generate-campaign-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          month
        })
      });

      const result = await response.json();

      if (result.success) {
        setCampaignUrl(result.data.campaignUrl);
        onUrlGenerated?.(result.data.campaignUrl);
        
        // Copiar URL para clipboard
        await navigator.clipboard.writeText(result.data.campaignUrl);
        
        // Toast de sucesso
        showToast('URL copiada para a área de transferência!', 'success');
      } else {
        showToast('Erro ao gerar URL: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Erro ao gerar URL:', error);
      showToast('Erro ao gerar URL da campanha', 'error');
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const generateQRCode = (url: string) => {
    // Usar API do QR Server para gerar QR Code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=00629B&margin=10&format=png`;
    setQrCodeUrl(qrUrl);
  };

  const generateShareTemplates = (url: string) => {
    const templates = {
      whatsapp: `🎯 *Confira nossa nova campanha!*\n\n📊 ${businessName} - ${month}\n\nVeja todos os criadores selecionados e acompanhe o progresso:\n${url}\n\n#MarketingDigital #Campanhas`,
      
      email: `Olá!\n\nGostaria de compartilhar com você nossa nova campanha de marketing digital.\n\n🏢 Empresa: ${businessName}\n📅 Período: ${month}\n\nAcesse o link para ver todos os detalhes, criadores selecionados e acompanhar o progresso:\n${url}\n\nAtenciosamente,\nEquipe de Marketing`,
      
      social: `🚀 Nova campanha no ar!\n\n${businessName} - ${month}\n\n📊 Confira todos os detalhes e criadores selecionados:\n${url}\n\n#MarketingDigital #Campanhas #CriadoresDeConteudo`
    };
    
    setShareTemplates(templates);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${type} copiado para a área de transferência!`, 'success');
    } catch (error) {
      showToast('Erro ao copiar texto', 'error');
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(shareTemplates.whatsapp);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Campanha ${businessName} - ${month}`);
    const body = encodeURIComponent(shareTemplates.email);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const openLandingPage = () => {
    if (campaignUrl) {
      window.open(campaignUrl, '_blank');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    // Implementação simples de toast - pode ser melhorada
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          Compartilhamento e Landing Page
        </h3>
      </div>

      {/* Botões de Ação Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={campaignUrl ? openLandingPage : generateCampaignUrl}
          disabled={isGeneratingUrl}
          className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {isGeneratingUrl ? 'Gerando...' : campaignUrl ? 'Ver Landing Page' : 'Gerar Landing Page'}
        </button>

        <button
          onClick={() => campaignUrl && copyToClipboard(campaignUrl, 'URL')}
          disabled={!campaignUrl}
          className="flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copiar URL
        </button>

        <button
          onClick={shareViaWhatsApp}
          disabled={!campaignUrl}
          className="flex items-center justify-center px-4 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          WhatsApp
        </button>
      </div>

      {/* QR Code e Preview */}
      {campaignUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">QR Code</h4>
            {qrCodeUrl && (
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code da Campanha" 
                  className="w-32 h-32 mx-auto"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Escaneie para acessar a landing page
            </p>
          </div>

          {/* Templates de Compartilhamento */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Templates de Mensagem</h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                  <button
                    onClick={() => copyToClipboard(shareTemplates.whatsapp, 'Template WhatsApp')}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Copiar
                  </button>
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs text-gray-700 max-h-20 overflow-y-auto">
                  {shareTemplates.whatsapp}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">Email</span>
                  <button
                    onClick={shareViaEmail}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Enviar
                  </button>
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs text-gray-700 max-h-20 overflow-y-auto">
                  {shareTemplates.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview da Landing Page */}
      {campaignUrl && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Preview da Landing Page</h4>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showPreview ? 'Ocultar' : 'Mostrar'} Preview
            </button>
          </div>
          
          {showPreview && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={campaignUrl}
                className="w-full h-64"
                title="Preview da Landing Page"
                sandbox="allow-same-origin allow-scripts"
              />
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 truncate">{campaignUrl}</span>
                  <button
                    onClick={openLandingPage}
                    className="text-xs text-blue-600 hover:text-blue-700 ml-2"
                  >
                    Abrir em nova aba
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
