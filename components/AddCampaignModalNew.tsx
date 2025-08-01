'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

interface AddCampaignModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BusinessData {
  id: number;
  nome: string;
  categoria: string;
  planoAtual: string;
  nomeResponsavel: string;
  cidade: string;
  whatsappResponsavel: string;
  responsavel: string;
  quantidadeCriadores: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export default function AddCampaignModalNew({ isOpen, onClose, onSuccess }: AddCampaignModalNewProps) {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessData | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [quantidadeCriadores, setQuantidadeCriadores] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);

  // Gerar lista de meses usando o novo sistema month_year_id
  const generateMonths = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const availableMonths = [];

    // Adicionar próximos 24 meses a partir do mês atual
    for (let i = 0; i < 24; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthYearId = year * 100 + month;

      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      availableMonths.push({
        id: monthYearId,                                    // 202507
        value: monthYearId.toString(),                      // "202507"
        label: `${monthNames[month - 1]} de ${year}`        // "Julho de 2025"
      });
    }

    return availableMonths;
  };

  const availableMonths = generateMonths();

  // Carregar businesses e usuários quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadBusinesses();
      loadUsers();
      // Definir mês atual como padrão
      setSelectedMonth(availableMonths[0]?.value || '');
    }
  }, [isOpen]);

  const loadBusinesses = async () => {
    try {
      setIsLoadingBusinesses(true);
      const response = await fetch('/api/get-businesses-for-campaigns');
      const result = await response.json();

      if (result.success) {
        setBusinesses(result.businesses);
        console.log('📊 Businesses carregados:', result.businesses.length);
      } else {
        alert('Erro ao carregar businesses: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar businesses:', error);
      alert('Erro ao carregar lista de businesses');
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/supabase/users');
      const result = await response.json();

      if (result.success) {
        setUsers(result.users);
        console.log('👥 Usuários carregados:', result.users.length);
      } else {
        console.error('Erro ao carregar usuários:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleBusinessSelect = (business: BusinessData) => {
    setSelectedBusiness(business);
    // Não preencher automaticamente o nome da campanha
    setQuantidadeCriadores(business.quantidadeCriadores || '1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBusiness || !campaignName || !selectedMonth || !quantidadeCriadores) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (parseInt(quantidadeCriadores) < 1 || parseInt(quantidadeCriadores) > 20) {
      alert('Quantidade de criadores deve ser entre 1 e 20');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/add-campaign-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessData: selectedBusiness,
          campaignName,
          selectedMonth,
          quantidadeCriadores,
          responsibleUserId,
          user: 'sistema' // TODO: pegar usuário logado
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${result.message}\n\n📊 Detalhes:\n• Business: ${result.data.businessName}\n• Mês: ${result.data.month}\n• Criadores: ${result.data.quantidadeCriadores}\n• Linhas criadas: ${result.data.rowsCreated}`);
        
        // Resetar formulário
        setSelectedBusiness(null);
        setCampaignName('');
        setQuantidadeCriadores('');
        setResponsibleUserId('');
        setSelectedMonth(availableMonths[0]?.value || '');
        
        onSuccess();
        onClose();
      } else {
        alert('❌ Erro ao criar campanha: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      alert('❌ Erro ao criar campanha');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-white p-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-2">
                Nova Campanha
              </h2>
              <p className="text-gray-600">
                Adicione uma nova campanha vinculada a um business existente
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seleção de Business */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Business *
              </label>
              {isLoadingBusinesses ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-gray-600">Carregando businesses...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-2xl p-4">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      onClick={() => handleBusinessSelect(business)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedBusiness?.id === business.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{business.nome}</h3>
                          <p className="text-sm text-gray-600">{business.categoria}</p>
                          <p className="text-xs text-gray-500">
                            {business.cidade} • {business.quantidadeCriadores} criadores
                          </p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedBusiness?.id === business.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedBusiness?.id === business.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nome da Campanha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Campanha *
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Campanha Verão 2025"
                required
              />
            </div>

            {/* Mês */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês da Campanha *
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {availableMonths.map((month) => (
                  <option key={month.id} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantidade de Criadores */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade de Criadores *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={quantidadeCriadores}
                onChange={(e) => setQuantidadeCriadores(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 4"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Será criada uma linha na planilha para cada criador (máximo 20)
              </p>
            </div>

            {/* Responsável pela Campanha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsável pela Campanha
              </label>
              <select
                value={responsibleUserId}
                onChange={(e) => setResponsibleUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um responsável</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Usuário responsável por gerenciar esta campanha
              </p>
            </div>

            {/* Resumo */}
            {selectedBusiness && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">📋 Resumo da Campanha</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Business:</strong> {selectedBusiness.nome}</p>
                  <p><strong>Categoria:</strong> {selectedBusiness.categoria}</p>
                  <p><strong>Responsável do Business:</strong> {selectedBusiness.nomeResponsavel}</p>
                  <p><strong>Mês:</strong> {selectedMonth} {new Date().getFullYear()}</p>
                  <p><strong>Criadores:</strong> {quantidadeCriadores} linhas serão criadas</p>
                  {responsibleUserId && (
                    <p><strong>Responsável pela Campanha:</strong> {users.find(u => u.id === responsibleUserId)?.full_name}</p>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex justify-end space-x-4">
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !selectedBusiness}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Criando...
              </div>
            ) : (
              'Criar Campanha'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
