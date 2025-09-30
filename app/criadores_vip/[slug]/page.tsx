import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCreatorBySlug, getAllCreatorSlugs } from '@/lib/creatorsService';

// Gerar metadata dinâmica para SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const creator = await getCreatorBySlug(params.slug);

  if (!creator) {
    return {
      title: 'Criador não encontrado | crIAdores VIP',
    };
  }

  const title = `${creator.name} | Criadores VIP Pass`;
  const description = creator.profile_info?.biography ||
    `Conheça ${creator.name}, criador(a) de conteúdo VIP da comunidade crIAdores em Londrina.`;

  return {
    title,
    description,
    keywords: [
      creator.name,
      'criador de conteúdo',
      'influenciador Londrina',
      'criadores vip',
      'criadores.app',
      creator.profile_info?.category || '',
    ].filter(Boolean),
    alternates: {
      canonical: `https://www.criadores.app/criadores_vip/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.criadores.app/criadores_vip/${params.slug}`,
      type: 'profile',
      images: creator.profile_info?.photo_url ? [
        {
          url: creator.profile_info.photo_url,
          width: 800,
          height: 800,
          alt: creator.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: creator.profile_info?.photo_url ? [creator.profile_info.photo_url] : [],
    },
  };
}

// Gerar páginas estáticas para todos os criadores
export async function generateStaticParams() {
  const slugs = await getAllCreatorSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function CreatorProfilePage({ params }: { params: { slug: string } }) {
  const creator = await getCreatorBySlug(params.slug);

  if (!creator) {
    notFound();
  }

  const instagramUrl = creator.social_media?.instagram?.profile_url ||
    (creator.social_media?.instagram?.username ? `https://instagram.com/${creator.social_media.instagram.username}` : null);

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
              <Link href="/criadores_vip" className="text-sm text-[#0b3553] hover:text-black font-semibold transition-colors duration-200">Criadores VIP</Link>
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

      {/* Breadcrumb */}
      <div className="pt-20 pb-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Início</Link>
            <span className="text-gray-400">/</span>
            <Link href="/criadores_vip" className="text-gray-500 hover:text-gray-700">Criadores VIP</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{creator.name}</span>
          </nav>
        </div>
      </div>

      {/* Profile Section */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Foto do Criador */}
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 md:w-64 md:h-64 mx-auto md:mx-0 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative shadow-2xl">
                    {creator.profile_info?.photo_url ? (
                      <img
                        src={creator.profile_info.photo_url}
                        alt={creator.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    )}

                    {/* Badge VIP */}
                    <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      VIP
                    </div>
                  </div>
                </div>

                {/* Informações do Criador */}
                <div className="flex-1 space-y-6">
                  {/* Nome e Categoria */}
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                      {creator.name}
                    </h1>
                    {creator.profile_info?.category && (
                      <p className="text-xl text-gray-600 font-medium">
                        {creator.profile_info.category}
                      </p>
                    )}
                  </div>

                  {/* Localização */}
                  {creator.profile_info?.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span className="text-lg">
                        {creator.profile_info.location.city}{creator.profile_info.location.state ? `, ${creator.profile_info.location.state}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Biografia */}
                  {creator.profile_info?.biography && (
                    <div className="pt-4">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {creator.profile_info.biography}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="pt-4 flex flex-wrap gap-4">
                    {creator.social_media?.instagram?.followers && (
                      <div className="bg-[#0b3553]/10 border border-[#0b3553]/20 rounded-xl px-6 py-3">
                        <div className="text-3xl font-bold text-[#0b3553]">
                          {creator.social_media.instagram.followers >= 1000
                            ? `${(creator.social_media.instagram.followers / 1000).toFixed(1)}K`
                            : creator.social_media.instagram.followers}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Seguidores</div>
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-xl px-6 py-3">
                      <div className="text-3xl font-bold text-gray-800">VIP</div>
                      <div className="text-sm text-gray-600 font-medium">Membro</div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="pt-6 space-y-4">
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                        </svg>
                        Ver Instagram
                      </a>
                    )}

                    <div>
                      <a
                        href="https://wa.me/554391936400"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#0b3553] hover:bg-[#0a2f4a] text-white font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"></path>
                        </svg>
                        Entre em Contato
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voltar para lista */}
          <div className="mt-12 text-center">
            <Link
              href="/criadores_vip"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0b3553] font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path>
              </svg>
              Voltar para Criadores VIP
            </Link>
          </div>
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