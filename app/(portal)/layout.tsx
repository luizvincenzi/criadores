'use client';

import React from 'react';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import PortalSidebar from '@/components/portal/PortalSidebar';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalTasksSidebar from '@/components/portal/PortalTasksSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const { user, isLoading, isAuthenticated } = usePortalAuth();

  if (isLoading) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        message="Carregando portal..."
      />
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Redirecionamento será feito pelo hook
  }

  return (
    <div className="min-h-screen bg-surface-dim">
      {/* Header do Portal */}
      <PortalHeader user={user} />
      
      <div className="flex">
        {/* Sidebar Principal */}
        <PortalSidebar user={user} />
        
        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          {children}
        </main>
        
        {/* Sidebar de Tarefas do Portal */}
        <PortalTasksSidebar />
      </div>
    </div>
  );
}
