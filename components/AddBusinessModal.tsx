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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header Fixo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Adicionar Novo Negócio</h2>
            <p className="text-green-100 mt-1">
              Preencha as informações do negócio para adicionar à base
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-3 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 backdrop-blur-sm border border-white/30"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto">
          <form id="business-form" onSubmit={handleSubmit} className="p-6 space-y-6">
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

          </form>
        </div>

        {/* Footer Fixo com Botões */}
        <div className="border-t border-gray-200 bg-gray-50 p-6 rounded-b-2xl">
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="business-form"
              disabled={isSubmitting}
              onClick={(e) => {
                e.preventDefault();
                console.log('🖱️ Botão de adicionar negócio clicado!', e);
                handleSubmit(e);
              }}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Adicionar Negócio
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
