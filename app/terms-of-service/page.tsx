export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Serviço</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 mb-4">
                Ao acessar e usar a plataforma Criadores, você concorda com estes Termos de Serviço.
                Se você não concorda com qualquer parte destes termos, não deve usar nossos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
              <p className="text-gray-700 mb-4">
                A Criadores é uma plataforma que conecta empresas e criadores de conteúdo, oferecendo:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Gestão de campanhas de marketing de influência</li>
                <li>Relatórios de performance e métricas</li>
                <li>Integração com redes sociais (Instagram)</li>
                <li>Ferramentas de comunicação e colaboração</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Elegibilidade</h2>
              <p className="text-gray-700 mb-4">
                Para usar nossos serviços, você deve:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Ter pelo menos 18 anos de idade</li>
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Ter autoridade para representar sua empresa (se aplicável)</li>
                <li>Cumprir com todas as leis aplicáveis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Contas de Usuário</h2>
              <p className="text-gray-700 mb-4">
                Você é responsável por:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Manter a segurança de sua conta</li>
                <li>Todas as atividades realizadas em sua conta</li>
                <li>Notificar-nos sobre uso não autorizado</li>
                <li>Fornecer informações precisas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Integração com Instagram</h2>
              <p className="text-gray-700 mb-4">
                Ao conectar sua conta do Instagram:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Você autoriza o acesso aos dados especificados</li>
                <li>Deve cumprir os termos do Instagram/Meta</li>
                <li>Pode revogar a autorização a qualquer momento</li>
                <li>É responsável pelo conteúdo compartilhado</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Uso Aceitável</h2>
              <p className="text-gray-700 mb-4">
                Você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Usar a plataforma para atividades ilegais</li>
                <li>Violar direitos de propriedade intelectual</li>
                <li>Enviar spam ou conteúdo malicioso</li>
                <li>Tentar acessar sistemas não autorizados</li>
                <li>Interferir no funcionamento da plataforma</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Propriedade Intelectual</h2>
              <p className="text-gray-700 mb-4">
                A plataforma Criadores e seu conteúdo são protegidos por direitos autorais e outras leis.
                Você mantém os direitos sobre seu conteúdo, mas nos concede licença para usar conforme necessário
                para fornecer nossos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Pagamentos e Taxas</h2>
              <p className="text-gray-700 mb-4">
                Alguns serviços podem estar sujeitos a taxas. Você concorda em:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Pagar todas as taxas aplicáveis</li>
                <li>Fornecer informações de pagamento precisas</li>
                <li>Cumprir com os termos de pagamento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitação de Responsabilidade</h2>
              <p className="text-gray-700 mb-4">
                A Criadores não será responsável por danos indiretos, incidentais ou consequenciais
                decorrentes do uso da plataforma, exceto conforme exigido por lei.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Rescisão</h2>
              <p className="text-gray-700 mb-4">
                Podemos suspender ou encerrar sua conta por violação destes termos.
                Você pode encerrar sua conta a qualquer momento através das configurações da plataforma.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-gray-900 mb-4">11. Alterações</h2>
              <p className="text-gray-700 mb-4">
                Reservamos o direito de modificar estes termos. Mudanças significativas serão comunicadas
                com antecedência através da plataforma ou por email.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contato</h2>
              <p className="text-gray-700 mb-4">
                Para questões sobre estes termos:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Email: legal@criadores.app</li>
                <li>Telefone: (11) 99999-9999</li>
                <li>Endereço: São Paulo, SP, Brasil</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
