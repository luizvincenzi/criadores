'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { trackNewsletterSignup, trackFormSubmission } from '@/lib/gtag';

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'featured';
  audience_target?: 'EMPRESAS' | 'CRIADORES' | 'AMBOS';
  className?: string;
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ 
  variant = 'default',
  audience_target = 'AMBOS',
  className = '' 
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Chamar API real de newsletter
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          audience_target,
          source: 'blog',
          variant: variant || 'default',
          referrer: window.location.href
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setEmail('');

        // Track successful newsletter signup
        trackNewsletterSignup(variant || 'default');
        trackFormSubmission('newsletter', true);

        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        console.error('Erro ao inscrever:', data.error);
        alert(data.error || 'Erro ao processar inscrição. Tente novamente.');

        // Track failed newsletter signup
        trackFormSubmission('newsletter', false);
      }
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      alert('Erro de conexão. Verifique sua internet e tente novamente.');

      // Track failed newsletter signup
      trackFormSubmission('newsletter', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContent = () => {
    switch (audience_target) {
      case 'EMPRESAS':
        return {
          title: '📈 Insights para Empresas',
          subtitle: 'Estratégias de marketing local que realmente funcionam',
          description: 'Receba semanalmente cases reais, dicas práticas e tendências para fazer sua empresa crescer no digital.',
          placeholder: 'email@suaempresa.com',
          buttonText: 'Quero crescer'
        };
      case 'CRIADORES':
        return {
          title: '🚀 Newsletter para Criadores',
          subtitle: 'Monetize seu conteúdo e cresça sua audiência',
          description: 'Dicas exclusivas de criadores que faturam 5 dígitos, oportunidades de parcerias e tendências do mercado.',
          placeholder: 'seu@email.com',
          buttonText: 'Quero monetizar'
        };
      default:
        return {
          title: '💡 Insights Semanais',
          subtitle: 'O melhor do marketing local e criação de conteúdo',
          description: 'Estratégias práticas, cases de sucesso e tendências que conectam empresas e criadores.',
          placeholder: 'seu@email.com',
          buttonText: 'Inscrever-se'
        };
    }
  };

  const content = getContent();

  if (variant === 'compact') {
    return (
      <div className={`bg-gray-50 rounded-xl p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <Mail className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-bold text-gray-900">
            {content.title}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm">
          {content.description}
        </p>
        
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={content.placeholder}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isSubmitting}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors text-sm"
          >
            {isSubmitting ? '...' : content.buttonText}
          </button>
        </form>
        
        {isSuccess && (
          <div className="mt-3 flex items-center text-green-600 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>Inscrição realizada com sucesso!</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={`bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold mb-3">
            {content.title}
          </h3>
          
          <h4 className="text-xl text-blue-100 mb-4">
            {content.subtitle}
          </h4>
          
          <p className="text-blue-100 mb-8 leading-relaxed">
            {content.description}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={content.placeholder}
              className="w-full px-6 py-4 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-900 text-lg"
              disabled={isSubmitting}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 disabled:bg-gray-300 transition-colors text-lg flex items-center justify-center"
            >
              {isSubmitting ? (
                'Inscrevendo...'
              ) : (
                <>
                  {content.buttonText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>
          
          {isSuccess && (
            <div className="mt-4 flex items-center justify-center text-green-200">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Bem-vindo(a) à nossa comunidade!</span>
            </div>
          )}
          
          <p className="text-xs text-blue-200 mt-4">
            Sem spam. Cancele quando quiser.
          </p>
        </div>
      </div>
    );
  }

  // Variant default
  return (
    <div className={`rounded-xl p-8 text-center ${className}`} style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-lg mx-auto">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {content.title}
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {content.description}
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={content.placeholder}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? 'Inscrevendo...' : content.buttonText}
          </button>
        </form>
        
        {isSuccess && (
          <div className="mt-4 flex items-center justify-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Inscrição realizada com sucesso!</span>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-3">
          Sem spam. Apenas conteúdo de qualidade.
        </p>
      </div>
    </div>
  );
};

export default NewsletterSignup;
