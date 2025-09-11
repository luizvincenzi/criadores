import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sou crIAdor | Conecte-se com Empresas Locais',
  description: 'Junte-se à maior comunidade de criadores de conteúdo local. Conecte-se com empresas da sua região e monetize seu talento de forma autêntica.',
  keywords: [
    'criador de conteúdo',
    'influenciador local',
    'monetização',
    'parcerias empresas',
    'comunidade criadores',
    'marketing local',
    'renda extra',
  ],
  alternates: {
    canonical: 'https://www.criadores.app/sou-criador',
  },
  openGraph: {
    title: 'Sou crIAdor | Conecte-se com Empresas Locais',
    description: 'Junte-se à maior comunidade de criadores de conteúdo local.',
    url: 'https://www.criadores.app/sou-criador',
    type: 'website',
  },
  twitter: {
    title: 'Sou crIAdor | Conecte-se com Empresas Locais',
    description: 'Junte-se à maior comunidade de criadores de conteúdo local.',
  },
};

export default function SouCriador() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-onest tracking-tight">
                <span className="text-gray-600 font-light">cr</span>
                <span className="text-black font-bold">IA</span>
                <span className="text-gray-600 font-light">dores</span>
              </a>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Sobre</button>
              <button className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Serviços</button>
              <button className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Missão</button>
              <button className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Por que</button>
              <button className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Processo</button>
              <a href="/blog" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">Blog</a>
              <a href="/sou-criador" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200 text-[#0b3553] font-semibold">Sou crIAdor</a>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200 border border-gray-300 rounded-full hover:border-gray-400">Entrar</button>
              <button className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-4 py-2 text-xs rounded-full">
                <span className="hidden sm:inline">Começar Agora</span>
                <span className="sm:hidden">Começar</span>
              </button>
            </div>
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-black focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-[#0b3553] text-sm font-medium mb-6">
              Para Criadores de Conteúdo
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Conecte-se com <span className="text-[#0b3553]">Empresas Locais</span><br/>
              e <span className="text-[#0b3553]">Monetize</span> seu Talento
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Estar conectado com empresas locais é fundamental para garantir bons resultados no seu trabalho como criador. 
              Junte-se à maior comunidade local para crIAdores e transforme sua paixão em uma fonte de renda sustentável.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="https://wa.me/5543991049779" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-8 py-4 text-lg rounded-full">
                Entrar na Comunidade
              </a>
              <div className="text-sm font-medium text-gray-600">
                ou ligue: <span className="text-[#0b3553] font-bold">(43) 99104-9779</span>
              </div>
            </div>
          </div>

          {/* Benefícios */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Renda Garantida</h3>
              <p className="text-gray-600">Parcerias com empresas locais que valorizam seu trabalho e pagam valores justos.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#0b3553]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Comunidade Ativa</h3>
              <p className="text-gray-600">Rede de criadores locais para troca de experiências e oportunidades.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Crescimento Acelerado</h3>
              <p className="text-gray-600">Suporte e mentoria para desenvolver suas habilidades e aumentar seu alcance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-20" style={{backgroundColor:'#f5f5f5'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-[#0b3553] text-sm font-medium mb-6">
              Nossos Princípios
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b3553] mb-6">Nossos Valores</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value 1 - Comunidade */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#0b3553]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Comunidade</h3>
              <p className="text-gray-600">Acreditamos que <span className="font-bold">1 + 1 = 3</span></p>
            </div>

            {/* Value 2 - Over Delivery */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Over Delivery</h3>
              <p className="text-gray-600">Entregar <span className="font-bold">mais do que o prometido</span>, sempre!</p>
            </div>

            {/* Value 3 - Protagonismo */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Protagonismo</h3>
              <p className="text-gray-600">Nossos criadores são <span className="font-bold">nossas estrelas</span>. Nossos parceiros são <span className="font-bold">os diretores</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Missão e Visão */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Missão */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-[#0b3553] text-sm font-medium mb-6">
                Nossa Missão
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0b3553] mb-6">
                Empoderar Criadores Locais
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Nossa missão é empoderar criadores de conteúdo locais, conectando-os com empresas da região
                para criar campanhas autênticas que geram resultados reais para todos os envolvidos.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-700">Valorizar o talento local e regional</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-700">Criar oportunidades de renda sustentável</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-700">Fortalecer a economia local</p>
                </div>
              </div>
            </div>

            {/* Visão */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium mb-6">
                Nossa Visão
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0b3553] mb-6">
                Ser a Maior Rede Local
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Ser a maior e mais confiável rede de criadores de conteúdo local do Brasil,
                transformando a forma como empresas e criadores se conectam e colaboram.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-700">Presença em todas as regiões do Brasil</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-700">Tecnologia de ponta para matching perfeito</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-700">Comunidade próspera e colaborativa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-[#0b3553] to-[#1e5f7e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ficou Interessado?
          </h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Entre para nossa comunidade e comece a monetizar seu talento hoje mesmo.
            Conecte-se com empresas locais e transforme sua paixão em renda.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a href="https://wa.me/5543991049779" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-white text-[#0b3553] font-bold px-8 py-4 text-lg rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"></path>
              </svg>
              Entrar na Comunidade
            </a>

            <div className="text-center">
              <div className="text-blue-100 text-sm mb-1">ou ligue diretamente:</div>
              <div className="text-lg font-medium text-white">(43) 99104-9779</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
