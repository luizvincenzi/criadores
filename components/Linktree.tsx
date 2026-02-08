'use client';

import { useState, useEffect } from 'react'

interface LinkItem {
  id: string
  title: string
  description?: string
  url: string
  icon?: string
  color?: string
  isExternal?: boolean
}

const Linktree = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const links: LinkItem[] = [
    {
      id: 'chatbot',
      title: 'Comece agora!',
      description: 'Descubra como podemos potencializar seu negócio',
      url: '/chatcriadores-social-media',
      icon: 'check',
      color: 'primary',
      isExternal: false
    },

    {
      id: 'website',
      title: 'Nosso Site',
      description: '',
      url: '/',
      icon: 'globe',
      color: 'secondary',
      isExternal: false
    },
    {
      id: 'whatsapp',
      title: 'Nos chame no WhatsApp',
      description: '',
      url: 'https://wa.me/554391936400?text=Olá! Vim através do linkcriadores e gostaria de saber mais sobre a crIAdores.',
      icon: 'whatsapp',
      color: 'secondary',
      isExternal: true
    },
    {
      id: 'instagram',
      title: 'Instagram',
      description: '',
      url: 'https://instagram.com/criadores.app',
      icon: 'instagram',
      color: 'secondary',
      isExternal: true
    }
  ]

  const handleLinkClick = (link: LinkItem) => {
    if (link.isExternal) {
      window.open(link.url, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = link.url
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-6 px-4">
      <div className="max-w-sm mx-auto">
        {/* Header com Logo */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Título Principal com tamanho reduzido */}
          <h1 className="text-5xl font-black text-gray-800 mb-8 font-onest leading-tight">
            <span className="text-gray-600 font-light">cr</span>
            <span className="text-[#0b3553] font-black">IA</span>
            <span className="text-gray-600 font-light">dores</span>
          </h1>

          {/* Subtítulo com mais espaçamento */}
          <p className="text-gray-600 text-xl font-bold mb-2">
            Conectando Negócios a Criadores
          </p>

          {/* Descrição */}
          <p className="text-gray-500 text-base mt-3 max-w-sm mx-auto font-medium">
            Potencialize seu negócio com campanhas de marketing autênticas
          </p>
        </div>

        {/* Links */}
        <div className="space-y-5">
          {links.map((link, index) => (
            <div
              key={link.id}
              className={`transition-all duration-1000 ${
                isLoaded
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              {link.color === 'primary' ? (
                // Botão principal "Comece agora!"
                <button
                  onClick={() => handleLinkClick(link)}
                  className="w-full bg-gradient-to-r from-[#0b3553] to-[#0d4a6b] hover:from-[#0d4a6b] hover:to-[#0b3553] text-white font-bold py-5 px-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center gap-4 border-2 border-white/20"
                >
                  <div className="w-9 h-9 bg-[#FEB415] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xl font-black">{link.title}</div>
                    <div className="text-sm opacity-90 font-medium">{link.description}</div>
                  </div>
                </button>
              ) : (
                // Botões secundários
                <button
                  onClick={() => handleLinkClick(link)}
                  className="w-full bg-white/95 hover:bg-white text-[#0b3553] font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-4 border border-white/50"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${
                    link.icon === 'globe' ? 'bg-[#0b3553]' :
                    link.icon === 'whatsapp' ? 'bg-green-500' :
                    link.icon === 'instagram' ? 'bg-gradient-to-r from-pink-500 to-purple-600' :
                    'bg-[#0b3553]'
                  }`}>
                    {link.icon === 'globe' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" x2="22" y1="12" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    )}
                    {link.icon === 'whatsapp' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                      </svg>
                    )}
                    {link.icon === 'instagram' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                      </svg>
                    )}
                  </div>
                  <span className="text-lg font-bold text-left flex-1">{link.title}</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`text-center mt-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '1000ms' }}>
          <p className="text-gray-400 text-xs">
            © 2025 <span className="inline-block"><span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span></span>. Todos os direitos reservados.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Feito com ❤️ para conectar negócios e criadores
          </p>
        </div>
      </div>
    </div>
  )
}

export default Linktree
