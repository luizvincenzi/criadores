'use client';

import React, { useState } from 'react';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BusinessFormData {
  businessName: string;        // A = Nome
  category: string;            // B = Categoria
  currentPlan: string;         // C = Plano atual
  comercial: string;           // D = Comercial
  nomeResponsavel: string;     // E = Nome Responsável
  cidade: string;              // F = Cidade
  whatsappResponsavel: string; // G = WhatsApp Responsável
  prospeccao: string;          // H = Prospecção
  responsavel: string;         // I = Responsável
  instagram: string;           // J = Instagram
  grupoWhatsApp: string;       // K = Grupo WhatsApp criado
  contratoAssinado: string;    // L = Contrato assinado e enviado
  dataAssinatura: string;      // M = Data assinatura do contrato
  contratoValidoAte: string;   // N = Contrato válido até
  relatedFiles: string;        // O = Related files
  notes: string;               // P = Notes
}

export default function AddBusinessModal({ isOpen, onClose, onSuccess }: AddBusinessModalProps) {
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: '',        // A = Nome
    category: '',            // B = Categoria
    currentPlan: '',         // C = Plano atual
    comercial: '',           // D = Comercial
    nomeResponsavel: '',     // E = Nome Responsável
    cidade: '',              // F = Cidade
    whatsappResponsavel: '', // G = WhatsApp Responsável
    prospeccao: '',          // H = Prospecção
    responsavel: '',         // I = Responsável
    instagram: '',           // J = Instagram
    grupoWhatsApp: '',       // K = Grupo WhatsApp criado
    contratoAssinado: '',    // L = Contrato assinado e enviado
    dataAssinatura: '',      // M = Data assinatura do contrato
    contratoValidoAte: '',   // N = Contrato válido até
    relatedFiles: '',        // O = Related files
    notes: ''                // P = Notes
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<BusinessFormData>>({});

  const categories = [
    'Alimentação',
    'Moda e Beleza',
    'Tecnologia',
    'Saúde e Bem-estar',
    'Educação',
    'Entretenimento',
    'Serviços',
    'E-commerce',
    'Imobiliário',
    'Automotivo',
    'Outros'
  ];

  const plans = [
    'Básico',
    'Intermediário',
    'Premium',
    'Enterprise',
    'Personalizado'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<BusinessFormData> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Nome do negócio é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.nomeResponsavel.trim()) {
      newErrors.nomeResponsavel = 'Nome do responsável é obrigatório';
    }

    if (!formData.whatsappResponsavel.trim()) {
      newErrors.whatsappResponsavel = 'WhatsApp do responsável é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔄 Iniciando submissão do formulário...');

    if (!validateForm()) {
      console.log('❌ Validação do formulário falhou');
      return;
    }

    console.log('✅ Formulário validado com sucesso');
    setIsSubmitting(true);

    try {
      console.log('🚀 Enviando dados via API...');

      // Usar a API em vez de chamar a função diretamente
      const response = await fetch('/api/add-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao adicionar negócio');
      }

      console.log('✅ Negócio adicionado com sucesso via API!');
      
      // Reset form
      setFormData({
        businessName: '',        // A = Nome
        category: '',            // B = Categoria
        currentPlan: '',         // C = Plano atual
        comercial: '',           // D = Comercial
        nomeResponsavel: '',     // E = Nome Responsável
        cidade: '',              // F = Cidade
        whatsappResponsavel: '', // G = WhatsApp Responsável
        prospeccao: '',          // H = Prospecção
        responsavel: '',         // I = Responsável
        instagram: '',           // J = Instagram
        grupoWhatsApp: '',       // K = Grupo WhatsApp criado
        contratoAssinado: '',    // L = Contrato assinado e enviado
        dataAssinatura: '',      // M = Data assinatura do contrato
        contratoValidoAte: '',   // N = Contrato válido até
        relatedFiles: '',        // O = Related files
        notes: ''                // P = Notes
      });

      console.log('🎉 Chamando onSuccess e onClose...');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Erro ao adicionar negócio:', error);
      alert(`Erro ao adicionar negócio: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente.`);
    } finally {
      console.log('🏁 Finalizando submissão...');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  console.log('🔄 Modal renderizado, isSubmitting:', isSubmitting);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Adicionar Novo Negócio</h2>
                <p className="text-sm text-gray-600 mt-1">Preencha as informações do novo cliente</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Negócio *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.businessName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Loja Fashion Store"
                  />
                  {errors.businessName && (
                    <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plano
                  </label>
                  <select
                    value={formData.currentPlan}
                    onChange={(e) => handleInputChange('currentPlan', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um plano</option>
                    {plans.map(plan => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comercial
                  </label>
                  <input
                    type="text"
                    value={formData.comercial}
                    onChange={(e) => handleInputChange('comercial', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome do comercial responsável"
                  />
                </div>
              </div>
            </div>

            {/* Informações de Contato */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Responsável *
                  </label>
                  <input
                    type="text"
                    value={formData.nomeResponsavel}
                    onChange={(e) => handleInputChange('nomeResponsavel', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nomeResponsavel ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nome do responsável"
                  />
                  {errors.nomeResponsavel && (
                    <p className="text-red-500 text-xs mt-1">{errors.nomeResponsavel}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Responsável *
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsappResponsavel}
                    onChange={(e) => handleInputChange('whatsappResponsavel', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.whatsappResponsavel ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.whatsappResponsavel && (
                    <p className="text-red-500 text-xs mt-1">{errors.whatsappResponsavel}</p>
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
                    placeholder="Cidade do negócio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="@instagram_do_negocio"
                  />
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      Grupo WhatsApp Criado
                    </label>
                    <select
                      value={formData.grupoWhatsApp}
                      onChange={(e) => handleInputChange('grupoWhatsApp', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contrato Assinado e Enviado
                    </label>
                    <select
                      value={formData.contratoAssinado}
                      onChange={(e) => handleInputChange('contratoAssinado', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Assinatura do Contrato
                    </label>
                    <input
                      type="date"
                      value={formData.dataAssinatura}
                      onChange={(e) => handleInputChange('dataAssinatura', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contrato Válido Até
                    </label>
                    <input
                      type="date"
                      value={formData.contratoValidoAte}
                      onChange={(e) => handleInputChange('contratoValidoAte', e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações (Notes)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observações adicionais sobre o negócio..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl -mx-6 -mb-6">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    console.log('🖱️ Botão clicado!', e);
                    // Não previne o default, deixa o form submit acontecer
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    'Adicionar Negócio'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
