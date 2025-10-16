'use client';

import React, { useState, useEffect } from 'react';
import PMEsHeader from '../../empresas/components/PMEsHeader';
import PMEsFooter from '../../empresas/components/PMEsFooter';
import FormularioDiagnostico from '../../empresas/components/FormularioDiagnostico';

export default function RaioXDaMinhaEmpresaLPVersao3() {
  const [showForm, setShowForm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <PMEsHeader />

      {/* HERO SECTION - Versão 3: Clean & Professional */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2364B5F6' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10zm10 0c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-6">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Relatório Gratuito</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Diagnóstico Completo do
                <br />
                <span className="text-blue-600">Seu Marketing Digital</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Receba um relatório profissional de 360º graus sobre seu negócio + 1 hora de consultoria estratégica gratuita.
                Descubra exatamente o que funciona e o que precisa ser melhorado.
              </p>

              {/* Value Proposition Cards */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📊</span>
                    </div>
                    <h3 className="font-bold text-gray-900">Relatório Detalhado</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Análise completa de todos os canais de marketing</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xl">📞</span>
                    </div>
                    <h3 className="font-bold text-gray-900">Consultoria 1h</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Reunião estratégica personalizada</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Solicitar Meu Relatório Gratuito
                </button>

                <button
                  onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300"
                >
                  Como Funciona
                </button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Gratuito</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Entrega em 48h</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Confidencial</span>
                </div>
              </div>
            </div>

            {/* Right Side - Professional Visual */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-white">📈</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Seu Relatório Executivo</h3>
                  <p className="text-gray-600">Análise profissional e acionável</p>
                </div>

                {/* Report Preview */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Performance Digital</span>
                      <span className="text-sm text-green-600 font-bold">85/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Posicionamento</span>
                      <span className="text-sm text-yellow-600 font-bold">72/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Engajamento</span>
                      <span className="text-sm text-blue-600 font-bold">91/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">Relatório completo inclui:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Análise SWOT</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Benchmarking</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">ROI</span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg">
                GRÁTIS
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg">
                PROFISSIONAL
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - Versão 3: Step by Step */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Como Funciona o Processo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um processo simples e eficiente para você ter insights valiosos sobre seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Você Solicita</h3>
              <p className="text-gray-600">
                Preencha o formulário com informações básicas sobre seu negócio. Leva menos de 2 minutos.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nós Analisamos</h3>
              <p className="text-gray-600">
                Nossa equipe especializada analisa seu marketing usando metodologia própria e benchmarks do mercado.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Você Recebe</h3>
              <p className="text-gray-600">
                Relatório completo em PDF + agendamento da consultoria estratégica de 1 hora.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET - Versão 3: Detailed Breakdown */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100 text-blue-800 text-sm font-bold mb-8">
              RELATÓRIO COMPLETO
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              O Que Está Incluído
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um diagnóstico profissional completo com insights acionáveis
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Análise de Performance Digital</h3>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Métricas de alcance e engajamento</li>
                      <li>• Taxa de conversão por canal</li>
                      <li>• Análise de crescimento de seguidores</li>
                      <li>• ROI estimado das campanhas</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Posicionamento de Marca</h3>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Clareza da mensagem institucional</li>
                      <li>• Análise da percepção do público</li>
                      <li>• Diferenciais competitivos</li>
                      <li>• Consistência da marca</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Comunicação e Conteúdo</h3>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Qualidade do conteúdo produzido</li>
                      <li>• Tom de voz da marca</li>
                      <li>• Frequência de postagens</li>
                      <li>• Engajamento do público</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Plano de Ação Estratégico</h3>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Prioridades de curto prazo</li>
                      <li>• Estratégias de médio prazo</li>
                      <li>• Métricas de acompanhamento</li>
                      <li>• Cronograma de implementação</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bonus Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Bônus Especial</h3>
            <p className="text-xl mb-6 text-blue-100">
              Além do relatório completo, você recebe:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl mb-3">📞</div>
                <h4 className="text-lg font-bold mb-2">Consultoria 1h</h4>
                <p className="text-blue-100">Reunião estratégica personalizada</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl mb-3">📋</div>
                <h4 className="text-lg font-bold mb-2">Checklist Executivo</h4>
                <p className="text-blue-100">Passo a passo de implementação</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="text-lg font-bold mb-2">Dashboard de Métricas</h4>
                <p className="text-blue-100">Acompanhamento em tempo real</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* URGENCY COUNTDOWN - Versão 3: Professional Urgency */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Oferta por Tempo Limitado
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Esta análise gratuita está disponível apenas para os próximos empresários
            </p>

            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <div className="text-2xl font-mono font-bold text-blue-400 mb-2">
                {formatTime(timeLeft)}
              </div>
              <p className="text-gray-400 text-sm">até o fim da promoção</p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-12 py-6 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
            >
              GARANTIR MEU RELATÓRIO AGORA
            </button>

            <p className="text-gray-400 text-sm mt-4">
              ⚡ Entrega garantida em até 48 horas • 100% confidencial
            </p>
          </div>
        </div>
      </section>

      <PMEsFooter />

      {showForm && <FormularioDiagnostico />}
    </div>
  );
}