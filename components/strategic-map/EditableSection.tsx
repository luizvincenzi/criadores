'use client';

import React, { useState } from 'react';
import type { StrategicMapSection } from '@/types/strategic-map';
import { SWOTEditor } from './editors/SWOTEditor';
import { BusinessDiagnosisEditor } from './editors/BusinessDiagnosisEditor';
import { MarketAnalysisEditor } from './editors/MarketAnalysisEditor';
import { ObjectivesEditor } from './editors/ObjectivesEditor';
import { ProductAnalysisEditor } from './editors/ProductAnalysisEditor';
import { KPITableEditor } from './editors/KPITableEditor';
import { MetricsOverviewEditor } from './editors/MetricsOverviewEditor';
import { ICPPersonasEditor } from './editors/ICPPersonasEditor';

interface EditableSectionProps {
  section: StrategicMapSection;
  children: React.ReactNode;
  onUpdate?: (updatedSection: StrategicMapSection) => void;
}

export function EditableSection({ section, children, onUpdate }: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (content: any) => {
    setIsSaving(true);
    setError(null);

    try {
      console.log('🔄 Salvando seção:', section.id, content);

      // Enviar para API usando PUT (método mais compatível)
      const response = await fetch(`/api/strategic-maps/sections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: section.id,
          content,
          change_description: 'Edição manual via interface',
        }),
      });

      console.log('📡 Resposta da API:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro da API:', errorData);
        throw new Error(errorData.error || 'Falha ao salvar alterações');
      }

      const data = await response.json();
      console.log('✅ Dados salvos:', data);

      // Atualizar estado local
      if (onUpdate && data.section) {
        onUpdate(data.section);
      }

      setIsEditing(false);
    } catch (err) {
      console.error('💥 Erro ao salvar:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setIsEditing(false);
  };

  // Renderizar editor específico baseado no tipo de seção
  const renderEditor = () => {
    const editorProps = {
      content: section.content,
      onSave: handleSave,
      onCancel: handleCancel,
      isSaving,
    };

    switch (section.section_type) {
      case 'metrics_overview':
        return <MetricsOverviewEditor {...editorProps} content={section.content as any} />;
      case 'swot':
        return <SWOTEditor {...editorProps} content={section.content as any} />;
      case 'business_diagnosis':
        return <BusinessDiagnosisEditor {...editorProps} content={section.content as any} />;
      case 'market_analysis':
        return <MarketAnalysisEditor {...editorProps} content={section.content as any} />;
      case 'product_analysis':
        return <ProductAnalysisEditor {...editorProps} content={section.content as any} />;
      case 'kpi_table':
        return <KPITableEditor {...editorProps} content={section.content as any} />;
      case 'objectives':
        return <ObjectivesEditor {...editorProps} content={section.content as any} />;
      case 'icp_personas':
        return <ICPPersonasEditor {...editorProps} />;
      default:
        // Fallback para editor JSON genérico
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Modo de Edição</h4>
                  <p className="text-sm text-yellow-800">
                    Edite o JSON abaixo. As alterações serão salvas no banco de dados.
                  </p>
                </div>
              </div>
            </div>
            <textarea
              defaultValue={JSON.stringify(section.content, null, 2)}
              className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              spellCheck={false}
              id="json-editor"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  try {
                    const textarea = document.getElementById('json-editor') as HTMLTextAreaElement;
                    const content = JSON.parse(textarea.value);
                    handleSave(content);
                  } catch (err) {
                    setError('JSON inválido');
                  }
                }}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Botão de Editar - Minimalista */}
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 transition-colors group"
          title="Editar seção"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:scale-110 transition-transform"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
        </button>
      )}

      {/* Modo de Visualização */}
      {!isEditing && children}

      {/* Modo de Edição */}
      {isEditing && (
        <div>
          {renderEditor()}

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-600 mt-0.5 flex-shrink-0"
                >
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" x2="12" y1="8" y2="12"/>
                  <line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

