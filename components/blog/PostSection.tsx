'use client';

import React from 'react';

interface PostSectionProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlighted' | 'conclusion';
  className?: string;
}

const PostSection: React.FC<PostSectionProps> = ({ 
  title, 
  content, 
  icon, 
  variant = 'default',
  className = '' 
}) => {
  // Função para processar conteúdo e destacar termos importantes
  const processContent = (text: string) => {
    // Remover aspas duplas se o conteúdo estiver entre aspas
    const cleanText = text.replace(/^"|"$/g, '');
    
    // Dividir em parágrafos
    const paragraphs = cleanText.split('\n').filter(p => p.trim().length > 0);
    
    return paragraphs.map((paragraph, index) => {
      // Destacar números importantes (percentuais, valores monetários, etc.)
      let processedParagraph = paragraph
        .replace(/(\d+%)/g, '<span class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-semibold">$1</span>')
        .replace(/(R\$\s*[\d.,]+)/g, '<span class="bg-green-100 text-green-800 px-1 py-0.5 rounded font-semibold">$1</span>')
        .replace(/(\d+x)/g, '<span class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-semibold">$1</span>');

      // Destacar palavras-chave importantes
      const keywords = [
        'aumento', 'crescimento', 'resultado', 'sucesso', 'estratégia',
        'implementar', 'automatização', 'otimização', 'conversão'
      ];

      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
        processedParagraph = processedParagraph.replace(
          regex,
          '<span class="bg-blue-50 text-blue-900 px-1 rounded font-medium">$1</span>'
        );
      });
      
      return (
        <p
          key={index}
          className="mb-6 leading-relaxed text-lg"
          dangerouslySetInnerHTML={{ __html: processedParagraph }}
        />
      );
    });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'highlighted':
        return 'bg-white pl-6 py-6';
      case 'conclusion':
        return 'bg-white pl-6 py-6';
      default:
        return 'bg-white';
    }
  };

  return (
    <section className={`mb-12 ${getVariantStyles()} ${className}`}>
      {/* Header da Seção */}
      <div className="flex items-center mb-6">
        {icon && (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
            <div className="text-gray-600">
              {icon}
            </div>
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-2">
            {title}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
        </div>
      </div>
      
      {/* Conteúdo da Seção */}
      <div className="prose prose-xl max-w-none text-gray-800 leading-relaxed">
        {processContent(content)}
      </div>
    </section>
  );
};

export default PostSection;
