'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { StrategicMapInputData } from '@/types/strategic-map';

interface Props {
  quarter: string;
  businessId?: string; // undefined = crIAdores
  onSubmit?: () => void;
}

export function StrategicMapDataForm({ quarter, businessId, onSubmit }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<StrategicMapInputData>({
    social_media: {
      instagram: { url: '', followers: 0, engagement_rate: 0, verified: false },
      tiktok: { url: '', followers: 0, engagement_rate: 0 },
      facebook: { url: '', followers: 0, engagement_rate: 0 },
      youtube: { url: '', subscribers: 0, avg_views: 0 },
    },
    reviews: {
      google: { url: '', rating: 0, total_reviews: 0 },
      tripadvisor: { url: '', rating: 0, total_reviews: 0 },
      reclame_aqui: { url: '', score: 0, complaints: 0 },
    },
    website: {
      url: '',
      monthly_visits: 0,
      bounce_rate: 0,
    },
    business_info: {
      category: '',
      city: '',
      state: '',
      target_audience: '',
      main_competitors: [],
    },
    additional_info: {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create strategic map
      const createResponse = await fetch('/api/strategic-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          quarter,
          input_data: formData,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create strategic map');
      }

      const { strategic_map } = await createResponse.json();

      // Start AI generation
      const generateResponse = await fetch(`/api/strategic-maps/${strategic_map.id}/generate`, {
        method: 'POST',
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to start generation');
      }

      // Refresh page or call callback
      if (onSubmit) {
        onSubmit();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Error creating strategic map:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Criar Mapa Estratégico - {quarter}
        </h2>
        <p className="text-gray-600">
          Preencha os dados abaixo para gerar seu mapa estratégico com IA
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Informações do Negócio */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          📋 Informações do Negócio
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria/Setor *
            </label>
            <input
              type="text"
              required
              value={formData.business_info.category}
              onChange={(e) => setFormData({
                ...formData,
                business_info: { ...formData.business_info, category: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Alimentação, Moda, Tecnologia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Público-alvo *
            </label>
            <input
              type="text"
              required
              value={formData.business_info.target_audience}
              onChange={(e) => setFormData({
                ...formData,
                business_info: { ...formData.business_info, target_audience: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Jovens 18-35 anos, classe B/C"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade *
            </label>
            <input
              type="text"
              required
              value={formData.business_info.city}
              onChange={(e) => setFormData({
                ...formData,
                business_info: { ...formData.business_info, city: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: São Paulo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <input
              type="text"
              required
              maxLength={2}
              value={formData.business_info.state}
              onChange={(e) => setFormData({
                ...formData,
                business_info: { ...formData.business_info, state: e.target.value.toUpperCase() }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="SP"
            />
          </div>
        </div>
      </section>

      {/* Redes Sociais */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          📱 Redes Sociais
        </h3>

        {/* Instagram */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">Instagram</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={formData.social_media.instagram.url}
                onChange={(e) => setFormData({
                  ...formData,
                  social_media: {
                    ...formData.social_media,
                    instagram: { ...formData.social_media.instagram, url: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seguidores</label>
              <input
                type="number"
                value={formData.social_media.instagram.followers}
                onChange={(e) => setFormData({
                  ...formData,
                  social_media: {
                    ...formData.social_media,
                    instagram: { ...formData.social_media.instagram, followers: parseInt(e.target.value) || 0 }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Engajamento (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.social_media.instagram.engagement_rate}
                onChange={(e) => setFormData({
                  ...formData,
                  social_media: {
                    ...formData.social_media,
                    instagram: { ...formData.social_media.instagram, engagement_rate: parseFloat(e.target.value) || 0 }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="3.5"
              />
            </div>
          </div>
        </div>

        {/* Google Reviews */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">Google Reviews</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={formData.reviews.google.url}
                onChange={(e) => setFormData({
                  ...formData,
                  reviews: {
                    ...formData.reviews,
                    google: { ...formData.reviews.google, url: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://g.page/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.reviews.google.rating}
                onChange={(e) => setFormData({
                  ...formData,
                  reviews: {
                    ...formData.reviews,
                    google: { ...formData.reviews.google, rating: parseFloat(e.target.value) || 0 }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="4.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total de Avaliações</label>
              <input
                type="number"
                value={formData.reviews.google.total_reviews}
                onChange={(e) => setFormData({
                  ...formData,
                  reviews: {
                    ...formData.reviews,
                    google: { ...formData.reviews.google, total_reviews: parseInt(e.target.value) || 0 }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="150"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Botões */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Gerando com IA...
            </>
          ) : (
            <>
              <span>✨</span>
              Gerar Mapa Estratégico
            </>
          )}
        </button>
      </div>
    </form>
  );
}

