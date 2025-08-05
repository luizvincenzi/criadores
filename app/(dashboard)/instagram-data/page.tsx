'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

interface Campaign {
  id: string;
  title: string;
  status: string;
  created_at: string;
  campaign_creators: Array<{
    id: string;
    video_instagram_link: string;
    creators: {
      name: string;
    };
  }>;
}

interface ExtractedData {
  creatorId: string;
  creatorName: string;
  postId: string;
  postUrl: string;
  data: {
    like_count: number;
    comments_count: number;
    insights: {
      reach: number;
      impressions: number;
      engagement: number;
      likes: number;
      comments: number;
      saves: number;
      shares: number;
    };
  };
}

export default function InstagramDataPage() {
  const { user } = useAuthStore();
  const authenticatedFetch = useAuthenticatedFetch();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [message, setMessage] = useState('');

  // Business ID - usar o configurado ou fallback
  const businessId = user?.business_id || process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID || '00000000-0000-0000-0000-000000000002';

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`/api/instagram/extract-campaign-data?businessId=${businessId}`);
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns);
        console.log('✅ Campanhas carregadas:', data.campaigns.length);
      } else {
        setMessage(`Erro ao carregar campanhas: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar campanhas:', error);
      setMessage('Erro ao carregar campanhas');
    } finally {
      setIsLoading(false);
    }
  };

  const extractCampaignData = async () => {
    if (!selectedCampaign) {
      setMessage('Selecione uma campanha primeiro');
      return;
    }

    setIsExtracting(true);
    setMessage('');
    
    try {
      const response = await authenticatedFetch('/api/instagram/extract-campaign-data', {
        method: 'POST',
        body: JSON.stringify({
          campaignId: selectedCampaign,
          businessId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setExtractedData(data.data);
        setMessage(`✅ ${data.message}`);
        console.log('✅ Dados extraídos:', data.data);
      } else {
        if (data.needsConnection) {
          setMessage('❌ Conecte uma conta Instagram primeiro na página de debug');
        } else {
          setMessage(`❌ ${data.error}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao extrair dados:', error);
      setMessage('❌ Erro ao extrair dados do Instagram');
    } finally {
      setIsExtracting(false);
    }
  };

  const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📱 Extração de Dados do Instagram
          </h1>
          <p className="text-gray-600 mb-6">
            Extraia dados reais das postagens do Instagram baseado nos links das campanhas
          </p>

          {/* Seleção de Campanha */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Campanha
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="">Selecione uma campanha...</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title} ({campaign.campaign_creators.length} criadores com links)
                </option>
              ))}
            </select>
          </div>

          {/* Informações da Campanha Selecionada */}
          {selectedCampaignData && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                📋 {selectedCampaignData.title}
              </h3>
              <div className="text-sm text-blue-700">
                <p><strong>Status:</strong> {selectedCampaignData.status}</p>
                <p><strong>Criadores com links:</strong> {selectedCampaignData.campaign_creators.length}</p>
                <div className="mt-2">
                  <strong>Criadores:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {selectedCampaignData.campaign_creators.map((creator, index) => (
                      <li key={index}>
                        {creator.creators.name} - {creator.video_instagram_link}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Botão de Extração */}
          <div className="mb-6">
            <button
              onClick={extractCampaignData}
              disabled={!selectedCampaign || isExtracting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isExtracting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Extraindo dados...
                </>
              ) : (
                <>
                  📊 Extrair Dados do Instagram
                </>
              )}
            </button>
          </div>

          {/* Mensagem */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Dados Extraídos */}
          {extractedData.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Dados Extraídos ({extractedData.length} posts)
              </h3>
              
              <div className="grid gap-4">
                {extractedData.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900">
                        👤 {item.creatorName}
                      </h4>
                      <a
                        href={item.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver Post 🔗
                      </a>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Curtidas:</span>
                        <div className="font-semibold">{item.data.insights.likes.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Comentários:</span>
                        <div className="font-semibold">{item.data.insights.comments.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Alcance:</span>
                        <div className="font-semibold">{item.data.insights.reach.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Impressões:</span>
                        <div className="font-semibold">{item.data.insights.impressions.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Engajamento:</span>
                        <div className="font-semibold">{item.data.insights.engagement.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Salvamentos:</span>
                        <div className="font-semibold">{item.data.insights.saves.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Compartilhamentos:</span>
                        <div className="font-semibold">{item.data.insights.shares.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Post ID:</span>
                        <div className="font-mono text-xs">{item.postId}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações sobre Campanhas */}
          {campaigns.length > 0 && (
            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Campanhas Disponíveis ({campaigns.length})
              </h3>
              
              <div className="grid gap-3">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{campaign.title}</span>
                      <span className="text-sm text-gray-600">
                        {campaign.campaign_creators.length} criadores com links
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
