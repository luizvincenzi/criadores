'use client';

import React from 'react';
import { XCircle, RefreshCw, MessageCircle } from 'lucide-react';

export default function CanceladoPage() {
  const handleTryAgain = () => {
    window.history.back();
  };

  const whatsappMessage = encodeURIComponent('Olá! Tive um problema com meu pagamento.');
  const whatsappUrl = `https://wa.me/554391936400?text=${whatsappMessage}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
      {/* Cancel Icon */}
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Pagamento Cancelado
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Seu pagamento não foi concluído.
        </p>
        <p className="text-base text-gray-500 mb-8">
          Não se preocupe, nenhum valor foi cobrado do seu cartão.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 max-w-md mx-auto">
        <button
          onClick={handleTryAgain}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full font-medium text-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="w-5 h-5" />
          Tentar Novamente
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-full font-medium text-lg transition-all duration-200 hover:shadow-lg"
        >
          <MessageCircle className="w-5 h-5" />
          Falar no WhatsApp
        </a>
      </div>

      {/* Support Text */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Precisa de ajuda? Entre em contato pelo WhatsApp:{' '}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            (43) 9193-6400
          </a>
        </p>
      </div>

      {/* Back to Home */}
      <div className="mt-8 text-center border-t border-gray-200 pt-8">
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          ← Voltar ao Início
        </button>
      </div>
    </div>
  );
}
