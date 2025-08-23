'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface UserData {
  userType?: 'empresa' | 'criador';
  businessName?: string;
  businessSegment?: string;
  businessGoal?: string;
  hasWorkedWithInfluencers?: string;
  investmentRange?: string;
  creatorNiche?: string;
  followersCount?: string;
  hasWorkedWithBrands?: string;
  name?: string;
  email?: string;
  whatsapp?: string;
  instagram?: string;
  lgpdConsent?: string;
}

interface ChatStep {
  id: string;
  message: string | ((userData: UserData) => string);
  type: 'bot' | 'input' | 'options';
  field?: keyof UserData;
  options?: Array<{ text: string; value: string }>;
  validation?: (value: string) => boolean;
  errorMessage?: string;
  nextStep?: string | ((value: string) => string);
  final?: boolean;
}

interface ChatbotHomepageProps {
  title?: string;
  welcomeMessage?: string;
  steps?: ChatStep[];
  onComplete?: (userData: UserData) => void;
}

export default function ChatbotHomepage({ 
  title = "crIAdores",
  welcomeMessage = "Olá! 👋 Seja bem-vindo(a) à crIAdores! Sou a IA da crIAdores e estou aqui para te ajudar a descobrir como podemos potencializar seu negócio.",
  steps: customSteps,
  onComplete
}: ChatbotHomepageProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<UserData>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<Array<{ text: string; value: string }>>([]);
  const [progress, setProgress] = useState(0);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultSteps: ChatStep[] = [
    {
      id: 'welcome',
      message: welcomeMessage,
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
      validation: (value) => value.length >= 2,
      errorMessage: 'Por favor, digite um nome válido.',
      nextStep: 'userType'
    },
    {
      id: 'userType',
      message: 'Para começarmos, você é:',
      type: 'options',
      field: 'userType',
      options: [
        { text: '🏢 Empresa/Negócio', value: 'empresa' },
        { text: '🎨 Criador de Conteúdo', value: 'criador' }
      ],
      nextStep: (value) => value === 'empresa' ? 'businessName' : 'creatorNiche'
    },
    {
      id: 'businessName',
      message: 'Perfeito! Qual é o nome da sua empresa?',
      type: 'input',
      field: 'businessName',
      validation: (value) => value.length >= 2,
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
        { text: '🚗 Automotivo', value: 'automotivo' },
        { text: '📚 Educação/Cursos', value: 'educacao' },
        { text: '🎯 Outros', value: 'outros' }
      ],
      nextStep: 'businessGoal'
    },
    {
      id: 'businessGoal',
      message: 'Qual é o principal objetivo da sua empresa com influenciadores?',
      type: 'options',
      field: 'businessGoal',
      options: [
        { text: '📈 Aumentar vendas', value: 'vendas' },
        { text: '👥 Ganhar mais clientes', value: 'clientes' },
        { text: '🎯 Divulgar marca/produto', value: 'divulgacao' },
        { text: '🌟 Melhorar presença digital', value: 'presenca' }
      ],
      nextStep: 'hasWorkedWithInfluencers'
    },
    {
      id: 'hasWorkedWithInfluencers',
      message: 'Sua empresa já contratou influenciadores antes?',
      type: 'options',
      field: 'hasWorkedWithInfluencers',
      options: [
        { text: '✅ Sim, já contratamos', value: 'sim' },
        { text: '❌ Não, seria a primeira vez', value: 'nao' }
      ],
      nextStep: 'investmentRange'
    },
    {
      id: 'investmentRange',
      message: 'Qual a faixa de investimento mensal em marketing da sua empresa?',
      type: 'options',
      field: 'investmentRange',
      options: [
        { text: '💰 Até R$ 500', value: 'ate_500' },
        { text: '💰💰 R$ 500 - R$ 2.000', value: '500_2000' },
        { text: '💰💰💰 Acima de R$ 2.000', value: 'acima_2000' }
      ],
      nextStep: 'email'
    },
    {
      id: 'creatorNiche',
      message: 'Que legal! Em qual nicho você cria conteúdo?',
      type: 'options',
      field: 'creatorNiche',
      options: [
        { text: '🍕 Gastronomia', value: 'gastronomia' },
        { text: '👗 Moda/Lifestyle', value: 'moda' },
        { text: '🏃‍♀️ Fitness/Saúde', value: 'fitness' },
        { text: '🎮 Entretenimento', value: 'entretenimento' },
        { text: '📚 Educação', value: 'educacao' },
        { text: '🎨 Outros', value: 'outros' }
      ],
      nextStep: 'followersCount'
    },
    {
      id: 'followersCount',
      message: 'Quantos seguidores você tem no Instagram/TikTok?',
      type: 'options',
      field: 'followersCount',
      options: [
        { text: '📱 Até 5k seguidores', value: 'ate_5k' },
        { text: '📱📱 5k - 20k seguidores', value: '5k_20k' },
        { text: '📱📱📱 Acima de 20k seguidores', value: 'acima_20k' }
      ],
      nextStep: 'hasWorkedWithBrands'
    },
    {
      id: 'hasWorkedWithBrands',
      message: 'Você já trabalhou com marcas antes?',
      type: 'options',
      field: 'hasWorkedWithBrands',
      options: [
        { text: '✅ Sim, já trabalhei', value: 'sim' },
        { text: '❌ Não, seria a primeira vez', value: 'nao' }
      ],
      nextStep: 'email'
    },
    {
      id: 'email',
      message: 'Qual é o seu e-mail?',
      type: 'input',
      field: 'email',
      validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      errorMessage: 'Por favor, digite um e-mail válido.',
      nextStep: 'whatsapp'
    },
    {
      id: 'whatsapp',
      message: 'Qual é o seu WhatsApp? (formato: 11999999999)',
      type: 'input',
      field: 'whatsapp',
      validation: (value) => /^\d{10,11}$/.test(value.replace(/\D/g, '')),
      errorMessage: 'Por favor, digite um WhatsApp válido (apenas números).',
      nextStep: 'instagram'
    },
    {
      id: 'instagram',
      message: 'Qual é o seu Instagram? (apenas o @usuario)',
      type: 'input',
      field: 'instagram',
      validation: (value) => value.length >= 2,
      errorMessage: 'Por favor, digite seu Instagram.',
      nextStep: 'lgpdConsent'
    },
    {
      id: 'lgpdConsent',
      message: 'Para finalizar, você autoriza o uso dos seus dados para contato conforme nossa política de privacidade?',
      type: 'options',
      field: 'lgpdConsent',
      options: [
        { text: '✅ Sim, autorizo', value: 'sim' },
        { text: '❌ Não autorizo', value: 'nao' }
      ],
      nextStep: (value) => value === 'sim' ? 'final' : 'noConsent'
    },
    {
      id: 'noConsent',
      message: 'Entendo! Sem o consentimento não podemos prosseguir. Caso mude de ideia, estaremos aqui! 😊',
      type: 'bot',
      final: true
    },
    {
      id: 'final',
      message: (userData: UserData) => {
        const leadId = generateLeadId();
        if (userData.userType === 'empresa') {
          return `Perfeito, ${userData.name}! 🎉\n\n📋 **Resumo dos seus dados:**\n• Empresa: ${userData.businessName}\n• Segmento: ${getSegmentText(userData.businessSegment!)}\n• Objetivo: ${getGoalText(userData.businessGoal!)}\n• WhatsApp: ${userData.whatsapp}\n• E-mail: ${userData.email}\n• Instagram: ${userData.instagram}\n\n🎯 **Próximos passos:**\nNossa equipe entrará em contato em até 24h para apresentar uma proposta personalizada!\n\n📱 **Protocolo:** ${leadId}`;
        } else {
          return `Obrigado, ${userData.name}! 🎉\n\n📋 **Resumo dos seus dados:**\n• Nicho: ${getNicheText(userData.creatorNiche!)}\n• Seguidores: ${getFollowersText(userData.followersCount!)}\n• WhatsApp: ${userData.whatsapp}\n• E-mail: ${userData.email}\n• Instagram: ${userData.instagram}\n\n🌟 **Próximos passos:**\nEm breve entraremos em contato para te incluir em nossas campanhas!\n\n📱 **Protocolo:** ${leadId}`;
        }
      },
      type: 'bot',
      final: true
    }
  ];

  const steps = customSteps || defaultSteps;

  useEffect(() => {
    // Iniciar conversa apenas uma vez
    if (messages.length === 0) {
      setTimeout(() => {
        processStep();
      }, 1000);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const progressValue = (currentStep / (steps.length - 1)) * 100;
    setProgress(Math.min(progressValue, 100));

    // Processar step quando currentStep mudar (exceto no primeiro render)
    if (currentStep > 0) {
      processStep();
    }
  }, [currentStep]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (content: string, type: 'bot' | 'user') => {
    const newCounter = messageIdCounter + 1;
    setMessageIdCounter(newCounter);
    const newMessage: Message = {
      id: `${type}-${newCounter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processStep = () => {
    const step = steps[currentStep];
    if (!step) return;

    if (step.type === 'bot') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const message = typeof step.message === 'function' ? step.message(userData) : step.message;
        addMessage(message, 'bot');

        if (step.final) {
          saveUserData();
          showFinalActions();
          return;
        }

        // Para o primeiro step, avança para o próximo
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 2000);
      }, 1500);
    } else if (step.type === 'input') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const message = typeof step.message === 'function' ? step.message(userData) : step.message;
        addMessage(message, 'bot');

        // Sempre mostrar input após a pergunta
        setTimeout(() => {
          setShowInput(true);
        }, 500);
      }, 1500);
    } else if (step.type === 'options') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const message = typeof step.message === 'function' ? step.message(userData) : step.message;
        addMessage(message, 'bot');

        // Mostrar opções como botões
        setTimeout(() => {
          const options = typeof step.options === 'function' ? step.options(userData) : step.options!;
          setCurrentOptions(options);
          setShowInput(false); // Não mostrar input para opções
        }, 1000);
      }, 1500);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const step = steps[currentStep];
    const processedValue = inputValue.trim();

    // Para inputs normais, validar se necessário
    if (step.validation && !step.validation(processedValue)) {
      addMessage(inputValue, 'user');
      setTimeout(() => {
        addMessage(step.errorMessage!, 'bot');
      }, 500);
      setInputValue('');
      return;
    }

    addMessage(inputValue, 'user');
    setUserData(prev => ({ ...prev, [step.field!]: processedValue }));

    setInputValue('');
    setShowInput(false);

    setTimeout(() => {
      const nextStepIndex = getNextStepIndex(step, processedValue);
      setCurrentStep(nextStepIndex);
    }, 1000);
  };

  const handleOptionSelect = (value: string, text: string) => {
    const step = steps[currentStep];
    addMessage(text, 'user');

    // Se for uma ação final, executar a ação
    if (step.final) {
      if (value === 'whatsapp') {
        window.open('https://wa.me/5542991159229?text=Olá! Vim através do site da crIAdores e gostaria de saber mais sobre os serviços.', '_blank');
      } else if (value === 'home') {
        router.push('/');
      }
      return;
    }

    setUserData(prev => ({ ...prev, [step.field!]: value }));
    setCurrentOptions([]);

    setTimeout(() => {
      const nextStepIndex = getNextStepIndex(step, value);
      setCurrentStep(nextStepIndex);
    }, 1000);
  };

  const getNextStepIndex = (step: ChatStep, value: string): number => {
    if (typeof step.nextStep === 'function') {
      const nextStepId = step.nextStep(value);
      return steps.findIndex(s => s.id === nextStepId);
    } else if (step.nextStep) {
      return steps.findIndex(s => s.id === step.nextStep);
    }
    return currentStep + 1;
  };

  const saveUserData = async () => {
    try {
      console.log('Salvando dados do usuário:', userData);

      const response = await fetch('/api/chatbot/save-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Lead salvo com sucesso:', result.data);
        if (onComplete) {
          onComplete(userData);
        }
      } else {
        console.error('Erro ao salvar lead:', result.error);
      }

    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  };

  const showFinalActions = () => {
    setTimeout(() => {
      const finalOptions = [
        { text: '📱 Falar no WhatsApp', value: 'whatsapp' },
        { text: '🏠 Voltar ao Site', value: 'home' }
      ];

      addMessage('Escolha uma opção:', 'bot');
      setCurrentOptions(finalOptions);
    }, 2000);
  };

  const getInputPlaceholder = () => {
    const step = steps[currentStep];
    if (!step) return 'Digite sua resposta...';

    switch (step.field) {
      case 'name':
        return 'Digite seu nome completo...';
      case 'email':
        return 'Digite seu e-mail...';
      case 'whatsapp':
        return 'Digite seu WhatsApp...';
      case 'instagram':
        return 'Digite seu Instagram...';
      case 'businessName':
        return 'Digite o nome da empresa...';
      default:
        return 'Digite sua resposta...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h1 className="text-2xl font-medium">
            <span className="text-gray-700">cr</span>
            <span className="text-black font-bold text-2xl">IA</span>
            <span className="text-gray-700">dores</span>
          </h1>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-yellow-400 via-blue-500 to-purple-600 h-1">
        <div
          className="bg-white h-full transition-all duration-500"
          style={{ width: `${100 - progress}%`, marginLeft: `${progress}%` }}
        />
      </div>

      {/* Chat Container */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={message.id}>
              {/* Message */}
              {message.type === 'bot' ? (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-800 font-bold text-xs">IA</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm leading-relaxed whitespace-pre-line text-gray-800">
                      {message.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="inline-block px-4 py-3 rounded-lg bg-blue-600 text-white max-w-xs">
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {message.content}
                    </div>
                  </div>
                </div>
              )}

              {/* Input ou Botões logo após a última mensagem do bot */}
              {message.type === 'bot' &&
               index === messages.length - 1 &&
               !isTyping && (
                <div className="mt-4 ml-13">
                  {/* Mostrar botões se há opções */}
                  {currentOptions.length > 0 ? (
                    <div className="space-y-2">
                      {currentOptions.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          onClick={() => handleOptionSelect(option.value, option.text)}
                          className="block w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 text-sm"
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  ) : showInput ? (
                    /* Mostrar input se não há opções */
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={getInputPlaceholder()}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        autoFocus
                      />
                      <button
                        onClick={handleSend}
                        className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-800 font-bold text-xs">IA</span>
              </div>
              <div className="flex space-x-1 py-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

// Funções auxiliares
function generateLeadId(): string {
  return 'CRI' + Date.now().toString().slice(-6);
}

function getSegmentText(segment: string): string {
  const segments: Record<string, string> = {
    'alimentacao': 'Alimentação/Restaurantes',
    'moda': 'Moda/Beleza',
    'saude': 'Saúde/Bem-estar',
    'casa': 'Casa/Decoração',
    'automotivo': 'Automotivo',
    'educacao': 'Educação/Cursos',
    'outros': 'Outros'
  };
  return segments[segment] || segment;
}

function getGoalText(goal: string): string {
  const goals: Record<string, string> = {
    'vendas': 'Aumentar vendas',
    'clientes': 'Ganhar mais clientes',
    'divulgacao': 'Divulgar marca/produto',
    'presenca': 'Melhorar presença digital'
  };
  return goals[goal] || goal;
}

function getNicheText(niche: string): string {
  const niches: Record<string, string> = {
    'gastronomia': 'Gastronomia',
    'moda': 'Moda/Lifestyle',
    'fitness': 'Fitness/Saúde',
    'entretenimento': 'Entretenimento',
    'educacao': 'Educação',
    'outros': 'Outros'
  };
  return niches[niche] || niche;
}

function getFollowersText(followers: string): string {
  const ranges: Record<string, string> = {
    'ate_5k': 'Até 5k seguidores',
    '5k_20k': '5k - 20k seguidores',
    'acima_20k': 'Acima de 20k seguidores'
  };
  return ranges[followers] || followers;
}
