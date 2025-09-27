'use client';

import React, { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { usePermissions } from '@/hooks/usePermissions';

interface StrategistAccess {
  access_id: string;
  strategist_user_id: string;
  business_id: string;
  access_level: string;
  permissions: Record<string, any>;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  strategist_name: string;
  strategist_email: string;
  business_name: string;
  business_slug: string;
  granted_by_name?: string;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  business_stage: string;
}

interface Strategist {
  id: string;
  email: string;
  full_name: string;
  role: string;
  creator_type?: string;
}

export default function StrategistAccessManager() {
  const [accesses, setAccesses] = useState<StrategistAccess[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [strategists, setStrategists] = useState<Strategist[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [selectedStrategist, setSelectedStrategist] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [accessLevel, setAccessLevel] = useState('read_write');
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const { authenticatedFetch } = useAuthenticatedFetch();
  const { isAdmin } = usePermissions();

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar acessos existentes
      const accessesResponse = await authenticatedFetch('/api/strategist-access');
      const accessesData = await accessesResponse.json();
      
      if (accessesData.success) {
        setAccesses(accessesData.accesses);
      }

      // Carregar empresas
      const businessesResponse = await authenticatedFetch('/api/supabase/businesses');
      const businessesData = await businessesResponse.json();
      
      if (businessesData.success) {
        setBusinesses(businessesData.businesses);
      }

      // Carregar estrategistas
      const strategistsResponse = await authenticatedFetch('/api/supabase/users?role=creator_strategist,marketing_strategist');
      const strategistsData = await strategistsResponse.json();
      
      if (strategistsData.success) {
        setStrategists(strategistsData.users);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const grantAccess = async () => {
    if (!selectedStrategist || !selectedBusiness) {
      setMessage('Selecione um estrategista e uma empresa');
      return;
    }

    try {
      const strategist = strategists.find(s => s.id === selectedStrategist);
      if (!strategist) {
        setMessage('Estrategista não encontrado');
        return;
      }

      const response = await authenticatedFetch('/api/strategist-access', {
        method: 'POST',
        body: JSON.stringify({
          strategistEmail: strategist.email,
          businessId: selectedBusiness,
          accessLevel,
          expiresAt: expiresAt || null,
          notes: notes || null
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Acesso concedido com sucesso!');
        setShowGrantForm(false);
        setSelectedStrategist('');
        setSelectedBusiness('');
        setAccessLevel('read_write');
        setExpiresAt('');
        setNotes('');
        loadData(); // Recarregar dados
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao conceder acesso:', error);
      setMessage('❌ Erro ao conceder acesso');
    }
  };

  const revokeAccess = async (access: StrategistAccess) => {
    if (!confirm(`Tem certeza que deseja revogar o acesso de ${access.strategist_name} à empresa ${access.business_name}?`)) {
      return;
    }

    try {
      const response = await authenticatedFetch(
        `/api/strategist-access?strategistEmail=${encodeURIComponent(access.strategist_email)}&businessId=${access.business_id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Acesso revogado com sucesso!');
        loadData(); // Recarregar dados
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao revogar acesso:', error);
      setMessage('❌ Erro ao revogar acesso');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Apenas administradores podem gerenciar acesso de estrategistas.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gerenciar Acesso de Estrategistas
        </h1>
        <button
          onClick={() => setShowGrantForm(!showGrantForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showGrantForm ? 'Cancelar' : 'Conceder Acesso'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Formulário para conceder acesso */}
      {showGrantForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border">
          <h2 className="text-lg font-semibold mb-4">Conceder Novo Acesso</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estrategista
              </label>
              <select
                value={selectedStrategist}
                onChange={(e) => setSelectedStrategist(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um estrategista</option>
                {strategists.map(strategist => (
                  <option key={strategist.id} value={strategist.id}>
                    {strategist.full_name} ({strategist.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma empresa</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Acesso
              </label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="read_only">Somente Leitura</option>
                <option value="read_write">Leitura e Escrita</option>
                <option value="full_access">Acesso Total</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Expiração (Opcional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Observações sobre este acesso..."
            />
          </div>

          <button
            onClick={grantAccess}
            disabled={!selectedStrategist || !selectedBusiness}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Conceder Acesso
          </button>
        </div>
      )}

      {/* Lista de acessos existentes */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Acessos Ativos</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        ) : accesses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nenhum acesso de estrategista encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estrategista
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nível de Acesso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concedido em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expira em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accesses.map((access) => (
                  <tr key={access.access_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {access.strategist_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {access.strategist_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {access.business_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        access.access_level === 'full_access' ? 'bg-red-100 text-red-800' :
                        access.access_level === 'read_write' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {access.access_level === 'full_access' ? 'Acesso Total' :
                         access.access_level === 'read_write' ? 'Leitura/Escrita' :
                         'Somente Leitura'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(access.granted_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {access.expires_at ? 
                        new Date(access.expires_at).toLocaleDateString('pt-BR') : 
                        'Sem expiração'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => revokeAccess(access)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Revogar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
