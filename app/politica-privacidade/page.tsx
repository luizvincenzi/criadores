'use client';

import React from 'react';

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-onest tracking-tight">
                <span className="text-gray-600 font-light">cr</span>
                <span className="text-black font-bold">IA</span>
                <span className="text-gray-600 font-light">dores</span>
              </span>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Política de Privacidade
            </h1>
            <p className="text-lg text-gray-600">
              Vigente a partir de 05 de setembro de 2025
            </p>
          </div>

          {/* Content Sections */}
          <div className="prose prose-lg max-w-none">
            
            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introdução</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Apresentamos nossa Política de Privacidade, que explica como coletamos, usamos, armazenamos, 
                protegemos e compartilhamos seus dados pessoais quando você acessa o site "criadores.app" ou 
                utiliza nossos serviços. Estamos em conformidade com a Lei Geral de Proteção de Dados 
                (LGPD – Lei nº 13.709/2018).
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Quem somos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                crIAdores — "crIAdores" ou "nós" — é uma plataforma especializada em conectar empresas locais 
                com criadores de conteúdo da região. Nosso compromisso é entregar serviço eficiente, seguro e 
                transparente, facilitando campanhas de marketing de influência autênticas e eficazes.
              </p>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Dados que coletamos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Dados fornecidos por você:</strong> nome, e-mail, telefone, informações da empresa, 
                redes sociais, dados de campanhas, número de identificação (RG/CPF), dados bancários para 
                pagamentos, documentos contratuais, etc.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Dados coletados automaticamente:</strong> endereço IP, tipo de navegador, dados de uso, 
                cookies e similares. Utilizamos cookies para melhorar a navegação, como em suas ferramentas de 
                escolha de aceitação ou recusa.
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Finalidades do tratamento e base legal</h2>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                <li><strong>Execução de serviço solicitado</strong> (conexão entre empresas e criadores) — base legal: consentimento e execução de contrato.</li>
                <li><strong>Cumprimento de obrigações legais</strong> — base legal: cumprimento de obrigação legal.</li>
                <li><strong>Melhorias e segurança do serviço</strong> (incluindo prevenção a fraudes) — base legal: legítimo interesse.</li>
                <li><strong>Envio de comunicações, ofertas ou atualizações</strong> — apenas com seu consentimento — base legal: consentimento.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Compartilhamento de dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Podemos compartilhar seus dados com:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                <li><strong>Parceiros e prestadores de serviços</strong> — somente com finalidade específica, conforme liberado por você (ex: criadores parceiros, empresas clientes)</li>
                <li><strong>Autoridades públicas</strong> — quando exigido por lei ou ordem judicial.</li>
                <li><strong>Outros agentes envolvidos</strong> no processo de campanhas de marketing, com seu consentimento ou conforme exigência contratual.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Armazenamento e segurança</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Adotamos medidas técnicas e administrativas adequadas para proteger seus dados contra acessos 
                não autorizados, vazamentos, destruição ou alteração. Podemos reter dados enquanto existirem 
                finalidades legítimas ou obrigações legais.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Direitos do titular dos dados (conforme LGPD)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Você tem o direito de solicitar, a qualquer momento:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                <li>Confirmação da existência de tratamento;</li>
                <li>Acesso aos seus dados pessoais;</li>
                <li>Correção de dados imprecisos;</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
                <li>Portabilidade dos dados;</li>
                <li>Revogação do consentimento;</li>
                <li>Oposição ao tratamento baseado em legítimo interesse;</li>
                <li>Revisão de decisões automatizadas.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Menores de 16 anos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Não coletamos dados pessoais de menores de 16 anos sem o consentimento expresso dos pais ou responsáveis.
              </p>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Opt-out e controle de comunicações</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Você pode recusar ou retirar seu consentimento para qualquer comunicação de marketing a qualquer 
                momento, enviando e‑mail para contato@criadores.app.
              </p>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Alterações nesta política</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Podemos atualizar esta Política de Privacidade periodicamente. Qualquer modificação será publicada 
                em nosso site com data de revisão. Recomendamos que você a revise regularmente.
              </p>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contato</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Se quiser exercer algum de seus direitos ou esclarecer dúvidas, entre em contato conosco através de:
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                <strong>E-mail:</strong> <a href="mailto:contato@criadores.app" className="text-blue-600 hover:text-blue-800 transition-colors">contato@criadores.app</a>
              </p>
            </section>

          </div>

          {/* CTA Button */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <button 
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Voltar ao Início
            </button>
          </div>

        </div>
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
