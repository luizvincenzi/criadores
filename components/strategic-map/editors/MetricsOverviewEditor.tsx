'use client';

import React, { useState } from 'react';

interface SocialMetrics {
  followers: number;
  growth_rate: number;
}

interface MetricsOverviewContent {
  google_reviews?: {
    rating: number;
    total: number;
  };
  instagram?: SocialMetrics;
  facebook?: SocialMetrics;
  tiktok?: SocialMetrics;
  main_opportunity?: string;
  competitive_advantage?: string;
}

interface MetricsOverviewEditorProps {
  content: MetricsOverviewContent;
  onSave: (content: MetricsOverviewContent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function MetricsOverviewEditor({ content, onSave, onCancel, isSaving }: MetricsOverviewEditorProps) {
  const [editedContent, setEditedContent] = useState<MetricsOverviewContent>(content);

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Modo de Edição</h4>
            <p className="text-sm text-yellow-800">
              Edite as métricas de redes sociais e avaliações.
            </p>
          </div>
        </div>
      </div>

      {/* Google Reviews */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">⭐ Google Reviews</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avaliação (0-5)</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={editedContent.google_reviews?.rating || 0}
              onChange={(e) => setEditedContent({
                ...editedContent,
                google_reviews: {
                  ...editedContent.google_reviews!,
                  rating: parseFloat(e.target.value),
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total de Avaliações</label>
            <input
              type="number"
              value={editedContent.google_reviews?.total || 0}
              onChange={(e) => setEditedContent({
                ...editedContent,
                google_reviews: {
                  ...editedContent.google_reviews!,
                  total: parseInt(e.target.value),
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Instagram */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">📷 Instagram</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seguidores</label>
            <input
              type="number"
              value={editedContent.instagram?.followers || 0}
              onChange={(e) => setEditedContent({
                ...editedContent,
                instagram: {
                  ...editedContent.instagram!,
                  followers: parseInt(e.target.value),
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Taxa de Crescimento (%)</label>
            <input
              type="number"
              step="0.1"
              value={editedContent.instagram?.growth_rate || 0}
              onChange={(e) => setEditedContent({
                ...editedContent,
                instagram: {
                  ...editedContent.instagram!,
                  growth_rate: parseFloat(e.target.value),
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Facebook */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">👥 Facebook</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seguidores</label>
            <input
              type="number"
              value={editedContent.facebook?.followers || 0}
              onChange={(e) => setEditedContent({
                ...editedContent,
                facebook: {
                  ...editedContent.facebook!,
                  followers: parseInt(e.target.value),
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Taxa de Crescimento (%)</label>
            <input
              type="number"
              step="0.1"
              value={editedContent.facebook?.growth_rate || 0}
              onChange={(e) => setEditedContent({
                ...editedContent,
                facebook: {
                  ...editedContent.facebook!,
                  growth_rate: parseFloat(e.target.value),
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* TikTok */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">🎵 TikTok</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seguidores</label>
            <input
              type="number"
              value={editedContent.tiktok?.followers || 0}
              onChange={(e) => setEditedContent({
                ...editedContent,
                tiktok: {
                  ...editedContent.tiktok!,
                  followers: parseInt(e.target.value),
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Taxa de Crescimento (%)</label>
            <input
              type="number"
              step="0.1"
              value={editedContent.tiktok?.growth_rate || 0}
              onChange={(e) => setEditedContent({
                ...editedContent,
                tiktok: {
                  ...editedContent.tiktok!,
                  growth_rate: parseFloat(e.target.value),
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Opportunity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">📈 Oportunidade Principal</h4>
        <textarea
          value={editedContent.main_opportunity || ''}
          onChange={(e) => setEditedContent({ ...editedContent, main_opportunity: e.target.value })}
          placeholder="Descreva a principal oportunidade..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Competitive Advantage */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">💎 Diferencial Competitivo</h4>
        <textarea
          value={editedContent.competitive_advantage || ''}
          onChange={(e) => setEditedContent({ ...editedContent, competitive_advantage: e.target.value })}
          placeholder="Descreva o diferencial competitivo..."
          rows={3}
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

