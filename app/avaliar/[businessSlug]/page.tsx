'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// Types
// ============================================
interface BusinessInfo {
  business_name: string;
  business_slug: string;
  google_reviews_url: string | null;
  waiter_name: string | null;
}

interface CategoryRatings {
  atendimento: number;
  comida: number;
  tempo_espera: number;
  ambiente: number;
  custo_beneficio: number;
}

// ============================================
// Star Component
// ============================================
function Star({
  filled,
  onTap,
  size = 40,
  delay = 0,
}: {
  filled: boolean;
  onTap: () => void;
  size?: number;
  delay?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 1.3 }}
      whileHover={{ scale: 1.1 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.08, type: 'spring', stiffness: 300, damping: 15 }}
      className="focus:outline-none"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? '#FBBF24' : '#E5E7EB'}
        stroke={filled ? '#F59E0B' : '#D1D5DB'}
        strokeWidth="1"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </motion.button>
  );
}

// ============================================
// Category Labels
// ============================================
const CATEGORIES: { key: keyof CategoryRatings; label: string; emoji: string }[] = [
  { key: 'atendimento', label: 'Atendimento', emoji: '🤝' },
  { key: 'comida', label: 'Qualidade da comida', emoji: '🍽️' },
  { key: 'tempo_espera', label: 'Tempo de espera', emoji: '⏱️' },
  { key: 'ambiente', label: 'Ambiente', emoji: '✨' },
  { key: 'custo_beneficio', label: 'Custo-benefício', emoji: '💰' },
];

