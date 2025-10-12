import React from 'react';
import Link from 'next/link';

interface CTAButtonProps {
  chatbot: 'empresas' | 'social-media' | 'mentoria' | 'criadores' | 'medicos' | 'advogados';
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export default function CTAButton({ 
  chatbot, 
  variant = 'primary',
  size = 'md',
  className = '',
  children = 'Falar Com Especialista Agora'
}: CTAButtonProps) {
  const chatbotUrls = {
    'empresas': '/chatcriadores-empresas',
    'social-media': '/chatcriadores-social-media',
    'mentoria': '/chatcriadores-mentoria',
    'criadores': '/chatcriadores-criadores',
    'medicos': '/chatcriadores-medicos',
    'advogados': '/chatcriadores-advogados'
  };

  const sizeClasses = {
    'sm': 'px-6 py-2 text-sm',
    'md': 'px-8 py-4 text-lg',
    'lg': 'px-12 py-5 text-xl'
  };

  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const sizeClass = sizeClasses[size];

  return (
    <Link
      href={chatbotUrls[chatbot]}
      className={`${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </Link>
  );
}

