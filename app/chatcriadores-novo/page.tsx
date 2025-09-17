'use client';

import ChatbotHomepage from '@/components/chatbot/ChatbotHomepage';

export default function CriavozNovoPage() {
  const handleComplete = (userData: any) => {
    console.log('Criavoz novo concluído com dados:', userData);
  };

  // Steps customizados para empresas (sem pergunta de tipo de usuário)
  const empresaSteps = [
    {
      id: 'welcome',
      message: 'Olá! 👋 Seja bem-vindo(a) à crIAdores! Sou a IA da crIAdores e estou aqui para te ajudar a descobrir como podemos potencializar seu negócio.',
      type: 'bot',
      nextStep: 'intro'
    },
    {
      id: 'intro',
      message: 'Para começar, preciso de algumas informações básicas.',
      type: 'bot',
      nextStep: 'name'
    },
    {
      id: 'name',
      message: '**Qual é o seu nome?**',
      type: 'input',
      field: 'name',
      validation: (value: string) => value.length >= 2,
      errorMessage: 'Por favor, digite um nome válido.',
      nextStep: 'businessName'
    },
    {
      id: 'businessName',
      message: 'Perfeito! Qual é o nome da sua empresa?',
      type: 'input',
      field: 'businessName',
      validation: (value: string) => value.length >= 2,
      errorMessage: 'Por favor, digite o nome da empresa.',
      nextStep: 'businessSegment'
    },
    {
      id: 'businessSegment',
      message: 'Em qual segmento sua empresa atua?',
      type: 'options',
      field: 'businessSegment',
      options: [
        { text: '🍕 Alimentação/Restaurantes', value: 'alimentacao' },
        { text: '👗 Moda/Beleza', value: 'moda' },
        { text: '🏥 Saúde/Bem-estar', value: 'saude' },
        { text: '🏠 Casa/Decoração', value: 'casa' },
        { text: '💼 Serviços/Consultoria', value: 'servicos' },
        { text: '🎓 Educação/Cursos', value: 'educacao' },
        { text: '🏃‍♂️ Fitness/Esportes', value: 'fitness' },
        { text: '🎮 Tecnologia/Games', value: 'tecnologia' },
        { text: '✈️ Turismo/Viagens', value: 'turismo' },
        { text: '🎯 Outros', value: 'outros' }
      ],
      nextStep: 'businessGoal'
    },
    {
      id: 'businessGoal',
      message: 'Qual é o seu principal objetivo com marketing de influência?',
      type: 'options',
      field: 'businessGoal',
      options: [
        { text: '💰 Aumentar vendas', value: 'vendas' },
        { text: '👥 Conseguir clientes', value: 'clientes' },
        { text: '📢 Fortalecer a marca', value: 'branding' },
        { text: '📈 Aumentar engajamento', value: 'engajamento' },
        { text: '🔄 Outros', value: 'outros' }
      ],
      nextStep: 'hasWorkedWithInfluencers'
    },
    {
      id: 'hasWorkedWithInfluencers',
      message: 'Sua empresa já trabalhou com influenciadores antes?',
      type: 'options',
      field: 'hasWorkedWithInfluencers',
      options: [
        { text: '✅ Sim', value: 'sim' },
        { text: '❌ Não', value: 'nao' }
      ],
      nextStep: 'email'
    },
    {
      id: 'email',
      message: 'Qual é o seu e-mail para contato?',
      type: 'input',
      field: 'email',
      validation: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      errorMessage: 'Por favor, digite um e-mail válido.',
      nextStep: 'whatsapp'
    },
    {
      id: 'whatsapp',
      message: 'Qual é o seu WhatsApp? (apenas números)',
      type: 'input',
      field: 'whatsapp',
      validation: (value: string) => /^\d{10,11}$/.test(value.replace(/\D/g, '')),
      errorMessage: 'Por favor, digite um WhatsApp válido (apenas números).',
      nextStep: 'instagram'
    },
    {
      id: 'instagram',
      message: 'Qual é o seu Instagram? (Ex: @seunome)',
      type: 'input',
      field: 'instagram',
      validation: (value: string) => value.length >= 2,
      errorMessage: 'Por favor, digite seu Instagram.',
      nextStep: 'final'
    },
    {
      id: 'final',
      message: (userData: any) => `Perfeito, ${userData.name}! 🎉

Recebi todas as informações sobre **${userData.businessName}**. Nossa equipe vai analisar seu perfil e encontrar os criadores ideais para potencializar seu negócio!

**Próximos passos:**
📱 Vamos entrar em contato via WhatsApp
📊 Análise gratuita do seu negócio
🎯 Sugestão de criadores para seu nicho
💰 Proposta personalizada

**Seu protocolo:** CRI${Date.now().toString().slice(-6)}`,
      type: 'bot',
      final: true
    }
  ];

  return (
    <ChatbotHomepage
      title={<span className="inline-block"><span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span></span>}
      welcomeMessage="Olá! 👋 Seja bem-vindo(a) à crIAdores! Sou a IA da crIAdores e estou aqui para te ajudar a descobrir como podemos potencializar seu negócio."
      steps={empresaSteps}
      onComplete={handleComplete}
      source="criavoz-novo"
    />
  );
}
