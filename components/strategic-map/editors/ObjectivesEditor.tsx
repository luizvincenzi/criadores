'use client';

import React, { useState } from 'react';
import type { ObjectivesContent, Objective, ActionPlan } from '@/types/strategic-map';

interface ObjectivesEditorProps {
  content: ObjectivesContent;
  onSave: (content: ObjectivesContent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ObjectivesEditor({ content, onSave, onCancel, isSaving }: ObjectivesEditorProps) {
  const [editedContent, setEditedContent] = useState<ObjectivesContent>(content);

  // Strategic Objectives
  const addObjective = () => {
    const newObjective: Objective = {
      id: `obj${Date.now()}`,
      title: '',
      description: '',
      icon: '🎯',
    };
    setEditedContent({
      ...editedContent,
      strategic_objectives: [...(editedContent.strategic_objectives || []), newObjective],
    });
  };

  const updateObjective = (index: number, field: keyof Objective, value: string) => {
    const objectives = [...(editedContent.strategic_objectives || [])];
    objectives[index] = { ...objectives[index], [field]: value };
    setEditedContent({ ...editedContent, strategic_objectives: objectives });
  };

  const removeObjective = (index: number) => {
    const objectives = [...(editedContent.strategic_objectives || [])];
    objectives.splice(index, 1);
    setEditedContent({ ...editedContent, strategic_objectives: objectives });
  };

  // Action Plans
  const addActionPlan = () => {
    const newPlan: ActionPlan = {
      id: `plan${Date.now()}`,
      title: '',
      objective: '',
      key_results: [],
    };
    setEditedContent({
      ...editedContent,
      action_plans: [...(editedContent.action_plans || []), newPlan],
    });
  };

  const updateActionPlan = (index: number, field: keyof ActionPlan, value: any) => {
    const plans = [...(editedContent.action_plans || [])];
    plans[index] = { ...plans[index], [field]: value };
    setEditedContent({ ...editedContent, action_plans: plans });
  };

  const removeActionPlan = (index: number) => {
    const plans = [...(editedContent.action_plans || [])];
    plans.splice(index, 1);
    setEditedContent({ ...editedContent, action_plans: plans });
  };

  const addKeyResult = (planIndex: number) => {
    const newKR = {
      id: `kr${Date.now()}`,
      text: '',
    };
    const plans = [...(editedContent.action_plans || [])];
    plans[planIndex].key_results = [
      ...(plans[planIndex].key_results || []),
      newKR,
    ];
    setEditedContent({ ...editedContent, action_plans: plans });
  };

  const updateKeyResult = (planIndex: number, krIndex: number, value: string) => {
    const plans = [...(editedContent.action_plans || [])];
    const keyResults = [...(plans[planIndex].key_results || [])];
    keyResults[krIndex] = { ...keyResults[krIndex], text: value };
    plans[planIndex].key_results = keyResults;
    setEditedContent({ ...editedContent, action_plans: plans });
  };

  const removeKeyResult = (planIndex: number, krIndex: number) => {
    const plans = [...(editedContent.action_plans || [])];
    const keyResults = [...(plans[planIndex].key_results || [])];
    keyResults.splice(krIndex, 1);
    plans[planIndex].key_results = keyResults;
    setEditedContent({ ...editedContent, action_plans: plans });
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Modo de Edição</h4>
            <p className="text-sm text-yellow-800">
              Edite os objetivos estratégicos e planos de ação abaixo.
            </p>
          </div>
        </div>
      </div>

      {/* Strategic Objectives */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800">🎯 Objetivos Estratégicos</h4>
          <button
            onClick={addObjective}
            className="text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Adicionar Objetivo
          </button>
        </div>
        <div className="space-y-3">
          {editedContent.strategic_objectives?.map((objective, objIndex) => (
            <div key={`obj-${objIndex}-${objective.id}`} className="border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={objective.icon}
                  onChange={(e) => updateObjective(objIndex, 'icon', e.target.value)}
                  placeholder="Ícone (emoji)..."
                  className="w-16 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={objective.title}
                  onChange={(e) => updateObjective(objIndex, 'title', e.target.value)}
                  placeholder="Título do objetivo..."
                  className="flex-1 px-3 py-2 text-sm font-semibold border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeObjective(objIndex)}
                  className="px-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
              <textarea
                value={objective.description}
                onChange={(e) => updateObjective(objIndex, 'description', e.target.value)}
                placeholder="Descrição do objetivo..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action Plans */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800">📋 Planos de Ação</h4>
          <button
            onClick={addActionPlan}
            className="text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Adicionar Plano
          </button>
        </div>
        <div className="space-y-4">
          {editedContent.action_plans?.map((plan, planIndex) => (
            <div key={`plan-${planIndex}-${plan.id}`} className="border-2 border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={plan.title}
                  onChange={(e) => updateActionPlan(planIndex, 'title', e.target.value)}
                  placeholder="Título do plano..."
                  className="flex-1 px-3 py-2 text-sm font-semibold border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeActionPlan(planIndex)}
                  className="px-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={plan.objective}
                onChange={(e) => updateActionPlan(planIndex, 'objective', e.target.value)}
                placeholder="Objetivo relacionado..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />

              {/* Key Results */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-xs font-semibold text-gray-700">Key Results</h5>
                  <button
                    onClick={() => addKeyResult(planIndex)}
                    className="text-xs px-2 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                  >
                    + Adicionar KR
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.key_results?.map((kr, krIndex) => (
                    <div key={`kr-${planIndex}-${krIndex}-${kr.id}`} className="flex gap-2">
                      <input
                        type="text"
                        value={kr.text}
                        onChange={(e) => updateKeyResult(planIndex, krIndex, e.target.value)}
                        placeholder="Descrição do key result..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      />
                      <button
                        onClick={() => removeKeyResult(planIndex, krIndex)}
                        className="px-2 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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

