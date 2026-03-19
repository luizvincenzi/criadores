'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Star, Users, BarChart3, ExternalLink, QrCode, Plus, Copy, Check, Download, ChevronRight, MapPin, MessageCircle, X, Trash2, ChevronLeft } from 'lucide-react';

// ============================================
// Types
// ============================================
interface Subscription {
  id: string;
  business_id: string;
  is_active: boolean;
  business_slug: string;
  google_reviews_url: string | null;
  alert_whatsapp: string | null;
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
  reviews: Array<{
    author_name: string;
    author_photo_url: string | null;
    rating: number;
    text: string;
    publish_time: string | null;
    relative_time: string | null;
  }>;
}

type TabId = 'overview' | 'waiters' | 'reviews' | 'google';

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
// Category label helper
// ============================================
const CATEGORY_LABELS: Record<string, string> = {
  atendimento: 'Atendimento',
  comida: 'Qualidade da Comida',
  qualidade_comida: 'Qualidade da Comida',
  tempo_espera: 'Tempo de Espera',
  ambiente: 'Ambiente',
  custo_beneficio: 'Custo-benefício',
};

// ============================================
// WaitersTab Component (simplified)
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

        {/* KPIs - Bread King style */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <MessageCircle className="w-5 h-5 text-gray-300 mb-3" />
            <p className="text-3xl font-black text-gray-900">{stats?.total_reviews || 0}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Avaliacoes</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <Star className="w-5 h-5 text-gray-300 mb-3" />
            <p className="text-3xl font-black text-gray-900">{stats?.avg_rating.toFixed(1) || '0.0'}<span className="text-lg text-gray-400">/5</span></p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Nota Media</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <ExternalLink className="w-5 h-5 text-gray-300 mb-3" />
            <p className="text-3xl font-black text-gray-900">{fiveStarPct}<span className="text-lg text-gray-400">%</span></p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">5 Estrelas</p>
          </div>
        </div>

        {/* Category bars */}
        {hasCategories && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Media por Categoria</h4>
            <div className="space-y-3">
              {Object.entries(categories).map(([key, value]) => {
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-teal-500', 'bg-amber-500'];
                const catIndex = Object.keys(categories).indexOf(key);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-gray-700">{CATEGORY_LABELS[key] || key}</span>
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
                          {CATEGORY_LABELS[key] || key}: <b>{val}/5</b>
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

  // Reviews pagination
  const [reviewsPage, setReviewsPage] = useState(0);
  const REVIEWS_PER_PAGE = 10;

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

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'waiters', label: 'Garçons' },
    { id: 'reviews', label: 'Avaliações' },
    { id: 'google', label: 'Google Maps' },
  ];

  const paginatedReviews = reviews.slice(reviewsPage * REVIEWS_PER_PAGE, (reviewsPage + 1) * REVIEWS_PER_PAGE);
  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

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
              Avaliações Recebidas ({reviews.length})
            </h3>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">Nenhuma avaliação ainda</p>
              <p className="text-xs text-gray-400">As avaliações dos clientes aparecerão aqui.</p>
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
              <p className="text-sm font-medium text-gray-600 mb-1">Google Maps não vinculado</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                O perfil do Google Maps do seu negócio ainda não está vinculado.
                Entre em contato com a equipe crIAdores para configurar.
              </p>
            </div>
          ) : (
            <>
              {/* Google Maps Overview Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#4285F4] flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      {googleData.business_name_on_google || 'Seu Negócio'}
                    </h3>
                    <p className="text-[10px] text-gray-400">Perfil do Google Maps</p>
                  </div>
                  {googleData.google_maps_url && (
                    <a href={googleData.google_maps_url} target="_blank" rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-[#4285F4] text-white rounded-lg text-[11px] font-medium hover:bg-[#3367D6] transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      Ver no Google
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Nota</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-900">{googleData.rating?.toFixed(1) || '—'}</p>
                      <StarDisplay rating={googleData.rating || 0} size={12} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total Avaliações</p>
                    <p className="text-2xl font-bold text-gray-900">{googleData.reviews_count?.toLocaleString() || '—'}</p>
                  </div>
                  {googleData.positive_sentiment_pct !== null && googleData.positive_sentiment_pct !== undefined && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Sentimento</p>
                      <p className="text-2xl font-bold text-emerald-600">{googleData.positive_sentiment_pct}%</p>
                    </div>
                  )}
                  {googleData.response_rate !== null && googleData.response_rate !== undefined && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Taxa Resposta</p>
                      <p className="text-2xl font-bold text-[#007AFF]">{googleData.response_rate}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Google Reviews List */}
              {googleData.reviews && googleData.reviews.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Últimas Avaliações no Google</h3>
                  <div className="space-y-3">
                    {googleData.reviews.map((review, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          {review.author_photo_url ? (
                            <img src={review.author_photo_url} alt="" className="w-7 h-7 rounded-full" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#4285F4]/10 flex items-center justify-center text-[10px] font-bold text-[#4285F4]">
                              {review.author_name?.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-gray-700">{review.author_name}</p>
                            <div className="flex items-center gap-1.5">
                              <StarDisplay rating={review.rating} size={10} />
                              {review.relative_time && (
                                <span className="text-[9px] text-gray-400">{review.relative_time}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {review.text && (
                          <p className="text-xs text-gray-600 leading-relaxed">{review.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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
