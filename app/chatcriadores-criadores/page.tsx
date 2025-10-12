'use client';

import ChatbotHomepage from '@/components/chatbot/ChatbotHomepage';

export default function ChatCriadoresCriadoresPage() {
  const handleComplete = (userData: any) => {
    console.log('Chat Criadores Locais concluído com dados:', userData);
  };

  return (
    <ChatbotHomepage
      title={<span className="inline-block"><span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span></span>}
      welcomeMessage="Olá! 👋 Quer conectar seu negócio a criadores locais que vendem de verdade? Vamos descobrir como podemos ajudar!"
      onComplete={handleComplete}
    />
  );
}

