export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Informações que Coletamos</h2>
              <p className="text-gray-700 mb-4">
                A Criadores coleta as seguintes informações quando você usa nossa plataforma:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Informações de perfil do Instagram (nome de usuário, tipo de conta)</li>
                <li>Dados de posts públicos do Instagram (imagens, vídeos, legendas, métricas)</li>
                <li>Métricas de engajamento (curtidas, comentários, compartilhamentos, alcance)</li>
                <li>Informações de campanhas e colaborações</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Como Usamos suas Informações</h2>
              <p className="text-gray-700 mb-4">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Fornecer relatórios de performance de campanhas</li>
                <li>Calcular métricas de ROI e engajamento</li>
                <li>Facilitar a comunicação entre empresas e criadores</li>
                <li>Melhorar nossos serviços e funcionalidades</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Compartilhamento de Informações</h2>
              <p className="text-gray-700 mb-4">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Com empresas parceiras para fins de campanhas autorizadas</li>
                <li>Quando exigido por lei ou processo legal</li>
                <li>Para proteger nossos direitos e segurança</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Integração com Instagram</h2>
              <p className="text-gray-700 mb-4">
                Nossa integração com o Instagram:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Acessa apenas dados públicos e autorizados</li>
                <li>Requer sua autorização explícita</li>
                <li>Pode ser revogada a qualquer momento</li>
                <li>Segue as diretrizes da Meta/Facebook</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Seus Direitos</h2>
              <p className="text-gray-700 mb-4">
                Você tem o direito de:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar exclusão de seus dados</li>
                <li>Revogar autorização do Instagram</li>
                <li>Portabilidade de dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Segurança</h2>
              <p className="text-gray-700 mb-4">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações,
                incluindo criptografia, controle de acesso e monitoramento contínuo.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contato</h2>
              <p className="text-gray-700 mb-4">
                Para questões sobre privacidade, entre em contato:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Email: privacy@criadores.app</li>
                <li>Telefone: (11) 99999-9999</li>
                <li>Endereço: São Paulo, SP, Brasil</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Alterações</h2>
              <p className="text-gray-700 mb-4">
                Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas
                através da plataforma ou por email.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
