'use client';

import React from 'react';
import { useBusinessStore } from '@/store/businessStore';
import Button from './ui/Button';

export default function TestMoveButton() {
  const { businesses, moveBusinessStage } = useBusinessStore();

  const testMove = () => {
    if (businesses.length > 0) {
      const firstBusiness = businesses[0];
      const stages = ['Reunião Briefing', 'Agendamentos', 'Entrega Final'];
      const currentIndex = stages.indexOf(firstBusiness.journeyStage);
      const nextIndex = (currentIndex + 1) % stages.length;
      const newStage = stages[nextIndex];
      
      console.log(`🧪 Teste: Movendo "${firstBusiness.businessName}" para "${newStage}"`);
      moveBusinessStage(firstBusiness.id, newStage as any);
    }
  };

  return (
    <Button 
      variant="tertiary" 
      size="sm" 
      onClick={testMove}
      disabled={businesses.length === 0}
    >
      🧪 Teste Mover
    </Button>
  );
}
