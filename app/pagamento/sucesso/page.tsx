'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

interface PaymentDetails {
  id: string;
  status: string;
  paymentStatus: string;
  amountTotal: number;
  customerEmail: string;
}

function SucessoContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);
      fetch(`https://criadores.digital/api/billing/payment-link?sessionId=${sessionId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch payment details');
          return res.json();
        })
        .then((data) => {
          setPaymentDetails(data);
          setError(null);
        })
        .catch(() => {
          setError('Não foi possível carregar os detalhes do pagamento');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [sessionId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
      {/* Success Icon */}
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Pagamento Confirmado!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Seu pagamento foi processado com sucesso. Você receberá um e-mail de confirmação em breve.
        </p>
      </div>

      {/* Payment Details */}
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Carregando detalhes...</span>
        </div>
      )}

      {!isLoading && paymentDetails && !error && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Pagamento</h2>
          <div className="space-y-3">
            {paymentDetails.amountTotal && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor pago:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(paymentDetails.amountTotal)}
                </span>
              </div>
            )}
            {paymentDetails.customerEmail && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">E-mail de confirmação:</span>
                <span className="text-gray-900 font-medium">
                  {paymentDetails.customerEmail}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="text-center">
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Carregando...</span>
          </div>
        </div>
      }
    >
      <SucessoContent />
    </Suspense>
  );
}
