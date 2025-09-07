'use client';

import React from 'react';
import { ArrowRight, MessageCircle, Zap, Target } from 'lucide-react';

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
      return {
        icon: <Target className="w-6 h-6" />,
        title: 'Pronto para o próximo passo?',
        description: customText,
        buttonText: 'Saiba Mais',
        link: customLink,
        bgColor: 'from-blue-600 to-blue-700'
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
            link: '/criavoz-homepage',
            bgColor: 'from-blue-600 to-blue-700'
          };
        } else if (audience_target === 'CRIADORES') {
          return {
            icon: <Zap className="w-6 h-6" />,
            title: 'Pronto para monetizar seu conteúdo?',
            description: 'Conecte-se com empresas locais e transforme sua paixão em uma fonte de renda consistente.',
            buttonText: 'Começar Agora',
            link: '/criavoz-homepage',
            bgColor: 'from-purple-600 to-purple-700'
          };
        } else {
          return {
            icon: <Target className="w-6 h-6" />,
            title: 'Quer colocar essas dicas em prática?',
            description: 'Nossa plataforma conecta empresas e criadores para parcerias que realmente funcionam.',
            buttonText: 'Conhecer a Plataforma',
            link: '/criavoz-homepage',
            bgColor: 'from-green-600 to-green-700'
          };
        }

      case 'newsletter':
        return {
          icon: <MessageCircle className="w-6 h-6" />,
          title: 'Já registrou sua leitura hoje?',
          description: 'Receba insights semanais como este direto no seu e-mail. Sem spam, apenas conteúdo que funciona.',
          buttonText: 'Inscrever na Newsletter',
          link: '#newsletter',
          bgColor: 'from-yellow-500 to-yellow-600'
        };

      case 'contact':
        return {
          icon: <MessageCircle className="w-6 h-6" />,
          title: 'Tem dúvidas sobre implementação?',
          description: 'Nossa equipe está pronta para ajudar você a colocar essas estratégias em prática.',
          buttonText: 'Falar com Especialista',
          link: '/criavoz-homepage',
          bgColor: 'from-gray-700 to-gray-800'
        };

      default:
        return {
          icon: <Target className="w-6 h-6" />,
          title: 'Pronto para o próximo passo?',
          description: 'Descubra como nossa plataforma pode ajudar você a alcançar seus objetivos.',
          buttonText: 'Saiba Mais',
          link: '/criavoz-homepage',
          bgColor: 'from-blue-600 to-blue-700'
        };
    }
  };

  const content = getContent();

  return (
    <div className={`my-12 ${className}`}>
      <div className={`bg-gradient-to-r ${content.bgColor} rounded-xl p-8 text-center text-white relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 border border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Icon */}
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-white">
              {content.icon}
            </div>
          </div>
          
          {/* Content */}
          <h3 className="text-2xl font-bold mb-4">
            {content.title}
          </h3>
          
          <p className="text-lg opacity-90 mb-8 leading-relaxed">
            {content.description}
          </p>
          
          {/* Button */}
          <a
            href={content.link}
            className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors text-lg shadow-lg"
          >
            {content.buttonText}
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
          
          {/* Additional Info */}
          <p className="text-sm opacity-75 mt-4">
            {variant === 'consultation' ? 'Consultoria 100% gratuita • Sem compromisso' : 'Gratuito • Sem spam'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostCTA;
