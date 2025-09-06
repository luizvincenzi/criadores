'use client';

import ChatbotHomepage from '@/components/chatbot/ChatbotHomepage';

export default function CriavozHomepagePage() {
  const handleComplete = (userData: any) => {
    console.log('Criavoz homepage concluído com dados:', userData);
  };

  return (
    <ChatbotHomepage
      title="crIAdores"
      welcomeMessage="Olá! 👋 Seja bem-vindo(a) à crIAdores! Sou a IA da crIAdores e estou aqui para te ajudar a descobrir como podemos potencializar seu negócio."
      onComplete={handleComplete}
    />
  );
}
