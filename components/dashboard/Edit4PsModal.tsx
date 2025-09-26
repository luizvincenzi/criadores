'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Package, CircleDollarSign, MapPin, Megaphone } from 'lucide-react';

interface FourPsStatus {
  produto: string;
  preco: string;
  praca: string;
  promocao: string;
}

interface Edit4PsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fourPsStatus: FourPsStatus;
  onSave: (fourPsStatus: FourPsStatus) => Promise<void>;
}

export function Edit4PsModal({ isOpen, onClose, fourPsStatus, onSave }: Edit4PsModalProps) {
  const [editedStatus, setEditedStatus] = useState<FourPsStatus>(fourPsStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedStatus(fourPsStatus);
  }, [fourPsStatus]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSave(editedStatus);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar 4 Ps do Marketing');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (p: keyof FourPsStatus, status: string) => {
    setEditedStatus(prev => ({ ...prev, [p]: status }));
  };

  const statusOptions = [
    { value: 'green', label: 'Verde (Excelente)', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'yellow', label: 'Amarelo (Atenção)', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'red', label: 'Vermelho (Crítico)', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'gray', label: 'Cinza (Não avaliado)', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];

  const psConfig = [
    {
      key: 'produto' as keyof FourPsStatus,
      title: 'Produto',
      icon: Package,
      description: 'Qualidade, variedade e adequação do produto/serviço',
      examples: ['Cardápio família', 'Porções para compartilhar', 'Playground']
    },
    {
      key: 'preco' as keyof FourPsStatus,
      title: 'Preço',
      icon: CircleDollarSign,
      description: 'Estratégia de precificação e percepção de valor',
      examples: ['Preço-âncora por categoria', 'Combo família + cover incluso']
    },
    {
      key: 'praca' as keyof FourPsStatus,
      title: 'Praça',
      icon: MapPin,
      description: 'Localização, distribuição e canais de venda',
      examples: ['Densidade familiar Zona Sul', 'Acesso fácil', 'Delivery']
    },
    {
      key: 'promocao' as keyof FourPsStatus,
      title: 'Promoção',
      icon: Megaphone,
      description: 'Comunicação, marketing e relacionamento',
      examples: ['Calendário mensal com CTAs', 'Parcerias com criadores']
    }
  ];

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Editar 4 Ps do Marketing</h2>
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
            {psConfig.map((config) => {
              const Icon = config.icon;
              const currentStatus = editedStatus[config.key];
              
              return (
                <div key={config.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{config.title}</h3>
                      <p className="text-sm text-gray-600">{config.description}</p>
                    </div>
                  </div>

                  {/* Status Options */}
                  <div className="space-y-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Status Atual:
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {statusOptions.map((option) => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`status-${config.key}`}
                            value={option.value}
                            checked={currentStatus === option.value}
                            onChange={(e) => updateStatus(config.key, e.target.value)}
                            className="sr-only"
                          />
                          <div className={`flex-1 p-2 rounded border text-sm transition-all ${
                            currentStatus === option.value 
                              ? option.color + ' ring-2 ring-offset-1 ring-blue-500' 
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}>
                            {option.label}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="bg-gray-50 rounded p-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Exemplos:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {config.examples.map((example, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-400 mr-1">•</span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview dos 4 Ps:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {psConfig.map((config) => {
                const Icon = config.icon;
                const status = editedStatus[config.key];
                
                return (
                  <div key={config.key} className={`p-3 rounded border text-center ${getStatusColor(status)}`}>
                    <Icon className="h-5 w-5 mx-auto mb-1" />
                    <div className="font-medium text-sm">{config.title}</div>
                    <div className="text-xs opacity-75 capitalize">{status}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Resumo do Status:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-green-600">
                  {Object.values(editedStatus).filter(s => s === 'green').length}
                </div>
                <div className="text-green-700">Excelentes</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">
                  {Object.values(editedStatus).filter(s => s === 'yellow').length}
                </div>
                <div className="text-yellow-700">Atenção</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600">
                  {Object.values(editedStatus).filter(s => s === 'red').length}
                </div>
                <div className="text-red-700">Críticos</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-600">
                  {Object.values(editedStatus).filter(s => s === 'gray').length}
                </div>
                <div className="text-gray-700">Não avaliados</div>
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
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar 4 Ps'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Edit4PsModal;
