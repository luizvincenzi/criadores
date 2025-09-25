'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface QuarterlySnapshot {
  id: string;
  business_id: string;
  quarter: string;
  year: number;
  quarter_number: number;
  digital_presence: {
    google: { rating: number; reviews: number };
    instagram: number;
    facebook: number;
    tiktok: number;
    tripadvisor?: { rating: number; rank: number };
  };
  kpis: {
    ocupacao: number;
    ticket: number;
    margemPorcoes: number;
    nps: number;
    ruido: number;
  };
  four_ps_status: {
    produto: string;
    preco: string;
    praca: string;
    promocao: string;
  };
  porter_forces: {
    [key: string]: { score: number; status: string };
  };
  executive_summary: {
    green: string[];
    yellow: string[];
    red: string[];
  };
  notes: string;
}

interface EditSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: QuarterlySnapshot | null;
  onSave: (snapshot: QuarterlySnapshot) => Promise<void>;
}

export function EditSnapshotModal({ isOpen, onClose, snapshot, onSave }: EditSnapshotModalProps) {
  const [editedSnapshot, setEditedSnapshot] = useState<QuarterlySnapshot | null>(null);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (snapshot) {
      setEditedSnapshot({ ...snapshot });
    }
  }, [snapshot]);

  if (!isOpen || !editedSnapshot) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await onSave(editedSnapshot);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const updateKPI = (key: string, value: number) => {
    setEditedSnapshot(prev => prev ? {
      ...prev,
      kpis: { ...prev.kpis, [key]: value }
    } : null);
  };

  const updateDigitalPresence = (platform: string, field: string, value: number) => {
    setEditedSnapshot(prev => {
      if (!prev) return null;
      
      if (platform === 'google' || platform === 'tripadvisor') {
        return {
          ...prev,
          digital_presence: {
            ...prev.digital_presence,
            [platform]: {
              ...prev.digital_presence[platform as keyof typeof prev.digital_presence],
              [field]: value
            }
          }
        };
      } else {
        return {
          ...prev,
          digital_presence: {
            ...prev.digital_presence,
            [platform]: value
          }
        };
      }
    });
  };

  const update4PStatus = (p: string, status: string) => {
    setEditedSnapshot(prev => prev ? {
      ...prev,
      four_ps_status: { ...prev.four_ps_status, [p]: status }
    } : null);
  };

  const updatePorterForce = (force: string, field: string, value: number | string) => {
    setEditedSnapshot(prev => prev ? {
      ...prev,
      porter_forces: {
        ...prev.porter_forces,
        [force]: { ...prev.porter_forces[force], [field]: value }
      }
    } : null);
  };

  const updateExecutiveSummary = (category: 'green' | 'yellow' | 'red', items: string[]) => {
    setEditedSnapshot(prev => prev ? {
      ...prev,
      executive_summary: { ...prev.executive_summary, [category]: items }
    } : null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Editar Snapshot - {editedSnapshot.quarter}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* KPIs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">KPIs Críticos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(editedSnapshot.kpis).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {key === 'ocupacao' ? 'Ocupação Sex/Sáb (%)' :
                     key === 'ticket' ? 'Ticket Médio (R$)' :
                     key === 'margemPorcoes' ? 'Margem Porções (%)' :
                     key === 'nps' ? 'NPS' :
                     key === 'ruido' ? 'Reclamações Ruído (/mês)' : key}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateKPI(key, Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Presença Digital */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Presença Digital</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Google Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={editedSnapshot.digital_presence.google.rating}
                  onChange={(e) => updateDigitalPresence('google', 'rating', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Google Reviews</label>
                <input
                  type="number"
                  value={editedSnapshot.digital_presence.google.reviews}
                  onChange={(e) => updateDigitalPresence('google', 'reviews', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Instagram Seguidores</label>
                <input
                  type="number"
                  value={editedSnapshot.digital_presence.instagram}
                  onChange={(e) => updateDigitalPresence('instagram', '', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Facebook Seguidores</label>
                <input
                  type="number"
                  value={editedSnapshot.digital_presence.facebook}
                  onChange={(e) => updateDigitalPresence('facebook', '', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 4 Ps do Marketing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">4 Ps do Marketing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(editedSnapshot.four_ps_status).map(([key, status]) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {key === 'produto' ? 'Produto' :
                     key === 'preco' ? 'Preço' :
                     key === 'praca' ? 'Praça' :
                     key === 'promocao' ? 'Promoção' : key}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => update4PStatus(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="green">Verde (Excelente)</option>
                    <option value="yellow">Amarelo (Atenção)</option>
                    <option value="red">Vermelho (Crítico)</option>
                    <option value="gray">Cinza (Não avaliado)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas e Observações</h3>
            <textarea
              value={editedSnapshot.notes}
              onChange={(e) => setEditedSnapshot(prev => prev ? { ...prev, notes: e.target.value } : null)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Adicione observações sobre este trimestre..."
            />
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
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditSnapshotModal;
