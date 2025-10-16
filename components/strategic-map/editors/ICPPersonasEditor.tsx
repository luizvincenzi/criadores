'use client';

import React, { useState } from 'react';
import type { ICPPersonasContent, Persona, PersonaDetail } from '@/types/strategic-map';

interface ICPPersonasEditorProps {
  content: ICPPersonasContent;
  onSave: (content: ICPPersonasContent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ICPPersonasEditor({ content, onSave, onCancel, isSaving }: ICPPersonasEditorProps) {
  const [editedContent, setEditedContent] = useState<ICPPersonasContent>({
    personas: content.personas || [
      {
        name: 'Persona Principal',
        icon: '👤',
        status: 'Primary ICP',
        details: [
          { label: 'Idade', value: '28-38 anos' },
          { label: 'Renda', value: 'R$ 8.000-15.000' },
          { label: 'Profissão', value: 'Profissional liberal' },
          { label: 'Localização', value: 'Centro de Londrina' }
        ],
        motivations: 'Experiências únicas e instagramáveis',
        pains: 'Dificuldade em conseguir reserva, busca lugares únicos',
        channels: 'Instagram, indicações de amigos',
        quote: 'Quero um lugar especial para comemorar momentos importantes'
      }
    ],
    matrix: content.matrix || {}
  });

  const updatePersona = (index: number, field: keyof Persona, value: any) => {
    const updatedPersonas = [...(editedContent.personas || [])];
    if (updatedPersonas[index]) {
      updatedPersonas[index] = { ...updatedPersonas[index], [field]: value };
      setEditedContent({
        ...editedContent,
        personas: updatedPersonas,
      });
    }
  };

  const updatePersonaDetail = (personaIndex: number, detailIndex: number, value: string) => {
    const updatedPersonas = [...(editedContent.personas || [])];
    if (updatedPersonas[personaIndex]?.details?.[detailIndex]) {
      updatedPersonas[personaIndex].details![detailIndex].value = value;
      setEditedContent({
        ...editedContent,
        personas: updatedPersonas,
      });
    }
  };

  const addPersona = () => {
    const newPersona: Persona = {
      name: `Persona ${editedContent.personas?.length ? editedContent.personas.length + 1 : 1}`,
      icon: '👤',
      status: 'Secondary ICP',
      details: [
        { label: 'Idade', value: '' },
        { label: 'Renda', value: '' },
        { label: 'Profissão', value: '' },
        { label: 'Localização', value: '' }
      ],
      motivations: '',
      pains: '',
      channels: '',
      quote: ''
    };

    setEditedContent({
      ...editedContent,
      personas: [...(editedContent.personas || []), newPersona],
    });
  };

  const removePersona = (index: number) => {
    const updatedPersonas = (editedContent.personas || []).filter((_, i) => i !== index);
    setEditedContent({
      ...editedContent,
      personas: updatedPersonas,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Modo de Edição</h4>
            <p className="text-sm text-yellow-800">
              Edite as informações dos perfis de clientes ideais (ICP).
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Personas */}
      <div className="space-y-6">
        {editedContent.personas?.map((persona, personaIndex) => (
          <div key={personaIndex} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                {persona.icon || '👤'} Persona {personaIndex + 1}
                {personaIndex === 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Principal</span>}
              </h4>
              {editedContent.personas && editedContent.personas.length > 1 && (
                <button
                  onClick={() => removePersona(personaIndex)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  🗑️ Remover
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Persona</label>
                <input
                  type="text"
                  value={persona.name || ''}
                  onChange={(e) => updatePersona(personaIndex, 'name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                <input
                  type="text"
                  value={persona.icon || ''}
                  onChange={(e) => updatePersona(personaIndex, 'icon', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Detalhes Demográficos */}
            <div className="mt-6">
              <h5 className="font-medium text-gray-800 mb-3">Informações Demográficas</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {persona.details?.map((detail, detailIndex) => (
                  <div key={detailIndex}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{detail.label}</label>
                    <input
                      type="text"
                      value={detail.value}
                      onChange={(e) => updatePersonaDetail(personaIndex, detailIndex, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Motivações */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivações</label>
              <textarea
                value={persona.motivations || ''}
                onChange={(e) => updatePersona(personaIndex, 'motivations', e.target.value)}
                placeholder="O que motiva esta persona?"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dores */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dores e Desafios</label>
              <textarea
                value={persona.pains || ''}
                onChange={(e) => updatePersona(personaIndex, 'pains', e.target.value)}
                placeholder="Quais são as principais dores desta persona?"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Canais */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Canais de Comunicação</label>
              <textarea
                value={persona.channels || ''}
                onChange={(e) => updatePersona(personaIndex, 'channels', e.target.value)}
                placeholder="Onde esta persona consome conteúdo?"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Citação */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Citação Representativa</label>
              <textarea
                value={persona.quote || ''}
                onChange={(e) => updatePersona(personaIndex, 'quote', e.target.value)}
                placeholder="Uma frase que representa o pensamento desta persona"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}

        {/* Botão para adicionar persona */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <button
            onClick={addPersona}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Adicionar Nova Persona
          </button>
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