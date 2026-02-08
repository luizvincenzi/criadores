'use client';

import ChatbotHomepage from '@/components/chatbot/ChatbotHomepage';

export default function ChatCriadoresSocialMediaPage() {
  const handleComplete = (userData: any) => {
    console.log('Chat Social Media concluído com dados:', userData);
  };

  return (
    <ChatbotHomepage
      title={<span className="inline-block"><span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span></span>}
      welcomeMessage="Olá! 👋 Quer ter um estrategista dedicado cuidando do seu marketing digital? Vamos conversar sobre como podemos ajudar!"
      onComplete={handleComplete}
      source="chatcriadores-social-media"
    />
  );
}

