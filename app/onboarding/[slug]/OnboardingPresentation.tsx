'use client';

import React, { useEffect, useState } from 'react';

interface PortfolioItem {
  url: string;
  title?: string;
  thumbnail_url?: string;
  type: 'reel' | 'video' | 'post';
}

interface CreatorInfo {
  id: string;
  name: string;
  instagram_username?: string;
  photo_url?: string;
  match_description?: string;
}

interface OnboardingPresentationProps {
  business: { id: string; name: string; slug: string };
  onboarding: {
    welcome_message?: string;
    match_description?: string;
    creator_photo_url?: string;
    portfolio_items: PortfolioItem[];
  };
  creators: CreatorInfo[];
}

export function OnboardingPresentation({ business, onboarding, creators }: OnboardingPresentationProps) {
  const [mounted, setMounted] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  useEffect(() => { setMounted(true); }, []);

  const handleImageError = (id: string) => {
    setBrokenImages(prev => new Set(prev).add(id));
  };

  const welcomeMessage = onboarding.welcome_message || `BEM VINDO ${business.name.toUpperCase()}`;
  const portfolioItems = onboarding.portfolio_items || [];
  const showCreatorsSection = creators.length > 0 || onboarding.match_description;

  return (
    <div className="min-h-screen bg-white">

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col justify-center items-start bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className={`relative z-10 w-full max-w-5xl mx-auto px-8 md:px-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[13px] md:text-[15px] tracking-[0.4em] text-gray-400 uppercase mb-4 md:mb-6">
            {welcomeMessage.split(' ').slice(0, -1).join(' ') || 'BEM VINDO'}
          </p>
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.9]">
            {welcomeMessage.split(' ').pop() || business.name.toUpperCase()}
          </h1>
        </div>
        <div className={`absolute bottom-8 md:bottom-12 right-8 md:right-16 text-right transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-2xl md:text-3xl font-light tracking-wide">
            cr<span className="font-bold text-3xl md:text-4xl">IA</span>dores
          </div>
          <p className="text-[10px] md:text-[11px] tracking-[0.3em] text-gray-500 uppercase mt-1">
            1&deg; Marketplace de Social Media do Brasil
          </p>
        </div>
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-gray-500 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ===== SOCIAL MEDIAS ===== */}
      {showCreatorsSection && (
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-5xl mx-auto px-8 md:px-16">
            <div className="text-center mb-16">
              <p className="text-[13px] tracking-[0.3em] text-gray-400 uppercase mb-2">
                {creators.length > 1 ? 'social medias' : 'social media'}
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-950 tracking-tight">
                {creators.length > 1 ? 'selecionadas' : 'selecionada'}
              </h2>
            </div>

            <div className={`grid gap-16 ${
              creators.length === 1 ? 'grid-cols-1' :
              creators.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {creators.map((cr, index) => {
                const hasValidPhoto = cr.photo_url && cr.photo_url.startsWith('http') && !brokenImages.has(cr.id || `cr-${index}`);
                return (
                  <div key={cr.id || index} className={`flex flex-col items-center text-center ${creators.length === 1 ? 'md:flex-row md:text-left md:gap-16 md:items-center max-w-3xl mx-auto' : ''}`}>
                    <div className={`flex-shrink-0 mb-6 ${creators.length === 1 ? 'md:mb-0' : ''}`}>
                      {hasValidPhoto ? (
                        <div className={`rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-100 shadow-2xl ${creators.length === 1 ? 'w-56 h-56 md:w-72 md:h-72' : 'w-40 h-40 md:w-48 md:h-48'}`}>
                          <img src={cr.photo_url!} alt={cr.name} className="w-full h-full object-cover"
                            onError={() => handleImageError(cr.id || `cr-${index}`)} />
                        </div>
                      ) : (
                        <div className={`rounded-full bg-gray-100 flex items-center justify-center ${creators.length === 1 ? 'w-56 h-56 md:w-72 md:h-72' : 'w-40 h-40 md:w-48 md:h-48'}`}>
                          <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-medium text-gray-900 mb-2 ${creators.length === 1 ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                        {cr.name}
                      </h3>
                      {cr.instagram_username && (
                        <a href={`https://instagram.com/${cr.instagram_username}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                          </svg>
                          <span className="text-[14px]">@{cr.instagram_username}</span>
                        </a>
                      )}
                      {cr.match_description && (
                        <div>
                          <h4 className="text-[14px] font-bold text-gray-900 mb-2 tracking-wide">Match perfeito</h4>
                          <p className="text-[15px] leading-relaxed text-gray-600">{cr.match_description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== TRABALHOS (Thumbnail + Link) ===== */}
      {portfolioItems.length > 0 && (
        <section className="py-20 md:py-32 bg-gray-50">
          <div className="max-w-5xl mx-auto px-8 md:px-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-950 tracking-[0.15em] text-center mb-16">
              TRABALHOS
            </h2>

            <div className={`grid gap-6 md:gap-8 ${
              portfolioItems.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
              portfolioItems.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {portfolioItems.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  {/* Phone mockup */}
                  <div className="relative bg-gray-900 rounded-[2rem] p-2 shadow-xl group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-2xl z-10" />
                    <div className="relative rounded-[1.5rem] overflow-hidden bg-gray-800 aspect-[9/16]">
                      {item.thumbnail_url && item.thumbnail_url.startsWith('http') ? (
                        <>
                          <img
                            src={item.thumbnail_url}
                            alt={item.title || `Trabalho ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-gray-900 ml-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                              </svg>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                          {/* Instagram icon */}
                          <svg className="w-10 h-10 mb-4 opacity-40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                          </svg>
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-gray-400 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                          </div>
                          <span className="text-[11px] opacity-60 uppercase tracking-wider">
                            {item.type === 'reel' ? 'Reel' : item.type === 'video' ? 'Vídeo' : 'Post'}
                          </span>
                          <span className="text-[10px] opacity-40 mt-1">Toque para ver</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {item.title && (
                    <p className="text-center mt-4 text-[13px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      {item.title}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="py-12 bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto px-8 md:px-16 text-center">
          <div className="text-xl font-light tracking-wide mb-2">
            cr<span className="font-bold text-2xl">IA</span>dores
          </div>
          <p className="text-[11px] tracking-[0.2em] text-gray-500 uppercase">
            1&deg; Marketplace de Social Media do Brasil
          </p>
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-[11px] text-gray-600">
              &copy; {new Date().getFullYear()} crIAdores. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
