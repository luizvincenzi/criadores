import React from 'react';

interface MetricsOverviewProps {
  socialMedia: {
    instagram: { followers: number; engagement_rate: number; verified: boolean };
    tiktok: { followers: number; engagement_rate: number };
    facebook: { followers: number; engagement_rate: number };
    youtube?: { subscribers: number; avg_views: number };
  };
  reviews: {
    google: { rating: number; total_reviews: number };
    tripadvisor?: { rating: number; total_reviews: number };
    reclame_aqui?: { score: number; complaints: number };
  };
  opportunity?: string;
  competitive_advantage?: string;
}

export function MetricsOverviewSection({ socialMedia, reviews, opportunity, competitive_advantage }: MetricsOverviewProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getGrowthColor = (rate: number): string => {
    if (rate > 5) return 'text-green-600';
    if (rate > 0) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Métricas de Redes Sociais e Reviews */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Google Reviews */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-3xl font-bold text-gray-800">
            {reviews.google.rating}<span className="text-lg text-gray-500">/5</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Google ({reviews.google.total_reviews}) 
            <span className={`ml-1 font-semibold ${getGrowthColor(2.4)}`}>(+2.4%)</span>
          </div>
        </div>

        {/* Instagram */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">📷</div>
          <div className="text-3xl font-bold text-gray-800">
            {formatNumber(socialMedia.instagram.followers)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Instagram 
            <span className={`ml-1 font-semibold ${getGrowthColor(socialMedia.instagram.engagement_rate)}`}>
              (+{socialMedia.instagram.engagement_rate.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Facebook */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-3xl font-bold text-gray-800">
            {formatNumber(socialMedia.facebook.followers)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Facebook 
            <span className={`ml-1 font-semibold ${getGrowthColor(socialMedia.facebook.engagement_rate)}`}>
              (+{socialMedia.facebook.engagement_rate.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* TikTok */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">🎵</div>
          <div className="text-3xl font-bold text-gray-800">
            {formatNumber(socialMedia.tiktok.followers)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            TikTok 
            <span className={`ml-1 font-semibold ${getGrowthColor(socialMedia.tiktok.engagement_rate)}`}>
              (+{socialMedia.tiktok.engagement_rate.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Oportunidade e Diferencial Competitivo */}
      <div className="grid md:grid-cols-2 gap-4">
        {opportunity && (
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-5 border border-cyan-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📈</div>
              <div>
                <h4 className="font-bold text-cyan-900 mb-2">Oportunidade Principal</h4>
                <p className="text-sm text-cyan-800">{opportunity}</p>
              </div>
            </div>
          </div>
        )}

        {competitive_advantage && (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-5 border border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💎</div>
              <div>
                <h4 className="font-bold text-amber-900 mb-2">Diferencial Competitivo</h4>
                <p className="text-sm text-amber-800">{competitive_advantage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

