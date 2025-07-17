'use client';

import React, { useState } from 'react';

interface BulkOperationsPanelProps {
  selectedSlots: number[];
  availableCreators: any[];
  isProcessing: boolean;
  canPerformBulkOperation: (operation: string) => boolean;
  
  // Actions
  selectAllSlots: () => void;
  clearSelection: () => void;
  bulkAddCreators: (creatorIds: string[]) => Promise<boolean>;
  bulkRemoveCreators: () => Promise<boolean>;
  bulkSwapCreators: (newCreatorIds: string[]) => Promise<boolean>;
  
  // Data
  getSelectedSlotsData: () => any[];
}

export const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  selectedSlots,
  availableCreators,
  isProcessing,
  canPerformBulkOperation,
  selectAllSlots,
  clearSelection,
  bulkAddCreators,
  bulkRemoveCreators,
  bulkSwapCreators,
  getSelectedSlotsData
}) => {
  
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [showCreatorSelector, setShowCreatorSelector] = useState(false);
  const [operationType, setOperationType] = useState<'add' | 'swap'>('add');

  // Resetar seleção de criadores quando mudar slots selecionados
  React.useEffect(() => {
    setSelectedCreators([]);
    setShowCreatorSelector(false);
  }, [selectedSlots.length]);

  const handleCreatorToggle = (creatorId: string) => {
    setSelectedCreators(prev => {
      if (prev.includes(creatorId)) {
        return prev.filter(id => id !== creatorId);
      } else if (prev.length < selectedSlots.length) {
        return [...prev, creatorId];
      }
      return prev;
    });
  };

  const handleBulkAdd = () => {
    setOperationType('add');
    setShowCreatorSelector(true);
  };

  const handleBulkSwap = () => {
    setOperationType('swap');
    setShowCreatorSelector(true);
  };

  const handleConfirmOperation = async () => {
    if (selectedCreators.length !== selectedSlots.length) {
      alert(`Selecione exatamente ${selectedSlots.length} criadores`);
      return;
    }

    let success = false;
    
    if (operationType === 'add') {
      success = await bulkAddCreators(selectedCreators);
    } else if (operationType === 'swap') {
      success = await bulkSwapCreators(selectedCreators);
    }

    if (success) {
      setShowCreatorSelector(false);
      setSelectedCreators([]);
    }
  };

  const selectedSlotsData = getSelectedSlotsData();

  if (selectedSlots.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <div className="text-center text-gray-500">
          <p className="text-sm">Selecione slots para usar operações em lote</p>
          <button
            onClick={selectAllSlots}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Selecionar todos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
            {selectedSlots.length} selecionados
          </span>
          <span className="text-sm text-gray-600">
            {selectedSlotsData.filter(slot => slot.influenciador && slot.influenciador.trim() !== '').length} ocupados
          </span>
        </div>
        
        <button
          onClick={clearSelection}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Limpar seleção
        </button>
      </div>

      {!showCreatorSelector ? (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleBulkAdd}
            disabled={!canPerformBulkOperation('add') || isProcessing}
            className={`px-3 py-2 rounded text-sm font-medium ${
              canPerformBulkOperation('add') && !isProcessing
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Adicionar Criadores
          </button>

          <button
            onClick={bulkRemoveCreators}
            disabled={!canPerformBulkOperation('remove') || isProcessing}
            className={`px-3 py-2 rounded text-sm font-medium ${
              canPerformBulkOperation('remove') && !isProcessing
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Remover Criadores
          </button>

          <button
            onClick={handleBulkSwap}
            disabled={!canPerformBulkOperation('swap') || isProcessing}
            className={`px-3 py-2 rounded text-sm font-medium ${
              canPerformBulkOperation('swap') && !isProcessing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Trocar Criadores
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {operationType === 'add' ? 'Adicionar' : 'Trocar'} criadores ({selectedCreators.length}/{selectedSlots.length})
            </h4>
            <button
              onClick={() => setShowCreatorSelector(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
            <div className="grid grid-cols-1 gap-1">
              {availableCreators.map(creator => (
                <label
                  key={creator.id}
                  className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 ${
                    selectedCreators.includes(creator.id) ? 'bg-blue-100' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCreators.includes(creator.id)}
                    onChange={() => handleCreatorToggle(creator.id)}
                    disabled={!selectedCreators.includes(creator.id) && selectedCreators.length >= selectedSlots.length}
                    className="mr-2"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{creator.nome}</div>
                    <div className="text-xs text-gray-500">
                      {creator.cidade} • {creator.seguidores?.toLocaleString()} seguidores
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowCreatorSelector(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmOperation}
              disabled={selectedCreators.length !== selectedSlots.length || isProcessing}
              className={`px-4 py-2 rounded font-medium ${
                selectedCreators.length === selectedSlots.length && !isProcessing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? 'Processando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center text-blue-600">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processando operação em lote...
          </div>
        </div>
      )}
    </div>
  );
};
