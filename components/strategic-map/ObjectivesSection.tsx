import React from 'react';
import type { ObjectivesContent } from '@/types/strategic-map';

interface ObjectivesSectionProps {
  content: ObjectivesContent;
}

export function ObjectivesSection({ content }: ObjectivesSectionProps) {
  return (
    <div className="space-y-12">
      {/* Objetivos Estratégicos */}
      <div>
        <h3 className="text-xl font-bold text-center mb-6 text-gray-800">Objetivos Estratégicos</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {content.strategic_objectives?.map((objective, index) => (
            <div key={index} className="border border-stone-200 rounded-lg p-5 bg-stone-50 transition-shadow hover:shadow-md text-center">
              <div className="text-4xl mb-3">{objective.icon || '🎯'}</div>
              <h3 className="text-stone-800 font-semibold mb-2">{objective.title}</h3>
              <p className="text-sm text-stone-600">{objective.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plano de Ação */}
      <div>
        <h3 className="text-xl font-bold text-center mb-6 text-gray-800">Plano de Ação Trimestral</h3>
        <div className="grid lg:grid-cols-3 gap-6">
          {content.action_plans?.map((plan, index) => (
            <div key={index} className="rounded-lg border border-stone-200 p-5 bg-stone-50">
              <div className="flex items-center gap-3 font-semibold text-stone-800 mb-1">
                <span className="text-2xl">📋</span>
                {plan.title}
              </div>
              {plan.objective && (
                <div className="text-xs text-stone-500 mt-1 mb-3">
                  <strong>Objetivo:</strong> {plan.objective}
                </div>
              )}
              <ul className="space-y-2 text-sm text-stone-700">
                {plan.key_results?.map((kr, krIndex) => (
                  <li key={krIndex} className="flex gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>KR: {typeof kr === 'string' ? kr : kr.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

