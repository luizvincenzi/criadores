'use client';

import React, { useState } from 'react';
import type { KPITableContent, ICPKPI, ICPMetrics } from '@/types/strategic-map';

interface KPITableEditorProps {
  content: KPITableContent;
  onSave: (content: KPITableContent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function KPITableEditor({ content, onSave, onCancel, isSaving }: KPITableEditorProps) {
  const [editedContent, setEditedContent] = useState<KPITableContent>(content);

  const addICP = () => {
    const newICP: ICPKPI = {
      id: `icp${Date.now()}`,
      name: '',
      icon: '👤',
      matrix: 'core',
      metrics: {
        cac: { value: 0, editable: true },
        ltv: { value: 0, editable: true },
        retention: { value: 0, editable: true },
        avg_ticket: { value: 0, editable: true },
        main_channel: { value: '', editable: true },
        base_percentage: { value: 0, editable: true },
      },
    };
    setEditedContent({
      ...editedContent,
      icps: [...(editedContent.icps || []), newICP],
    });
  };

  const updateICP = (index: number, field: keyof ICPKPI, value: any) => {
    const icps = [...(editedContent.icps || [])];
    icps[index] = { ...icps[index], [field]: value };
    setEditedContent({ ...editedContent, icps });
  };

  const updateMetric = (icpIndex: number, metricKey: keyof ICPMetrics, value: any) => {
    const icps = [...(editedContent.icps || [])];
    icps[icpIndex].metrics = {
      ...icps[icpIndex].metrics,
      [metricKey]: { ...icps[icpIndex].metrics[metricKey], value },
    };
    setEditedContent({ ...editedContent, icps });
  };

  const removeICP = (index: number) => {
    const icps = [...(editedContent.icps || [])];
    icps.splice(index, 1);
    setEditedContent({ ...editedContent, icps });
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Modo de Edição</h4>
            <p className="text-sm text-yellow-800">
              Edite os indicadores de performance por ICP.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">📊 ICPs e Métricas</h4>
        <button
          onClick={addICP}
          className="text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Adicionar ICP
        </button>
      </div>

      <div className="space-y-6">
        {editedContent.icps?.map((icp, icpIndex) => (
          <div key={`icp-${icpIndex}-${icp.id}`} className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-4">
            {/* ICP Header */}
            <div className="flex gap-3 pb-4 border-b">
              <input
                type="text"
                value={icp.icon}
                onChange={(e) => updateICP(icpIndex, 'icon', e.target.value)}
                placeholder="Ícone"
                className="w-16 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={icp.name}
                onChange={(e) => updateICP(icpIndex, 'name', e.target.value)}
                placeholder="Nome do ICP..."
                className="flex-1 px-3 py-2 text-sm font-semibold border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={icp.matrix}
                onChange={(e) => updateICP(icpIndex, 'matrix', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="core">Core</option>
                <option value="premium">Premium</option>
                <option value="volume">Volume</option>
                <option value="anti">Anti</option>
              </select>
              <button
                onClick={() => removeICP(icpIndex)}
                className="px-3 text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">CAC (R$)</label>
                <input
                  type="number"
                  value={icp.metrics.cac.value}
                  onChange={(e) => updateMetric(icpIndex, 'cac', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">LTV (R$)</label>
                <input
                  type="number"
                  value={icp.metrics.ltv.value}
                  onChange={(e) => updateMetric(icpIndex, 'ltv', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Retenção (%)</label>
                <input
                  type="number"
                  value={icp.metrics.retention.value}
                  onChange={(e) => updateMetric(icpIndex, 'retention', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ticket Médio (R$)</label>
                <input
                  type="number"
                  value={icp.metrics.avg_ticket.value}
                  onChange={(e) => updateMetric(icpIndex, 'avg_ticket', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Canal Principal</label>
                <input
                  type="text"
                  value={icp.metrics.main_channel.value}
                  onChange={(e) => updateMetric(icpIndex, 'main_channel', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">% da Base</label>
                <input
                  type="number"
                  value={icp.metrics.base_percentage.value}
                  onChange={(e) => updateMetric(icpIndex, 'base_percentage', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
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