// ============================================
// Main Page Component
// ============================================
export default function AvaliarPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const businessSlug = params.businessSlug as string;
  const waiterSlug = searchParams.get('garcom');

  const [screen, setScreen] = useState<'loading' | 'rating' | 'details' | 'contact' | 'thanks' | 'redirect' | 'error'>('loading');
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatings>({
    atendimento: 0,
    comida: 0,
    tempo_espera: 0,
    ambiente: 0,
    custo_beneficio: 0,
  });
  const [comment, setComment] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch business info on mount
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const params = new URLSearchParams({ slug: businessSlug });
        if (waiterSlug) params.set('waiter', waiterSlug);

        const res = await fetch(`/api/excelencia5/public/business?${params}`);
        const data = await res.json();

        if (data.success && data.data) {
          setBusinessInfo(data.data);
          setScreen('rating');
        } else {
          setScreen('error');
        }
      } catch {
        setScreen('error');
      }
    };

    fetchBusiness();
  }, [businessSlug, waiterSlug]);

  // Handle star rating selection
  const handleRating = useCallback(
    (rating: number) => {
      setOverallRating(rating);

      if (rating === 5) {
        // 5 stars → redirect to Google (if URL exists) or thank you
        fetch('/api/excelencia5/public/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_slug: businessSlug,
            overall_rating: 5,
            waiter_slug: waiterSlug,
            redirected_to_google: !!businessInfo?.google_reviews_url,
          }),
        }).catch(() => {});

        if (businessInfo?.google_reviews_url) {
          // Has Google URL → redirect
          setScreen('redirect');
          setTimeout(() => {
            window.location.href = businessInfo.google_reviews_url!;
          }, 1500);
        } else {
          // No Google URL → thank you screen
          setScreen('thanks');
        }
      } else {
        // ≤4 stars → detailed feedback
        setScreen('details');
      }
    },
    [businessInfo, businessSlug, waiterSlug]
  );

  // Submit detailed review
  const handleSubmitDetails = useCallback(() => {
    setScreen('contact');
  }, []);

  // Submit contact and finalize
  const handleSubmitContact = useCallback(async () => {
    setSubmitting(true);
    try {
      await fetch('/api/excelencia5/public/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_slug: businessSlug,
          overall_rating: overallRating,
          waiter_slug: waiterSlug,
          category_ratings: categoryRatings,
          comment: comment || null,
          customer_phone: phone || null,
        }),
      });
    } catch {
      // Silently fail — don't block the user
    }
    setSubmitting(false);
    setScreen('thanks');
  }, [businessSlug, overallRating, waiterSlug, categoryRatings, comment, phone]);

  // ============================================
  // Render screens
  // ============================================

  // Loading
  if (screen === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error
  if (screen === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-6xl mb-4">😔</p>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Página não encontrada</h1>
          <p className="text-sm text-gray-500">Este link de avaliação não está disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* ======================== */}
          {/* SCREEN 1: Rating */}
          {/* ======================== */}
          {screen === 'rating' && (
            <motion.div
              key="rating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Business name */}
              <div className="w-16 h-16 bg-[#007AFF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#007AFF]">
                  {businessInfo?.business_name?.charAt(0) || '?'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {businessInfo?.business_name}
              </h1>

              {businessInfo?.waiter_name && (
                <p className="text-sm text-gray-500 mb-6">
                  Atendido por <span className="font-semibold text-gray-700">{businessInfo.waiter_name}</span>
                </p>
              )}

              <p className="text-base text-gray-500 mb-8">
                Como foi sua experiência hoje?
              </p>

              {/* Stars */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    filled={star <= overallRating}
                    onTap={() => handleRating(star)}
                    size={52}
                    delay={star}
                  />
                ))}
              </div>

              <p className="text-xs text-gray-400">
                Toque nas estrelas para avaliar
              </p>
            </motion.div>
          )}

          {/* ======================== */}
          {/* SCREEN: Redirect to Google */}
          {/* ======================== */}
          {screen === 'redirect' && (
            <motion.div
              key="redirect"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Obrigado!</h2>
              <p className="text-sm text-gray-600 mb-1">
                Adoramos saber que sua experiência foi excelente!
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Agora clique em <strong>5 estrelas</strong> no Google para completar sua avaliação
              </p>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width={20} height={20} viewBox="0 0 24 24" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin mx-auto" />
            </motion.div>
          )}

          {/* ======================== */}
          {/* SCREEN 2: Detailed Feedback */}
          {/* ======================== */}
          {screen === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
                O que podemos melhorar?
              </h2>
              <p className="text-sm text-gray-500 mb-6 text-center">
                Sua opinião nos ajuda a melhorar
              </p>

              {/* Category ratings */}
              <div className="space-y-4 mb-6">
                {CATEGORIES.map((cat) => (
                  <div key={cat.key}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">{cat.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          filled={star <= categoryRatings[cat.key]}
                          onTap={() =>
                            setCategoryRatings((prev) => ({ ...prev, [cat.key]: star }))
                          }
                          size={28}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte mais sobre sua experiência... (opcional)"
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <button
                onClick={handleSubmitDetails}
                className="w-full bg-[#007AFF] text-white rounded-xl px-6 py-3.5 text-sm font-semibold shadow-lg shadow-blue-500/25 hover:bg-[#0066DD] transition-colors active:scale-[0.98]"
              >
                Enviar
              </button>
            </motion.div>
          )}

          {/* ======================== */}
          {/* SCREEN 3: Contact */}
          {/* ======================== */}
          {screen === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <p className="text-4xl mb-4">📱</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Podemos entrar em contato?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Gostaríamos de resolver sua experiência
              </p>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(43) 99999-9999"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 text-center placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none mb-4"
              />

              <button
                onClick={handleSubmitContact}
                disabled={submitting}
                className="w-full bg-[#007AFF] text-white rounded-xl px-6 py-3.5 text-sm font-semibold shadow-lg shadow-blue-500/25 hover:bg-[#0066DD] transition-colors active:scale-[0.98] disabled:opacity-50 mb-3"
              >
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>

              <button
                onClick={() => {
                  // Submit without phone
                  setPhone('');
                  handleSubmitContact();
                }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Prefiro não informar
              </button>
            </motion.div>
          )}

          {/* ======================== */}
          {/* SCREEN: Thank you */}
          {/* ======================== */}
          {screen === 'thanks' && (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="text-6xl mb-4"
              >
                💙
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Obrigado pelo seu feedback!
              </h2>
              <p className="text-sm text-gray-500">
                Sua opinião é muito importante para nós.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer branding */}
      <div className="mt-auto pt-8">
        <p className="text-[10px] text-gray-300">
          Powered by crIAdores
        </p>
      </div>
    </div>
  );
}
