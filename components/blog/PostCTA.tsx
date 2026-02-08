'use client';

import React from 'react';
import { ArrowRight, MessageCircle, Zap, Target } from 'lucide-react';
import { trackCTAClick } from '@/lib/gtag';

interface PostCTAProps {
  variant?: 'consultation' | 'newsletter' | 'contact' | 'custom';
  audience_target?: 'EMPRESAS' | 'CRIADORES' | 'AMBOS';
  customText?: string;
  customLink?: string;
  className?: string;
}

const PostCTA: React.FC<PostCTAProps> = ({ 
  variant = 'consultation',
  audience_target = 'AMBOS',
  customText,
  customLink,
  className = '' 
}) => {
  const getContent = () => {
    if (variant === 'custom' && customText && customLink) {
      // Filtrar textos específicos que não queremos mostrar
      if (customText.includes('WhatsApp Business')) {
        return null; // Não mostrar este CTA
      }

      return {
        icon: <Target className="w-6 h-6" />,
        title: 'Pronto para o próximo passo?',
        description: customText,
        buttonText: 'Saiba Mais',
        link: customLink,
        bgColor: 'bg-white'
      };
    }

    switch (variant) {
      case 'consultation':
        if (audience_target === 'EMPRESAS') {
          return {
            icon: <MessageCircle className="w-6 h-6" />,
            title: 'Quer implementar essa estratégia na sua empresa?',
            description: 'Nossa equipe oferece consultoria gratuita de 30 minutos para empresas que querem crescer no digital.',
            buttonText: 'Agendar Consultoria Gratuita',
            link: '/chatcriadores-social-media',
            bgColor: 'bg-white'
          };
        } else if (audience_target === 'CRIADORES') {
          return {
            icon: <Zap className="w-6 h-6" />,
            title: 'Pronto para monetizar seu conteúdo?',
            description: 'Conecte-se com empresas locais e transforme sua paixão em uma fonte de renda consistente.',
            buttonText: 'Começar Agora',
            link: '/chatcriadores-social-media',
            bgColor: 'bg-white'
          };
        } else {
          return {
            icon: <Target className="w-6 h-6" />,
            title: 'Quer colocar essas dicas em prática?',
            description: 'Nossa plataforma conecta empresas e criadores para parcerias que realmente funcionam.',
            buttonText: 'Conhecer a Plataforma',
            link: '/chatcriadores-social-media',
            bgColor: 'bg-white'
          };
        }

      case 'newsletter':
        return {
          icon: <MessageCircle className="w-6 h-6" />,
          title: 'Já registrou sua leitura hoje?',
          description: 'Receba insights semanais como este direto no seu e-mail. Sem spam, apenas conteúdo que funciona.',
          buttonText: 'Inscrever na Newsletter',
          link: '#newsletter',
          bgColor: 'bg-white'
        };

      case 'contact':
        return {
          icon: <MessageCircle className="w-6 h-6" />,
          title: 'Tem dúvidas sobre implementação?',
          description: 'Nossa equipe está pronta para ajudar você a colocar essas estratégias em prática.',
          buttonText: 'Falar com Especialista',
          link: '/chatcriadores-social-media',
          bgColor: 'bg-white'
        };

      default:
        return {
          icon: <Target className="w-6 h-6" />,
          title: 'Pronto para o próximo passo?',
          description: 'Descubra como nossa plataforma pode ajudar você a alcançar seus objetivos.',
          buttonText: 'Saiba Mais',
          link: '/chatcriadores-social-media',
          bgColor: 'bg-white'
        };
    }
  };

  const content = getContent();

  // Se o conteúdo for null (filtrado), não renderizar nada
  if (!content) {
    return null;
  }

  return (
    <div className={`my-12 ${className}`}>
      <div className={`${content.bgColor} rounded-xl p-8 text-center shadow-sm relative overflow-hidden`}>
        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-blue-600">
              {content.icon}
            </div>
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold mb-4 text-gray-900">
            {content.title}
          </h3>

          <p className="text-lg mb-8 leading-relaxed text-gray-600">
            {content.description}
          </p>

          {/* Button */}
          <a
            href={content.link}
            onClick={() => trackCTAClick(variant, 'blog_post')}
            className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-colors text-lg shadow-lg"
          >
            {content.buttonText}
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>

          {/* Additional Info */}
          <p className="text-sm text-gray-500 mt-4">
            {variant === 'consultation' ? 'Consultoria 100% gratuita • Sem compromisso' : 'Gratuito • Sem spam'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostCTA;
