'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateSessionId, trackChatbotEvent, flushChatbotEvents, setupUnloadHandlers } from '@/lib/chatbot-tracking';
import { trackChatbotStep, trackChatbotConversion, trackChatbotAbandonment } from '@/lib/gtag';

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
  creatorNiche?: string;
  followersCount?: string;
  hasWorkedWithBrands?: string;
  name?: string;
  email?: string;
  whatsapp?: string;
  instagram?: string;
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
  source?: string;
}

export default function ChatbotHomepage({
  title = "crIAdores",
  welcomeMessage = "Olá! 👋 Seja bem-vindo(a) à crIAdores! Sou a IA da crIAdores e estou aqui para te ajudar a descobrir como podemos potencializar seu negócio.",
  steps: customSteps,
  onComplete,
  source = "criavoz-homepage"
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
  const [isCompleted, setIsCompleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tracking refs (não causam re-render)
  const sessionIdRef = useRef<string>('');
  const sessionStartRef = useRef<number>(0);
  const stepStartTimeRef = useRef<number>(0);
  const userDataRef = useRef<UserData>({});
  const isCompletedRef = useRef<boolean>(false);
  const currentStepRef = useRef<number>(0);

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
      message: 'Qual é o principal objetivo da sua empresa com crIAdores?',
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
      message: 'Sua empresa já contratou crIAdores antes?',
      type: 'options',
      field: 'hasWorkedWithInfluencers',
      options: [
        { text: '✅ Sim, já contratamos', value: 'sim' },
        { text: '❌ Não, seria a primeira vez', value: 'nao' }
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
      message: 'Qual é o seu WhatsApp? (formato: 43999999999)',
      type: 'input',
      field: 'whatsapp',
      validation: (value) => /^\d{10,11}$/.test(value.replace(/\D/g, '')),
      errorMessage: 'Por favor, digite um WhatsApp válido (apenas números).',
      nextStep: 'instagram'
    },
    {
      id: 'instagram',
      message: (userData: UserData) => userData.userType === 'empresa'
        ? 'Qual é o Instagram da sua empresa? (apenas o @usuario)'
        : 'Qual é o seu Instagram? (apenas o @usuario)',
      type: 'input',
      field: 'instagram',
      validation: (value) => value.length >= 2,
      errorMessage: 'Por favor, digite o Instagram.',
      nextStep: 'final'
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

  // Manter refs sincronizados com state
  useEffect(() => { userDataRef.current = userData; }, [userData]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { isCompletedRef.current = isCompleted; }, [isCompleted]);

  useEffect(() => {
    // Iniciar conversa apenas uma vez
    if (messages.length === 0) {
      // Inicializar tracking
      sessionIdRef.current = generateSessionId();
      sessionStartRef.current = Date.now();
      stepStartTimeRef.current = Date.now();

      // Enviar evento session_start
      trackChatbotEvent({
        session_id: sessionIdRef.current,
        source,
        event_type: 'session_start',
        step_id: 'welcome',
        step_number: 0,
      });

      // Setup unload handlers para tracking de abandono
      const cleanup = setupUnloadHandlers(
        sessionIdRef.current,
        source,
        () => steps[currentStepRef.current]?.id,
        () => currentStepRef.current,
        () => Date.now() - sessionStartRef.current,
        () => userDataRef.current.userType,
        () => isCompletedRef.current
      );

      setTimeout(() => {
        processStep();
      }, 1000);

      return cleanup;
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
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
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

    // Tracking: step_completed para input
    const timeOnStep = Date.now() - stepStartTimeRef.current;
    trackChatbotEvent({
      session_id: sessionIdRef.current,
      source,
      event_type: 'step_completed',
      step_id: step.id,
      step_number: currentStep,
      step_value: processedValue,
      user_type: userData.userType,
      time_on_step_ms: timeOnStep,
      session_duration_ms: Date.now() - sessionStartRef.current,
    });
    trackChatbotStep(source, step.id, currentStep);
    stepStartTimeRef.current = Date.now();

    setInputValue('');
    setShowInput(false);

    // Scroll após resposta do usuário
    setTimeout(() => {
      scrollToBottom();
    }, 200);

    setTimeout(() => {
      const nextStepIndex = getNextStepIndex(step, processedValue);
      setCurrentStep(nextStepIndex);
    }, 1000);
  };

  const handleOptionSelect = (value: string, text: string) => {
    const step = steps[currentStep];
    addMessage(text, 'user');

    // Scroll após resposta do usuário
    setTimeout(() => {
      scrollToBottom();
    }, 200);

    // Se for uma ação final, executar a ação
    if (step.final) {
      if (value === 'whatsapp') {
        // Tracking: whatsapp_click
        trackChatbotEvent({
          session_id: sessionIdRef.current,
          source,
          event_type: 'whatsapp_click',
          session_duration_ms: Date.now() - sessionStartRef.current,
          user_type: userData.userType,
        });
        const whatsappMessage = generateWhatsAppMessage(userData);
        window.open(`https://wa.me/5543999520526?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
      } else if (value === 'home') {
        router.push('/');
      }
      return;
    }

    setUserData(prev => ({ ...prev, [step.field!]: value }));
    setCurrentOptions([]);

    // Tracking: step_completed para option
    const timeOnStep = Date.now() - stepStartTimeRef.current;
    trackChatbotEvent({
      session_id: sessionIdRef.current,
      source,
      event_type: 'step_completed',
      step_id: step.id,
      step_number: currentStep,
      step_value: value,
      user_type: step.field === 'userType' ? value as any : userData.userType,
      time_on_step_ms: timeOnStep,
      session_duration_ms: Date.now() - sessionStartRef.current,
    });
    trackChatbotStep(source, step.id, currentStep);
    stepStartTimeRef.current = Date.now();

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
        body: JSON.stringify({
          ...userData,
          source: source
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Lead salvo com sucesso:', result.data);

        // Tracking: form_submitted (conversão!)
        setIsCompleted(true);
        trackChatbotEvent({
          session_id: sessionIdRef.current,
          source,
          event_type: 'form_submitted',
          step_id: 'final',
          step_number: currentStep,
          user_type: userData.userType,
          session_duration_ms: Date.now() - sessionStartRef.current,
        });
        trackChatbotConversion(source, userData.userType || 'unknown');
        flushChatbotEvents();

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
        return userData.userType === 'empresa'
          ? 'Digite o Instagram da empresa...'
          : 'Digite seu Instagram...';
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
          <h1 className="text-2xl font-medium font-onest">
            <span className="text-gray-600 font-light">cr</span>
            <span className="text-[#0b3553] font-bold">IA</span>
            <span className="text-gray-600 font-light">dores</span>
          </h1>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 h-1">
        <div
          className="bg-[#0b3553] h-full transition-all duration-500"
          style={{ width: `${progress}%` }}
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
                  <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <img
                      src="/faviconcriadoresA3.png"
                      alt="crIAdores IA"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm text-sm leading-relaxed whitespace-pre-line text-gray-800">
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
                    <div className="flex justify-end">
                      <div className="flex items-center space-x-2 w-80">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          placeholder={getInputPlaceholder()}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          autoFocus
                        />
                        <button
                          onClick={handleSend}
                          className="w-8 h-8 bg-[#0b3553] text-white rounded-full flex items-center justify-center hover:bg-[#0a2d42] transition-colors flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <img
                  src="/faviconcriadoresA3.png"
                  alt="crIAdores IA"
                  className="w-6 h-6 object-contain"
                />
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
function generateWhatsAppMessage(userData: UserData): string {
  const leadId = generateLeadId();

  if (userData.userType === 'empresa') {
    return `Olá! Vim através do site da crIAdores e gostaria de saber mais sobre os serviços, segue as minhas informações:

Obrigado, ${userData.name}! 🎉

📋 Resumo dos seus dados:
• Empresa: ${userData.businessName}
• Segmento: ${getSegmentText(userData.businessSegment!)}
• Objetivo: ${getGoalText(userData.businessGoal!)}
• WhatsApp: ${userData.whatsapp}
• E-mail: ${userData.email}
• Instagram: ${userData.instagram}

🎯 Próximos passos:
Nossa equipe entrará em contato em até 24h para apresentar uma proposta personalizada!

📱 Protocolo: ${leadId}`;
  } else {
    return `Olá! Vim através do site da crIAdores e gostaria de saber mais sobre os serviços, segue as minhas informações:

Obrigado, ${userData.name}! 🎉

📋 Resumo dos seus dados:
• Nicho: ${getNicheText(userData.creatorNiche!)}
• Seguidores: ${getFollowersText(userData.followersCount!)}
• WhatsApp: ${userData.whatsapp}
• E-mail: ${userData.email}
• Instagram: ${userData.instagram}

🌟 Próximos passos:
Em breve entraremos em contato para te incluir em nossas campanhas!

📱 Protocolo: ${leadId}`;
  }
}

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
