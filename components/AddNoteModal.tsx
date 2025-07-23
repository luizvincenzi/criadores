import React, { useState } from 'react';

interface AddNoteModalProps {
  businessId: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onNoteAdded: () => void;
}

export default function AddNoteModal({ businessId, userId, isOpen, onClose, onNoteAdded }: AddNoteModalProps) {
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('Por favor, digite o conteúdo da nota');
      return;
    }

    if (!businessId) {
      alert('ID do negócio não encontrado');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Enviando nova nota:', {
        business_id: businessId,
        user_id: userId || '00000000-0000-0000-0000-000000000001',
        content: content.trim(),
        note_type: noteType
      });

      const response = await fetch('/api/crm/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: businessId,
          user_id: userId || '00000000-0000-0000-0000-000000000001', // User padrão se não fornecido
          content: content.trim(),
          note_type: noteType,
          create_activity: false // Sistema de atividades desabilitado temporariamente
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Nota adicionada com sucesso:', result);
        setContent('');
        setNoteType('general');
        onNoteAdded();
        onClose();
        alert('Nota adicionada com sucesso!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('❌ Erro ao adicionar nota:', errorData);
        alert('Erro ao adicionar nota: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar nota:', error);
      alert('Erro de conexão ao adicionar nota');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📝</span>
                <h2 className="text-xl font-bold">Adicionar Nota</h2>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Tipo da nota */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo da Nota
                </label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="general">📋 Geral</option>
                  <option value="internal">🔒 Interna</option>
                  <option value="client_facing">👥 Para o Cliente</option>
                  <option value="stage_change">🔄 Mudança de Etapa</option>
                </select>
              </div>

              {/* Conteúdo da nota */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo da Nota *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Digite sua nota aqui..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {content.length}/1000 caracteres
                </p>
              </div>

              {/* Dicas */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas para uma boa nota:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Seja específico sobre o que aconteceu</li>
                  <li>• Inclua próximos passos se aplicável</li>
                  <li>• Mencione datas importantes</li>
                  <li>• Use notas internas para informações sensíveis</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💾</span>
                    Salvar Nota
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
