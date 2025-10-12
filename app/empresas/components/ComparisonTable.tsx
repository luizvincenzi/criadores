import React from 'react';

export default function ComparisonTable() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-tertiary-container text-tertiary text-sm font-semibold mb-6">
            Compare e Economize
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
            Por Que o Combo Completo é a Melhor Escolha?
          </h2>
          
          <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
            Quando você integra estratégia, execução e visibilidade, os resultados se multiplicam.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full card-elevated overflow-hidden">
            <thead>
              <tr className="bg-surface-container">
                <th className="px-6 py-4 text-left text-sm font-semibold text-on-surface">
                  Solução
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-on-surface">
                  Individual
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-on-surface bg-primary-container">
                  <div className="flex items-center justify-center gap-2">
                    <span>Combo Completo</span>
                    <span className="px-2 py-1 bg-primary text-on-primary text-xs rounded-full">
                      Recomendado
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {/* Mentoria */}
              <tr>
                <td className="px-6 py-4">
                  <div className="font-semibold text-on-surface">🧠 Mentoria Estratégica</div>
                  <div className="text-sm text-on-surface-variant">Encontros semanais + canal exclusivo</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-lg font-bold text-on-surface">R$ 2.500</div>
                  <div className="text-sm text-on-surface-variant">/mês</div>
                </td>
                <td className="px-6 py-4 text-center bg-primary-container/30">
                  <div className="text-lg font-bold text-primary">Incluso</div>
                </td>
              </tr>

              {/* Social Media */}
              <tr>
                <td className="px-6 py-4">
                  <div className="font-semibold text-on-surface">👩‍💼 Estrategista + Social Media</div>
                  <div className="text-sm text-on-surface-variant">2 Reels/semana + stories diários</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-lg font-bold text-on-surface">R$ 2.800</div>
                  <div className="text-sm text-on-surface-variant">/mês</div>
                </td>
                <td className="px-6 py-4 text-center bg-primary-container/30">
                  <div className="text-lg font-bold text-primary">Incluso</div>
                </td>
              </tr>

              {/* Criadores */}
              <tr>
                <td className="px-6 py-4">
                  <div className="font-semibold text-on-surface">🤝 Criadores Locais</div>
                  <div className="text-sm text-on-surface-variant">4 microinfluenciadores/mês</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-lg font-bold text-on-surface">R$ 2.300</div>
                  <div className="text-sm text-on-surface-variant">/mês</div>
                </td>
                <td className="px-6 py-4 text-center bg-primary-container/30">
                  <div className="text-lg font-bold text-primary">Incluso</div>
                </td>
              </tr>

              {/* Bônus Exclusivos */}
              <tr>
                <td className="px-6 py-4">
                  <div className="font-semibold text-on-surface">🎁 Bônus Exclusivos</div>
                  <div className="text-sm text-on-surface-variant">Reunião unificada + relatório consolidado</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-on-surface-variant">—</div>
                </td>
                <td className="px-6 py-4 text-center bg-primary-container/30">
                  <div className="text-lg font-bold text-secondary">Grátis</div>
                </td>
              </tr>

              {/* Total */}
              <tr className="bg-surface-container font-bold">
                <td className="px-6 py-4 text-on-surface">
                  Total Mensal
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-2xl text-on-surface">R$ 7.600</div>
                  <div className="text-sm text-on-surface-variant font-normal">/mês</div>
                </td>
                <td className="px-6 py-4 text-center bg-primary-container">
                  <div className="text-3xl text-primary">R$ 5.900</div>
                  <div className="text-sm text-secondary font-semibold">Economize R$ 1.700/mês</div>
                  <div className="text-xs text-on-surface-variant font-normal mt-1">
                    ou R$ 3.900/mês no semestral
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-6">
          {/* Individual */}
          <div className="card-elevated p-6">
            <h3 className="text-xl font-bold text-on-surface mb-4 text-center">
              Planos Individuais
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
                <div>
                  <div className="font-semibold text-on-surface">🧠 Mentoria</div>
                  <div className="text-xs text-on-surface-variant">Estratégica</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-on-surface">R$ 2.500</div>
                  <div className="text-xs text-on-surface-variant">/mês</div>
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
                <div>
                  <div className="font-semibold text-on-surface">👩‍💼 Social Media</div>
                  <div className="text-xs text-on-surface-variant">Estrategista dedicado</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-on-surface">R$ 2.800</div>
                  <div className="text-xs text-on-surface-variant">/mês</div>
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
                <div>
                  <div className="font-semibold text-on-surface">🤝 Criadores</div>
                  <div className="text-xs text-on-surface-variant">4 influenciadores/mês</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-on-surface">R$ 2.300</div>
                  <div className="text-xs text-on-surface-variant">/mês</div>
                </div>
              </div>

              <div className="pt-3 text-center">
                <div className="text-2xl font-bold text-on-surface">R$ 7.600</div>
                <div className="text-sm text-on-surface-variant">Total mensal</div>
              </div>
            </div>
          </div>

          {/* Combo */}
          <div className="card-elevated p-6 bg-gradient-to-br from-primary-container/30 to-secondary-container/30 border-2 border-primary">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-on-surface text-center">
                Combo Completo
              </h3>
              <span className="px-2 py-1 bg-primary text-on-primary text-xs rounded-full">
                Recomendado
              </span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-on-surface">Mentoria Estratégica</span>
              </div>
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-on-surface">Estrategista + Social Media</span>
              </div>
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-on-surface">Criadores Locais</span>
              </div>
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 text-secondary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-on-surface font-semibold">+ Bônus Exclusivos</span>
              </div>
            </div>

            <div className="text-center pt-4 border-t-2 border-primary">
              <div className="text-3xl font-bold text-primary mb-1">R$ 5.900</div>
              <div className="text-sm text-secondary font-semibold mb-2">
                Economize R$ 1.700/mês (22%)
              </div>
              <div className="text-xs text-on-surface-variant">
                ou R$ 3.900/mês no plano semestral
              </div>
            </div>
          </div>
        </div>

        {/* Benefícios Exclusivos do Combo */}
        <div className="mt-12 card-elevated p-8">
          <h3 className="text-2xl font-bold text-on-surface mb-6 text-center">
            Benefícios Exclusivos do Combo Completo
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-on-surface mb-2">Estratégia Integrada</h4>
              <p className="text-sm text-on-surface-variant">
                Tudo alinhado: mentoria, conteúdo e criadores trabalhando juntos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-on-surface mb-2">Economize Tempo</h4>
              <p className="text-sm text-on-surface-variant">
                Uma reunião semanal unificada ao invés de 3 separadas
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-on-surface mb-2">Relatório Consolidado</h4>
              <p className="text-sm text-on-surface-variant">
                Veja todos os resultados em um único dashboard mensal
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

