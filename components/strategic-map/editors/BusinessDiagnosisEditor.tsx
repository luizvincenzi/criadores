'use client';

import React, { useState } from 'react';
import type { BusinessDiagnosisContent, FocusArea } from '@/types/strategic-map';

interface BusinessDiagnosisEditorProps {
  content: BusinessDiagnosisContent;
  onSave: (content: BusinessDiagnosisContent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function BusinessDiagnosisEditor({ content, onSave, onCancel, isSaving }: BusinessDiagnosisEditorProps) {
  const [editedContent, setEditedContent] = useState<BusinessDiagnosisContent>(content);

  const dimensions = [
    { key: 'customer_experience', label: 'Experiência do Cliente', icon: '😊' },
    { key: 'marketing_promotions', label: 'Marketing e Promoções', icon: '📢' },
    { key: 'price_value_perception', label: 'Preço e Percepção de Valor', icon: '💰' },
    { key: 'commercial_relationship', label: 'Relacionamento Comercial', icon: '🤝' },
    { key: 'digital_presence', label: 'Presença Digital', icon: '🌐' },
  ];

  const updateDimension = (key: string, value: number) => {
    setEditedContent({
      ...editedContent,
      dimensions: {
        ...editedContent.dimensions,
        [key]: value,
      },
    });
  };

  const addFocusArea = () => {
    const newArea: FocusArea = {
      id: `fa${Date.now()}`,
      area: '',
      current_state: '',
      desired_state: '',
      priority: 'medium',
    };
    setEditedContent({
      ...editedContent,
      focus_areas: [...(editedContent.focus_areas || []), newArea],
    });
  };

  const updateFocusArea = (index: number, field: keyof FocusArea, value: string) => {
    const areas = [...(editedContent.focus_areas || [])];
    areas[index] = { ...areas[index], [field]: value };
    setEditedContent({ ...editedContent, focus_areas: areas });
  };

  const removeFocusArea = (index: number) => {
    const areas = [...(editedContent.focus_areas || [])];
    areas.splice(index, 1);
    setEditedContent({ ...editedContent, focus_areas: areas });
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Modo de Edição</h4>
            <p className="text-sm text-yellow-800">
              Edite as dimensões e áreas de foco abaixo. As alterações serão salvas no banco de dados.
            </p>
          </div>
        </div>
      </div>

      {/* Dimensões */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Avaliação por Dimensão (0-10)</h4>
        <div className="space-y-4">
          {dimensions.map((dim, dimIndex) => {
            const score = editedContent.dimensions?.[dim.key as keyof typeof editedContent.dimensions] || 0;
            return (
              <div key={`dim-${dimIndex}-${dim.key}`}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {dim.icon} {dim.label}
                  </label>
                  <span className="text-sm font-bold text-blue-600">{score}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={score}
                  onChange={(e) => updateDimension(dim.key, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Áreas de Foco */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Áreas de Foco</h4>
          <button
            onClick={addFocusArea}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Adicionar Área
          </button>
        </div>
        <div className="space-y-4">
          {editedContent.focus_areas?.map((area, index) => (
            <div key={area.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={area.area}
                  onChange={(e) => updateFocusArea(index, 'area', e.target.value)}
                  placeholder="Nome da área..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={area.priority}
                  onChange={(e) => updateFocusArea(index, 'priority', e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
                <button
                  onClick={() => removeFocusArea(index)}
                  className="px-3 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={area.current_state}
                onChange={(e) => updateFocusArea(index, 'current_state', e.target.value)}
                placeholder="Estado atual..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={area.desired_state}
                onChange={(e) => updateFocusArea(index, 'desired_state', e.target.value)}
                placeholder="Estado desejado..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
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

