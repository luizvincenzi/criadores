'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function PortalLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-surface to-secondary/5">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-sm border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-on-primary font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-on-surface">crIAdores</h1>
            </div>
            <Link href="/portal-login">
              <Button variant="primary" size="md">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-on-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-on-surface mb-6">
              Portal <span className="text-primary">crIAdores</span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-3xl mx-auto mb-8">
              Acompanhe suas campanhas, métricas e performance em tempo real. 
              Uma plataforma moderna para empresas e criadores de conteúdo.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/portal/login">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Acessar Portal
              </Button>
            </Link>
            <Button variant="outlined" size="lg" className="w-full sm:w-auto">
              Saiba Mais
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant">
              <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-on-surface mb-2">Dashboard Inteligente</h3>
              <p className="text-on-surface-variant">
                Visualize métricas em tempo real, acompanhe o progresso das campanhas e tome decisões baseadas em dados.
              </p>
            </div>

            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant">
              <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-on-surface mb-2">Gestão de Campanhas</h3>
              <p className="text-on-surface-variant">
                Acompanhe todas as suas campanhas ativas, cronogramas de entrega e colaborações com criadores.
              </p>
            </div>

            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant">
              <div className="w-12 h-12 bg-tertiary-container rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-on-surface mb-2">Sistema de Tarefas</h3>
              <p className="text-on-surface-variant">
                Organize suas tarefas, defina prioridades e mantenha-se sempre atualizado com o progresso dos projetos.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline-variant mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-on-surface-variant">
              © 2025 crIAdores. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
