'use client';

import React from 'react';
import { useBusinessStore } from '@/store/businessStore';

export default function DebugPanel() {
  const { businesses, getBusinessesByStage } = useBusinessStore();

  const stages = ['Reunião Briefing', 'Agendamentos', 'Entrega Final'];

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h4 className="font-bold text-sm mb-2">Debug - Distribuição dos Negócios</h4>
      <div className="space-y-2 text-xs">
        {stages.map(stage => {
          const stageBusinesses = getBusinessesByStage(stage as any);
          return (
            <div key={stage} className="flex justify-between">
              <span className="truncate">{stage}:</span>
              <span className="font-mono">{stageBusinesses.length}</span>
            </div>
          );
        })}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span className="font-mono">{businesses.length}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t">
        <h5 className="font-bold text-xs mb-1">Últimos negócios:</h5>
        <div className="space-y-1 max-h-20 overflow-y-auto">
          {businesses.slice(0, 3).map(business => (
            <div key={business.id} className="text-xs">
              <div className="font-medium truncate">{business.businessName}</div>
              <div className="text-gray-500">{business.journeyStage}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
