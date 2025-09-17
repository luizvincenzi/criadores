'use client';

import { useState } from 'react';

// Componente FAQ com collapse
function FAQItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden hover:bg-gray-100 transition-colors duration-300">
      <button
        onClick={onToggle}
        className="w-full p-8 text-left flex items-center justify-between focus:outline-none"
      >
        <h3 className="text-xl font-bold text-[#0b3553] pr-4">{question}</h3>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-6 h-6 text-[#0b3553]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="px-8 pb-8">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "O que é o crIAdores?",
      answer: "O crIAdores é uma plataforma que conecta negócios locais a criadores de conteúdo autênticos da região. Facilitamos campanhas de marketing com micro influenciadores que geram resultados reais para pequenas e médias empresas."
    },
    {
      question: "Como funciona o processo de campanha?",
      answer: "O processo é simples: 1) Você define seus objetivos e orçamento, 2) Selecionamos criadores alinhados com sua marca e região, 3) Os criadores produzem conteúdo autêntico, 4) Acompanhamos os resultados e métricas em tempo real."
    },
    {
      question: "Como vocês selecionam os criadores?",
      answer: "Selecionamos criadores baseado em: localização geográfica, alinhamento com valores da marca, engajamento autêntico da audiência, qualidade do conteúdo e histórico de parcerias bem-sucedidas."
    },
    {
      question: "Posso escolher os criadores para minha campanha?",
      answer: "Sim! Apresentamos uma seleção de criadores pré-qualificados e você pode escolher aqueles que mais se alinham com sua marca. Também consideramos suas preferências e feedback."
    },
    {
      question: "Vocês trabalham com que tipos de negócio?",
      answer: "Trabalhamos com diversos segmentos: restaurantes, lojas, salões de beleza, academias, clínicas, escolas, eventos e qualquer negócio que queira aumentar sua presença local."
    }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
              <button onClick={() => scrollToSection('services')} className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Serviços
              </button>
              <button onClick={() => scrollToSection('mission')} className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Missão
              </button>

              <button onClick={() => scrollToSection('why')} className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Por que
              </button>
              <button onClick={() => scrollToSection('process')} className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Processo
              </button>
              <a href="/blog" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Blog
              </a>
              <a href="/sou-criador" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Sou crIAdor
              </a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => window.location.href = '/login'} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200 border border-gray-300 rounded-full hover:border-gray-400">
                Entrar
              </button>
              <button onClick={() => window.location.href = '/chatcriadores-home'} className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-4 py-2 text-xs rounded-full">
                <span className="hidden sm:inline">Começar Agora</span>
                <span className="sm:hidden">Começar</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-black focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                <button onClick={() => scrollToSection('about')} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black">
                  Sobre
                </button>
                <button onClick={() => scrollToSection('services')} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black">
                  Serviços
                </button>
                <button onClick={() => scrollToSection('mission')} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black">
                  Missão
                </button>
                <button onClick={() => scrollToSection('why')} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black">
                  Por que
                </button>
                <button onClick={() => scrollToSection('process')} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black">
                  Processo
                </button>
                <a href="/blog" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black">
                  Blog
                </a>
                <div className="px-3 py-2 space-y-2">
                  <button onClick={() => window.location.href = '/login'} className="w-full px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-full">
                    Entrar
                  </button>
                  <button onClick={() => window.location.href = '/chatcriadores-home'} className="w-full inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-4 py-2 text-xs rounded-full">
                    <span className="hidden sm:inline">Começar Agora</span>
                    <span className="sm:hidden">Começar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Premium Visual */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-white min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20 sm:pt-16 lg:pt-0">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-400 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10 mt-8 sm:mt-4 lg:mt-0">
          <div className="text-center lg:text-left order-1 lg:order-1 px-2 sm:px-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-onest font-bold text-gray-900 leading-tight mb-6">
              Conectamos <span className="text-[#0b3553]">empresas locais</span> com <span className="text-[#0b3553]">criadores locais</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-8 font-onest font-normal">
              Criamos conexões reais que geram engajamento real para seus clientes na sua cidade. Unindo negócios locais aos criadores da comunidade para <strong className="text-[#0b3553]">acelerar resultados e otimizar potencializando o negócio</strong> das empresas que trabalham com a gente.
            </p>
            <button onClick={() => window.location.href = '/chatcriadores-home'} className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-6 py-3 text-sm rounded-full">
              <span className="hidden sm:inline">Conectar Agora</span>
              <span className="sm:hidden">Conectar</span>
            </button>
          </div>

          {/* Visual Interactive - Circular Design with Radial Shadow */}
          <div className="relative h-[500px] sm:h-[600px] lg:h-[700px] flex items-center justify-center order-2 lg:order-2">
            {/* Background with improved radial gradient and smoother transition */}
            <div className="absolute inset-0 bg-gradient-radial from-blue-100/40 via-blue-50/30 via-gray-50/20 to-transparent rounded-full shadow-[0_0_200px_rgba(59,130,246,0.15)] animate-pulse" style={{animationDuration: '6s'}}></div>

            {/* Connection lines between empresas and criadores */}
            <div className="absolute inset-0">
              <svg className="w-full h-full opacity-30" viewBox="0 0 400 400">
                <defs>
                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6"/>
                    <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6"/>
                  </linearGradient>
                </defs>
                {/* Animated connection lines */}
                <path d="M100 150 Q200 200 300 150" stroke="url(#connectionGradient)" strokeWidth="3" fill="none" className="animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}/>
                <path d="M100 250 Q200 200 300 250" stroke="url(#connectionGradient)" strokeWidth="3" fill="none" className="animate-pulse" style={{animationDelay: '2s', animationDuration: '4s'}}/>
                <path d="M150 100 Q200 200 250 300" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="animate-pulse" style={{animationDelay: '3s', animationDuration: '4s'}}/>
              </svg>
            </div>

            <div className="relative w-full h-full flex items-center justify-center">

              {/* Center - Conexão (Larger and Central) */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-gradient-to-br from-white via-blue-50/90 to-blue-100/70 rounded-full flex flex-col items-center justify-center shadow-2xl z-20 border-4 border-white/90 backdrop-blur-sm transform hover:scale-105 transition-all duration-500 ring-2 ring-blue-200/50">
                <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 lg:mb-3">🤝</div>
                <div className="text-sm sm:text-base lg:text-lg font-bold text-[#0b3553] mb-2 text-center">CONEXÃO</div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-xs sm:text-sm text-[#0b3553] text-center font-medium">Empresas ↔ Criadores</div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                  <div className="text-xs sm:text-sm text-[#0b3553] text-center font-medium">na sua cidade</div>
                </div>
              </div>

              {/* Empresas Locais - Circular Arrangement */}
              {/* Top Left */}
              <div className="absolute top-[15%] left-[25%] flex flex-col items-center gap-2">
                <div className="text-xs sm:text-sm font-bold text-gray-700 text-center mb-2">EMPRESAS<br/>LOCAIS</div>
                <div className="w-18 h-18 sm:w-22 sm:h-22 lg:w-26 lg:h-26 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 animate-pulse border-4 border-white z-10" style={{animationDelay: '0s', animationDuration: '4s'}}>
                  🏪
                </div>
              </div>

              {/* Left */}
              <div className="absolute top-[45%] left-[8%] transform -translate-y-1/2">
                <div className="w-18 h-18 sm:w-22 sm:h-22 lg:w-26 lg:h-26 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 animate-pulse border-4 border-white z-10" style={{animationDelay: '1s', animationDuration: '4s'}}>
                  🍽️
                </div>
              </div>

              {/* Bottom Left */}
              <div className="absolute bottom-[15%] left-[25%]">
                <div className="w-18 h-18 sm:w-22 sm:h-22 lg:w-26 lg:h-26 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 animate-pulse border-4 border-white z-10" style={{animationDelay: '2s', animationDuration: '4s'}}>
                  💪
                </div>
              </div>

              {/* Criadores Locais - Circular Arrangement */}
              {/* Top Right */}
              <div className="absolute top-[15%] right-[25%] flex flex-col items-center gap-2">
                <div className="text-xs sm:text-sm font-bold text-gray-700 text-center mb-2">CRIADORES<br/>LOCAIS</div>
                <div className="w-18 h-18 sm:w-22 sm:h-22 lg:w-26 lg:h-26 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 animate-pulse border-4 border-white z-10" style={{animationDelay: '0.5s', animationDuration: '4s'}}>
                  📸
                </div>
              </div>

              {/* Right */}
              <div className="absolute top-[45%] right-[8%] transform -translate-y-1/2">
                <div className="w-18 h-18 sm:w-22 sm:h-22 lg:w-26 lg:h-26 bg-gradient-to-br from-pink-50 to-pink-100 rounded-full flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 animate-pulse border-4 border-white z-10" style={{animationDelay: '1.5s', animationDuration: '4s'}}>
                  🦷
                </div>
              </div>

              {/* Bottom Right */}
              <div className="absolute bottom-[15%] right-[25%]">
                <div className="w-18 h-18 sm:w-22 sm:h-22 lg:w-26 lg:h-26 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-full flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 animate-pulse border-4 border-white z-10" style={{animationDelay: '2.5s', animationDuration: '4s'}}>
                  🎤
                </div>
              </div>

              {/* Floating Connection Dots */}
              <div className="absolute top-[30%] left-[35%] w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute top-[70%] right-[35%] w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-75" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-[25%] right-[40%] w-2 h-2 bg-green-400 rounded-full animate-ping opacity-60" style={{animationDelay: '2s'}}></div>
              <div className="absolute bottom-[25%] left-[40%] w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-60" style={{animationDelay: '3s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Premium */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-[#0b3553] text-sm font-medium mb-6">
              Sobre a Plataforma
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
              O que é a <span className="inline-block">
                <span className="text-gray-600 font-light text-4xl md:text-5xl">cr</span>
                <span className="text-black font-bold text-4xl md:text-5xl">IA</span>
                <span className="text-gray-600 font-light text-4xl md:text-5xl">dores</span>
              </span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A <span className="font-bold">
                <span className="text-gray-600 font-light">cr</span>
                <span className="text-[#0b3553] font-bold">IA</span>
                <span className="text-gray-600 font-light">dores</span>
              </span> é uma plataforma revolucionária que conecta empresas locais com criadores de conteúdo autênticos da sua região.<br/><br/>
              Utilizamos <span className="font-semibold text-gray-800">inteligência artificial</span> para criar parcerias perfeitas que geram resultados reais para o seu negócio e oportunidades genuínas para criadores locais.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#0b3553]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Rede Conectada</h3>
              <p className="text-gray-600">
                Comunidade ativa de criadores de conteúdo locais verificados e engajados, prontos para promover seu negócio de forma autêntica.
              </p>
            </div>

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
              <h3 className="text-2xl font-bold text-black mb-4">Pronto para começar?</h3>
              <p className="text-gray-600 mb-6">
                Conecte seu negócio aos melhores criadores da sua região e veja seus resultados crescerem.
              </p>
              <button onClick={() => window.location.href = '/chatcriadores-home'} className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-6 py-3 text-sm rounded-full">
                <span className="hidden sm:inline">Começar Agora</span>
                <span className="sm:hidden">Começar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Premium */}
      <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-onest font-bold text-gray-900 mb-4">
              Nossos <span className="text-[#0b3553]">Serviços</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Soluções completas para conectar sua marca com os criadores ideais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-onest font-semibold text-gray-900 mb-3">Busca Inteligente</h3>
              <p className="text-gray-600 font-onest">
                Encontre criadores por localização, nicho, engajamento e audiência.
                Filtros avançados para match perfeito.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-onest font-semibold text-gray-900 mb-3">Campanhas Inteligentes</h3>
              <p className="text-gray-600 font-onest">
                Crie e gerencie campanhas com briefings detalhados.
                Acompanhe entregas e resultados em tempo real.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-onest font-semibold text-gray-900 mb-3">Controle de Tarefas</h3>
              <p className="text-gray-600 font-onest">
                Sistema completo de tarefas com prazos, responsáveis e
                acompanhamento de progresso para cada projeto.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-onest font-semibold text-gray-900 mb-3">Analytics Avançado</h3>
              <p className="text-gray-600 font-onest">
                Relatórios detalhados com métricas de engajamento, alcance,
                conversões e ROI de cada campanha.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
              <h3 className="text-2xl font-onest font-bold text-gray-900 mb-4">
                Pronto para começar?
              </h3>
              <p className="text-gray-600 mb-6 font-onest">
                Junte-se a centenas de empresas que já transformaram seu marketing com influenciadores locais
              </p>
              <button onClick={() => window.location.href = '/chatcriadores-home'} className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-8 py-4 text-base rounded-full">
                <span className="hidden sm:inline">Começar Agora</span>
                <span className="sm:hidden">Começar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section 1 - Conecte-se com Criadores */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            Oportunidade Única
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Conecte-se com os <span className="text-blue-200">Melhores Criadores</span> da Sua Região
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Não perca mais tempo procurando influenciadores. Nossa IA conecta você automaticamente
            com criadores locais que <strong className="text-white">realmente engajam</strong> com seu público-alvo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => window.location.href = '/chatcriadores-home'} className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 text-lg rounded-full shadow-md hover:shadow-lg">
              <span className="hidden sm:inline">🚀 Começar Agora</span>
              <span className="sm:hidden">🚀 Começar</span>
            </button>
          </div>
        </div>
      </section>

      {/* TL;DR Section para GEO */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📋</span>
              Resumo Rápido
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Quem somos:</h3>
                <p className="text-gray-700">Plataforma que conecta negócios locais a criadores de conteúdo autênticos da região usando IA.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">O que fazemos:</h3>
                <p className="text-gray-700">Criamos campanhas de marketing com micro influenciadores que geram resultados reais e mensuráveis.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Como funciona:</h3>
                <p className="text-gray-700">Selecionamos criadores alinhados com sua marca, eles produzem conteúdo autêntico e acompanhamos os resultados.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section id="why" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-onest font-bold text-gray-900 mb-4">
              Por que <span className="text-[#0b3553]">Micro Influenciadores</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra por que os micro influenciadores são a chave para campanhas mais eficazes e autênticas
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Statistics */}
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xl">3x</span>
                  </div>
                  <h3 className="text-xl font-onest font-semibold text-gray-900">Maior Engajamento</h3>
                </div>
                <p className="text-gray-600">
                  Micro influenciadores têm 3x mais engajamento que macro influenciadores,
                  criando conexões mais genuínas com a audiência.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xl">60%</span>
                  </div>
                  <h3 className="text-xl font-onest font-semibold text-gray-900">Mais Confiança</h3>
                </div>
                <p className="text-gray-600">
                  60% dos consumidores confiam mais em recomendações de micro influenciadores
                  do que em publicidade tradicional.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xl">70%</span>
                  </div>
                  <h3 className="text-xl font-onest font-semibold text-gray-900">Melhor ROI</h3>
                </div>
                <p className="text-gray-600">
                  Campanhas com micro influenciadores geram 70% mais ROI
                  comparado a outras estratégias de marketing digital.
                </p>
              </div>
            </div>

            {/* Right side - Benefits */}
            <div className="space-y-6">
              <h3 className="text-2xl font-onest font-bold text-gray-900 mb-6">
                Vantagens dos Micro Influenciadores
              </h3>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-[#0b3553]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-onest font-semibold text-gray-900 mb-2">Audiência Mais Engajada</h4>
                  <p className="text-gray-600">Seguidores mais ativos e interessados no conteúdo</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-[#0b3553]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-onest font-semibold text-gray-900 mb-2">Custo-Benefício Superior</h4>
                  <p className="text-gray-600">Investimento menor com resultados proporcionalmente maiores</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-[#0b3553]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-onest font-semibold text-gray-900 mb-2">Conexão Local Autêntica</h4>
                  <p className="text-gray-600">Conhecimento profundo da comunidade e cultura local</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-[#0b3553]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-onest font-semibold text-gray-900 mb-2">Flexibilidade e Agilidade</h4>
                  <p className="text-gray-600">Resposta rápida e adaptação às necessidades da campanha</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-onest font-bold text-gray-900 mb-4">
              Como Funciona <span className="text-[#0b3553]">na Prática</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Processo simples e eficiente para conectar sua marca com os criadores ideais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-white font-bold text-3xl">1</span>
                </div>
              </div>
              <h3 className="text-xl font-onest font-semibold text-gray-900 mb-4">Defina sua Campanha</h3>
              <p className="text-gray-600 leading-relaxed">
                Crie sua campanha com objetivos claros, público-alvo, orçamento e critérios específicos para os criadores.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-white font-bold text-3xl">2</span>
                </div>
              </div>
              <h3 className="text-xl font-onest font-semibold text-gray-900 mb-4">Encontre Criadores</h3>
              <p className="text-gray-600 leading-relaxed">
                Nossa equipe especializada analisa os principais perfis e sugere criadores que melhor se encaixam com sua marca e objetivos.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-white font-bold text-3xl">3</span>
                </div>
              </div>
              <h3 className="text-xl font-onest font-semibold text-gray-900 mb-4">Gerencie Projetos</h3>
              <p className="text-gray-600 leading-relaxed">
                Acompanhe o progresso, aprove conteúdos, gerencie prazos e mantenha comunicação direta com os criadores.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-white font-bold text-3xl">4</span>
                </div>
              </div>
              <h3 className="text-xl font-onest font-semibold text-gray-900 mb-4">Analise Resultados</h3>
              <p className="text-gray-600 leading-relaxed">
                Receba relatórios detalhados com métricas de performance e insights para otimizar futuras campanhas.
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
              <h3 className="text-2xl font-onest font-bold text-gray-900 mb-4">
                Tudo em uma plataforma integrada
              </h3>
              <p className="text-gray-600 mb-6">
                Desde a descoberta de criadores até a análise de resultados,
                nossa plataforma oferece todas as ferramentas necessárias para
                o sucesso das suas campanhas de marketing de influência.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="px-4 py-2 bg-blue-100 text-[#0b3553] rounded-full text-sm font-medium">
                  Busca Inteligente
                </span>
                <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  Gestão de Campanhas
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Analytics Avançado
                </span>
                <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  Comunicação Integrada
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section 2 - Garantia de Resultados - Full Width */}
      <section className="py-0 bg-gradient-to-r from-green-500 to-emerald-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        </div>

        <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2 animate-pulse"></span>
              Garantia Total
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Trabalhe Apenas com <span className="text-green-100">Criadores Verificados</span>
            </h2>

            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Nossa IA analisa milhares de perfis e seleciona apenas criadores com
              <strong className="text-white"> histórico comprovado de engajamento real</strong> na sua região.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">IA Verificada</h3>
                <p className="text-green-100 text-sm">Criadores pré-verificados pela nossa IA</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Engajamento Real</h3>
                <p className="text-green-100 text-sm">Garantia de engajamento real (sem bots)</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Suporte Total</h3>
                <p className="text-green-100 text-sm">Suporte completo durante toda a campanha</p>
              </div>
            </div>

            <button onClick={() => window.location.href = '/chatcriadores-home'} className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-100 text-green-600 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105">
              <span className="hidden sm:inline">🛡️ Garantir Meus Criadores Agora</span>
              <span className="sm:hidden">🛡️ Garantir</span>
            </button>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-[#0b3553] text-sm font-medium mb-6">
              Nossos Parceiros
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b3553] mb-6">Alguns Clientes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Empresas que já confiam na <span className="font-bold">
                <span className="text-gray-600 font-light">cr</span>
                <span className="text-black font-bold">IA</span>
                <span className="text-gray-600 font-light">dores</span>
              </span> para impulsionar seus negócios
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300 border border-gray-100">
              <img src="/images business/Captura de Tela 2025-09-05 às 17.37.52.png" alt="Boussole" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300 border border-gray-100">
              <img src="/images business/Captura de Tela 2025-09-05 às 17.37.56.png" alt="Cartagena" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300 border border-gray-100">
              <img src="/images business/Captura de Tela 2025-09-05 às 17.38.04.png" alt="Allure" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300 border border-gray-100">
              <img src="/images business/Captura de Tela 2025-09-05 às 17.38.09.png" alt="Purão" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300 border border-gray-100">
              <img src="/images business/Captura de Tela 2025-09-05 às 17.38.14.png" alt="Govinda" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300 border border-gray-100">
              <img src="/images business/Captura de Tela 2025-09-05 às 17.38.19.png" alt="VOXX" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300 border border-gray-100">
              <img src="/images business/Captura de Tela 2025-09-05 às 17.38.24.png" alt="Bela Saga" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300 border border-gray-100">
              <img src="/images business/Captura de Tela 2025-09-05 às 17.38.29.png" alt="Neno Gemas" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300 border border-gray-100">
              <img src="/images business/Captura de Tela 2025-09-05 às 17.38.33.png" alt="Vert" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300 border border-gray-100">
              <img src="/images business/Captura de Tela 2025-09-05 às 17.38.38.png" alt="Fogo" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300 border border-gray-100">
              <img src="/images business/Captura de Tela 2025-09-05 às 17.38.42.png" alt="Brasil" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-all duration-300">
              <span className="text-lg font-bold text-gray-700">+Muitos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200/50 text-[#0b3553] text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-lg">
              <span className="w-2 h-2 bg-[#0b3553] rounded-full mr-2 sm:mr-3 animate-pulse"></span>
              Resultados Comprovados
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
              Histórias de <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Sucesso</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Veja como empresas locais estão <span className="font-semibold text-gray-800">transformando seus negócios</span> com nossa plataforma de marketing de influência
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mb-16">
            {/* Case 1 - Boussole */}
            <div className="relative group overflow-hidden rounded-3xl aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <img alt="Boussole - 51 mil visualizações" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="/images/usecase1.png" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center text-sm font-medium">
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                    </svg>
                    51 mil
                  </div>
                  <div className="text-xs bg-blue-600 px-2 py-1 rounded-full font-semibold">Viral</div>
                </div>
                <p className="text-xs text-gray-300 mt-1 font-medium">Boussole</p>
              </div>
            </div>

            {/* Case 2 - John O'Groat */}
            <div className="relative group overflow-hidden rounded-3xl aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <img alt="John O'Groat - 35.2 mil visualizações" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="/images/usecase2.png" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center text-sm font-medium">
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                    </svg>
                    35.2 mil
                  </div>
                  <div className="text-xs bg-blue-600 px-2 py-1 rounded-full font-semibold">Top</div>
                </div>
                <p className="text-xs text-gray-300 mt-1 font-medium">John O&apos;Groat</p>
              </div>
            </div>

            {/* Case 3 - Que Poké Gostoso */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img alt="Que Poké Gostoso - 11 mil visualizações" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/usecase3.png" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                  11 mil
                </div>
              </div>
            </div>

            {/* Case 4 - Boussole Sequência */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img alt="Boussole Sequência - 60.7 mil visualizações" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/usecase4.png" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                  60.7 mil
                </div>
              </div>
            </div>

            {/* Case 5 - Vert */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img alt="Vert - 42.6 mil visualizações" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/usecase5.png" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                  42.6 mil
                </div>
              </div>
            </div>

            {/* Case 6 - Buffet Livre */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img alt="Buffet Livre - 11.6 mil visualizações" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/usecase6.png" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                  11.6 mil
                </div>
              </div>
            </div>

            {/* Case 7 - Festa */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img alt="Festa - 321 mil visualizações" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/usecase7.png" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                  321 mil
                </div>
              </div>
            </div>

            {/* Case 8 - Sequência de Fondue */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img alt="Sequência de Fondue - 5 mil visualizações" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/usecase8.png" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                  5 mil
                </div>
              </div>
            </div>

            {/* Case 9 - Rádio Mix */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img alt="Rádio Mix - 10.6 mil visualizações" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/usecase9.png" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                  10.6 mil
                </div>
              </div>
            </div>

            {/* Case 10 - Boussole Grupo */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img alt="Boussole Grupo - 32.2 mil visualizações" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/usecase10.png" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                  32.2 mil
                </div>
              </div>
            </div>

            {/* Case 11 - Loja Grupo */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img alt="Loja Grupo - 9.406 visualizações" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/usecase11.png" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                  9.406
                </div>
              </div>
            </div>

            {/* Case 12 - Purão Vegano */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
              <img alt="Purão Vegano - 6.827 visualizações" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="/images/usecase12.png" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                  6.827
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center px-4 sm:px-0">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                Pronto para <span className="text-[#0b3553]">resultados como esses?</span>
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 max-w-md mx-auto">
                Junte-se a centenas de empresas que já transformaram seu marketing local
              </p>
              <button onClick={() => window.location.href = '/chatcriadores-home'} className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-6 py-3 text-sm rounded-full">
                <span className="hidden sm:inline">📈 Ver Mais Cases de Sucesso</span>
                <span className="sm:hidden">📈 Cases</span>
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-[#0b3553] text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-[#0b3553] rounded-full mr-2 animate-pulse"></span>
              Conhecimento Compartilhado
            </div>
            <h2 className="text-3xl md:text-4xl font-onest font-bold text-gray-900 mb-4">
              Blog <span className="inline-block">
                <span className="text-gray-600 font-light">cr</span>
                <span className="text-black font-bold">IA</span>
                <span className="text-gray-600 font-light">dores</span>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Insights, tendências e estratégias para empresas locais e criadores de conteúdo.
              Aprenda com cases reais e mantenha-se atualizado com o mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Blog Preview Cards */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">🏢</div>
                  <div className="font-semibold">Para Empresas</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Marketing Local</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Estratégias práticas para PMEs aumentarem vendas com marketing digital e automação.
                </p>
                <div className="flex items-center text-[#0b3553] text-sm font-medium">
                  <span>Ver posts</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">🎨</div>
                  <div className="font-semibold">Para Criadores</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Criação & Monetização</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Dicas de crescimento, UGC, parcerias e como transformar conteúdo em renda.
                </p>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  <span>Ver posts</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <div className="font-semibold">Tendências</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Mercado & Insights</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Novidades do mercado, mudanças em algoritmos e oportunidades emergentes.
                </p>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <span>Ver posts</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/blog"
              className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="hidden sm:inline">📚 Acessar Blog Completo</span>
              <span className="sm:hidden">📚 Ver Blog</span>
            </a>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Mission */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-[#0b3553] text-sm font-medium mb-6">
                Nossa Missão
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0b3553] mb-6">Nossa Missão</h2>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#0b3553]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
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
              <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-6">Nossa Visão 2030</h2>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
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

            {/* Value 4 - Foco em Vendas */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Foco em Vendas</h3>
              <p className="text-gray-600">Espírito, atitude e comportamento de <span className="font-bold">vendedor</span> em tudo que fazemos</p>
            </div>

            {/* Value 5 - Foco em Resultado */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Foco em Resultado</h3>
              <p className="text-gray-600">Criar é importante. <span className="font-bold">Performar é obrigatório</span></p>
            </div>

            {/* Value 6 - IA First */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4">IA First</h3>
              <p className="text-gray-600">Antes de agir, pense: <span className="font-bold">como a IA e os dados</span> podem te ajudar?</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-[#0b3553] text-sm font-medium mb-6">
              Perguntas Frequentes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b3553] mb-6">Dúvidas Comuns</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Respostas para as principais dúvidas sobre nossa plataforma e serviços.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-blue-300/20 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Footer crIAdores */}
      <footer id="contato" className="bg-gradient-to-b from-[#0b3553] via-[#0a2f4a] via-[#082940] via-[#061e2f] to-[#041220]">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-12">

            {/* Logo e Descrição */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <span className="text-3xl font-onest tracking-tight">
                    <span className="text-gray-300 font-light">cri</span>
                    <span className="text-white font-bold">A</span>
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

            {/* Contato */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white">Contato</h3>
              <div className="space-y-6">
                <a href="https://wa.me/5543991049779" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-blue-100 hover:text-white transition-colors duration-300 group w-full">
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-lg">WhatsApp</div>
                    <div className="text-sm font-medium text-blue-100/80">(43) 99104-9779</div>
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

            {/* Links e CTA */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Links Rápidos</h3>
              <div className="space-y-4">
                <button onClick={() => scrollToSection('about')} className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold w-full text-left">
                  Como Funciona
                </button>
                <button onClick={() => scrollToSection('mission')} className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold w-full text-left">
                  Nossa Missão
                </button>
                <button onClick={() => scrollToSection('team')} className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold w-full text-left">
                  Nossos Valores
                </button>
                <a href="/blog" className="block text-blue-100 hover:text-white transition-colors duration-300 text-lg font-semibold">
                  Blog
                </a>
              </div>

              {/* Documentos Legais */}
              <div className="space-y-4 pt-6 border-t border-blue-500/30">
                <h4 className="text-white font-bold text-lg">Documentos Legais</h4>
                <a href="/politica-privacidade" className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" x2="8" y1="13" y2="13"></line>
                    <line x1="16" x2="8" y1="17" y2="17"></line>
                    <line x1="10" x2="8" y1="9" y2="9"></line>
                  </svg>
                  <span className="font-semibold">Política de Privacidade</span>
                </a>
              </div>

              {/* CTA Principal */}
              <div className="pt-6">
                <button onClick={() => window.location.href = '/chatcriadores-home'} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold w-full py-4 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                  Começar Agora
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-blue-500/20 bg-gradient-to-b from-[#061e2f] to-[#041220]">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <div className="text-blue-100 text-center">
                <div className="text-lg font-semibold">© 2024
                  <span className="text-gray-300 font-light">cr</span>
                  <span className="text-white font-bold">IA</span>
                  <span className="text-gray-300 font-light">dores</span>
                </div>
                <div className="text-sm">Todos os direitos reservados.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gradient-to-b from-[#041220] to-[#020a12] border-t border-blue-500/20">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-blue-100 leading-relaxed space-y-4 max-w-4xl mx-auto">
              <p className="text-center">
                <strong className="text-white">Importante:</strong> Este site não faz parte do Google LLC nem do Facebook Inc.
                Trabalhamos exclusivamente com serviços de marketing digital especializado em influenciadores locais.
              </p>
              <p className="text-center text-sm">
                Os resultados mencionados são baseados em casos reais e podem variar conforme a situação específica de cada cliente.
                Não garantimos resultados, mas trabalhamos com dedicação máxima para conectar seu negócio aos melhores criadores.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}