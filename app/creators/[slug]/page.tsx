'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface CreatorWork {
  campanha: string;
  business: string;
  mes: string;
  linkTrabalho: string;
  status: string;
}

interface CreatorData {
  nome: string;
  status: string;
  whatsapp: string;
  cidade: string;
  instagram: string;
  seguidoresInstagram: string;
  tiktok: string;
  seguidoresTiktok: string;
  perfil: string;
  preferencias: string;
  naoAceita: string;
  descricaoCriador: string;
  biografia: string;
  categoria: string;
  seguidores: number;
}

export default function CreatorLandingPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [works, setWorks] = useState<CreatorWork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreatorData();
  }, [slug]);

  const loadCreatorData = async () => {
    try {
      // Converter slug de volta para nome
      const creatorName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Buscar dados do criador
      const response = await fetch('/api/creators');
      const data = await response.json();
      
      if (data.success) {
        const foundCreator = data.creators.find((c: CreatorData) => 
          c.nome.toLowerCase() === creatorName.toLowerCase()
        );
        
        if (foundCreator) {
          setCreator(foundCreator);
          
          // Buscar trabalhos
          const worksResponse = await fetch(`/api/creator-works?name=${encodeURIComponent(foundCreator.nome)}`);
          const worksData = await worksResponse.json();
          
          if (worksData.success) {
            setWorks(worksData.works);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do criador:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFollowers = (count: string | number): string => {
    const num = typeof count === 'string' ? parseInt(count.replace(/[^\d]/g, '')) || 0 : count;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const openWhatsApp = () => {
    if (creator?.whatsapp) {
      const cleanPhone = creator.whatsapp.replace(/[^\d]/g, '');
      const message = `Olá ${creator.nome}! Vi seu media kit e gostaria de conversar sobre uma parceria.`;
      window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const openInstagram = () => {
    if (creator?.instagram) {
      let instagramUrl = creator.instagram;
      if (!instagramUrl.startsWith('http')) {
        const username = instagramUrl.replace('@', '');
        instagramUrl = `https://instagram.com/${username}`;
      }
      window.open(instagramUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando media kit...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Criador não encontrado</h1>
          <p className="text-gray-600">O criador que você está procurando não foi encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{creator.nome}</h1>
            <div className="flex items-center justify-center space-x-6 text-lg text-gray-600">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {creator.cidade}
              </span>
              {creator.perfil && (
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {creator.perfil}
                </span>
              )}
              {creator.categoria && (
                <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-medium">
                  {creator.categoria}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
            <div className="text-3xl font-bold text-blue-600 mb-2">{formatFollowers(creator.seguidores)}</div>
            <div className="text-sm font-medium text-blue-800">Seguidores Instagram</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
            <div className="text-3xl font-bold text-purple-600 mb-2">{creator.seguidoresTiktok ? formatFollowers(creator.seguidoresTiktok) : '0'}</div>
            <div className="text-sm font-medium text-purple-800">Seguidores TikTok</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
            <div className="text-3xl font-bold text-green-600 mb-2">{works.length}</div>
            <div className="text-sm font-medium text-green-800">Trabalhos Realizados</div>
          </div>
        </div>

        {/* Biografia e Descrição */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {creator.biografia && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Biografia</h3>
              <p className="text-gray-700 leading-relaxed">{creator.biografia}</p>
            </div>
          )}
          
          {creator.descricaoCriador && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sobre</h3>
              <p className="text-gray-700 leading-relaxed">{creator.descricaoCriador}</p>
            </div>
          )}
        </div>

        {/* Preferências */}
        {(creator.preferencias || creator.naoAceita) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {creator.preferencias && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-green-900 mb-4">Aceita</h3>
                <p className="text-green-700">{creator.preferencias}</p>
              </div>
            )}
            
            {creator.naoAceita && (
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <h3 className="text-xl font-bold text-red-900 mb-4">Não Aceita</h3>
                <p className="text-red-700">{creator.naoAceita}</p>
              </div>
            )}
          </div>
        )}

        {/* Trabalhos Realizados */}
        {works.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Trabalhos Realizados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {works.map((work, index) => (
                <div key={index} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-1">
                    {work.titulo ? work.titulo : work.business}
                  </h4>
                  <p className="text-sm text-orange-700">{work.business} • {work.mes}</p>
                  {work.linkTrabalho && (
                    <button
                      onClick={() => window.open(work.linkTrabalho, '_blank')}
                      className="mt-2 px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
                    >
                      Ver Trabalho
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Vamos trabalhar juntos?</h3>
          <p className="text-gray-600 mb-6">Entre em contato para discutir parcerias e colaborações.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openWhatsApp}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.097"/>
              </svg>
              Contato WhatsApp
            </button>
            
            <button
              onClick={openInstagram}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Seguir no Instagram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
