'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleGetStarted = () => {
    router.push('/chatbot-homepage');
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <span className="text-2xl font-onest tracking-tight">
                <span className="text-gray-600 font-light">cr</span>
                <span className="text-black font-bold">IA</span>
                <span className="text-gray-600 font-light">dores</span>
              </span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button onClick={() => scrollToSection('about')} className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Sobre
              </button>
              <button onClick={() => scrollToSection('mission')} className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Missão
              </button>
              <button onClick={() => scrollToSection('team')} className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Equipe
              </button>
              <button onClick={() => scrollToSection('why')} className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Por que
              </button>
              <button onClick={() => scrollToSection('process')} className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Processo
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Contato
              </button>
            </nav>
            <button
              onClick={handleLogin}
              className="inline-flex items-center justify-center duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Conexão Empresas & Criadores */}
      <section className="relative bg-gray-50 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-400 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">

          {/* Left Content */}
          <div className="text-center lg:text-left order-1 lg:order-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 leading-tight mb-6">
              Conectamos <span className="text-blue-600">empresas locais</span> com <span className="text-blue-600">criadores locais</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8 font-normal">
              Criamos conexões reais que geram engajamento real para seus clientes na sua cidade.
              Unindo negócios locais aos criadores da comunidade.
            </p>

            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <span>Conectar Agora</span>
              <span>→</span>
            </button>
          </div>

          {/* Right Visual - Premium Connection Network */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center order-2 lg:order-2">
            <div className="relative w-full h-full flex items-center justify-center">

              {/* Empresas Locais - Lado Esquerdo */}
              <div className="absolute left-0 sm:left-[-20px] lg:left-[-40px] top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-6 lg:gap-8">
                <div className="text-center">
                  <div className="text-xs sm:text-sm lg:text-base font-medium text-gray-500 mb-4 lg:mb-6 tracking-wide">
                    EMPRESAS<br />LOCAIS
                  </div>
                </div>
                <div className="flex flex-col gap-4 sm:gap-5 lg:gap-7">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    🏪
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    🍞
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    💪
                  </div>
                </div>
              </div>

              {/* Cidade no Centro - Premium */}
              <div className="relative w-72 h-44 sm:w-80 sm:h-48 lg:w-96 lg:h-64 bg-gradient-to-br from-white via-gray-50/30 to-white rounded-3xl lg:rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl z-10 border border-gray-200/30 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent rounded-3xl lg:rounded-[2.5rem]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50/20 to-transparent rounded-3xl lg:rounded-[2.5rem]"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 lg:mb-6">🏙️</div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 lg:mb-5 tracking-tight">CIDADE</div>
                  <div className="flex flex-col items-center space-y-3">
                    <div className="text-sm sm:text-base lg:text-lg text-gray-600 text-center font-medium">
                      Seus clientes na sua cidade
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full opacity-80"></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full opacity-60"></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full opacity-40"></div>
                    </div>
                    <div className="text-sm sm:text-base lg:text-lg text-gray-500 text-center font-medium">
                      Engajamento real
                    </div>
                  </div>
                </div>
              </div>

              {/* Criadores Locais - Lado Direito */}
              <div className="absolute right-0 sm:right-[-20px] lg:right-[-40px] top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-6 lg:gap-8">
                <div className="text-center">
                  <div className="text-xs sm:text-sm lg:text-base font-medium text-gray-500 mb-4 lg:mb-6 tracking-wide">
                    CRIADORES<br />LOCAIS
                  </div>
                </div>
                <div className="flex flex-col gap-4 sm:gap-5 lg:gap-7">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    📸
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    📱
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    🎤
                  </div>
                </div>
              </div>

              {/* Linhas de Conexão Premium */}
              <div className="hidden lg:block absolute top-[240px] left-[120px] w-[160px] h-[1px] bg-gradient-to-r from-gray-300 via-blue-400 to-transparent opacity-50"></div>
              <div className="hidden lg:block absolute top-[300px] left-[120px] w-[160px] h-[1px] bg-gradient-to-r from-gray-300 via-blue-400 to-transparent opacity-50"></div>
              <div className="hidden lg:block absolute top-[360px] left-[120px] w-[160px] h-[1px] bg-gradient-to-r from-gray-300 via-blue-400 to-transparent opacity-50"></div>

              <div className="hidden lg:block absolute top-[240px] right-[120px] w-[160px] h-[1px] bg-gradient-to-l from-gray-300 via-blue-400 to-transparent opacity-50"></div>
              <div className="hidden lg:block absolute top-[300px] right-[120px] w-[160px] h-[1px] bg-gradient-to-l from-gray-300 via-blue-400 to-transparent opacity-50"></div>
              <div className="hidden lg:block absolute top-[360px] right-[120px] w-[160px] h-[1px] bg-gradient-to-l from-gray-300 via-blue-400 to-transparent opacity-50"></div>

              {/* Pontos de conexão elegantes */}
              <div className="hidden lg:block absolute top-[237px] left-[280px] w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
              <div className="hidden lg:block absolute top-[297px] left-[280px] w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
              <div className="hidden lg:block absolute top-[357px] left-[280px] w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>

              <div className="hidden lg:block absolute top-[237px] right-[280px] w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
              <div className="hidden lg:block absolute top-[297px] right-[280px] w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
              <div className="hidden lg:block absolute top-[357px] right-[280px] w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>


            </div>
          </div>
        </div>
      </section>
      {/* About Section - O que é crIAdores */}
      <section id="about" className="py-20" style={{backgroundColor: '#f5f5f5'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              Sobre a Plataforma
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
              O que é a <span className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent font-black text-4xl md:text-5xl">crIAdores</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A <span className="font-bold text-blue-600">crIAdores</span> é uma plataforma revolucionária que conecta empresas locais com criadores de conteúdo autênticos da sua região.
              <br /><br />
              Utilizamos <span className="font-semibold text-gray-800">inteligência artificial</span> para criar parcerias perfeitas que geram resultados reais para o seu negócio e oportunidades genuínas para criadores locais.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rede Conectada */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Rede Conectada</h3>
              <p className="text-gray-600">
                Comunidade ativa de criadores de conteúdo locais verificados e engajados, prontos para promover seu negócio de forma autêntica.
              </p>
            </div>

            {/* IA Aplicada */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">IA Aplicada</h3>
              <p className="text-gray-600">
                Conteúdo guiado por inteligência artificial para melhores resultados e engajamento. Nossa tecnologia analisa perfis e sugere as melhores parcerias.
              </p>
            </div>

            {/* Resultados Reais */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Resultados Reais</h3>
              <p className="text-gray-600">
                Campanhas estruturadas para gerar vendas e engajamento comprovados. Acompanhe métricas detalhadas e veja o impacto real no seu negócio.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-black mb-4">
                Pronto para começar?
              </h3>
              <p className="text-gray-600 mb-6">
                Conecte seu negócio aos melhores criadores da sua região e veja seus resultados crescerem.
              </p>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Começar Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Mission */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
                Nossa Missão
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6">
                Nossa Missão
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Potencializar o poder de nano e micro influenciadores locais para impulsionar negócios locais por meio de conexões autênticas e bem estruturadas.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-medium mb-6">
                Nossa Visão 2030
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-6">
                Nossa Visão 2030
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Ter 10.000 negócios ativos na plataforma, gerando mais de R$ 10 milhões por mês em oportunidades financeiras para mais de 60 mil criadores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Values Section */}
      <section className="py-20" style={{backgroundColor: '#f5f5f5'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium mb-6">
              Nossos Princípios
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Nossos Valores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Comunidade */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-200 transition-colors">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Comunidade</h3>
              <p className="text-gray-600">
                Acreditamos que <span className="font-bold">1 + 1 = 3</span>
              </p>
            </div>

            {/* Over Delivery */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Over Delivery</h3>
              <p className="text-gray-600">
                Entregar <span className="font-bold">mais do que o prometido</span>, sempre!
              </p>
            </div>

            {/* Protagonismo */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Protagonismo</h3>
              <p className="text-gray-600">
                Nossos criadores são <span className="font-bold">nossas estrelas</span>. Nossos parceiros são <span className="font-bold">os diretores</span>
              </p>
            </div>

            {/* Foco em Vendas */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Foco em Vendas</h3>
              <p className="text-gray-600">
                Espírito, atitude e comportamento de <span className="font-bold">vendedor</span> em tudo que fazemos
              </p>
            </div>

            {/* Foco em Resultado */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Foco em Resultado</h3>
              <p className="text-gray-600">
                Criar é importante. <span className="font-bold">Performar é obrigatório</span>
              </p>
            </div>

            {/* IA First */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">IA First</h3>
              <p className="text-gray-600">
                Antes de agir, pense: <span className="font-bold">como a IA e os dados</span> podem te ajudar?
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Clients Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              Nossos Parceiros
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6">
              Alguns Clientes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Empresas que já confiam na <span className="font-bold text-blue-600">crIAdores</span> para impulsionar seus negócios
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {/* Row 1 */}
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">Boussole</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">Cartagena</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">Allure</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">Purão</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">Govinda</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">VOXX</span>
            </div>

            {/* Row 2 */}
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">Bela Saga</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">Neno Gemas</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">Vert</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">Fogo</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">Brasil</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">+Muitos</span>
            </div>
          </div>
        </div>
      </section>







      {/* Use Cases Section */}
      <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-blue-300/20 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 sm:mb-20">
            {/* Premium Badge */}
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200/50 text-blue-700 text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-lg">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
              Resultados Comprovados
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
              Histórias de <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Sucesso</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Veja como empresas locais estão <span className="font-semibold text-gray-800">transformando seus negócios</span> com nossa plataforma de marketing de influência
            </p>
          </div>

          {/* Premium Cases Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mb-16">
            {/* Row 1 */}
            <div className="relative group overflow-hidden rounded-3xl aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <img
                src="/images/usecase1.png"
                alt="Boussole - 51 mil visualizações"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center text-sm font-medium">
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                    51 mil
                  </div>
                  <div className="text-xs bg-blue-600 px-2 py-1 rounded-full font-semibold">
                    Viral
                  </div>
                </div>
                <p className="text-xs text-gray-300 mt-1 font-medium">Boussole</p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-3xl aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <img
                src="/images/usecase2.png"
                alt="John O'Groat - 35.2 mil visualizações"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center text-sm font-medium">
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                    35.2 mil
                  </div>
                  <div className="text-xs bg-blue-600 px-2 py-1 rounded-full font-semibold">
                    Top
                  </div>
                </div>
                <p className="text-xs text-gray-300 mt-1 font-medium">John O'Groat</p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img
                src="/images/usecase3.png"
                alt="Que Poké Gostoso - 11 mil visualizações"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  11 mil
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img
                src="/images/usecase4.png"
                alt="Boussole Sequência - 60.7 mil visualizações"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  60.7 mil
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img
                src="/images/usecase5.png"
                alt="Vert - 42.6 mil visualizações"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  42.6 mil
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img
                src="/images/usecase6.png"
                alt="Buffet Livre - 11.6 mil visualizações"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  11.6 mil
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img
                src="/images/usecase7.png"
                alt="Festa - 321 mil visualizações"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  321 mil
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img
                src="/images/usecase8.png"
                alt="Sequência de Fondue - 5 mil visualizações"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  5 mil
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img
                src="/images/usecase9.png"
                alt="Rádio Mix - 10.6 mil visualizações"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  10.6 mil
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img
                src="/images/usecase10.png"
                alt="Boussole Grupo - 32.2 mil visualizações"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  32.2 mil
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img
                src="/images/usecase11.png"
                alt="Loja Grupo - 9.406 visualizações"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  9.406
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img
                src="/images/usecase12.png"
                alt="Purão Vegano - 6.827 visualizações"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  6.827
                </div>
              </div>
            </div>
          </div>

          {/* Premium CTA - Responsive */}
          <div className="text-center px-4 sm:px-0">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                Pronto para <span className="text-blue-600">resultados como esses?</span>
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 max-w-md mx-auto">
                Junte-se a centenas de empresas que já transformaram seu marketing local
              </p>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary text-base sm:text-lg bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-lg font-medium transition-colors"
              >
                📈 Ver Mais Cases de Sucesso
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Why Invest Section */}
      <section className="py-20" style={{backgroundColor: '#f5f5f5'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              Vantagens
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6">
              Por que investir em Criadores?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Engajamento Real */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Engajamento Real</h3>
              <p className="text-gray-600 mb-4">
                <span className="font-bold">Maior envolvimento por proximidade</span>
              </p>
              <p className="text-gray-600">
                Conteúdo alinhado à cultura local
              </p>
            </div>

            {/* Custo-Benefício */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Custo-Benefício</h3>
              <p className="text-gray-600 mb-4">
                <span className="font-bold">Investimento acessível</span>
              </p>
              <p className="text-gray-600">
                Maior retorno sobre valor aplicado
              </p>
            </div>

            {/* Promoção Orgânica */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Promoção Orgânica</h3>
              <p className="text-gray-600 mb-4">
                <span className="font-bold">Conteúdo natural e recorrente</span>
              </p>
              <p className="text-gray-600">
                Recomendação genuína
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              Nossos Serviços
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6">
              O que você recebe?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Curadoria Profissional */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Curadoria Profissional</h3>
              <p className="text-gray-600">
                Selecionamos influenciadores ideais para o seu perfil
              </p>
            </div>

            {/* Campanhas Estruturadas */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Campanhas Estruturadas</h3>
              <p className="text-gray-600">
                Briefings claros e objetivos definidos em conjunto
              </p>
            </div>

            {/* Conteúdo Orgânico */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Conteúdo Orgânico</h3>
              <p className="text-gray-600">
                Ações frequentes nas redes de cada criador
              </p>
            </div>

            {/* Métricas e Relatórios */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Métricas e Relatórios</h3>
              <p className="text-gray-600">
                Acompanhamento e análise transparente dos resultados
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Benefits Section */}
      <section className="py-20" style={{backgroundColor: '#f5f5f5'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              Vantagens Exclusivas
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6">
              Benefícios para sua Empresa
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Visibilidade Regional */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Visibilidade Regional</h3>
              <p className="text-gray-600">
                Sua marca mais presente na região
              </p>
            </div>

            {/* Melhor Custo-Benefício */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Melhor Custo-Benefício</h3>
              <p className="text-gray-600">
                Investimento mais eficiente vs. mídia tradicional
              </p>
            </div>

            {/* Vendas Locais */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Vendas Locais</h3>
              <p className="text-gray-600">
                Aumento do potencial de vendas
              </p>
            </div>

            {/* Autoridade Verdadeira */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Autoridade Verdadeira</h3>
              <p className="text-gray-600">
                Associação com influenciadores autênticos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              Processo Simplificado
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6">
              Como funciona na prática
            </h2>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-green-200 via-orange-200 via-purple-200 to-red-200 transform -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg relative z-10">
                  1
                </div>
                <h3 className="text-lg font-bold mb-3">Briefing Personalizado</h3>
                <p className="text-gray-600 text-sm">
                  Entendemos seu objetivo comercial
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg relative z-10">
                  2
                </div>
                <h3 className="text-lg font-bold mb-3">Seleção Precisa</h3>
                <p className="text-gray-600 text-sm">
                  Selecionamos criadores ideais ao seu perfil e o cliente decide quais se encaixam mais no perfil adequado
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg relative z-10">
                  3
                </div>
                <h3 className="text-lg font-bold mb-3">Conteúdo Guiado</h3>
                <p className="text-gray-600 text-sm">
                  Criadores recebem orientação e entregam posts criativos
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg relative z-10">
                  4
                </div>
                <h3 className="text-lg font-bold mb-3">Aprovação Segura</h3>
                <p className="text-gray-600 text-sm">
                  Você valida todo o conteúdo
                </p>
              </div>

              {/* Step 5 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg relative z-10">
                  5
                </div>
                <h3 className="text-lg font-bold mb-3">Medição e Evolução</h3>
                <p className="text-gray-600 text-sm">
                  Análise e novos ciclos para mais resultados
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* What Makes Us Different Section */}
      <section className="py-20" style={{backgroundColor: '#f5f5f5'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              Nossos Diferenciais
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6">
              O que nos torna diferentes?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Foco no Local */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Foco no Local</h3>
              <p className="text-gray-600">
                Prioridade para influenciadores de conexão verdadeira
              </p>
            </div>

            {/* Mentoria Constante */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Mentoria Constante</h3>
              <p className="text-gray-600">
                Capacitação dos criadores para evolução contínua
              </p>
            </div>

            {/* Curadoria de Qualidade */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Curadoria de Qualidade</h3>
              <p className="text-gray-600">
                Supervisão de conteúdo em todas as etapas
              </p>
            </div>

            {/* IA Aliada */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">IA Aliada</h3>
              <p className="text-gray-600">
                Inteligência artificial para ganho de escala e performance
              </p>
            </div>

            {/* Foco em Vendas */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center md:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Foco em Vendas</h3>
              <p className="text-gray-600">
                Tudo pensado para conversão comercial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              Sobre a Plataforma
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
              O que é a <span className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent font-black text-4xl md:text-5xl">crIAdores</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A <span className="font-bold text-blue-600">crIAdores</span> é uma plataforma revolucionária que conecta empresas locais com criadores de conteúdo autênticos da sua região.
              <br /><br />
              Utilizamos <span className="font-semibold text-gray-800">inteligência artificial</span> para criar parcerias perfeitas que geram resultados reais para o seu negócio e oportunidades genuínas para criadores locais.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rede Conectada */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Rede Conectada</h3>
              <p className="text-gray-600">
                Comunidade ativa de criadores de conteúdo locais verificados e engajados, prontos para promover seu negócio de forma autêntica.
              </p>
            </div>

            {/* IA Aplicada */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">IA Aplicada</h3>
              <p className="text-gray-600">
                Conteúdo guiado por inteligência artificial para melhores resultados e engajamento. Nossa tecnologia analisa perfis e sugere as melhores parcerias.
              </p>
            </div>

            {/* Resultados Reais */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Resultados Reais</h3>
              <p className="text-gray-600">
                Campanhas estruturadas para gerar vendas e engajamento comprovados. Acompanhe métricas detalhadas e veja o impacto real no seu negócio.
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-black mb-4">
                Pronto para começar?
              </h3>
              <p className="text-gray-600 mb-6">
                Conecte seu negócio aos melhores criadores da sua região e veja seus resultados crescerem.
              </p>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Começar Agora
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Seção Nossos Serviços Premium */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium mb-8">
              ✨ Nossos Serviços
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-onest">
              O que você <span className="text-gray-600">recebe?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Soluções completas e premium para transformar sua estratégia de influencer marketing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Curadoria Profissional */}
            <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-500 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-onest">Curadoria Profissional</h3>
                <p className="text-gray-600 leading-relaxed">
                  Selecionamos influenciadores ideais para o seu perfil e objetivos específicos
                </p>
              </div>
            </div>

            {/* Campanhas Estruturadas */}
            <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-500 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-onest">Campanhas Estruturadas</h3>
                <p className="text-gray-600 leading-relaxed">
                  Briefings claros e objetivos definidos em conjunto com sua equipe
                </p>
              </div>
            </div>

            {/* Conteúdo Orgânico */}
            <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-500 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-onest">Conteúdo Orgânico</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ações frequentes e autênticas nas redes de cada criador
                </p>
              </div>
            </div>

            {/* Métricas e Relatórios */}
            <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-500 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-onest">Métricas e Relatórios</h3>
                <p className="text-gray-600 leading-relaxed">
                  Acompanhamento e análise transparente dos resultados obtidos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Campanhas Inteligentes</h3>
              <p className="text-gray-600">
                Crie e gerencie campanhas com briefings detalhados.
                Acompanhe entregas e resultados em tempo real.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Controle de Tarefas</h3>
              <p className="text-gray-600">
                Sistema completo de tarefas com prazos, responsáveis e
                acompanhamento de progresso para cada projeto.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestão de Criadores</h3>
              <p className="text-gray-600">
                Visualize todos os influenciadores das suas campanhas,
                acompanhe entregas e mantenha comunicação organizada.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Relatórios e Analytics</h3>
              <p className="text-gray-600">
                Dashboards com métricas importantes, ROI das campanhas
                e insights para otimizar seus resultados.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Landing Pages</h3>
              <p className="text-gray-600">
                Páginas públicas automáticas para cada campanha,
                perfeitas para compartilhar com clientes e parceiros.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Team Section */}


      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Vamos conversar sobre o futuro do seu negócio?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Entre em contato com nossa equipe e descubra como podemos potencializar sua presença digital local
          </p>
          <Button
            onClick={() => scrollToSection('contact')}
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
          >
            Fale Conosco
          </Button>
        </div>
      </section>





      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              Entre em Contato
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-600 rounded"></div>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-8">
              Nossa equipe está pronta para ajudar seu negócio a crescer
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">WhatsApp</h3>
                  <p className="text-gray-600">
                    <a href="https://wa.me/554391936400" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">
                      43 99104-9779
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Instagram</h3>
                  <p className="text-gray-600">
                    <a href="https://www.instagram.com/criadores.app/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors">
                      @criadores.app
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">TikTok</h3>
                  <p className="text-gray-600">
                    <a href="https://www.tiktok.com/@criadores.app?_t=ZM-8z6CVJvQ6Ny&_r=1" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 transition-colors">
                      @criadores.app
                    </a>
                  </p>
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-onest tracking-tight">
                  <span className="text-gray-400 font-light">cr</span>
                  <span className="text-white font-bold">IA</span>
                  <span className="text-gray-400 font-light">dores</span>
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Conectando negócios locais a criadores de conteúdo autênticos para impulsionar vendas e engajamento.
              </p>

            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Links Rápidos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">Sobre Nós</button></li>
                <li><button onClick={() => scrollToSection('mission')} className="hover:text-white transition-colors">Missão e Valores</button></li>
                <li><button onClick={() => scrollToSection('team')} className="hover:text-white transition-colors">Nossa Equipe</button></li>
                <li><button onClick={() => scrollToSection('why')} className="hover:text-white transition-colors">Por que Micro Influenciadores</button></li>
                <li><button onClick={() => scrollToSection('process')} className="hover:text-white transition-colors">Como Funciona</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Serviços</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Curadoria de Influenciadores</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Campanhas Estruturadas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conteúdo Orgânico</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Métricas e Relatórios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Consultoria Local</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <span className="block font-medium text-white mb-1">WhatsApp</span>
                  <a href="https://wa.me/554391936400" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">(43) 9193-6400</a>
                </li>
                <li>
                  <span className="block font-medium text-white mb-1 mt-4">Instagram</span>
                  <a href="https://www.instagram.com/criadores.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@criadores.app</a>
                </li>
                <li>
                  <span className="block font-medium text-white mb-1 mt-4">TikTok</span>
                  <a href="https://www.tiktok.com/@criadores.app?_t=ZM-8z6CVJvQ6Ny&_r=1" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@criadores.app</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 <span className="text-gray-400">cr</span><span className="text-white font-bold">IA</span><span className="text-gray-400">dores</span>. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
