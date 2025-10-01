import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Criadores VIP Card | Benefícios Exclusivos para Criadores de Conteúdo',
  description: 'Cartão de benefícios exclusivo para criadores de conteúdo. Descontos especiais em estabelecimentos parceiros, networking premium e vantagens únicas para impulsionar sua carreira.',
  keywords: [
    'criadores vip card',
    'benefícios criadores',
    'descontos para influenciadores',
    'cartão de benefícios',
    'vantagens exclusivas',
    'networking criadores',
    'programa vip',
    'criadores de conteúdo',
  ],
  alternates: {
    canonical: 'https://www.criadores.app/criadoresvipcard',
  },
  openGraph: {
    title: 'Criadores VIP Card | Benefícios Exclusivos',
    description: 'Cartão de benefícios exclusivo para criadores de conteúdo com descontos especiais em estabelecimentos parceiros.',
    url: 'https://www.criadores.app/criadoresvipcard',
    type: 'website',
    images: [
      {
        url: '/og-vipcard.jpg',
        width: 1200,
        height: 630,
        alt: 'Criadores VIP Card',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Criadores VIP Card | Benefícios Exclusivos',
    description: 'Cartão de benefícios exclusivo para criadores de conteúdo.',
    images: ['/og-vipcard.jpg'],
  },
};

export default function CriadoresVIPCard() {
  // Lista de empresas parceiras com seus benefícios
  const parceiros = [
    {
      id: 1,
      nome: 'Folks Pub',
      categoria: 'Pub',
      beneficio: 'Entrada sua e de um acompanhante grátis',
      descricao: 'Fila VIP',
      logo: '🍺',
    },
    {
      id: 2,
      nome: 'Cartagena Bar',
      categoria: 'Bar',
      beneficio: 'Entrada sua e de um acompanhante grátis',
      descricao: 'Fila preferencial',
      logo: '🌴',
    },
    {
      id: 3,
      nome: 'Boussolé Rooftop',
      categoria: 'Rooftop',
      beneficio: 'Compre um prato individual e ganhe outro',
      descricao: 'Não cumulativo com outras promoções',
      logo: '🍸',
    },
    {
      id: 4,
      nome: 'AgroBar',
      categoria: 'Bar',
      beneficio: 'Entrada sua e de um acompanhante grátis + 20% desconto',
      descricao: 'Não cumulativo com outras promoções',
      logo: '🎵',
    },
    {
      id: 5,
      nome: 'Pet Shop Paraíso',
      categoria: 'Pet Shop',
      beneficio: 'Na compra de um banho, ganha o segundo',
      descricao: 'Para a próxima vez',
      logo: '🐾',
    },
    {
      id: 6,
      nome: 'Clínica de Estética Beautitá',
      categoria: 'Estética',
      beneficio: 'Na compra de 1 pacote de massagem',
      descricao: 'Ganhe uma Relax Biuti',
      logo: '💆',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-onest tracking-tight">
                <span className="text-gray-400 font-light">cr</span>
                <span className="text-white font-bold">IA</span>
                <span className="text-gray-400 font-light">dores</span>
              </a>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="/#about" className="text-sm text-gray-300 hover:text-white font-medium transition-colors duration-200">Sobre</a>
              <a href="/sou-criador" className="text-sm text-gray-300 hover:text-white font-medium transition-colors duration-200">Sou crIAdor</a>
              <a href="/blog" className="text-sm text-gray-300 hover:text-white font-medium transition-colors duration-200">Blog</a>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <a href="https://wa.me/554391936400" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#0b3553] hover:bg-[#0a2f4a] text-white px-4 py-2 text-xs rounded-full">
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

      {/* Hero Section - Minimalista e Elegante */}
      <section className="pt-32 md:pt-40 pb-32 relative overflow-hidden">
        {/* Background decorativo sutil */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#0b3553] rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gray-800 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Logo crIAdores */}
            <div className="mb-20">
              <div className="text-5xl md:text-6xl font-onest tracking-tight">
                <span className="text-gray-600 font-light">cr</span>
                <span className="text-white font-bold">IA</span>
                <span className="text-gray-600 font-light">dores</span>
              </div>
            </div>

            {/* Título Principal - VIP PASS - DESTAQUE MÁXIMO */}
            <div className="mb-20">
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white mb-12 tracking-tight">
                vip <span className="text-gray-700">pass</span>
              </h1>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mt-16 leading-tight">
                aqui tem<br/>
                <span className="text-gray-600">benefícios</span>
              </h2>
            </div>

            {/* Texto de instrução - Elegante */}
            <div className="max-w-2xl mx-auto">
              <p className="text-base md:text-lg text-gray-400 leading-relaxed">
                utilize seu cartão de benefícios<br/>
                nesse estabelecimento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estabelecimentos Parceiros */}
      <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium mb-6">
              🤝 Empresas Parceiras
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Onde usar seu VIP Card
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Estabelecimentos parceiros com benefícios exclusivos para crIAdores VIP
            </p>
          </div>

          {/* Grid de Parceiros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parceiros.map((parceiro) => (
              <div
                key={parceiro.id}
                className="group bg-[#f5f5f5] border border-gray-300 rounded-2xl p-6 hover:border-[#0b3553] transition-all duration-300 hover:shadow-2xl hover:shadow-[#0b3553]/20 hover:transform hover:scale-105"
              >
                {/* Logo/Ícone */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{parceiro.logo}</div>
                  <div className="px-3 py-1 bg-white border border-gray-300 rounded-full">
                    <span className="text-xs font-semibold text-gray-600">{parceiro.categoria}</span>
                  </div>
                </div>

                {/* Nome */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">{parceiro.nome}</h3>

                {/* Benefício - Destaque */}
                <div className="bg-[#0b3553]/10 border border-[#0b3553]/30 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-2 mb-2">
                    <svg className="w-5 h-5 text-[#0b3553] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                    </svg>
                    <span className="text-sm font-bold text-gray-900 leading-tight">{parceiro.beneficio}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{parceiro.descricao}</p>
                </div>

                {/* Badge de Validação */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Parceiro Verificado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios Principais - Sem Roxo */}
      <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium mb-6">
              ✨ Vantagens Exclusivas
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              O que o VIP Card oferece
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Benefícios pensados especialmente para criadores de conteúdo que fazem parte da nossa comunidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefício 1 - Descontos */}
            <div className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-[#0b3553] transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-[#0b3553] rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-[#0b3553]/50 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Descontos Exclusivos</h3>
              <p className="text-gray-400">Até 10% de desconto + entrada free em estabelecimentos parceiros da sua região</p>
            </div>

            {/* Benefício 2 - Networking */}
            <div className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-[#0b3553] transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-[#0b3553] rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-[#0b3553]/50 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Networking Premium</h3>
              <p className="text-gray-400">Acesso a eventos exclusivos e conexão com outros criadores da comunidade</p>
            </div>

            {/* Benefício 3 - Prioridade */}
            <div className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-[#0b3553] transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-[#0b3553] rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-[#0b3553]/50 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Prioridade & Acesso</h3>
              <p className="text-gray-400">Atendimento prioritário e acesso antecipado a novas parcerias e campanhas</p>
            </div>

            {/* Benefício 4 - Suporte */}
            <div className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-[#0b3553] transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-[#0b3553] rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-[#0b3553]/50 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Suporte Personalizado</h3>
              <p className="text-gray-400">Canal direto de comunicação e suporte dedicado para criadores VIP</p>
            </div>

            {/* Benefício 5 - Conteúdo */}
            <div className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-[#0b3553] transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-[#0b3553] rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-[#0b3553]/50 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Conteúdo Exclusivo</h3>
              <p className="text-gray-400">Materiais educativos, workshops e mentorias para alavancar sua carreira</p>
            </div>

            {/* Benefício 6 - Visibilidade */}
            <div className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-[#0b3553] transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-[#0b3553] rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-[#0b3553]/50 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Maior Visibilidade</h3>
              <p className="text-gray-400">Destaque nas campanhas e prioridade para novas oportunidades</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Como usar seu VIP Card
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              É simples, rápido e você começa a aproveitar imediatamente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Passo 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-[#0b3553] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#0b3553]/50">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                {/* Linha conectora */}
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#0b3553] to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cadastre-se</h3>
              <p className="text-gray-400">Entre para a comunidade crIAdores e complete seu perfil</p>
            </div>

            {/* Passo 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-[#0b3553] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#0b3553]/50">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#0b3553] to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Receba seu Card</h3>
              <p className="text-gray-400">Seu cartão digital VIP será liberado automaticamente</p>
            </div>

            {/* Passo 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-[#0b3553] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#0b3553]/50">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#0b3553] to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Apresente</h3>
              <p className="text-gray-400">Mostre seu card nos estabelecimentos parceiros</p>
            </div>

            {/* Passo 4 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-[#0b3553] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#0b3553]/50">
                  <span className="text-3xl font-bold text-white">4</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Aproveite</h3>
              <p className="text-gray-400">Garanta seus descontos e benefícios exclusivos</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-black relative overflow-hidden">
        {/* Background decorativo sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#0b3553] blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Pronto para aproveitar os benefícios?
          </h2>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed">
            Entre para a comunidade crIAdores agora e receba seu VIP Card gratuitamente.
            Comece a economizar e aproveitar vantagens exclusivas hoje mesmo!
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="https://wa.me/554391936400"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#0b3553] hover:bg-[#0a2f4a] text-white font-bold px-8 py-4 text-lg rounded-full transition-all duration-200 shadow-xl shadow-[#0b3553]/50 hover:shadow-2xl hover:shadow-[#0b3553]/70 w-full sm:w-auto max-w-sm"
            >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"></path>
              </svg>
              Quero Meu VIP Card
            </a>
          </div>

          {/* Benefícios rápidos */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Ativação Imediata</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Sem Mensalidade</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-gradient-to-b from-black via-[#0a2f4a] to-[#0b3553]">
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

              {/* Horário */}
              <div className="pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className="font-bold text-white text-base">Horário de Atendimento</span>
                </div>
                <div className="text-blue-100 text-sm space-y-2 font-medium">
                  <div className="flex justify-between">
                    <span>Segunda a Sexta:</span>
                    <span className="font-bold text-white">8h às 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábado:</span>
                    <span className="font-bold text-white">9h às 14h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 3 - Links Rápidos */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Links Rápidos</h3>
              <div className="space-y-4">
                <a href="/" className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold w-full text-left">
                  Página Inicial
                </a>
                <a href="/sou-criador" className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold w-full text-left">
                  Sou crIAdor
                </a>
                <a href="/blog" className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold">
                  Blog
                </a>
                <a href="/politica-privacidade" className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold">
                  Política de Privacidade
                </a>
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