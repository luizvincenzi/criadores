'use client';

import ChatbotHomepage from '@/components/chatbot/ChatbotHomepage';

export default function ChatCriadoresMentoriaPage() {
  const handleComplete = (userData: any) => {
    console.log('Chat Mentoria concluído com dados:', userData);
  };

  return (
    <ChatbotHomepage
      title={<span className="inline-block"><span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span></span>}
      welcomeMessage="Olá! 👋 Quer dominar o marketing do seu negócio com mentoria estratégica? Vamos conversar sobre a mentoria com Gabriel D'Ávila!"
      onComplete={handleComplete}
      source="chatcriadores-mentoria"
    />
  );
}

