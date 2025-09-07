'use client';

import React from 'react';
import { FileText, TrendingUp, Target, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';

interface PostSummaryProps {
  content: string;
  audience_target: 'EMPRESAS' | 'CRIADORES' | 'AMBOS';
  tags?: string[];
}

const PostSummary: React.FC<PostSummaryProps> = ({ content, audience_target, tags = [] }) => {
  // Função para extrair pontos principais do conteúdo
  const extractKeyPoints = (content: string): string[] => {
    // Remover aspas duplas se o conteúdo estiver entre aspas
    const cleanContent = content.replace(/^"|"$/g, '');
    
    // Dividir por parágrafos e filtrar linhas vazias
    const paragraphs = cleanContent.split('\n').filter(p => p.trim().length > 0);
    
    // Extrair pontos principais (primeiros 3-6 parágrafos mais relevantes)
    const keyPoints: string[] = [];
    
    paragraphs.forEach(paragraph => {
      const trimmed = paragraph.trim();
      
      // Priorizar parágrafos que contêm números, percentuais ou palavras-chave
      if (trimmed.length > 30 && (
        /\d+%/.test(trimmed) || // Contém percentual
        /R\$\s*\d+/.test(trimmed) || // Contém valor monetário
        /\d+x/.test(trimmed) || // Contém multiplicador
        /aumento|crescimento|resultado|estratégia|implementar/i.test(trimmed) // Palavras-chave
      )) {
        keyPoints.push(trimmed);
      }
    });
    
    // Se não encontrou pontos específicos, pegar os primeiros parágrafos
    if (keyPoints.length === 0) {
      keyPoints.push(...paragraphs.slice(0, 4));
    }
    
    // Limitar a 6 pontos e truncar se muito longos
    return keyPoints.slice(0, 6).map(point => 
      point.length > 120 ? point.substring(0, 120) + '...' : point
    );
  };

  // Função para escolher ícone baseado no conteúdo
  const getIconForPoint = (point: string, index: number): React.ReactNode => {
    const icons = [
      <TrendingUp className="w-4 h-4" />,
      <Target className="w-4 h-4" />,
      <Lightbulb className="w-4 h-4" />,
      <CheckCircle className="w-4 h-4" />,
      <FileText className="w-4 h-4" />,
      <ArrowRight className="w-4 h-4" />
    ];
    
    // Escolher ícone baseado no conteúdo
    if (/\d+%|aumento|crescimento/i.test(point)) return <TrendingUp className="w-4 h-4" />;
    if (/estratégia|implementar|aplicar/i.test(point)) return <Target className="w-4 h-4" />;
    if (/dica|insight|descobrir/i.test(point)) return <Lightbulb className="w-4 h-4" />;
    if (/resultado|sucesso|conseguir/i.test(point)) return <CheckCircle className="w-4 h-4" />;
    
    return icons[index % icons.length];
  };

  // Função para obter cor baseada na audiência
  const getAudienceColor = () => {
    switch (audience_target) {
      case 'EMPRESAS':
        return 'border-blue-200 bg-blue-50';
      case 'CRIADORES':
        return 'border-purple-200 bg-purple-50';
      case 'AMBOS':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const keyPoints = extractKeyPoints(content);

  if (keyPoints.length === 0) return null;

  return (
    <div className={`rounded-xl border-2 p-6 mb-8 ${getAudienceColor()}`}>
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
          <span className="text-sm font-bold text-gray-900">📋</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
          Na Edição de Hoje
        </h3>
      </div>
      
      <ul className="space-y-3">
        {keyPoints.map((point, index) => (
          <li key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5 border border-gray-200">
              <div className="text-gray-600">
                {getIconForPoint(point, index)}
              </div>
            </div>
            <span className="text-gray-700 leading-relaxed text-sm">
              {point}
            </span>
          </li>
        ))}
      </ul>
      
      {tags && tags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostSummary;
