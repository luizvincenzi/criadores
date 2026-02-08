'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateSessionId, trackChatbotEvent, flushChatbotEvents, setupUnloadHandlers } from '@/lib/chatbot-tracking';
import { trackChatbotStep, trackChatbotConversion } from '@/lib/gtag';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface SocialMediaUserData {
  name?: string;
  businessName?: string;
  socialMediaPain?: string;
  whatsapp?: string;
  instagram?: string;
}

interface ChatStep {
  id: string;
  message: string | ((userData: SocialMediaUserData) => string);
  type: 'bot' | 'input' | 'options';
  field?: keyof SocialMediaUserData;
  options?: Array<{ text: string; value: string }>;
  validation?: (value: string) => boolean;
  errorMessage?: string;
  nextStep?: string;
  final?: boolean;
}

interface ChatbotSocialMediaProps {
  source?: string;
  onComplete?: (userData: SocialMediaUserData) => void;
}

export default function ChatbotSocialMedia({
  source = 'chatcriadores-social-media',
  onComplete,
}: ChatbotSocialMediaProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<SocialMediaUserData>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<Array<{ text: string; value: string }>>([]);
  const [progress, setProgress] = useState(0);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tracking refs
  const sessionIdRef = useRef<string>('');
  const sessionStartRef = useRef<number>(0);
  const stepStartTimeRef = useRef<number>(0);
  const userDataRef = useRef<SocialMediaUserData>({});
  const isCompletedRef = useRef<boolean>(false);
  const currentStepRef = useRef<number>(0);

  const steps: ChatStep[] = [
    {
      id: 'welcome',
      message: 'Olá! 👋 Quer ter um Social Media Estratégico dedicado ao seu negócio? Responda algumas perguntas rápidas e nosso especialista entra em contato com você!',
      type: 'bot',
      nextStep: 'name'
    },
    {
      id: 'name',
      message: 'Para começar, como posso te chamar?',
      type: 'input',
      field: 'name',
      validation: (value) => value.length >= 2,
      errorMessage: 'Por favor, digite um nome válido.',
      nextStep: 'businessName'
    },
    {
      id: 'businessName',
      message: (userData) => `Prazer, ${userData.name}! Qual é o nome do seu negócio?`,
      type: 'input',
      field: 'businessName',
      validation: (value) => value.length >= 2,
      errorMessage: 'Por favor, digite o nome do negócio.',
      nextStep: 'socialMediaPain'
    },
    {
      id: 'socialMediaPain',
      message: (userData) => `Qual é o maior desafio do ${userData.businessName} com as redes sociais hoje?`,
      type: 'options',
      field: 'socialMediaPain',
      options: [
        { text: '⏰ Não tenho tempo de postar com frequência', value: 'sem_tempo' },
        { text: '📉 Posto, mas não tenho resultado', value: 'sem_resultado' },
        { text: '🤔 Não sei o que postar', value: 'sem_ideia' },
        { text: '📸 Preciso de conteúdo mais profissional', value: 'qualidade' }
      ],
      nextStep: 'whatsapp'
    },
    {
      id: 'whatsapp',
      message: (userData) => `Nosso especialista vai entrar em contato com você pelo WhatsApp para explicar como funciona o Social Media Estratégico para o ${userData.businessName}.\n\nQual é o seu número? (DDD + número, ex: 43999999999)`,
      type: 'input',
      field: 'whatsapp',
      validation: (value) => /^\d{10,11}$/.test(value.replace(/\D/g, '')),
      errorMessage: 'Por favor, digite um WhatsApp válido (apenas números, DDD + número).',
      nextStep: 'instagram'
    },
    {
      id: 'instagram',
      message: (userData) => `Qual é o Instagram do ${userData.businessName}? (só o @)`,
      type: 'input',
      field: 'instagram',
      validation: (value) => value.length >= 2,
      errorMessage: 'Por favor, digite o Instagram do negócio.',
      nextStep: 'final'
    },
    {
      id: 'final',
      message: (userData) => {
        const leadId = generateLeadId();
        const painText = getPainText(userData.socialMediaPain!);
        return `Obrigado, ${userData.name}! 🎉\n\n📋 **Resumo:**\n• Negócio: ${userData.businessName}\n• Desafio: ${painText}\n• WhatsApp: ${userData.whatsapp}\n• Instagram: ${userData.instagram}\n\n🎯 **Próximos passos:**\nUm especialista da crIAdores vai entrar em contato pelo WhatsApp em até 24h para te mostrar como funciona o Social Media Estratégico para o ${userData.businessName}.\n\n📱 **Protocolo:** ${leadId}`;
      },
      type: 'bot',
      final: true
    }
  ];

  // Sync refs com state
  useEffect(() => { userDataRef.current = userData; }, [userData]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { isCompletedRef.current = isCompleted; }, [isCompleted]);

  useEffect(() => {
    if (messages.length === 0) {
      sessionIdRef.current = generateSessionId();
      sessionStartRef.current = Date.now();
      stepStartTimeRef.current = Date.now();

      trackChatbotEvent({
        session_id: sessionIdRef.current,
        source,
        event_type: 'session_start',
        step_id: 'welcome',
        step_number: 0,
      });

      const cleanup = setupUnloadHandlers(
        sessionIdRef.current,
        source,
        () => steps[currentStepRef.current]?.id,
        () => currentStepRef.current,
        () => Date.now() - sessionStartRef.current,
        () => 'empresa',
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

        setTimeout(() => {
          setCurrentOptions(step.options!);
          setShowInput(false);
        }, 1000);
      }, 1500);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const step = steps[currentStep];
    const processedValue = inputValue.trim();

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

    // Tracking
    const timeOnStep = Date.now() - stepStartTimeRef.current;
    trackChatbotEvent({
      session_id: sessionIdRef.current,
      source,
      event_type: 'step_completed',
      step_id: step.id,
      step_number: currentStep,
      step_value: processedValue,
      user_type: 'empresa',
      time_on_step_ms: timeOnStep,
      session_duration_ms: Date.now() - sessionStartRef.current,
    });
    trackChatbotStep(source, step.id, currentStep);
    stepStartTimeRef.current = Date.now();

    setInputValue('');
    setShowInput(false);

    setTimeout(() => scrollToBottom(), 200);

    setTimeout(() => {
      const nextStepIndex = steps.findIndex(s => s.id === step.nextStep);
      setCurrentStep(nextStepIndex >= 0 ? nextStepIndex : currentStep + 1);
    }, 1000);
  };

  const handleOptionSelect = (value: string, text: string) => {
    const step = steps[currentStep];
    addMessage(text, 'user');

    setTimeout(() => scrollToBottom(), 200);

    // Ações finais (WhatsApp / Voltar)
    if (step.final) {
      if (value === 'whatsapp') {
        trackChatbotEvent({
          session_id: sessionIdRef.current,
          source,
          event_type: 'whatsapp_click',
          session_duration_ms: Date.now() - sessionStartRef.current,
          user_type: 'empresa',
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

    // Tracking
    const timeOnStep = Date.now() - stepStartTimeRef.current;
    trackChatbotEvent({
      session_id: sessionIdRef.current,
      source,
      event_type: 'step_completed',
      step_id: step.id,
      step_number: currentStep,
      step_value: value,
      user_type: 'empresa',
      time_on_step_ms: timeOnStep,
      session_duration_ms: Date.now() - sessionStartRef.current,
    });
    trackChatbotStep(source, step.id, currentStep);
    stepStartTimeRef.current = Date.now();

    setTimeout(() => {
      const nextStepIndex = steps.findIndex(s => s.id === step.nextStep);
      setCurrentStep(nextStepIndex >= 0 ? nextStepIndex : currentStep + 1);
    }, 1000);
  };

  const saveUserData = async () => {
    try {
      console.log('Salvando dados do lead (Social Media):', userData);

      const response = await fetch('/api/chatbot/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          userType: 'empresa',
          source: source,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Lead Social Media salvo com sucesso:', result.data);

        setIsCompleted(true);
        trackChatbotEvent({
          session_id: sessionIdRef.current,
          source,
          event_type: 'form_submitted',
          step_id: 'final',
          step_number: currentStep,
          user_type: 'empresa',
          session_duration_ms: Date.now() - sessionStartRef.current,
        });
        trackChatbotConversion(source, 'empresa');
        flushChatbotEvents();

        if (onComplete) {
          onComplete(userData);
        }
      } else {
        console.error('Erro ao salvar lead Social Media:', result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar lead Social Media:', error);
    }
  };

  const showFinalActions = () => {
    setTimeout(() => {
      const finalOptions = [
        { text: '📱 Falar agora no WhatsApp', value: 'whatsapp' },
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
        return 'Digite seu nome...';
      case 'businessName':
        return 'Digite o nome do negócio...';
      case 'whatsapp':
        return 'Ex: 43999999999';
      case 'instagram':
        return '@seunegocio';
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
          <div className="w-16"></div>
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
              {message.type === 'bot' ? (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <img
                      src="/faviconcriadoresA3.png"
                      alt="crIAdores"
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

              {/* Input ou Botões após última mensagem do bot */}
              {message.type === 'bot' &&
               index === messages.length - 1 &&
               !isTyping && (
                <div className="mt-4 ml-13">
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
                  alt="crIAdores"
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

// Helpers

function generateLeadId(): string {
  return 'CRI' + Date.now().toString().slice(-6);
}

function getPainText(pain: string): string {
  const pains: Record<string, string> = {
    'sem_tempo': 'Não tem tempo de postar com frequência',
    'sem_resultado': 'Posta, mas não tem resultado',
    'sem_ideia': 'Não sabe o que postar',
    'qualidade': 'Precisa de conteúdo mais profissional'
  };
  return pains[pain] || pain;
}

function generateWhatsAppMessage(userData: SocialMediaUserData): string {
  const leadId = generateLeadId();
  const painText = getPainText(userData.socialMediaPain!);

  return `Olá! Vim pelo site da crIAdores e tenho interesse no Social Media Estratégico.

📋 Meus dados:
• Nome: ${userData.name}
• Negócio: ${userData.businessName}
• Desafio: ${painText}
• Instagram: ${userData.instagram}

📱 Protocolo: ${leadId}`;
}
