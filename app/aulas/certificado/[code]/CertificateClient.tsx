'use client';

import React from 'react';

interface Certificate {
  id: string;
  certificate_code: string;
  user_full_name: string;
  user_email: string | null;
  track_title: string;
  total_lessons: number;
  total_duration_seconds: number;
  issued_at: string;
}

interface Props {
  certificate: Certificate;
}

export function CertificateClient({ certificate }: Props) {
  const handlePrint = () => {
    window.print();
  };

  const issuedDate = new Date(certificate.issued_at).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalHours = Math.floor(certificate.total_duration_seconds / 3600);
  const totalMinutes = Math.floor((certificate.total_duration_seconds % 3600) / 60);
  const durationLabel =
    totalHours > 0
      ? `${totalHours}h${totalMinutes > 0 ? ` ${totalMinutes}min` : ''}`
      : `${totalMinutes} minutos`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
      {/* Print button — hidden on print */}
      <div className="mb-4 print:hidden flex items-center gap-3">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect width="12" height="8" x="6" y="14" />
          </svg>
          Imprimir / Salvar em PDF
        </button>
        <a
          href="/aulas"
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200"
        >
          ← Voltar
        </a>
      </div>

      {/* Certificate */}
      <div
        className="relative bg-white shadow-2xl print:shadow-none w-full max-w-4xl aspect-[1.414/1] print:aspect-auto overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.04) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(0, 122, 255, 0.04) 0%, transparent 50%)'
        }}
      >
        {/* Decorative border */}
        <div className="absolute inset-6 border-2 border-gray-200 rounded-sm pointer-events-none" />
        <div className="absolute inset-8 border border-gray-100 rounded-sm pointer-events-none" />

        {/* Corner flourishes */}
        <div className="absolute top-10 left-10 w-16 h-16 border-l-2 border-t-2 border-green-500/30" />
        <div className="absolute top-10 right-10 w-16 h-16 border-r-2 border-t-2 border-green-500/30" />
        <div className="absolute bottom-10 left-10 w-16 h-16 border-l-2 border-b-2 border-green-500/30" />
        <div className="absolute bottom-10 right-10 w-16 h-16 border-r-2 border-b-2 border-green-500/30" />

        <div className="relative h-full flex flex-col items-center justify-center px-12 py-16 text-center">
          {/* Logo crIAdores */}
          <div className="mb-6">
            <div className="text-3xl font-onest tracking-tight">
              <span className="text-gray-600 font-light">cr</span>
              <span className="text-black font-bold">IA</span>
              <span className="text-gray-600 font-light">dores</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-0.5">
              Academy
            </div>
          </div>

          {/* Title */}
          <div className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-2">
            Certificado de Conclusão
          </div>

          <div className="w-20 h-px bg-green-500 mb-8" />

          {/* Body */}
          <p className="text-[13px] text-gray-600 mb-3">
            Certificamos que
          </p>

          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-3 font-serif">
            {certificate.user_full_name}
          </h1>

          <p className="text-[13px] text-gray-600 max-w-xl leading-relaxed mb-2">
            concluiu com aproveitamento a trilha
          </p>

          <p className="text-xl font-semibold text-gray-900 mb-5">
            {certificate.track_title}
          </p>

          <p className="text-[12px] text-gray-500 max-w-xl leading-relaxed">
            composta por <span className="font-semibold text-gray-700">{certificate.total_lessons}</span> aulas
            {certificate.total_duration_seconds > 0 && (
              <>
                {' '}totalizando{' '}
                <span className="font-semibold text-gray-700">{durationLabel}</span>{' '}
                de conteúdo
              </>
            )}
            .
          </p>

          {/* Footer */}
          <div className="mt-10 flex items-end justify-between w-full max-w-2xl">
            <div className="text-center flex-1">
              <div className="w-40 h-px bg-gray-300 mx-auto mb-1" />
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                Emitido em
              </div>
              <div className="text-[12px] font-semibold text-gray-900 mt-0.5">
                {issuedDate}
              </div>
            </div>

            <div className="text-center flex-1">
              <div className="w-40 h-px bg-gray-300 mx-auto mb-1" />
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                Código de verificação
              </div>
              <div className="text-[12px] font-mono font-semibold text-gray-900 mt-0.5">
                {certificate.certificate_code}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print CSS tweaks */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
