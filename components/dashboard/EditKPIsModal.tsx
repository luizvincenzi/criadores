'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Target } from 'lucide-react';

interface KPIs {
  ocupacao: number;
  ticket: number;
  margemPorcoes: number;
  nps: number;
  ruido: number;
}

interface EditKPIsModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpis: KPIs;
  onSave: (kpis: KPIs) => Promise<void>;
}

export function EditKPIsModal({ isOpen, onClose, kpis, onSave }: EditKPIsModalProps) {
  const [editedKPIs, setEditedKPIs] = useState<KPIs>(kpis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedKPIs(kpis);
  }, [kpis]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSave(editedKPIs);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar KPIs');
    } finally {
      setLoading(false);
    }
  };

  const updateKPI = (key: keyof KPIs, value: number) => {
    setEditedKPIs(prev => ({ ...prev, [key]: value }));
  };

  const kpiConfig = [
    {
      key: 'ocupacao' as keyof KPIs,
      label: 'Ocupação Sex/Sáb',
      unit: '%',
      target: '≥ 75%',
      min: 0,
      max: 100,
      step: 1
    },
    {
      key: 'ticket' as keyof KPIs,
      label: 'Ticket Médio',
      unit: 'R$',
      target: 'R$ 68',
      min: 0,
      max: 500,
      step: 1
    },
    {
      key: 'margemPorcoes' as keyof KPIs,
      label: 'Margem Porções',
      unit: '%',
      target: '≥ 65%',
      min: 0,
      max: 100,
      step: 1
    },
    {
      key: 'nps' as keyof KPIs,
      label: 'NPS Mensal',
      unit: '',
      target: '≥ 75',
      min: -100,
      max: 100,
      step: 1
    },
    {
      key: 'ruido' as keyof KPIs,
      label: 'Reclamações de Ruído',
      unit: '/mês',
      target: '0/mês',
      min: 0,
      max: 50,
      step: 1
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Editar KPIs Críticos</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kpiConfig.map((config) => (
              <div key={config.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    {config.label}
                  </label>
                  <span className="text-xs text-gray-500">Meta: {config.target}</span>
                </div>
                
                <div className="relative">
                  <input
                    type="number"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={editedKPIs[config.key]}
                    onChange={(e) => updateKPI(config.key, Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">
                    {config.unit}
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  value={editedKPIs[config.key]}
                  onChange={(e) => updateKPI(config.key, Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{config.min}{config.unit}</span>
                  <span>{config.max}{config.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview dos KPIs:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {kpiConfig.map((config) => {
                const value = editedKPIs[config.key];
                const isGood = config.key === 'ruido' ? value === 0 : 
                              config.key === 'ocupacao' ? value >= 75 :
                              config.key === 'ticket' ? value >= 68 :
                              config.key === 'margemPorcoes' ? value >= 65 :
                              config.key === 'nps' ? value >= 75 : false;
                
                return (
                  <div key={config.key} className={`p-2 rounded text-center text-xs ${
                    isGood ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <div className="font-medium">{value}{config.unit}</div>
                    <div className="opacity-75">{config.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar KPIs'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditKPIsModal;
