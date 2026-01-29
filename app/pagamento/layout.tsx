'use client';

import React from 'react';

export default function PagamentoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <a href="/">
                <span className="text-2xl font-onest tracking-tight">
                  <span className="text-gray-600 font-light">cr</span>
                  <span className="text-black font-bold">IA</span>
                  <span className="text-gray-600 font-light">dores</span>
                </span>
              </a>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              ← Voltar ao Início
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            © 2024 crIAdores. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
