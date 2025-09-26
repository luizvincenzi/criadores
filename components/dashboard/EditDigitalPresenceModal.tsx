'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Globe2, Star, Users } from 'lucide-react';

interface DigitalPresence {
  google: { rating: number; reviews: number };
  instagram: number;
  facebook: number;
  tiktok: number;
  tripadvisor?: { rating: number; rank: number };
}

interface EditDigitalPresenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  digitalPresence: DigitalPresence;
  onSave: (digitalPresence: DigitalPresence) => Promise<void>;
}

export function EditDigitalPresenceModal({ isOpen, onClose, digitalPresence, onSave }: EditDigitalPresenceModalProps) {
  const [editedPresence, setEditedPresence] = useState<DigitalPresence>(digitalPresence);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedPresence(digitalPresence);
  }, [digitalPresence]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSave(editedPresence);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar presença digital');
    } finally {
      setLoading(false);
    }
  };

  const updateGoogle = (field: 'rating' | 'reviews', value: number) => {
    setEditedPresence(prev => ({
      ...prev,
      google: { ...prev.google, [field]: value }
    }));
  };

  const updateTripadvisor = (field: 'rating' | 'rank', value: number) => {
    setEditedPresence(prev => ({
      ...prev,
      tripadvisor: { ...prev.tripadvisor, [field]: value }
    }));
  };

  const updateSocial = (platform: 'instagram' | 'facebook' | 'tiktok', value: number) => {
    setEditedPresence(prev => ({ ...prev, [platform]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Globe2 className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Presença Digital</h2>
          </div>
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

          {/* Google Reviews */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Star className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-800">Google Reviews</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Avaliação (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editedPresence.google.rating}
                  onChange={(e) => updateGoogle('rating', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Número de Avaliações
                </label>
                <input
                  type="number"
                  min="0"
                  value={editedPresence.google.reviews}
                  onChange={(e) => updateGoogle('reviews', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tripadvisor */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Globe2 className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-800">Tripadvisor</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Avaliação (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editedPresence.tripadvisor?.rating || 0}
                  onChange={(e) => updateTripadvisor('rating', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ranking na Região
                </label>
                <input
                  type="number"
                  min="0"
                  value={editedPresence.tripadvisor?.rank || 0}
                  onChange={(e) => updateTripadvisor('rank', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-purple-800">Redes Sociais</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Instagram Seguidores
                </label>
                <input
                  type="number"
                  min="0"
                  value={editedPresence.instagram}
                  onChange={(e) => updateSocial('instagram', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Facebook Seguidores
                </label>
                <input
                  type="number"
                  min="0"
                  value={editedPresence.facebook}
                  onChange={(e) => updateSocial('facebook', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  TikTok Seguidores
                </label>
                <input
                  type="number"
                  min="0"
                  value={editedPresence.tiktok}
                  onChange={(e) => updateSocial('tiktok', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview da Presença Digital:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded border text-center">
                <div className="text-lg font-bold text-blue-600">
                  {editedPresence.google.rating.toFixed(1)}/5
                </div>
                <div className="text-xs text-gray-600">Google ({editedPresence.google.reviews} avaliações)</div>
              </div>
              <div className="bg-white p-3 rounded border text-center">
                <div className="text-lg font-bold text-green-600">
                  {editedPresence.tripadvisor?.rating?.toFixed(1) || '0'}/5
                </div>
                <div className="text-xs text-gray-600">Tripadvisor (#{editedPresence.tripadvisor?.rank || 0})</div>
              </div>
              <div className="bg-white p-3 rounded border text-center">
                <div className="text-lg font-bold text-purple-600">
                  {editedPresence.instagram.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-gray-600">Instagram</div>
              </div>
              <div className="bg-white p-3 rounded border text-center">
                <div className="text-lg font-bold text-blue-600">
                  {editedPresence.facebook.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-gray-600">Facebook</div>
              </div>
              <div className="bg-white p-3 rounded border text-center">
                <div className="text-lg font-bold text-pink-600">
                  {editedPresence.tiktok.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-gray-600">TikTok</div>
              </div>
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
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Presença Digital'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditDigitalPresenceModal;
