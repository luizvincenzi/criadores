'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Star, Users, BarChart3, ExternalLink, QrCode, Plus, Copy, Check, Download, ChevronRight, MapPin, MessageCircle, X, Trash2, ChevronLeft, Calendar, Settings, AlertTriangle, Phone } from 'lucide-react';

// ============================================
// Types
// ============================================
interface AlertContact {
  name: string;
  phone: string;
  active: boolean;
}

interface CategoryConfig {
  key: string;
  label: string;
  emoji: string;
}

interface Subscription {
  id: string;
  business_id: string;
  is_active: boolean;
  business_slug: string;
  google_reviews_url: string | null;
  alert_whatsapp: string | null;
  alert_contacts: AlertContact[];
  alert_threshold: number;
  custom_categories: CategoryConfig[] | null;
  categories_history: Array<{ categories: CategoryConfig[]; changed_at: string }>;
}

interface Analytics {
  total_reviews: number;
  avg_rating: number;
  star_distribution: Record<number, number>;
  google_redirects: number;
  category_averages: Record<string, number>;
  waiter_ranking: Array<{
    waiter_id: string;
    name: string;
    total_reviews: number;
    avg_rating: number;
    five_star_count: number;
  }>;
}

interface Waiter {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

interface Review {
  id: string;
  overall_rating: number;
  redirected_to_google: boolean;
  category_ratings: Record<string, number> | null;
  comment: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  waiter_id: string | null;
  created_at: string;
}

interface GoogleReviewsData {
  has_profile: boolean;
  business_name_on_google: string | null;
  google_maps_url: string | null;
  rating: number | null;
  reviews_count: number | null;
  response_rate: number | null;
  positive_sentiment_pct: number | null;
  negative_sentiment_pct: number | null;
  star_distribution: {
    reviews_5_star: number;
    reviews_4_star: number;
    reviews_3_star: number;
    reviews_2_star: number;
    reviews_1_star: number;
  } | null;
  growth: {
    reviews_gained: number;
    rating_change: number;
    days_monitored: number;
    avg_reviews_per_month: number;
  } | null;
  last_sync_at: string | null;
  reviews: Array<{
    author_name: string;
    author_photo_url: string | null;
    rating: number;
    text: string;
    publish_time: string | null;
    relative_time: string | null;
  }>;
}

type TabId = 'overview' | 'waiters' | 'reviews' | 'google' | 'settings';

// ============================================
// Star Rating Display
// ============================================
function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width={size} height={size} viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? '#FBBF24' : 'none'}
          stroke={star <= Math.round(rating) ? '#F59E0B' : '#D1D5DB'}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ============================================
// Category label helper (defaults, overridden by subscription.custom_categories)
// ============================================
const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  atendimento: 'Atendimento',
  comida: 'Qualidade da Comida',
  qualidade_comida: 'Qualidade da Comida',
  tempo_espera: 'Tempo de Espera',
  ambiente: 'Ambiente',
  custo_beneficio: 'Custo-benefício',
};

const DEFAULT_RADAR_CATEGORIES = [
  { key: 'atendimento', label: 'Atendimento' },
  { key: 'comida', label: 'Comida' },
  { key: 'tempo_espera', label: 'Tempo de Espera' },
  { key: 'ambiente', label: 'Ambiente' },
  { key: 'custo_beneficio', label: 'Custo-benefício' },
];

function getCategoryLabels(customCats: CategoryConfig[] | null): Record<string, string> {
  if (!customCats) return DEFAULT_CATEGORY_LABELS;
  const labels: Record<string, string> = {};
  for (const cat of customCats) {
    labels[cat.key] = cat.label;
  }
  return labels;
}

function getRadarCategories(customCats: CategoryConfig[] | null) {
  if (!customCats) return DEFAULT_RADAR_CATEGORIES;
  return customCats.map(c => ({ key: c.key, label: c.label }));
}

// ============================================
// RadarChart SVG
// ============================================
function RadarChart({ categories, radarCats }: { categories: Record<string, number>; radarCats?: Array<{ key: string; label: string }> }) {
  const cx = 120;
  const cy = 120;
  const maxR = 80;
  const levels = 5;
  const cats = radarCats || DEFAULT_RADAR_CATEGORIES;
  const n = cats.length;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 5) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const getLabelPos = (index: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = maxR + 28;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const val = ((level + 1) / levels) * 5;
    return cats.map((_, i) => {
      const p = getPoint(i, val);
      return `${p.x},${p.y}`;
    }).join(' ');
  });

  const dataPoints = cats.map((cat, i) => {
    const val = categories[cat.key] || 0;
    const p = getPoint(i, val);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[240px] mx-auto">
      {gridPolygons.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
      ))}
      {cats.map((_, i) => {
        const p = getPoint(i, 5);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth="0.5" />;
      })}
      <polygon points={dataPoints} fill="rgba(0, 122, 255, 0.15)" stroke="#007AFF" strokeWidth="1.5" />
      {cats.map((cat, i) => {
        const val = categories[cat.key] || 0;
        const p = getPoint(i, val);
        return <circle key={i} cx={p.x} cy={p.y} r="3" fill="#007AFF" />;
      })}
      {cats.map((cat, i) => {
        const pos = getLabelPos(i);
        const val = categories[cat.key] || 0;
        return (
          <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-gray-500 font-medium">
            <tspan x={pos.x} dy="-4">{cat.label}</tspan>
            <tspan x={pos.x} dy="10" className="fill-gray-900 font-bold text-[9px]">{val.toFixed(1)}</tspan>
          </text>
        );
      })}
    </svg>
  );
}

