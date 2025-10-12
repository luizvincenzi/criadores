'use client';

import ChatbotHomepage from '@/components/chatbot/ChatbotHomepage';

export default function ChatCriadoresAdvogadosPage() {
  const handleComplete = (userData: any) => {
    console.log('Chat Advogados concluído com dados:', userData);
  };

  return (
    <ChatbotHomepage
      title={<span className="inline-block"><span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span></span>}
      welcomeMessage="Olá, Dr(a). Advogado(a)! 👋 Quer construir autoridade e atrair clientes qualificados para seu escritório? Vamos conversar sobre marketing jurídico estratégico!"
      onComplete={handleComplete}
    />
  );
}

