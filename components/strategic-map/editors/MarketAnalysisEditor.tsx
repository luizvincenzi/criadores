'use client';

import React, { useState } from 'react';
import type { MarketAnalysisContent, MarketSearchTerm } from '@/types/strategic-map';

interface MarketAnalysisEditorProps {
  content: MarketAnalysisContent;
  onSave: (content: MarketAnalysisContent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function MarketAnalysisEditor({ content, onSave, onCancel, isSaving }: MarketAnalysisEditorProps) {
  const [editedContent, setEditedContent] = useState<MarketAnalysisContent>(content);

  // Search Terms
  const addSearchTerm = () => {
    const newTerm: MarketSearchTerm = {
      term: '',
      volume: 'medium',
    };
    setEditedContent({
      ...editedContent,
      search_terms: [...(editedContent.search_terms || []), newTerm],
    });
  };

  const updateSearchTerm = (index: number, field: keyof MarketSearchTerm, value: any) => {
    const terms = [...(editedContent.search_terms || [])];
    terms[index] = { ...terms[index], [field]: value };
    setEditedContent({ ...editedContent, search_terms: terms });
  };

  const removeSearchTerm = (index: number) => {
    const terms = [...(editedContent.search_terms || [])];
    terms.splice(index, 1);
    setEditedContent({ ...editedContent, search_terms: terms });
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Modo de Edição</h4>
            <p className="text-sm text-yellow-800">
              Edite os termos de busca, oportunidade principal e vantagem competitiva.
            </p>
          </div>
        </div>
      </div>

      {/* Search Terms */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">🔍 Termos de Busca</h4>
          <button
            onClick={addSearchTerm}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Adicionar
          </button>
        </div>
        <div className="space-y-3">
          {editedContent.search_terms?.map((term, index) => (
            <div key={`term-${index}`} className="border border-gray-200 rounded-lg p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={term.term}
                  onChange={(e) => updateSearchTerm(index, 'term', e.target.value)}
                  placeholder="Termo de busca..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={term.volume}
                  onChange={(e) => updateSearchTerm(index, 'volume', e.target.value as 'high' | 'medium' | 'low')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">Alto Volume</option>
                  <option value="medium">Médio Volume</option>
                  <option value="low">Baixo Volume</option>
                </select>
                <button
                  onClick={() => removeSearchTerm(index)}
                  className="px-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Opportunity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">📈 Oportunidade Principal</h4>
        <textarea
          value={editedContent.main_opportunity}
          onChange={(e) => setEditedContent({ ...editedContent, main_opportunity: e.target.value })}
          placeholder="Descreva a principal oportunidade identificada..."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Competitive Advantage */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">💎 Vantagem Competitiva</h4>
        <textarea
          value={editedContent.competitive_advantage}
          onChange={(e) => setEditedContent({ ...editedContent, competitive_advantage: e.target.value })}
          placeholder="Descreva a principal vantagem competitiva..."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
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

