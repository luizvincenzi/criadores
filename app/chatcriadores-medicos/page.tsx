'use client';

import ChatbotHomepage from '@/components/chatbot/ChatbotHomepage';

export default function ChatCriadoresMedicosPage() {
  const handleComplete = (userData: any) => {
    console.log('Chat Médicos concluído com dados:', userData);
  };

  return (
    <ChatbotHomepage
      title={<span className="inline-block"><span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span></span>}
      welcomeMessage="Olá, Doutor(a)! 👋 Quer atrair mais pacientes com marketing digital ético e profissional? Vamos conversar sobre como podemos ajudar sua clínica/consultório!"
      onComplete={handleComplete}
    />
  );
}

