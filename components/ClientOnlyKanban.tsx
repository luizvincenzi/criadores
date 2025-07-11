'use client';

import React, { useEffect, useState } from 'react';
import KanbanBoard from './KanbanBoard';

interface ClientOnlyKanbanProps {
  className?: string;
}

export default function ClientOnlyKanban({ className }: ClientOnlyKanbanProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skeleton loading para as 3 colunas */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-elevated p-6 min-h-96">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-surface-container rounded-xl"></div>
                  <div>
                    <div className="h-4 bg-surface-container rounded w-24 mb-2"></div>
                    <div className="h-3 bg-surface-container rounded w-32"></div>
                  </div>
                </div>
                <div className="w-8 h-6 bg-surface-container rounded-full"></div>
              </div>
              
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="p-4 bg-surface-container rounded-xl">
                    <div className="h-4 bg-surface-variant rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-surface-variant rounded w-1/2 mb-3"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-surface-variant rounded w-16"></div>
                      <div className="h-3 bg-surface-variant rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <KanbanBoard className={className} />;
}