// ============================================
// NPS Distribution
// ============================================
function NPSDistribution({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const promotores = reviews.filter(r => r.overall_rating === 5).length;
  const neutros = reviews.filter(r => r.overall_rating === 4).length;
  const detratores = reviews.filter(r => r.overall_rating <= 3).length;

  const pctPromotor = total > 0 ? Math.round((promotores / total) * 100) : 0;
  const pctNeutro = total > 0 ? Math.round((neutros / total) * 100) : 0;
  const pctDetrator = total > 0 ? Math.round((detratores / total) * 100) : 0;

  const items = [
    { label: 'Promotores', sublabel: '5 estrelas', count: promotores, pct: pctPromotor, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
    { label: 'Neutros', sublabel: '4 estrelas', count: neutros, pct: pctNeutro, color: 'bg-amber-400', textColor: 'text-amber-600' },
    { label: 'Detratores', sublabel: '1-3 estrelas', count: detratores, pct: pctDetrator, color: 'bg-red-500', textColor: 'text-red-600' },
  ];

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-[11px] font-medium text-gray-700">{item.label}</span>
              <span className="text-[9px] text-gray-400">({item.sublabel})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold ${item.textColor}`}>{item.count}</span>
              <span className="text-[10px] text-gray-400">{item.pct}%</span>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${item.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// WaitersTab Component
// ============================================
function WaitersTab({
  waiters, analytics, reviews, subscription,
  showAddWaiter, setShowAddWaiter, newWaiterName, setNewWaiterName,
  addingWaiter, handleAddWaiter, handleShowQR, handleCopyLink, handleRemoveWaiter,
  copiedId, fetchReviews,
}: {
  waiters: Waiter[];
  analytics: Analytics | null;
  reviews: Review[];
  subscription: Subscription | null;
  showAddWaiter: boolean;
  setShowAddWaiter: (v: boolean) => void;
  newWaiterName: string;
  setNewWaiterName: (v: string) => void;
  addingWaiter: boolean;
  handleAddWaiter: () => void;
  handleShowQR: (w?: Waiter) => void;
  handleCopyLink: (w?: Waiter) => void;
  handleRemoveWaiter: (id: string) => void;
  copiedId: string | null;
  fetchReviews: () => void;
}) {
  const [selectedWaiter, setSelectedWaiter] = useState<string | null>(null);

  // Dynamic category labels
  const waiterCategoryLabels = getCategoryLabels(subscription?.custom_categories || null);
  const waiterRadarCats = getRadarCategories(subscription?.custom_categories || null);

  const getWaiterStats = (waiterId: string) => {
    return analytics?.waiter_ranking?.find(w => w.waiter_id === waiterId);
  };

  const getWaiterReviews = (waiterId: string) => {
    return reviews.filter(r => r.waiter_id === waiterId);
  };

  const getWaiterCategories = (waiterId: string) => {
    const waiterReviews = getWaiterReviews(waiterId).filter(r => r.category_ratings);
    if (waiterReviews.length === 0) return {};
    const sums: Record<string, { total: number; count: number }> = {};
    waiterReviews.forEach(r => {
      if (!r.category_ratings) return;
      Object.entries(r.category_ratings).forEach(([key, value]) => {
        if (!sums[key]) sums[key] = { total: 0, count: 0 };
        sums[key].total += value;
        sums[key].count += 1;
      });
    });
    const avgs: Record<string, number> = {};
    Object.entries(sums).forEach(([key, { total, count }]) => {
      avgs[key] = Number((total / count).toFixed(1));
    });
    return avgs;
  };

  // Detail view
  if (selectedWaiter) {
    const waiter = waiters.find(w => w.id === selectedWaiter);
    if (!waiter) { setSelectedWaiter(null); return null; }

    const stats = getWaiterStats(waiter.id);
    const categories = getWaiterCategories(waiter.id);
    const waiterReviews = getWaiterReviews(waiter.id);
    const hasCategories = Object.keys(categories).length > 0;
    const fiveStarPct = stats && stats.total_reviews > 0
      ? Math.round((stats.five_star_count / stats.total_reviews) * 100)
      : 0;
    const promotoresPct = waiterReviews.length > 0
      ? Math.round((waiterReviews.filter(r => r.overall_rating === 5).length / waiterReviews.length) * 100)
      : 0;

    return (
      <div className="space-y-6">
        {/* Back */}
        <button
          onClick={() => setSelectedWaiter(null)}
          className="text-[12px] text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Voltar para lista
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-xl font-bold text-[#007AFF]">
            {waiter.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{waiter.name}</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {stats ? `${stats.total_reviews} avaliações • Nota ${stats.avg_rating.toFixed(1)}` : 'Sem avaliações'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => handleShowQR(waiter)} className="flex items-center gap-1.5 px-3 py-2 bg-[#007AFF] text-white rounded-lg text-[11px] font-medium hover:bg-[#0066DD] transition-colors">
              <QrCode className="w-3.5 h-3.5" /> QR Code
            </button>
            <button onClick={() => handleCopyLink(waiter)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              {copiedId === waiter.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copiedId === waiter.id ? 'Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>

        {/* KPIs - 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <MessageCircle className="w-5 h-5 text-gray-300 mb-3" />
            <p className="text-3xl font-black text-gray-900">{stats?.total_reviews || 0}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Respostas</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <Star className="w-5 h-5 text-gray-300 mb-3" />
            <p className="text-3xl font-black text-gray-900">{stats?.avg_rating.toFixed(1) || '0.0'}<span className="text-lg text-gray-400">/5</span></p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Nota Media</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <Star className="w-5 h-5 text-gray-300 mb-3" />
            <p className="text-3xl font-black text-gray-900">{fiveStarPct}<span className="text-lg text-gray-400">%</span></p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">5 Estrelas</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <ExternalLink className="w-5 h-5 text-gray-300 mb-3" />
            <p className="text-3xl font-black text-gray-900">{promotoresPct}<span className="text-lg text-gray-400">%</span></p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Promotores</p>
          </div>
        </div>

        {/* NPS Distribution */}
        {waiterReviews.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Distribuicao NPS</h4>
            <NPSDistribution reviews={waiterReviews} />
          </div>
        )}

        {/* Radar Chart + Category bars */}
        {hasCategories && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Radar de Performance</h4>
              <RadarChart categories={categories} radarCats={waiterRadarCats} />
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Media por Categoria</h4>
              <div className="space-y-3">
                {Object.entries(categories).map(([key, value]) => {
                  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-teal-500', 'bg-amber-500'];
                  const catIndex = Object.keys(categories).indexOf(key);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-gray-700">{waiterCategoryLabels[key] || key}</span>
                        <span className="text-[11px] font-semibold text-gray-900">{value}/5</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[catIndex % colors.length]}`} style={{ width: `${(value / 5) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Avaliacoes Recentes</h4>
          {waiterReviews.length === 0 ? (
            <p className="text-[11px] text-gray-400 text-center py-4">Nenhuma avaliacao encontrada</p>
          ) : (
            <div className="space-y-3">
              {waiterReviews.slice(0, 10).map(review => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={review.overall_rating} size={12} />
                      <span className="text-[11px] font-semibold text-gray-700">{review.overall_rating}/5</span>
                      {review.redirected_to_google && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">Google</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {(() => { const d = new Date(review.created_at); return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }); })()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-[11px] text-gray-600 mt-1 italic">&quot;{review.comment}&quot;</p>
                  )}
                  {review.category_ratings && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(review.category_ratings).map(([key, val]) => (
                        <span key={key} className="text-[9px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
                          {waiterCategoryLabels[key] || key}: <b>{val}/5</b>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          Garçons ({waiters.length})
        </h3>
        <button
          onClick={() => setShowAddWaiter(!showAddWaiter)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#007AFF] text-white rounded-xl text-[12px] font-medium hover:bg-[#0066DD] transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Garçom
        </button>
      </div>

      {/* Add waiter form */}
      {showAddWaiter && (
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-xs font-medium text-blue-800 mb-2">Novo Garçom</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newWaiterName}
              onChange={(e) => setNewWaiterName(e.target.value)}
              placeholder="Nome do garçom"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddWaiter()}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
            />
            <button onClick={handleAddWaiter} disabled={addingWaiter || !newWaiterName.trim()} className="px-4 py-2.5 bg-[#007AFF] text-white rounded-lg text-xs font-medium hover:bg-[#0066DD] disabled:opacity-50 transition-colors">
              {addingWaiter ? '...' : 'Salvar'}
            </button>
            <button onClick={() => { setShowAddWaiter(false); setNewWaiterName(''); }} className="px-3 py-2.5 text-gray-400 hover:text-gray-600 text-xs">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* General QR Code */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-700">QR Code Geral</p>
            <p className="text-[10px] text-gray-400 mt-0.5">criadores.app/avaliar/{subscription?.business_slug}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => handleShowQR()} className="flex items-center gap-1.5 px-3 py-2 bg-[#007AFF] text-white rounded-lg text-[11px] font-medium hover:bg-[#0066DD] transition-colors">
              <QrCode className="w-3.5 h-3.5" /> QR Code
            </button>
            <button onClick={() => handleCopyLink()} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              {copiedId === 'general' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copiedId === 'general' ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      {/* Waiter cards */}
      {waiters.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">Nenhum garçom cadastrado</p>
          <p className="text-xs text-gray-400">Adicione garçons para rastrear avaliações individuais e gerar QR codes personalizados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {waiters.map((waiter) => {
            const stats = getWaiterStats(waiter.id);
            return (
              <div
                key={waiter.id}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedWaiter(waiter.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-sm font-bold text-[#007AFF]">
                      {waiter.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{waiter.name}</p>
                      {stats ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarDisplay rating={stats.avg_rating} size={10} />
                          <span className="text-[10px] text-gray-400">
                            {stats.avg_rating.toFixed(1)} • {stats.total_reviews} avaliações • {stats.five_star_count} ★5
                          </span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 mt-0.5">Sem avaliações ainda</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleShowQR(waiter)} className="flex items-center gap-1.5 px-3 py-2 bg-[#007AFF] text-white rounded-lg text-[11px] font-medium hover:bg-[#0066DD] transition-colors">
                      <QrCode className="w-3 h-3" /> QR
                    </button>
                    <button onClick={() => handleCopyLink(waiter)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      {copiedId === waiter.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedId === waiter.id ? 'Copiado!' : 'Link'}
                    </button>
                    <button onClick={() => handleRemoveWaiter(waiter.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" title="Remover garçom">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// Default categories (restaurant)
// ============================================
const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { key: 'atendimento', label: 'Atendimento', emoji: '🤝' },
  { key: 'comida', label: 'Qualidade da comida', emoji: '🍽️' },
  { key: 'tempo_espera', label: 'Tempo de espera', emoji: '⏱️' },
  { key: 'ambiente', label: 'Ambiente', emoji: '✨' },
  { key: 'custo_beneficio', label: 'Custo-benefício', emoji: '💰' },
];

const EMOJI_OPTIONS = ['🤝', '🍽️', '⏱️', '✨', '💰', '⭐', '🎯', '💬', '🏢', '🛠️', '📦', '🚀', '💡', '🎨', '📱', '🔧', '👥', '📊', '🏥', '⚖️'];

// ============================================
// SettingsTab Component
// ============================================
function SettingsTab({
  subscription,
  onUpdate,
}: {
  subscription: Subscription;
  onUpdate: (updated: Subscription) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Alert contacts
  const [contacts, setContacts] = useState<AlertContact[]>(
    Array.isArray(subscription.alert_contacts) && subscription.alert_contacts.length > 0
      ? subscription.alert_contacts
      : subscription.alert_whatsapp
        ? [{ name: 'Principal', phone: subscription.alert_whatsapp, active: true }]
        : []
  );
  const [threshold, setThreshold] = useState(subscription.alert_threshold ?? 4);

  // Categories
  const [categories, setCategories] = useState<CategoryConfig[]>(
    subscription.custom_categories || DEFAULT_CATEGORIES
  );
  const [categoriesChanged, setCategoriesChanged] = useState(false);

  // Google URL
  const [googleUrl, setGoogleUrl] = useState(subscription.google_reviews_url || '');

  const addContact = () => {
    if (contacts.length >= 5) return;
    setContacts([...contacts, { name: '', phone: '', active: true }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: keyof AlertContact, value: string | boolean) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const addCategory = () => {
    if (categories.length >= 8) return;
    setCategoriesChanged(true);
    setCategories([...categories, { key: `cat_${Date.now()}`, label: '', emoji: '⭐' }]);
  };

  const removeCategory = (index: number) => {
    if (categories.length <= 1) return;
    setCategoriesChanged(true);
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, field: keyof CategoryConfig, value: string) => {
    setCategoriesChanged(true);
    const updated = [...categories];
    if (field === 'label') {
      // Auto-generate key from label
      const key = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      updated[index] = { ...updated[index], label: value, key: key || updated[index].key };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setCategories(updated);
  };

  const resetToDefault = () => {
    setCategoriesChanged(true);
    setCategories([...DEFAULT_CATEGORIES]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Determine if categories actually differ from what's saved
      const savedCats = subscription.custom_categories || DEFAULT_CATEGORIES;
      const catsAreSame = JSON.stringify(categories) === JSON.stringify(savedCats);
      const isDefault = JSON.stringify(categories) === JSON.stringify(DEFAULT_CATEGORIES);

      const res = await fetch('/api/excelencia5/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: subscription.id,
          alert_contacts: contacts.filter(c => c.phone), // Remove empty
          alert_threshold: threshold,
          custom_categories: catsAreSame ? undefined : (isDefault ? null : categories),
          google_reviews_url: googleUrl || null,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onUpdate(data.data);
        setSaved(true);
        setCategoriesChanged(false);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
    setSaving(false);
  };

  const lastCategoryChange = Array.isArray(subscription.categories_history) && subscription.categories_history.length > 0
    ? subscription.categories_history[subscription.categories_history.length - 1]
    : null;

  return (
    <div className="space-y-6">
      {/* Section: Alert Contacts */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <Phone className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Alertas WhatsApp</h3>
            <p className="text-[10px] text-gray-400">Receba notificações de avaliações negativas</p>
          </div>
        </div>

        {/* Threshold */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <label className="text-[11px] font-medium text-gray-600 block mb-2">
            Alertar quando a nota for menor ou igual a:
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((t) => (
              <button
                key={t}
                onClick={() => setThreshold(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  threshold === t
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                ≤ {t} {'⭐'.repeat(t)}
              </button>
            ))}
          </div>
        </div>

        {/* Contact List */}
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={contact.name}
                onChange={(e) => updateContact(index, 'name', e.target.value)}
                placeholder="Nome (ex: Gerente)"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
              />
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => updateContact(index, 'phone', e.target.value)}
                placeholder="(43) 99999-9999"
                className="w-44 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none font-mono"
              />
              <button
                onClick={() => updateContact(index, 'active', !contact.active)}
                className={`px-3 py-2 rounded-lg text-[10px] font-medium transition-all ${
                  contact.active
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                }`}
              >
                {contact.active ? 'Ativo' : 'Inativo'}
              </button>
              <button
                onClick={() => removeContact(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-gray-400">Digite apenas os números do WhatsApp (ex: 43991937770)</p>

        <div className="mt-3 flex items-center gap-3">
          {contacts.length < 5 && (
            <button
              onClick={addContact}
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#007AFF] hover:text-[#0066DD] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar contato
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto px-4 py-2 bg-[#007AFF] text-white rounded-lg text-[11px] font-semibold hover:bg-[#0066DD] transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? (
              <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Salvando...</>
            ) : saved ? (
              <><Check className="w-3 h-3" />Salvo!</>
            ) : (
              'Salvar alertas'
            )}
          </button>
        </div>
      </div>

      {/* Section: Custom Categories */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Categorias de Avaliação</h3>
            <p className="text-[10px] text-gray-400">Personalize as perguntas "O que podemos melhorar?"</p>
          </div>
        </div>

        {/* Warning */}
        {categoriesChanged && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-medium text-amber-800">
                Alterar as categorias pode afetar a análise comparativa dos dados.
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5">
                Recomendamos manter as mesmas categorias por pelo menos 30 dias para garantir padrões consistentes de respostas.
              </p>
            </div>
          </div>
        )}

        {lastCategoryChange && (
          <div className="mb-4 p-2 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-400">
              Última alteração: {new Date(lastCategoryChange.changed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}

        {/* Category List */}
        <div className="space-y-2">
          {categories.map((cat, index) => (
            <div key={index} className="flex items-center gap-2">
              {/* Emoji selector */}
              <div className="relative group">
                <button className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg text-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                  {cat.emoji}
                </button>
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 hidden group-hover:grid grid-cols-5 gap-1 z-50 w-48">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => updateCategory(index, 'emoji', emoji)}
                      className="w-8 h-8 text-lg flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={cat.label}
                onChange={(e) => updateCategory(index, 'label', e.target.value)}
                placeholder="Nome da categoria"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
              />
              {categories.length > 1 && (
                <button
                  onClick={() => removeCategory(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-3">
          {categories.length < 8 && (
            <button
              onClick={addCategory}
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#007AFF] hover:text-[#0066DD] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar categoria ({categories.length}/8)
            </button>
          )}
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Restaurar padrão (Restaurante)
          </button>
        </div>

        {/* Preview */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Preview do formulário</p>
          <div className="space-y-2">
            {categories.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm">{cat.emoji}</span>
                <span className="text-xs text-gray-700">{cat.label || '(sem nome)'}</span>
                <div className="flex gap-0.5 ml-auto">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width={12} height={12} viewBox="0 0 24 24" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section: Google Maps URL */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Link Google Maps</h3>
            <p className="text-[10px] text-gray-400">URL para redirecionar avaliações 5 estrelas</p>
          </div>
        </div>
        <input
          type="url"
          value={googleUrl}
          onChange={(e) => setGoogleUrl(e.target.value)}
          placeholder="https://search.google.com/local/writereview?placeid=..."
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none font-mono"
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#007AFF] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:bg-[#0066DD] transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Salvo!
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              Salvar Configurações
            </>
          )}
        </button>
        {saved && (
          <span className="text-xs text-green-600 font-medium">Configurações atualizadas com sucesso</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// Main Page
// ============================================
export default function ExcelencIA5Page() {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [googleData, setGoogleData] = useState<GoogleReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [noSubscription, setNoSubscription] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Waiter management
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newWaiterName, setNewWaiterName] = useState('');
  const [addingWaiter, setAddingWaiter] = useState(false);
  const [showAddWaiter, setShowAddWaiter] = useState(false);

  // QR Modal
  const [qrModal, setQrModal] = useState<{ url: string; dataUrl: string; name: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Reviews pagination & date filter
  const [reviewsPage, setReviewsPage] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [filterWaiterId, setFilterWaiterId] = useState<string>('all');
  const REVIEWS_PER_PAGE = 10;

  const applyQuickFilter = (filterId: string) => {
    const now = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    let from = '';
    let to = fmt(now);

    if (filterId === activeQuickFilter) {
      // Toggle off
      setDateFrom(''); setDateTo(''); setActiveQuickFilter(null); setReviewsPage(0);
      return;
    }

    switch (filterId) {
      case 'today': {
        from = fmt(now);
        break;
      }
      case '7days': {
        const d = new Date(now); d.setDate(d.getDate() - 6);
        from = fmt(d);
        break;
      }
      case '30days': {
        const d = new Date(now); d.setDate(d.getDate() - 29);
        from = fmt(d);
        break;
      }
      case 'this_month': {
        from = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
        break;
      }
      case 'last_month': {
        const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const last = new Date(now.getFullYear(), now.getMonth(), 0);
        from = fmt(first);
        to = fmt(last);
        break;
      }
      case 'this_year': {
        from = fmt(new Date(now.getFullYear(), 0, 1));
        break;
      }
    }
    setDateFrom(from); setDateTo(to); setActiveQuickFilter(filterId); setReviewsPage(0);
  };

  const businessId = user?.business_id;

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const subRes = await fetch(`/api/excelencia5/subscription?business_id=${businessId}`);
      const subData = await subRes.json();

      if (!subData.success || !subData.data) {
        setNoSubscription(true);
        setLoading(false);
        return;
      }

      setSubscription(subData.data);

      const [analyticsRes, waitersRes, googleRes] = await Promise.all([
        fetch(`/api/excelencia5/analytics?business_id=${businessId}`),
        fetch(`/api/excelencia5/waiters?business_id=${businessId}`),
        fetch(`/api/excelencia5/google-reviews?business_id=${businessId}`),
      ]);

      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) setAnalytics(analyticsData.data);

      const waitersData = await waitersRes.json();
      if (waitersData.success) setWaiters(waitersData.data || []);

      const googleResData = await googleRes.json();
      if (googleResData.success) setGoogleData(googleResData.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  // Fetch reviews (separate, paginated)
  const fetchReviews = useCallback(async () => {
    if (!businessId) return;
    try {
      const res = await fetch(`/api/excelencia5/reviews?business_id=${businessId}&limit=50`);
      const data = await res.json();
      if (data.success) setReviews(data.data || []);
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
    }
  }, [businessId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (activeTab === 'reviews' || activeTab === 'waiters') fetchReviews(); }, [activeTab, fetchReviews]);

  // Waiter actions
  const handleAddWaiter = async () => {
    if (!newWaiterName.trim() || !businessId) return;
    setAddingWaiter(true);
    try {
      const res = await fetch('/api/excelencia5/waiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId, name: newWaiterName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setWaiters((prev) => [...prev, data.data]);
        setNewWaiterName('');
        setShowAddWaiter(false);
        fetchData(); // refresh analytics
      }
    } catch (err) {
      console.error('Erro ao adicionar garçom:', err);
    } finally {
      setAddingWaiter(false);
    }
  };

  const handleRemoveWaiter = async (waiterId: string) => {
    try {
      await fetch(`/api/excelencia5/waiters?id=${waiterId}`, { method: 'DELETE' });
      setWaiters((prev) => prev.map((w) => w.id === waiterId ? { ...w, is_active: false } : w));
    } catch (err) {
      console.error('Erro ao remover garçom:', err);
    }
  };

  const handleShowQR = async (waiter?: Waiter) => {
    if (!subscription) return;
    setQrLoading(true);
    try {
      const params = new URLSearchParams({ business_slug: subscription.business_slug });
      if (waiter?.slug) params.set('waiter_slug', waiter.slug);
      const res = await fetch(`/api/excelencia5/qrcode?${params}`);
      const data = await res.json();
      if (data.success) {
        setQrModal({
          url: data.data.url,
          dataUrl: data.data.qrcode_data_url,
          name: waiter?.name || 'QR Code Geral',
        });
      }
    } catch (err) {
      console.error('Erro ao gerar QR:', err);
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrModal) return;
    const link = document.createElement('a');
    link.download = `qrcode-${qrModal.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = qrModal.dataUrl;
    link.click();
  };

  const handleCopyLink = async (waiter?: Waiter) => {
    if (!subscription) return;
    const url = waiter
      ? `https://criadores.app/avaliar/${subscription.business_slug}?garcom=${waiter.slug}`
      : `https://criadores.app/avaliar/${subscription.business_slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(waiter?.id || 'general');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No subscription
  if (noSubscription) {
    return (
      <div className="px-6 md:px-8 max-w-4xl mx-auto pt-12 pb-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">excelencIA5</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            O sistema de avaliações Google ainda não está ativo para o seu negócio.
            Entre em contato com a equipe crIAdores para ativar.
          </p>
          <a
            href="https://wa.me/5543999999999?text=Olá! Gostaria de ativar o excelencIA5 para meu negócio."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#007AFF] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#0066DD] transition-colors"
          >
            Falar com a equipe
          </a>
        </div>
      </div>
    );
  }

  const fiveStarRate = analytics && analytics.total_reviews > 0
    ? ((analytics.star_distribution[5] || 0) / analytics.total_reviews * 100).toFixed(0)
    : '0';

  const activeWaiters = waiters.filter(w => w.is_active);

  // Dynamic category labels based on subscription config
  const CATEGORY_LABELS = getCategoryLabels(subscription?.custom_categories || null);
  const RADAR_CATS = getRadarCategories(subscription?.custom_categories || null);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'waiters', label: 'Garçons' },
    { id: 'reviews', label: 'Avaliações' },
    { id: 'google', label: 'Google Maps' },
    { id: 'settings', label: 'Configurações' },
  ];

  const filteredReviews = reviews.filter((review) => {
    // Waiter filter
    if (filterWaiterId !== 'all') {
      if (filterWaiterId === 'none') {
        if (review.waiter_id) return false;
      } else {
        if (review.waiter_id !== filterWaiterId) return false;
      }
    }
    // Date filter
    const reviewDate = new Date(review.created_at);
    if (isNaN(reviewDate.getTime())) return true;
    if (dateFrom) {
      const from = new Date(dateFrom + 'T00:00:00');
      if (reviewDate < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59');
      if (reviewDate > to) return false;
    }
    return true;
  });
  const paginatedReviews = filteredReviews.slice(reviewsPage * REVIEWS_PER_PAGE, (reviewsPage + 1) * REVIEWS_PER_PAGE);
  const totalReviewPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);

  return (
    <div className="px-6 md:px-8 max-w-[1200px] mx-auto pt-6 md:pt-8 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">excelencIA5</h1>
        <p className="text-sm text-gray-500 mt-1">Gestão de avaliações e reputação Google</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-full p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================ */}
      {/* TAB: Overview */}
      {/* ============================================ */}
      {activeTab === 'overview' && (
        <>
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <h2 className="text-lg font-black text-gray-900 italic uppercase tracking-tight">Os Números</h2>
          </div>

          {/* KPI Cards - Bread King style */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <BarChart3 className="w-5 h-5 text-gray-300 mb-3" />
              <p className="text-3xl font-black text-gray-900">{analytics?.total_reviews || 0}</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Total Avaliações</p>
              <p className="text-[9px] text-gray-300 mt-0.5">Coletadas pelo sistema</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <Star className="w-5 h-5 text-gray-300 mb-3" />
              <p className="text-3xl font-black text-gray-900">{analytics?.avg_rating?.toFixed(1) || '0.0'}</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Nota Média</p>
              <p className="text-[9px] text-gray-300 mt-0.5">De 5 estrelas</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <ExternalLink className="w-5 h-5 text-gray-300 mb-3" />
              <p className="text-3xl font-black text-gray-900">{analytics?.google_redirects || 0}</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Enviados p/ Google</p>
              <p className="text-[9px] text-gray-300 mt-0.5">Redirecionamentos</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <Star className="w-5 h-5 text-gray-300 mb-3" />
              <p className="text-3xl font-black text-gray-900">{fiveStarRate}<span className="text-lg">%</span></p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Taxa 5 Estrelas</p>
              <p className="text-[9px] text-gray-300 mt-0.5">Avaliações perfeitas</p>
            </div>
          </div>

          {/* Google Maps Card (if has profile) */}
          {googleData?.has_profile && (
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#4285F4]/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#4285F4]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{googleData.business_name_on_google || 'Google Maps'}</p>
                    <p className="text-[9px] text-gray-400">Perfil verificado</p>
                  </div>
                </div>
                {googleData.google_maps_url && (
                  <a href={googleData.google_maps_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-medium text-gray-600 hover:bg-gray-200 transition-colors">
                    Ver no Google <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-black text-gray-900">{googleData.rating?.toFixed(1) || '—'}</p>
                  <StarDisplay rating={googleData.rating || 0} size={12} />
                  <p className="text-[9px] text-gray-300 mt-0.5">Nota Google</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{googleData.reviews_count?.toLocaleString() || '—'}</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Avaliações</p>
                  <p className="text-[9px] text-gray-300 mt-0.5">No Google Maps</p>
                </div>
                {googleData.positive_sentiment_pct != null && (
                  <div>
                    <p className="text-2xl font-black text-emerald-600">{googleData.positive_sentiment_pct}%</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Sentimento</p>
                    <p className="text-[9px] text-gray-300 mt-0.5">Positivo</p>
                  </div>
                )}
                {googleData.response_rate != null && (
                  <div>
                    <p className="text-2xl font-black text-[#007AFF]">{googleData.response_rate}%</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Resposta</p>
                    <p className="text-[9px] text-gray-300 mt-0.5">Taxa de resposta</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distribution + Categories Section Title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-gray-400" />
            </div>
            <h2 className="text-lg font-black text-gray-900 italic uppercase tracking-tight">Detalhamento</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Star Distribution */}
            {analytics && analytics.total_reviews > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Distribuição de Notas</h3>
                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = analytics.star_distribution[star] || 0;
                    const pct = analytics.total_reviews > 0 ? (count / analytics.total_reviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-500 w-6 text-right">{star}★</span>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${star >= 4 ? 'bg-emerald-400' : star === 3 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-16 text-right">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category Averages */}
            {analytics && Object.keys(analytics.category_averages || {}).length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Média por Categoria</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.category_averages).map(([key, val]) => {
                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-teal-500', 'bg-amber-500'];
                    const idx = Object.keys(analytics.category_averages).indexOf(key);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">{CATEGORY_LABELS[key] || key}</span>
                          <span className="text-xs font-semibold text-gray-800">{val.toFixed(1)} / 5</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors[idx % colors.length]}`}
                            style={{ width: `${(val / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Top Waiters */}
          {analytics?.waiter_ranking && analytics.waiter_ranking.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ranking de Garçons</h3>
              </div>
              <div className="space-y-2">
                {analytics.waiter_ranking.slice(0, 5).map((waiter, i) => (
                  <div key={waiter.waiter_id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i === 0 ? 'bg-amber-100 text-amber-700' :
                      i === 1 ? 'bg-gray-100 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-800">{waiter.name}</p>
                      <p className="text-[10px] text-gray-400">{waiter.total_reviews} avaliações • {waiter.five_star_count} ★5</p>
                    </div>
                    <div className="text-right">
                      <StarDisplay rating={waiter.avg_rating} size={11} />
                      <p className="text-[10px] font-semibold text-gray-600 mt-0.5">{waiter.avg_rating.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================ */}
      {/* TAB: Waiters */}
      {/* ============================================ */}
      {activeTab === 'waiters' && (
        <WaitersTab
          waiters={activeWaiters}
          analytics={analytics}
          reviews={reviews}
          subscription={subscription}
          showAddWaiter={showAddWaiter}
          setShowAddWaiter={setShowAddWaiter}
          newWaiterName={newWaiterName}
          setNewWaiterName={setNewWaiterName}
          addingWaiter={addingWaiter}
          handleAddWaiter={handleAddWaiter}
          handleShowQR={handleShowQR}
          handleCopyLink={handleCopyLink}
          handleRemoveWaiter={handleRemoveWaiter}
          copiedId={copiedId}
          fetchReviews={fetchReviews}
        />
      )}

      {/* ============================================ */}
      {/* TAB: Reviews */}
      {/* ============================================ */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              Avaliações Recebidas ({filteredReviews.length}{filteredReviews.length !== reviews.length ? ` de ${reviews.length}` : ''})
            </h3>
          </div>

          {/* Date Filter */}
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            {/* Quick filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              {[
                { id: 'today', label: 'Hoje' },
                { id: '7days', label: '7 dias' },
                { id: '30days', label: '30 dias' },
                { id: 'this_month', label: 'Este mês' },
                { id: 'last_month', label: 'Mês passado' },
                { id: 'this_year', label: 'Este ano' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => applyQuickFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    activeQuickFilter === f.id
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); setActiveQuickFilter(null); setReviewsPage(0); }}
                  className="px-3 py-1.5 text-[11px] text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>
            {/* Custom date range */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Personalizado</span>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-gray-500">De:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setActiveQuickFilter(null); setReviewsPage(0); }}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-gray-500">Até:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setActiveQuickFilter(null); setReviewsPage(0); }}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Waiter filter */}
            {waiters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <Users className="w-4 h-4 text-gray-400 shrink-0" />
                <button
                  onClick={() => { setFilterWaiterId('all'); setReviewsPage(0); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    filterWaiterId === 'all' ? 'bg-[#007AFF] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                {waiters.filter(w => w.is_active).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => { setFilterWaiterId(w.id); setReviewsPage(0); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      filterWaiterId === w.id ? 'bg-[#007AFF] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
                <button
                  onClick={() => { setFilterWaiterId('none'); setReviewsPage(0); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    filterWaiterId === 'none' ? 'bg-[#007AFF] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sem garçom
                </button>
              </div>
            )}
          </div>

          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">
                {reviews.length > 0 ? 'Nenhuma avaliação com esses filtros' : 'Nenhuma avaliação ainda'}
              </p>
              <p className="text-xs text-gray-400">
                {reviews.length > 0 ? 'Tente ajustar os filtros de data ou garçom.' : 'As avaliações dos clientes aparecerão aqui.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedReviews.map((review) => {
                  const waiterName = waiters.find(w => w.id === review.waiter_id)?.name;
                  return (
                    <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StarDisplay rating={review.overall_rating} size={14} />
                          <span className="text-xs font-semibold text-gray-700">{review.overall_rating}/5</span>
                          {review.redirected_to_google && (
                            <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                              → Google
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {(() => { const d = new Date(review.created_at); return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); })()}
                        </span>
                      </div>

                      {waiterName && (
                        <p className="text-[10px] text-gray-400 mb-2">
                          <Users className="w-3 h-3 inline mr-1" />
                          Garçom: {waiterName}
                        </p>
                      )}

                      {review.comment && (
                        <p className="text-xs text-gray-600 mb-2 italic">"{review.comment}"</p>
                      )}

                      {review.category_ratings && Object.keys(review.category_ratings).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(review.category_ratings).map(([key, val]) => (
                            <span key={key} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded-lg">
                              {CATEGORY_LABELS[key] || key}: <strong>{val}/5</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      {review.customer_phone && (
                        <p className="text-[10px] text-gray-400 mt-2">
                          📱 {review.customer_phone}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalReviewPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setReviewsPage(Math.max(0, reviewsPage - 1))}
                    disabled={reviewsPage === 0}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="text-xs text-gray-400">
                    {reviewsPage + 1} de {totalReviewPages}
                  </span>
                  <button
                    onClick={() => setReviewsPage(Math.min(totalReviewPages - 1, reviewsPage + 1))}
                    disabled={reviewsPage >= totalReviewPages - 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 disabled:opacity-40"
                  >
                    Próximo
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* TAB: Google Maps */}
      {/* ============================================ */}
      {activeTab === 'google' && (
        <div className="space-y-4">
          {!googleData?.has_profile ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">Google Maps nao vinculado</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                O perfil do Google Maps do seu negocio ainda nao esta vinculado.
                Entre em contato com a equipe crIAdores para configurar.
              </p>
            </div>
          ) : (
            <>
              {/* Google Maps Header */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#4285F4] flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      {googleData.business_name_on_google || 'Seu Negocio'}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      Perfil do Google Maps
                      {googleData.last_sync_at && (
                        <> &middot; Atualizado: {new Date(googleData.last_sync_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</>
                      )}
                    </p>
                  </div>
                  {googleData.google_maps_url && (
                    <a href={googleData.google_maps_url} target="_blank" rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-[#4285F4] text-white rounded-lg text-[11px] font-medium hover:bg-[#3367D6] transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      Ver no Google
                    </a>
                  )}
                </div>

                {/* KPIs - Bread King style */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <Star className="w-4 h-4 text-gray-300 mb-2" />
                    <p className="text-2xl font-black text-gray-900">{googleData.rating?.toFixed(1) || '-'}<span className="text-sm text-gray-400">/5</span></p>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Nota Google</p>
                    {googleData.growth && googleData.growth.rating_change !== 0 && (
                      <p className={`text-[9px] mt-0.5 font-semibold ${googleData.growth.rating_change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {googleData.growth.rating_change > 0 ? '+' : ''}{googleData.growth.rating_change.toFixed(1)}
                      </p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <BarChart3 className="w-4 h-4 text-gray-300 mb-2" />
                    <p className="text-2xl font-black text-gray-900">{googleData.reviews_count?.toLocaleString() || '-'}</p>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Reviews</p>
                    {googleData.growth && googleData.growth.reviews_gained > 0 && (
                      <p className="text-[9px] text-emerald-500 mt-0.5 font-semibold">+{googleData.growth.reviews_gained} novos</p>
                    )}
                  </div>
                  {googleData.positive_sentiment_pct != null && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Star className="w-4 h-4 text-gray-300 mb-2" />
                      <p className="text-2xl font-black text-emerald-600">{googleData.positive_sentiment_pct}%</p>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Positivas</p>
                    </div>
                  )}
                  {googleData.response_rate != null && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Star className="w-4 h-4 text-gray-300 mb-2" />
                      <p className="text-2xl font-black text-[#007AFF]">{googleData.response_rate}%</p>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Taxa Resposta</p>
                    </div>
                  )}
                  {googleData.growth && googleData.growth.avg_reviews_per_month > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <BarChart3 className="w-4 h-4 text-gray-300 mb-2" />
                      <p className="text-2xl font-black text-gray-900">{googleData.growth.avg_reviews_per_month.toFixed(1)}</p>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Reviews/Mes</p>
                    </div>
                  )}
                  {googleData.growth && googleData.growth.days_monitored > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <BarChart3 className="w-4 h-4 text-gray-300 mb-2" />
                      <p className="text-2xl font-black text-gray-900">{googleData.growth.days_monitored}</p>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Dias Monitorado</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Star Distribution + Sentiment */}
              {googleData.star_distribution && (() => {
                const sd = googleData.star_distribution;
                const stars = [
                  { star: 5, count: sd.reviews_5_star },
                  { star: 4, count: sd.reviews_4_star },
                  { star: 3, count: sd.reviews_3_star },
                  { star: 2, count: sd.reviews_2_star },
                  { star: 1, count: sd.reviews_1_star },
                ];
                const totalStars = stars.reduce((acc, s) => acc + s.count, 0);
                if (totalStars === 0) return null;

                const sentimentData = [
                  { label: 'Positivas', sublabel: '4-5 estrelas', count: sd.reviews_5_star + sd.reviews_4_star, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
                  { label: 'Neutras', sublabel: '3 estrelas', count: sd.reviews_3_star, color: 'bg-amber-400', textColor: 'text-amber-600' },
                  { label: 'Negativas', sublabel: '1-2 estrelas', count: sd.reviews_2_star + sd.reviews_1_star, color: 'bg-red-500', textColor: 'text-red-600' },
                ];

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Distribuicao Google</h3>
                      <div className="space-y-2">
                        {stars.map(({ star, count }) => {
                          const pct = totalStars > 0 ? (count / totalStars) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-gray-600 w-4">{star}</span>
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[10px] text-gray-500 w-8 text-right">{count}</span>
                              <span className="text-[9px] text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Sentimento</h3>
                      <div className="space-y-3">
                        {sentimentData.map(item => {
                          const pct = totalStars > 0 ? Math.round((item.count / totalStars) * 100) : 0;
                          return (
                            <div key={item.label}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                  <span className="text-[11px] font-medium text-gray-700">{item.label}</span>
                                  <span className="text-[9px] text-gray-400">({item.sublabel})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[11px] font-bold ${item.textColor}`}>{item.count}</span>
                                  <span className="text-[10px] text-gray-400">{pct}%</span>
                                </div>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Google Reviews List */}
              {googleData.reviews && googleData.reviews.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Avaliacoes no Google ({googleData.reviews.length})
                  </h3>
                  <div className="space-y-4">
                    {googleData.reviews.map((review, idx) => (
                      <div key={idx} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start gap-3">
                          {review.author_photo_url ? (
                            <img src={review.author_photo_url} alt={review.author_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#4285F4]/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[11px] font-bold text-[#4285F4]">{review.author_name?.charAt(0)?.toUpperCase() || '?'}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[12px] font-semibold text-gray-800">{review.author_name}</span>
                              {review.relative_time && (
                                <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{review.relative_time}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 mb-1.5">
                              <StarDisplay rating={review.rating} size={11} />
                            </div>
                            {review.text && (
                              <p className="text-[11px] text-gray-600 leading-relaxed">{review.text}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* TAB: Settings */}
      {/* ============================================ */}
      {activeTab === 'settings' && subscription && (
        <SettingsTab
          subscription={subscription}
          onUpdate={(updated) => setSubscription(updated)}
        />
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setQrModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <button onClick={() => setQrModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{qrModal.name}</h3>
              <p className="text-[10px] text-gray-400 mb-4">Escaneie para avaliar</p>
              <img src={qrModal.dataUrl} alt="QR Code" className="w-52 h-52 mx-auto rounded-xl mb-4" />
              <p className="text-[10px] text-gray-500 break-all mb-4 px-2">{qrModal.url}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#007AFF] text-white rounded-xl text-xs font-medium hover:bg-[#0066DD] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(qrModal.url); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
