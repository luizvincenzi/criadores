'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLondrinaCreators, type Creator } from '@/lib/creatorsService';

export default function CriadoresVIPPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCreators() {
      try {
        console.log('🔵 [CLIENT] Iniciando carregamento de criadores...');
        console.log('🔵 [CLIENT] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'NÃO CONFIGURADO');
        const data = await getLondrinaCreators();
        console.log('🔵 [CLIENT] Criadores carregados:', data.length);

        if (data.length === 0) {
          setError('Nenhum criador de Londrina encontrado no banco de dados');
        }

        setCreators(data);
        setFilteredCreators(data);
      } catch (error) {
        console.error('🔴 [CLIENT] Erro ao carregar criadores:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    loadCreators();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCreators(creators);
    } else {
      const filtered = creators.filter(creator =>
        creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.profile_info?.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCreators(filtered);
    }
  }, [searchTerm, creators]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-onest tracking-tight">
                <span className="text-gray-600 font-light">cr</span>
                <span className="text-black font-bold">IA</span>
                <span className="text-gray-600 font-light">dores</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/#about" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Sobre</Link>
              <Link href="/sou-criador" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Sou crIAdor</Link>
              <Link href="/criadoresvipcard" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">VIP Card</Link>
              <Link href="/blog" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Blog</Link>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <a href="https://wa.me/554391936400" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-medium transition-all duration-200 bg-[#0b3553] hover:bg-[#0a2f4a] text-white px-4 py-2 text-xs rounded-full">
                Entrar na Comunidade
              </a>
            </div>
            <div className="md:hidden flex items-center">
              <a href="https://wa.me/554391936400" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-medium transition-all duration-200 bg-[#0b3553] text-white px-3 py-2 text-xs rounded-full">
                Entrar
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Background Preto com Gradiente */}
      <section className="pt-32 md:pt-40 pb-20 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#0b3553] rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gray-700 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium mb-8">
              📍 Londrina, PR
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight">
              esses são os<br/>
              <span className="font-bold">crIAdores VIP PASS</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Conheça os criadores de conteúdo que fazem parte da nossa comunidade exclusiva em Londrina
            </p>
          </div>
        </div>
      </section>

      {/* Filtro e Grid de Criadores - Background #f5f5f5 */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Barra de Busca */}
          <div className="mb-12">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar criador por nome ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#0b3553] transition-colors duration-200 text-lg shadow-sm"
                />
                <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Contador de Resultados */}
          <div className="text-center mb-8">
            <p className="text-gray-600 text-lg">
              {loading ? (
                'Carregando criadores...'
              ) : (
                <>
                  <span className="font-bold text-[#0b3553] text-2xl">{filteredCreators.length}</span> criador{filteredCreators.length !== 1 ? 'es' : ''} encontrado{filteredCreators.length !== 1 ? 's' : ''}
                </>
              )}
            </p>
            {error && (
              <p className="text-red-500 text-sm mt-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 inline-block">
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* Grid de Criadores */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse shadow-md">
                  <div className="h-32 bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-gray-600 mb-2">Nenhum criador encontrado</p>
              <p className="text-gray-500">Tente ajustar sua busca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCreators.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/criadores_vip/${creator.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#0b3553] transition-all duration-300 hover:shadow-2xl hover:shadow-[#0b3553]/20 hover:transform hover:scale-105"
                >
                  {/* Foto do Criador - Reduzida */}
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {creator.profile_info?.photo_url ? (
                      <img
                        src={creator.profile_info.photo_url}
                        alt={creator.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    )}

                    {/* Badge VIP */}
                    <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg">
                      VIP
                    </div>
                  </div>

                  {/* Informações - Foco no Nome */}
                  <div className="p-5">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#0b3553] transition-colors line-clamp-2 leading-tight">
                      {creator.name}
                    </h3>

                    {creator.profile_info?.category &&
                     creator.profile_info.category !== 'Micro' &&
                     creator.profile_info.category !== 'Nano' && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        {creator.profile_info.category}
                      </p>
                    )}

                    {/* Instagram */}
                    {creator.social_media?.instagram?.username && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                        </svg>
                        <span className="truncate">@{creator.social_media.instagram.username}</span>
                      </div>
                    )}

                    {/* Seguidores */}
                    {creator.social_media?.instagram?.followers && (
                      <div className="flex items-center gap-2">
                        <div className="bg-[#0b3553]/10 text-[#0b3553] px-2.5 py-1 rounded-full text-xs font-bold">
                          {creator.social_media.instagram.followers >= 1000
                            ? `${(creator.social_media.instagram.followers / 1000).toFixed(1)}K`
                            : creator.social_media.instagram.followers
                          } seguidores
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-gradient-to-b from-[#f5f5f5] via-[#0a2f4a] to-[#0b3553]">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Coluna 1 - Logo e Descrição */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <span className="text-3xl font-onest tracking-tight">
                    <span className="text-gray-300 font-light">cr</span>
                    <span className="text-white font-bold">IA</span>
                    <span className="text-gray-300 font-light">dores</span>
                  </span>
                </div>
                <p className="text-blue-100 leading-relaxed text-lg max-w-lg">
                  Especialistas em conectar <strong className="text-white">negócios locais aos melhores criadores</strong> da região.
                  Criamos campanhas autênticas que geram <strong className="text-white">resultados reais e mensuráveis.</strong>
                </p>
              </div>

              {/* Redes Sociais */}
              <div className="pt-4">
                <h4 className="text-blue-100 font-bold mb-6 text-lg">Siga-nos</h4>
                <div className="space-y-4">
                  <a href="https://instagram.com/criadores.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-blue-100 hover:text-white transition-colors duration-300 group w-full">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-base">Instagram</div>
                      <div className="text-sm font-medium text-blue-100/80">@criadores.app</div>
                    </div>
                  </a>

                  <a href="https://www.tiktok.com/@criadores.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-blue-100 hover:text-white transition-colors duration-300 group w-full">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-base">TikTok</div>
                      <div className="text-sm font-medium text-blue-100/80">@criadores.app</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Coluna 2 - Contato */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white">Contato</h3>
              <div className="space-y-6">
                <a href="https://wa.me/554391936400" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-blue-100 hover:text-white transition-colors duration-300 group w-full">
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-lg">WhatsApp</div>
                    <div className="text-sm font-medium text-blue-100/80">(43) 9193-6400</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Coluna 3 - Links Rápidos */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Links Rápidos</h3>
              <div className="space-y-4">
                <Link href="/" className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold w-full text-left">
                  Página Inicial
                </Link>
                <Link href="/sou-criador" className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold w-full text-left">
                  Sou crIAdor
                </Link>
                <Link href="/criadoresvipcard" className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold w-full text-left">
                  VIP Card
                </Link>
                <Link href="/blog" className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold">
                  Blog
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-gradient-to-b from-[#0b3553] to-[#041220]">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <div className="text-blue-100 text-center">
                <div className="text-lg font-semibold">
                  © 2024
                  <span className="text-gray-300 font-light">cr</span>
                  <span className="text-white font-bold">IA</span>
                  <span className="text-gray-300 font-light">dores</span>
                </div>
                <div className="text-sm">Todos os direitos reservados.</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}