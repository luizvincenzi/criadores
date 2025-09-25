'use client';

import React, { useState, useEffect } from 'react';
import CreatorSelectionModal from './CreatorSelectionModal';

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
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);



  // 🚀 NOVA ESTRATÉGIA: Resetar estado quando abrir novo shadowbox
  useEffect(() => {
    if (businessName && month) {
      console.log('🔄 [RESET] Resetando estado para novo shadowbox:', { businessName, month });
      setCampaignUrl(null);
      setIsGeneratingUrl(false);
    }
  }, [businessName, month]);

  const generateCampaignUrl = async () => {
    try {
      setIsGeneratingUrl(true);

      console.log('🚀 [HYBRID SYSTEM] Gerando URL SEO-friendly para:', { businessName, month });

      // Gerar URL SEO-friendly diretamente
      const businessSlug = businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim();

      // Converter month para formato legível
      let monthYear: string;
      if (typeof month === 'string') {
        if (month.includes(' ')) {
          // Formato "jul 25" -> "jul-2025"
          const [monthName, year] = month.split(' ');
          const fullYear = year.length === 2 ? `20${year}` : year;
          monthYear = `${monthName.toLowerCase()}-${fullYear}`;
        } else if (/^\d{6}$/.test(month)) {
          // Formato "202507" -> "jul-2025"
          const year = Math.floor(parseInt(month) / 100);
          const monthNum = parseInt(month) % 100;

          const monthNames = [
            '', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
            'jul', 'ago', 'set', 'out', 'nov', 'dez'
          ];

          monthYear = `${monthNames[monthNum]}-${year}`;
        } else {
          monthYear = month.toLowerCase();
        }
      } else {
        monthYear = 'unknown';
      }

      const seoUrl = `/campaign/${businessSlug}-${monthYear}`;
      const fullUrl = `${window.location.origin}${seoUrl}`;

      console.log('🔗 [HYBRID SYSTEM] URL SEO gerada:', seoUrl);

      // Testar se a URL funciona
      const testResponse = await fetch(`/api/campaign-seo?url=${encodeURIComponent(seoUrl)}`);
      const testResult = await testResponse.json();

      if (testResult.success) {
        setCampaignUrl(fullUrl);
        onUrlGenerated?.(fullUrl);

        // Copiar URL para clipboard apenas se foi clique manual
        if (!isGeneratingUrl) {
          await navigator.clipboard.writeText(fullUrl);
          showToast('URL SEO-friendly copiada para a área de transferência!', 'success');
        }

        console.log('✅ [HYBRID SYSTEM] URL gerada com sucesso:', fullUrl);
      } else {
        console.error('❌ [HYBRID SYSTEM] Erro na API SEO:', testResult.error);

        // Fallback para API antiga
        console.log('🔄 [FALLBACK] Tentando API antiga...');

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

          if (!isGeneratingUrl) {
            await navigator.clipboard.writeText(result.data.campaignUrl);
            showToast('URL (sistema antigo) copiada para a área de transferência!', 'success');
          }
          console.log('✅ [FALLBACK] URL gerada com sistema antigo:', result.data.campaignUrl);
        } else {
          showToast('Erro ao gerar URL: ' + result.error, 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao gerar URL:', error);
      showToast('Erro ao gerar URL da campanha', 'error');
    } finally {
      setIsGeneratingUrl(false);
    }
  };



  const openLandingPage = () => {
    if (campaignUrl) {
      window.open(campaignUrl, '_blank');
    }
  };

  const handleSendToCreators = async (selectedCreators: any[], template: string) => {
    try {
      console.log('📤 Enviando para criadores:', { count: selectedCreators.length, template });

      // Simular envio (em produção, isso seria uma API real)
      const sendPromises = selectedCreators.map(async (creator) => {
        const personalizedMessage = template.replace('{nome}', creator.name);
        const whatsappNumber = creator.contact_info?.whatsapp?.replace(/\D/g, '') || '554391936400';
        const encodedMessage = encodeURIComponent(personalizedMessage);

        // Abrir WhatsApp em nova aba (em produção, seria um envio automático)
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');

        return { creator: creator.name, status: 'sent' };
      });

      await Promise.all(sendPromises);

      showToast(`Mensagem enviada para ${selectedCreators.length} criador(es)!`, 'success');
      setShowCreatorModal(false);

    } catch (error) {
      console.error('Erro ao enviar para criadores:', error);
      showToast('Erro ao enviar mensagens', 'error');
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
      <div className="flex gap-3 justify-center flex-wrap">
        {!campaignUrl ? (
          // Mostrar apenas "Gerar Landing Page" quando não há URL
          <button
            onClick={generateCampaignUrl}
            disabled={isGeneratingUrl}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {isGeneratingUrl ? 'Gerando...' : 'Gerar Landing Page'}
          </button>
        ) : (
          // Mostrar "Ver Landing Page" e "Enviar para Criadores" quando há URL
          <>
            <button
              onClick={openLandingPage}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver Landing Page
            </button>

            <button
              onClick={() => setShowCreatorModal(true)}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Enviar para Criadores
            </button>
          </>
        )}
      </div>






      {/* Modal de Seleção de Criadores */}
      <CreatorSelectionModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        campaignData={{
          business: { name: businessName },
          campaign: { title: `Campanha ${month}`, month: month }
        }}
        campaignUrl={campaignUrl || ''}
        onSendToCreators={handleSendToCreators}
      />
    </div>
  );
}
