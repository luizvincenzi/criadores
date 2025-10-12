'use client';

import ChatbotHomepage from '@/components/chatbot/ChatbotHomepage';

export default function ChatCriadoresEmpresasPage() {
  const handleComplete = (userData: any) => {
    console.log('Chat Empresas concluído com dados:', userData);
    // Aqui você pode enviar para Supabase, CRM, etc.
  };

  return (
    <ChatbotHomepage
      title={<span className="inline-block"><span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span></span>}
      welcomeMessage="Olá! 👋 Bem-vindo(a) à crIAdores! Vamos descobrir qual solução é ideal para o seu negócio crescer no digital?"
      onComplete={handleComplete}
    />
  );
}

