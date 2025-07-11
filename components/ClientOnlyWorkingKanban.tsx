'use client';

import React, { useEffect, useState } from 'react';
import WorkingKanban from './WorkingKanban';

export default function ClientOnlyWorkingKanban() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Skeleton loading para as 3 colunas */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 min-h-[70vh] shadow-sm">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="w-8 h-6 bg-gray-200 rounded-full"></div>
              </div>
              
              <div className="text-xs text-gray-400 mb-4">
                Total: Carregando...
              </div>
              
              <div className="space-y-2">
                {[1, 2].map((j) => (
                  <div key={j} className="p-3 bg-gray-100 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="flex justify-between mb-2">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="flex space-x-1">
                      <div className="h-6 bg-gray-200 rounded flex-1"></div>
                      <div className="h-6 bg-gray-200 rounded flex-1"></div>
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

  return <WorkingKanban />;
}
