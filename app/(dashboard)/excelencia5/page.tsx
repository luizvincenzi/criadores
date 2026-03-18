'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Star, Users, BarChart3, ExternalLink, QrCode, Plus, Copy, Check, Download, ChevronRight } from 'lucide-react';

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
// Main Page
// ============================================
export default function ExcelencIA5Page() {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [noSubscription, setNoSubscription] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newWaiterName, setNewWaiterName] = useState('');
  const [addingWaiter, setAddingWaiter] = useState(false);
  const [showAddWaiter, setShowAddWaiter] = useState(false);
  const [qrModal, setQrModal] = useState<{ url: string; dataUrl: string; name: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const businessId = user?.business_id;

  // Fetch subscription data
  const fetchData = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      // Fetch subscription
      const subRes = await fetch(`/api/excelencia5/subscription?business_id=${businessId}`);
      const subData = await subRes.json();

      if (!subData.success || !subData.data) {
        setNoSubscription(true);
        setLoading(false);
        return;
      }

      setSubscription(subData.data);

      // Fetch analytics and waiters in parallel
      const [analyticsRes, waitersRes] = await Promise.all([
        fetch(`/api/excelencia5/analytics?business_id=${businessId}`),
        fetch(`/api/excelencia5/waiters?business_id=${businessId}`),
      ]);

      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) setAnalytics(analyticsData.data);

      const waitersData = await waitersRes.json();
      if (waitersData.success) setWaiters(waitersData.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  // ============================================
  // Loading
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ============================================
  // No subscription
  // ============================================
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

  // ============================================
  // Dashboard
  // ============================================
  return (
    <div className="px-6 md:px-8 max-w-[1200px] mx-auto pt-6 md:pt-8 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">excelencIA5</h1>
        <p className="text-sm text-gray-500 mt-1">Gestão de avaliações e reputação Google</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#007AFF] flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Avaliações</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics?.total_reviews || 0}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
              <Star className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Média</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics?.avg_rating?.toFixed(1) || '0.0'}<span className="text-sm font-normal text-gray-400">/5</span></p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <ExternalLink className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Google</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics?.google_redirects || 0}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
              <Star className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Taxa 5★</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fiveStarRate}<span className="text-sm font-normal text-gray-400">%</span></p>
        </div>
      </div>

      {/* Star Distribution */}
      {analytics && analytics.total_reviews > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Distribuição de Avaliações</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = analytics.star_distribution[star] || 0;
              const pct = analytics.total_reviews > 0 ? (count / analytics.total_reviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 w-6 text-right">{star}★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${star >= 4 ? 'bg-emerald-400' : star === 3 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{count} ({pct.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Waiters + QR Codes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">
            <Users className="w-4 h-4 inline mr-1.5 text-gray-400" />
            Garçons ({waiters.filter(w => w.is_active).length})
          </h3>
          <button
            onClick={() => setShowAddWaiter(!showAddWaiter)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#007AFF] text-white rounded-lg text-[11px] font-medium hover:bg-[#0066DD] transition-colors"
          >
            <Plus className="w-3 h-3" />
            Adicionar
          </button>
        </div>

        {/* Add waiter form */}
        {showAddWaiter && (
          <div className="flex items-center gap-2 mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <input
              type="text"
              value={newWaiterName}
              onChange={(e) => setNewWaiterName(e.target.value)}
              placeholder="Nome do garçom"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddWaiter()}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleAddWaiter}
              disabled={addingWaiter || !newWaiterName.trim()}
              className="px-3 py-2 bg-[#007AFF] text-white rounded-lg text-xs font-medium hover:bg-[#0066DD] disabled:opacity-50 transition-colors"
            >
              {addingWaiter ? '...' : 'Salvar'}
            </button>
            <button
              onClick={() => { setShowAddWaiter(false); setNewWaiterName(''); }}
              className="px-2 py-2 text-gray-400 hover:text-gray-600 text-xs"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* General QR */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-3">
          <div>
            <p className="text-xs font-medium text-gray-700">QR Code Geral</p>
            <p className="text-[10px] text-gray-400 mt-0.5">criadores.app/avaliar/{subscription?.business_slug}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleShowQR()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#007AFF] text-white rounded-lg text-[11px] font-medium hover:bg-[#0066DD] transition-colors"
            >
              <QrCode className="w-3 h-3" />
              QR Code
            </button>
            <button
              onClick={() => handleCopyLink()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {copiedId === 'general' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copiedId === 'general' ? 'Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>

        {/* Waiter list */}
        {waiters.filter(w => w.is_active).length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            Nenhum garçom cadastrado. A equipe crIAdores vai configurar seus garçons.
          </p>
        ) : (
          <div className="space-y-2">
            {waiters.filter(w => w.is_active).map((waiter) => {
              const stats = analytics?.waiter_ranking?.find(w => w.waiter_id === waiter.id);
              return (
                <div key={waiter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[11px] font-bold text-[#007AFF]">
                      {waiter.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{waiter.name}</p>
                      {stats && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarDisplay rating={stats.avg_rating} size={10} />
                          <span className="text-[10px] text-gray-400">
                            {stats.avg_rating.toFixed(1)} • {stats.total_reviews} avaliações
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleShowQR(waiter)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#007AFF] text-white rounded-lg text-[11px] font-medium hover:bg-[#0066DD] transition-colors"
                    >
                      <QrCode className="w-3 h-3" />
                      QR
                    </button>
                    <button
                      onClick={() => handleCopyLink(waiter)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {copiedId === waiter.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedId === waiter.id ? 'Copiado!' : 'Link'}
                    </button>
                    <button
                      onClick={() => handleRemoveWaiter(waiter.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                      title="Remover garçom"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Waiter Ranking */}
      {analytics?.waiter_ranking && analytics.waiter_ranking.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Ranking de Garçons</h3>
          <div className="space-y-2">
            {analytics.waiter_ranking.map((waiter, i) => (
              <div key={waiter.waiter_id} className="flex items-center gap-3 p-2 rounded-xl">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
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

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setQrModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <button onClick={() => setQrModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
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
