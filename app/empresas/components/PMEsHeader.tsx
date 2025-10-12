'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PMEsHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md fixed w-full top-0 z-50 border-b border-outline-variant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-onest tracking-tight">
              <span className="text-gray-600 font-light">cr</span>
              <span className="text-primary font-bold">IA</span>
              <span className="text-gray-600 font-light">dores</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#solucao" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              Solução
            </a>
            <a href="#beneficios" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              Benefícios
            </a>
            <a href="#como-funciona" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              Como Funciona
            </a>
            <a href="#depoimentos" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              Casos de Sucesso
            </a>
            <a href="#faq" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              FAQ
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="px-5 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/login" 
              className="btn-primary"
            >
              Criar Conta Grátis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-outline-variant">
            <nav className="flex flex-col space-y-4">
              <a href="#solucao" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                Solução
              </a>
              <a href="#beneficios" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                Benefícios
              </a>
              <a href="#como-funciona" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                Como Funciona
              </a>
              <a href="#depoimentos" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                Casos de Sucesso
              </a>
              <a href="#faq" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                FAQ
              </a>
              <div className="pt-4 flex flex-col space-y-3">
                <Link 
                  href="/login" 
                  className="text-center px-5 py-2 text-sm font-medium text-primary border border-primary rounded-full hover:bg-primary-container transition-colors"
                >
                  Entrar
                </Link>
                <Link 
                  href="/login" 
                  className="btn-primary text-center"
                >
                  Criar Conta Grátis
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

