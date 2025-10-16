'use client';

import React, { useState } from 'react';
import type { SWOTContent, SWOTItem } from '@/types/strategic-map';

interface SWOTEditorProps {
  content: SWOTContent;
  onSave: (content: SWOTContent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function SWOTEditor({ content, onSave, onCancel, isSaving }: SWOTEditorProps) {
  const [editedContent, setEditedContent] = useState<SWOTContent>(content);

  const addItem = (category: keyof SWOTContent) => {
    const newItem: SWOTItem = {
      id: `${category[0]}${Date.now()}`,
      text: '',
      impact: 'medium',
      evidence: '',
    };
    setEditedContent({
      ...editedContent,
      [category]: [...(editedContent[category] || []), newItem],
    });
  };

  const updateItem = (category: keyof SWOTContent, index: number, field: keyof SWOTItem, value: string) => {
    const items = [...(editedContent[category] || [])];
    items[index] = { ...items[index], [field]: value };
    setEditedContent({ ...editedContent, [category]: items });
  };

  const removeItem = (category: keyof SWOTContent, index: number) => {
    const items = [...(editedContent[category] || [])];
    items.splice(index, 1);
    setEditedContent({ ...editedContent, [category]: items });
  };

  const renderCategory = (
    category: keyof SWOTContent,
    title: string,
    icon: string,
    colorClass: string
  ) => {
    const items = editedContent[category] || [];
    
    return (
      <div className={`p-4 rounded-lg border ${colorClass}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold flex items-center gap-2">
            <span>{icon}</span>
            {title}
          </h4>
          <button
            onClick={() => addItem(category)}
            className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            + Adicionar
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${category}-${index}-${item.id}`} className="bg-white p-3 rounded border border-gray-200 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateItem(category, index, 'text', e.target.value)}
                  placeholder="Descrição..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => removeItem(category, index)}
                  className="px-2 text-red-600 hover:text-red-800"
                  title="Remover"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-2">
                <select
                  value={item.impact}
                  onChange={(e) => updateItem(category, index, 'impact', e.target.value)}
                  className="px-3 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">Alto Impacto</option>
                  <option value="medium">Médio Impacto</option>
                  <option value="low">Baixo Impacto</option>
                </select>
                <input
                  type="text"
                  value={item.evidence || ''}
                  onChange={(e) => updateItem(category, index, 'evidence', e.target.value)}
                  placeholder="Evidência (opcional)..."
                  className="flex-1 px-3 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Modo de Edição</h4>
            <p className="text-sm text-yellow-800">
              Edite os campos abaixo. As alterações serão salvas no banco de dados e uma nova versão será criada automaticamente.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {renderCategory('strengths', 'Forças', '✅', 'bg-green-50 border-green-200')}
        {renderCategory('weaknesses', 'Fraquezas', '⚠️', 'bg-red-50 border-red-200')}
        {renderCategory('opportunities', 'Oportunidades', '📈', 'bg-blue-50 border-blue-200')}
        {renderCategory('threats', 'Ameaças', '⚡', 'bg-orange-50 border-orange-200')}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSave(editedContent)}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Salvando...
            </>
          ) : (
            'Salvar Alterações'
          )}
        </button>
      </div>
    </div>
  );
}

