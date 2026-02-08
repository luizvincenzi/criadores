'use client';

import ChatbotSocialMedia from '@/components/chatbot/ChatbotSocialMedia';

export default function ChatCriadoresSocialMediaPage() {
  const handleComplete = (userData: any) => {
    console.log('Chat Social Media concluído com dados:', userData);
  };

  return (
    <ChatbotSocialMedia
      source="chatcriadores-social-media"
      onComplete={handleComplete}
    />
  );
}
