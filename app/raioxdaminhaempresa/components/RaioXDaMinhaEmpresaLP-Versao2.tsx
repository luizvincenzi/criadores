'use client';

import React, { useState } from 'react';
import PMEsHeader from '../../empresas/components/PMEsHeader';
import PMEsFooter from '../../empresas/components/PMEsFooter';
import FormularioDiagnostico from '../../empresas/components/FormularioDiagnostico';

export default function RaioXDaMinhaEmpresaLPVersao2() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <PMEsHeader />

      {/* HERO SECTION - Versão 2: Mais Dramática */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-red-600 via-red-700 to-red-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-white">
              {/* Urgency Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-8">
                <div className="w-3 h-3 bg-red-300 rounded-full animate-pulse" />
                <span className="text-sm font-semibold uppercase tracking-wider">Relatório Gratuito Limitado</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-none">
                SEU MARKETING
                <br />
                <span className="text-yellow-300">ESTÁ FALHANDO</span>
                <br />
                E VOCÊ NEM SABE
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-red-100 mb-8 leading-relaxed font-medium">
                Descubra em 48 horas exatamente o que está sabotando seu crescimento e como dobrar seus resultados com marketing inteligente.
              </p>

              {/* Value Proposition */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Diagnóstico Completo + Consultoria 1h</h3>
                    <p className="text-red-100">Valor real: R$ 2.500</p>
                  </div>
                </div>
                <p className="text-yellow-200 font-semibold">Hoje você recebe isso de GRAÇA</p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="group bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xl px-8 py-5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-yellow-400/25"
                >
                  QUERO MEU RELATÓRIO AGORA
                  <span className="block text-sm font-bold opacity-80">Antes que acabe a promoção</span>
                </button>

                <button
                  onClick={() => document.getElementById('problemas')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-white/30 text-white hover:bg-white/10 font-bold text-lg px-8 py-5 rounded-xl transition-all duration-300 backdrop-blur-sm"
                >
                  Ver Como Funciona
                </button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-6 text-red-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">100% Confidencial</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Entrega em 48h</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Sem compromisso</span>
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="relative">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-4xl text-white">📊</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Seu Relatório Personalizado</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-gray-700">Análise completa do seu negócio</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-gray-700">Pontos fortes e fracos identificados</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-gray-700">Plano de ação executável</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-gray-700">1h de consultoria estratégica</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl shadow-lg animate-bounce">
                GRÁTIS
              </div>
              <div className="absolute -bottom-4 -left-4 bg-red-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg">
                48H
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMAS SECTION - Versão 2: Mais Impactante */}
      <section id="problemas" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              POR QUE A MAIORIA DOS NEGÓCIOS
              <br />
              <span className="text-red-400">FALHAM NO MARKETING</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Você não é o único. 90% dos empresários investem dinheiro em marketing sem saber se está funcionando.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-8 text-white border border-red-700">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-xl font-bold mb-3">Gastam Sem Resultados</h3>
              <p className="text-red-100">Investem milhares em anúncios sem saber se convertem em vendas reais.</p>
            </div>

            <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-8 text-white border border-red-700">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-bold mb-3">Não Sabem Sua Marca</h3>
              <p className="text-red-100">Não sabem quem são seus clientes ideais nem como se posicionar.</p>
            </div>

            <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-8 text-white border border-red-700">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3">Redes Sociais Ineficientes</h3>
              <p className="text-red-100">Postam sem estratégia, sem engajamento, sem conversão.</p>
            </div>

            <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-8 text-white border border-red-700">
              <div className="text-6xl mb-4">🤷‍♂️</div>
              <h3 className="text-xl font-bold mb-3">Não Medem Resultados</h3>
              <p className="text-red-100">Não sabem se o marketing está trazendo retorno sobre investimento.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-yellow-400 text-black font-black text-2xl px-8 py-4 rounded-xl inline-block">
              MAS ISSO ACABA HOJE!
            </div>
          </div>
        </div>
      </section>

      {/* SOLUÇÃO SECTION - Versão 2: Foco no Valor */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-red-100 text-red-800 text-sm font-bold mb-8">
              SUA SOLUÇÃO DEFINITIVA
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              RELATÓRIO 360º DE MARKETING
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um diagnóstico completo que revela exatamente o que está funcionando e o que precisa ser corrigido no seu marketing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">O Que Você Recebe:</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Análise de Performance Digital</h4>
                    <p className="text-gray-600">Alcançe, engajamento, seguidores e conversões medidas com precisão.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Posicionamento de Marca</h4>
                    <p className="text-gray-600">Clareza da mensagem e diferenciais frente à concorrência.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Comunicação e Conteúdo</h4>
                    <p className="text-gray-600">Avaliação do impacto e tom das suas postagens e comunicações.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Plano de Ação Estratégico</h4>
                    <p className="text-gray-600">Próximos passos práticos para aumentar resultados imediatamente.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bônus Especial</h3>
                <p className="text-gray-600">Além do relatório completo</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📞</span>
                    <div>
                      <h4 className="font-bold text-gray-900">1 Hora de Consultoria</h4>
                      <p className="text-sm text-gray-600">Call estratégica personalizada</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h4 className="font-bold text-gray-900">Checklist de Implementação</h4>
                      <p className="text-sm text-gray-600">Passo a passo executável</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h4 className="font-bold text-gray-900">Dashboard de Acompanhamento</h4>
                      <p className="text-sm text-gray-600">Métricas em tempo real</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-2xl px-12 py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              GARANTIR MEU RELATÓRIO AGORA
            </button>
            <p className="text-gray-500 mt-4">Vagas limitadas • Processo confidencial</p>
          </div>
        </div>
      </section>

      {/* AUTORIDADE SECTION - Versão 2: Mais Credível */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            FEITO POR QUEM ENTENDE
            <br />
            <span className="text-red-400">DO MERCADO LOCAL</span>
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto">
            A crIAdores ajuda negócios locais a crescerem com marketing inteligente, usando dados, IA e criatividade humana.
            Conhecemos a realidade dos pequenos e médios empresários brasileiros.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-3">Foco Local</h3>
              <p className="text-gray-300">Especialistas em marketing para negócios locais brasileiros.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold text-white mb-3">Tecnologia + Criatividade</h3>
              <p className="text-gray-300">Usamos IA e dados para potencializar resultados criativos.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-2xl font-bold text-white mb-3">Resultados Comprovados</h3>
              <p className="text-gray-300">Ajudamos empresas a dobrarem seus resultados com marketing inteligente.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-3xl p-8 text-white">
            <h3 className="text-3xl font-black mb-4">Por Que Confiar na crIAdores?</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Especialistas em marketing digital há 3+ anos</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Conhecimento profundo do mercado brasileiro</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Metodologia própria testada e aprovada</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Compromisso com resultados mensuráveis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL - Versão 2: Urgência Máxima */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-red-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              ÚLTIMA CHANCE!
            </h2>
            <p className="text-xl text-red-100 mb-6">
              Estamos liberando apenas 10 relatórios gratuitos este mês.
            </p>
            <div className="text-6xl font-black text-yellow-400 mb-4">7 RESTANTES</div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-3xl px-16 py-8 rounded-3xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-yellow-400/50 mb-6"
          >
            GARANTIR MINHA VAGA AGORA
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Relatório entregue em 48h</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% confidencial</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Sem compromisso</span>
            </div>
          </div>
        </div>
      </section>

      <PMEsFooter />

      {showForm && <FormularioDiagnostico />}
    </div>
  );
}