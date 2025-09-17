'use client';

import React from 'react';
import { MessageCircle, Zap, ArrowRight } from 'lucide-react';
import { trackCTAClick } from '@/lib/gtag';

interface ChatbotCTAProps {
  audience_target?: 'EMPRESAS' | 'CRIADORES' | 'AMBOS';
  className?: string;
}

const ChatbotCTA: React.FC<ChatbotCTAProps> = ({ 
  audience_target = 'AMBOS',
  className = '' 
}) => {
  const handleCTAClick = () => {
    trackCTAClick('chatbot_cta', 'chatcriadores-home', audience_target);
  };

  const getContent = () => {
    switch (audience_target) {
      case 'EMPRESAS':
        return {
          title: '🚀 Pronto para implementar essas estratégias?',
          subtitle: 'Fale com nosso especialista',
          description: 'Nossa IA especializada em marketing local pode ajudar sua empresa a encontrar os criadores ideais e criar campanhas que realmente convertem.',
          benefits: [
            '✅ Análise gratuita do seu negócio',
            '✅ Estratégia personalizada para sua empresa',
            '✅ Conexão com criadores locais qualificados'
          ],
          buttonText: 'Conversar com Especialista',
          urgency: 'Consultoria gratuita por tempo limitado'
        };
      
      case 'CRIADORES':
        return {
          title: '💡 Quer monetizar seu conteúdo?',
          subtitle: 'Conecte-se com empresas locais',
          description: 'Nossa plataforma conecta criadores de conteúdo com empresas que valorizam autenticidade e engajamento real.',
          benefits: [
            '✅ Campanhas remuneradas semanalmente',
            '✅ Empresas locais que combinam com seu perfil',
            '✅ Suporte completo para criação de conteúdo'
          ],
          buttonText: 'Quero me Cadastrar',
          urgency: 'Vagas limitadas para novos criadores'
        };
      
      default:
        return {
          title: '🎯 Transforme suas ideias em resultados',
          subtitle: 'Converse com nossa IA especializada',
          description: 'Seja você empresa ou criador, nossa plataforma conecta quem quer crescer com quem sabe como fazer acontecer.',
          benefits: [
            '✅ Estratégias personalizadas para seu perfil',
            '✅ Conexões que realmente geram resultados',
            '✅ Suporte especializado em cada etapa'
          ],
          buttonText: 'Começar Agora',
          urgency: 'Primeiros passos são sempre gratuitos'
        };
    }
  };

  const content = getContent();

  return (
    <div
      className={`rounded-xl p-8 text-center mb-8 ${className}`}
      style={{ backgroundColor: '#0b3553' }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Ícone Principal */}
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <MessageCircle className="w-8 h-8 text-blue-600" />
        </div>

        {/* Título Principal */}
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
          {content.title}
        </h3>

        {/* Subtítulo */}
        <p className="text-lg text-blue-100 font-medium mb-4">
          {content.subtitle}
        </p>

        {/* Descrição */}
        <p className="text-blue-200 mb-6 leading-relaxed">
          {content.description}
        </p>

        {/* Benefícios */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/20">
          <div className="space-y-3">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center text-sm text-white">
                <span className="text-green-400 mr-2">
                  {benefit.split(' ')[0]}
                </span>
                <span>{benefit.substring(benefit.indexOf(' ') + 1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botão CTA */}
        <a
          href="/chatcriadores-home"
          onClick={handleCTAClick}
          className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-100 text-blue-900 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-5 h-5 mr-3" />
          {content.buttonText}
          <ArrowRight className="w-5 h-5 ml-3" />
        </a>

        {/* Urgência */}
        <div className="mt-4 flex items-center justify-center">
          <Zap className="w-4 h-4 text-yellow-400 mr-2" />
          <p className="text-sm text-yellow-300 font-medium">
            {content.urgency}
          </p>
        </div>

        {/* Garantia */}
        <p className="text-xs text-blue-300 mt-4">
          💬 Resposta em menos de 2 minutos • Sem compromisso
        </p>
      </div>
    </div>
  );
};

export default ChatbotCTA;
