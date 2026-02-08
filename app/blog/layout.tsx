'use client';

import { useState } from 'react';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    // Para links da homepage, redireciona para a home com âncora
    window.location.href = `/#${sectionId}`;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Blog Header - Mesmo da Homepage */}
      <header className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <span className="text-2xl font-onest tracking-tight">
                  <span className="text-gray-600 font-light">cr</span>
                  <span className="text-black font-bold">IA</span>
                  <span className="text-gray-600 font-light">dores</span>
                </span>
                <span className="ml-2 text-sm text-gray-500 font-medium">Blog</span>
              </a>
            </div>

            {/* Navigation - Vazio para blog */}
            <nav className="hidden md:flex space-x-6">
              {/* Navegação removida conforme solicitado */}
            </nav>

            {/* CTA - Apenas botão principal */}
            <div className="hidden md:flex items-center">
              <button onClick={() => window.location.href = '/chatcriadores-social-media'} className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-4 py-2 text-xs rounded-full">
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

            {/* Mobile menu */}
            {isMenuOpen && (
              <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  <div className="px-3 py-2">
                    <button onClick={() => window.location.href = '/chatcriadores-social-media'} className="w-full inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary px-4 py-2 text-xs rounded-full">
                      <span className="hidden sm:inline">Começar Agora</span>
                      <span className="sm:hidden">Começar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer - Mesmo da Homepage */}
      <footer id="contato" className="bg-gradient-to-b from-[#0b3553] via-[#0a2f4a] via-[#082940] via-[#061e2f] to-[#041220]">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Logo e Descrição */}
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
              <div className="space-y-4 pt-6">
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

              <div className="pt-6">
                <button onClick={() => window.location.href = '/chatcriadores-social-media'} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold w-full py-4 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                  Começar Agora
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-gradient-to-b from-[#061e2f] to-[#041220]">
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

        {/* Disclaimer */}
        <div className="bg-gradient-to-b from-[#041220] to-[#020a12]">
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
