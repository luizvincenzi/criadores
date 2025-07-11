'use client';

import React, { useState } from 'react';

interface AddCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreatorFormData {
  nome: string;                           // A = Nome
  status: string;                         // B = Status
  whatsapp: string;                       // C = WhatsApp
  cidade: string;                         // D = Cidade
  prospeccao: string;                     // E = Prospecção
  responsavel: string;                    // F = Responsável
  instagram: string;                      // G = Instagram
  seguidoresInstagram: string;            // H = Seguidores instagram - Maio 2025
  tiktok: string;                         // I = TikTok
  seguidoresTiktok: string;               // J = Seguidores TikTok - julho 25
  onboardingInicial: string;              // K = Onboarding Inicial
  startDate: string;                      // L = Start date
  endDate: string;                        // M = End date
  relatedFiles: string;                   // N = Related files
  notes: string;                          // O = Notes
  perfil: string;                         // P = Perfil
  preferencias: string;                   // Q = Preferências
  naoAceita: string;                      // R = Não aceita
  descricaoCriador: string;               // S = Descrição do criador
}

export default function AddCreatorModal({ isOpen, onClose, onSuccess }: AddCreatorModalProps) {
  const [formData, setFormData] = useState<CreatorFormData>({
    nome: '',                           // A = Nome
    status: '',                         // B = Status
    whatsapp: '',                       // C = WhatsApp
    cidade: '',                         // D = Cidade
    prospeccao: '',                     // E = Prospecção
    responsavel: '',                    // F = Responsável
    instagram: '',                      // G = Instagram
    seguidoresInstagram: '',            // H = Seguidores instagram - Maio 2025
    tiktok: '',                         // I = TikTok
    seguidoresTiktok: '',               // J = Seguidores TikTok - julho 25
    onboardingInicial: '',              // K = Onboarding Inicial
    startDate: '',                      // L = Start date
    endDate: '',                        // M = End date
    relatedFiles: '',                   // N = Related files
    notes: '',                          // O = Notes
    perfil: '',                         // P = Perfil
    preferencias: '',                   // Q = Preferências
    naoAceita: '',                      // R = Não aceita
    descricaoCriador: ''                // S = Descrição do criador
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CreatorFormData>>({});

  // Opções para os selects
  const statusOptions = ['Ativo', 'Inativo', 'Pendente', 'Bloqueado'];
  const onboardingOptions = ['Sim', 'Não', 'Em andamento'];
  const perfilOptions = ['Nano', 'Micro', 'Macro', 'Mega'];

  const handleInputChange = (field: keyof CreatorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Remove erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreatorFormData> = {};

    // Campos obrigatórios
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp é obrigatório';
    }

    if (!formData.instagram.trim()) {
      newErrors.instagram = 'Instagram é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔄 Iniciando submissão do formulário de criador...');
    
    if (!validateForm()) {
      console.log('❌ Validação do formulário falhou');
      return;
    }

    console.log('✅ Formulário validado com sucesso');
    setIsSubmitting(true);

    try {
      console.log('🚀 Enviando dados via API...');

      // Usar a API para adicionar criador
      const response = await fetch('/api/add-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao adicionar criador');
      }
      
      console.log('✅ Criador adicionado com sucesso via API!');

      // Reset form
      setFormData({
        nome: '',                           // A = Nome
        status: '',                         // B = Status
        whatsapp: '',                       // C = WhatsApp
        cidade: '',                         // D = Cidade
        prospeccao: '',                     // E = Prospecção
        responsavel: '',                    // F = Responsável
        instagram: '',                      // G = Instagram
        seguidoresInstagram: '',            // H = Seguidores instagram - Maio 2025
        tiktok: '',                         // I = TikTok
        seguidoresTiktok: '',               // J = Seguidores TikTok - julho 25
        onboardingInicial: '',              // K = Onboarding Inicial
        startDate: '',                      // L = Start date
        endDate: '',                        // M = End date
        relatedFiles: '',                   // N = Related files
        notes: '',                          // O = Notes
        perfil: '',                         // P = Perfil
        preferencias: '',                   // Q = Preferências
        naoAceita: '',                      // R = Não aceita
        descricaoCriador: ''                // S = Descrição do criador
      });

      console.log('🎉 Chamando onSuccess e onClose...');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Erro ao adicionar criador:', error);
      alert(`Erro ao adicionar criador: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente.`);
    } finally {
      console.log('🏁 Finalizando submissão...');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  console.log('🔄 Modal de criador renderizado, isSubmitting:', isSubmitting);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Adicionar Novo Criador</h2>
            <p className="text-sm text-gray-600 mt-1">
              Preencha as informações do criador para adicionar à base
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nome ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nome completo do criador"
                  />
                  {errors.nome && (
                    <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione o status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.whatsapp && (
                    <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cidade do criador"
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram *
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.instagram ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="@usuario_instagram"
                  />
                  {errors.instagram && (
                    <p className="text-red-500 text-xs mt-1">{errors.instagram}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seguidores Instagram - Maio 2025
                  </label>
                  <input
                    type="number"
                    value={formData.seguidoresInstagram}
                    onChange={(e) => handleInputChange('seguidoresInstagram', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TikTok
                  </label>
                  <input
                    type="text"
                    value={formData.tiktok}
                    onChange={(e) => handleInputChange('tiktok', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="@usuario_tiktok"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seguidores TikTok - Julho 25
                  </label>
                  <input
                    type="number"
                    value={formData.seguidoresTiktok}
                    onChange={(e) => handleInputChange('seguidoresTiktok', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 5000"
                  />
                </div>
              </div>
            </div>

            {/* Gestão e Contratos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestão e Contratos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prospecção
                  </label>
                  <input
                    type="text"
                    value={formData.prospeccao}
                    onChange={(e) => handleInputChange('prospeccao', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Origem da prospecção"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.responsavel}
                    onChange={(e) => handleInputChange('responsavel', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Responsável interno"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Onboarding Inicial
                  </label>
                  <select
                    value={formData.onboardingInicial}
                    onChange={(e) => handleInputChange('onboardingInicial', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    {onboardingOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perfil
                  </label>
                  <select
                    value={formData.perfil}
                    onChange={(e) => handleInputChange('perfil', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    {perfilOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Files
                  </label>
                  <input
                    type="text"
                    value={formData.relatedFiles}
                    onChange={(e) => handleInputChange('relatedFiles', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Links ou referências de arquivos"
                  />
                </div>
              </div>
            </div>

            {/* Preferências e Observações */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências e Observações</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferências
                  </label>
                  <textarea
                    value={formData.preferencias}
                    onChange={(e) => handleInputChange('preferencias', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Preferências do criador (tipos de conteúdo, marcas, etc.)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Não Aceita
                  </label>
                  <textarea
                    value={formData.naoAceita}
                    onChange={(e) => handleInputChange('naoAceita', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tipos de conteúdo ou marcas que não aceita"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Criador
                  </label>
                  <textarea
                    value={formData.descricaoCriador}
                    onChange={(e) => handleInputChange('descricaoCriador', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição detalhada do criador, estilo, público-alvo, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações (Notes)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observações adicionais sobre o criador"
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  console.log('🖱️ Botão de adicionar criador clicado!', e);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  'Adicionar Criador'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
