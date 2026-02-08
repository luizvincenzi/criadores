'use client';

import ChatbotHomepage from '@/components/chatbot/ChatbotHomepage';

export default function CriavozHomepagePage() {
  const handleComplete = (userData: any) => {
    console.log('Criavoz homepage concluído com dados:', userData);
  };

  return (
    <ChatbotHomepage
      title={<span className="inline-block"><span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span></span>}
      welcomeMessage="Olá! 👋 Seja bem-vindo(a) à crIAdores! Sou a IA da crIAdores e estou aqui para te ajudar a descobrir como podemos potencializar seu negócio."
      onComplete={handleComplete}
      source="chatcriadores-home"
    />
  );
}
