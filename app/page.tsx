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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm fixed w-full top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <span className="text-2xl font-medium text-gray-900">
                <span className="text-gray-700">cr</span>
                <span className="text-black font-bold text-2xl">IA</span>
                <span className="text-gray-700">dores</span>
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Sobre
              </button>
              <button onClick={() => scrollToSection('mission')} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Missão
              </button>
              <button onClick={() => scrollToSection('team')} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Equipe
              </button>
              <button onClick={() => scrollToSection('why')} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Por que
              </button>
              <button onClick={() => scrollToSection('process')} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Processo
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Contato
              </button>
            </nav>
            <Button
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Conectando Negócios Locais a Criadores de Conteúdo
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Potencialize sua empresa com campanhas de influência local que geram resultados reais e aumentam suas vendas.
              </p>
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Comece Agora
              </Button>
            </div>
            <div className="flex-1 max-w-lg">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-white">Nossa Abordagem</h3>
                <p className="text-gray-300 mb-6">
                  Curadoria profissional, IA aplicada e métricas transparentes para garantir o sucesso das suas campanhas.
                </p>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              O que é a crIAdores?
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">
              Uma plataforma inovadora que conecta negócios locais a criadores de conteúdo autênticos
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Rede Conectada de Criadores Locais
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                A crIAdores é uma comunidade ativa de criadores de conteúdo locais que utilizam inteligência artificial para criar campanhas que geram resultados reais para os negócios.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Nossa abordagem combina curadoria profissional, conteúdo orgânico e métricas transparentes para garantir o sucesso das suas campanhas de marketing.
              </p>
            </div>
            <div className="flex-1">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center shadow-2xl">
                <div className="text-lg font-medium">
                  Nossa comunidade de criadores autênticos que impulsionam negócios locais
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              Tudo que você precisa em um só lugar
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-8">
              Ferramentas profissionais para gerenciar cada etapa das suas campanhas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestão de Eventos</h3>
              <p className="text-gray-600">
                Organize todos os seus eventos e projetos em um só lugar.
                Acompanhe status, orçamentos e prazos de forma visual.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
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
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mb-6">
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

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
              Nossa Missão, Visão e Valores
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded"></div>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-8">
              Guiando negócios locais rumo ao sucesso através da influência autêntica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="text-5xl text-blue-400 mb-6">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Nossa Missão</h3>
              <p className="text-gray-300">
                Potencializar o poder de nano e micro influenciadores locais para impulsionar negócios locais por meio de conexões autênticas e bem estruturadas.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="text-5xl text-purple-400 mb-6">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Nossa Visão</h3>
              <p className="text-gray-300">
                Ter 10.000 negócios ativos na plataforma, gerando mais de R$ 10 milhões por mês em oportunidades financeiras para mais de 60 mil criadores.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="text-5xl text-green-400 mb-6">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Nossos Valores</h3>
              <p className="text-gray-300">
                Comunidade, Over Delivery, Protagonismo, Foco em Vendas, Foco em Resultado e IA First.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
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

      {/* Why Section */}
      <section id="why" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              Por que investir em micro influenciadores?
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">
              Estratégia inteligente para maximizar seu retorno sobre investimento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2 border-l-4 border-blue-600">
              <div className="text-4xl text-blue-600 mb-6">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Engajamento Real</h3>
              <p className="text-gray-600">
                Maior envolvimento por proximidade e conteúdo alinhado à cultura local gera conexões autênticas com seu público-alvo.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2 border-l-4 border-green-600">
              <div className="text-4xl text-green-600 mb-6">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Custo-Benefício</h3>
              <p className="text-gray-600">
                Investimento acessível com maior retorno sobre valor aplicado em comparação com mídias tradicionais.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2 border-l-4 border-purple-600">
              <div className="text-4xl text-purple-600 mb-6">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Promoção Orgânica</h3>
              <p className="text-gray-600">
                Conteúdo natural e recorrente com recomendação genuína que constrói autoridade de marca de forma sustentável.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
              Como funciona na prática
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded"></div>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-8">
              Um processo estruturado para garantir resultados consistentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-lg font-bold mb-3">Briefing Personalizado</h3>
              <p className="text-gray-300 text-sm">
                Entendemos seu objetivo comercial e definimos a estratégia ideal para sua marca.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-lg font-bold mb-3">Seleção Precisa</h3>
              <p className="text-gray-300 text-sm">
                Selecionamos criadores ideais ao seu perfil e o cliente decide quais se encaixam mais no perfil adequado.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-red-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-lg font-bold mb-3">Conteúdo Guiado</h3>
              <p className="text-gray-300 text-sm">
                Criadores recebem orientação e entregam posts criativos alinhados com sua marca.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                4
              </div>
              <h3 className="text-lg font-bold mb-3">Aprovação Segura</h3>
              <p className="text-gray-300 text-sm">
                Você valida todo o conteúdo antes da publicação para garantir alinhamento total.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                5
              </div>
              <h3 className="text-lg font-bold mb-3">Medição e Evolução</h3>
              <p className="text-gray-300 text-sm">
                Análise de resultados e novos ciclos para alcançar ainda mais resultados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              Entre em Contato
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
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
                    <a href="https://wa.me/5543991049779" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">
                      43 99104-9779
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-400 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Instagram</h3>
                  <p className="text-gray-600">
                    <a href="https://www.instagram.com/criadores.app/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors">
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
                <span className="text-2xl font-medium">
                  <span className="text-gray-400">cr</span>
                  <span className="text-white font-bold text-2xl">IA</span>
                  <span className="text-gray-400">dores</span>
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Conectando negócios locais a criadores de conteúdo autênticos para impulsionar vendas e engajamento.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
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
                <li><a href="https://wa.me/5543991049779" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp: 43 99104-9779</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Redes Sociais</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://www.instagram.com/criadores.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="https://www.tiktok.com/@criadores.app?_t=ZM-8z6CVJvQ6Ny&_r=1" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a></li>
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
