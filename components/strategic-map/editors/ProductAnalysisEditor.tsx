'use client';

import React, { useState } from 'react';
import type { ProductAnalysisContent } from '@/types/strategic-map';

interface ProductAnalysisEditorProps {
  content: ProductAnalysisContent;
  onSave: (content: ProductAnalysisContent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ProductAnalysisEditor({ content, onSave, onCancel, isSaving }: ProductAnalysisEditorProps) {
  const [editedContent, setEditedContent] = useState<ProductAnalysisContent>(content);

  const addStrength = () => {
    setEditedContent({
      ...editedContent,
      strengths: [...(editedContent.strengths || []), ''],
    });
  };

  const updateStrength = (index: number, value: string) => {
    const strengths = [...(editedContent.strengths || [])];
    strengths[index] = value;
    setEditedContent({ ...editedContent, strengths });
  };

  const removeStrength = (index: number) => {
    const strengths = [...(editedContent.strengths || [])];
    strengths.splice(index, 1);
    setEditedContent({ ...editedContent, strengths });
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Modo de Edição</h4>
            <p className="text-sm text-yellow-800">
              Edite a análise do produto abaixo.
            </p>
          </div>
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">💪 Pontos Fortes do Produto</h4>
          <button
            onClick={addStrength}
            className="text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Adicionar
          </button>
        </div>
        <div className="space-y-3">
          {editedContent.strengths?.map((strength, index) => (
            <div key={`strength-${index}`} className="flex gap-2">
              <textarea
                value={strength}
                onChange={(e) => updateStrength(index, e.target.value)}
                placeholder="Descreva um ponto forte do produto..."
                rows={2}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeStrength(index)}
                className="px-2 text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">📋 Análise do Menu/Portfólio</h4>
        <textarea
          value={editedContent.menu_analysis}
          onChange={(e) => setEditedContent({ ...editedContent, menu_analysis: e.target.value })}
          placeholder="Análise do portfólio de produtos/serviços..."
          rows={6}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Differentiation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">✨ Diferenciação</h4>
        <textarea
          value={editedContent.differentiation}
          onChange={(e) => setEditedContent({ ...editedContent, differentiation: e.target.value })}
          placeholder="Como o produto se diferencia no mercado..."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quality Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">⭐ Pontuação de Qualidade</h4>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={editedContent.quality_score}
            onChange={(e) => setEditedContent({ ...editedContent, quality_score: parseFloat(e.target.value) })}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-2xl font-bold text-blue-600 min-w-[60px]">
            {editedContent.quality_score}/10
          </span>
        </div>
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

