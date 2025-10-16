import React from 'react';
import type { SWOTContent, SWOTItem } from '@/types/strategic-map';

interface SWOTSectionProps {
  content: SWOTContent;
}

export function SWOTSection({ content }: SWOTSectionProps) {
  // Helper function to extract text from SWOTItem (object) or string
  const getText = (item: SWOTItem | string): string => {
    if (typeof item === 'string') return item;
    return item.text || '';
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-700">
      {/* Forças */}
      <div className="p-5 rounded-lg border border-green-200 bg-green-50">
        <h4 className="font-semibold mb-3 text-green-800">Forças</h4>
        <ul className="space-y-2 text-sm">
          {content.strengths?.map((item, index) => (
            <li key={index} className="flex gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mt-0.5 text-green-600 shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>{getText(item)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Fraquezas */}
      <div className="p-5 rounded-lg border border-red-200 bg-red-50">
        <h4 className="font-semibold mb-3 text-red-800">Fraquezas</h4>
        <ul className="space-y-2 text-sm">
          {content.weaknesses?.map((item, index) => (
            <li key={index} className="flex gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mt-0.5 text-red-600 shrink-0">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" x2="12" y1="8" y2="12"/>
                <line x1="12" x2="12.01" y1="16" y2="16"/>
              </svg>
              <span>{getText(item)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Oportunidades */}
      <div className="p-5 rounded-lg border border-sky-200 bg-sky-50">
        <h4 className="font-semibold mb-3 text-sky-800">Oportunidades</h4>
        <ul className="space-y-2 text-sm">
          {content.opportunities?.map((item, index) => (
            <li key={index} className="flex gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mt-0.5 text-sky-600 shrink-0">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                <polyline points="16 7 22 7 22 13"/>
              </svg>
              <span>{getText(item)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ameaças */}
      <div className="p-5 rounded-lg border border-orange-200 bg-orange-50">
        <h4 className="font-semibold mb-3 text-orange-800">Ameaças</h4>
        <ul className="space-y-2 text-sm">
          {content.threats?.map((item, index) => (
            <li key={index} className="flex gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mt-0.5 text-orange-600 shrink-0">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                <path d="M12 8v4"/>
                <path d="M12 16h.01"/>
              </svg>
              <span>{getText(item)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

