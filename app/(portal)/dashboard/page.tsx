'use client';

import React from 'react';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import EmpresaDashboard from '@/components/portal/EmpresaDashboard';
import CriadorDashboard from '@/components/portal/CriadorDashboard';

export default function PortalDashboardPage() {
  const { user } = usePortalAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            Dashboard
          </h1>
          <p className="text-on-surface-variant">
            {user.user_type === 'empresa' 
              ? 'Acompanhe suas campanhas e métricas' 
              : 'Visualize sua performance e campanhas ativas'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-on-surface-variant">
          <span>{user.user_type === 'empresa' ? '🏢' : '🎨'}</span>
          <span>{user.user_type === 'empresa' ? 'Empresa' : 'Criador'}</span>
        </div>
      </div>

      {/* Dashboard Content */}
      {user.user_type === 'empresa' ? (
        <EmpresaDashboard user={user} />
      ) : (
        <CriadorDashboard user={user} />
      )}
    </div>
  );
}
