'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Employee {
  id: string;
  email: string;
  full_name: string;
  permissions: EmployeePermissions;
  is_active: boolean;
  invitation_status: 'pending' | 'accepted' | 'expired';
  last_login?: string;
  created_at: string;
}

interface EmployeePermissions {
  campaigns: { read: boolean; write: boolean; delete: boolean };
  conteudo: { read: boolean; write: boolean; delete: boolean };
  briefings: { read: boolean; write: boolean; delete: boolean };
  reports: { read: boolean; write: boolean; delete: boolean };
  tasks: { read: boolean; write: boolean; delete: boolean };
}

interface EquipeTabProps {
  businessId: string;
  userId: string;
}

const DEFAULT_PERMISSIONS: EmployeePermissions = {
  campaigns: { read: true, write: false, delete: false },
  conteudo: { read: true, write: false, delete: false },
  briefings: { read: false, write: false, delete: false },
  reports: { read: true, write: false, delete: false },
  tasks: { read: false, write: false, delete: false }
};

const PERMISSION_LABELS: Record<string, { label: string; actions: { key: string; label: string }[] }> = {
  conteudo: {
    label: 'Conteudo',
    actions: [
      { key: 'read', label: 'Visualizar' },
      { key: 'write', label: 'Editar' }
    ]
  },
  campaigns: {
    label: 'Campanhas',
    actions: [
      { key: 'read', label: 'Visualizar' }
    ]
  },
  reports: {
    label: 'excelencIA5',
    actions: [
      { key: 'read', label: 'Visualizar' },
      { key: 'write', label: 'Gerenciar' }
    ]
  },
  briefings: {
    label: 'Relatorios',
    actions: [
      { key: 'read', label: 'Visualizar' }
    ]
  }
};

export function EquipeTab({ businessId, userId }: EquipeTabProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', full_name: '' });
  const [formPermissions, setFormPermissions] = useState<EmployeePermissions>(DEFAULT_PERMISSIONS);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/platform/employees?business_id=${businessId}&requester_id=${userId}&include_inactive=true`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
        setTotal(data.total);
        setLimit(data.limit);
      }
    } catch {
      console.error('Erro ao carregar equipe');
    } finally {
      setIsLoading(false);
    }
  }, [businessId, userId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const resetForm = () => {
    setFormData({ email: '', full_name: '' });
    setFormPermissions(DEFAULT_PERMISSIONS);
    setEditingEmployee(null);
    setShowForm(false);
    setError(null);
  };

  const openEditForm = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ email: emp.email, full_name: emp.full_name });
    setFormPermissions(emp.permissions || DEFAULT_PERMISSIONS);
    setShowForm(true);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.email.trim() || !formData.full_name.trim()) {
      setError('Email e nome completo sao obrigatorios');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingEmployee) {
        // Update
        const res = await fetch(`/api/platform/employees/${editingEmployee.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: formData.full_name,
            permissions: formPermissions,
            requester_id: userId
          })
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.error || 'Erro ao atualizar');
          return;
        }
        setSuccessMessage('Funcionario atualizado com sucesso');
      } else {
        // Create
        const res = await fetch('/api/platform/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: businessId,
            email: formData.email,
            full_name: formData.full_name,
            permissions: formPermissions,
            requester_id: userId
          })
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.error || 'Erro ao criar');
          return;
        }
        setSuccessMessage('Convite enviado com sucesso');
      }

      resetForm();
      fetchEmployees();
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    try {
      const res = await fetch(`/api/platform/employees/${emp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !emp.is_active, requester_id: userId })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(emp.is_active ? 'Acesso desativado' : 'Acesso reativado');
        fetchEmployees();
      }
    } catch {
      setError('Erro ao alterar status');
    }
  };

  const handleDelete = async (empId: string) => {
    try {
      const res = await fetch(`/api/platform/employees/${empId}?requester_id=${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Funcionario removido');
        setConfirmDelete(null);
        fetchEmployees();
      }
    } catch {
      setError('Erro ao remover');
    }
  };

  const handleResendInvite = async (emp: Employee) => {
    try {
      const res = await fetch(`/api/platform/employees/${emp.id}/resend-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester_id: userId })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Convite reenviado para ' + emp.email);
      } else {
        setError(data.error || 'Erro ao reenviar');
      }
    } catch {
      setError('Erro ao reenviar convite');
    }
  };

  const togglePermission = (resource: string, action: string) => {
    setFormPermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource as keyof EmployeePermissions],
        [action]: !prev[resource as keyof EmployeePermissions]?.[action as 'read' | 'write' | 'delete']
      }
    }));
  };

  const getStatusBadge = (emp: Employee) => {
    if (!emp.is_active) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Desativado</span>;
    }
    if (emp.invitation_status === 'pending') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Convite pendente</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Ativo</span>;
  };

  const getPermissionBadges = (perms: EmployeePermissions) => {
    const badges: string[] = [];
    if (perms?.conteudo?.read) badges.push('Conteudo');
    if (perms?.conteudo?.write) badges.push('Editar conteudo');
    if (perms?.campaigns?.read) badges.push('Campanhas');
    if (perms?.reports?.read) badges.push('excelencIA5');
    if (perms?.reports?.write) badges.push('Gerenciar excIA5');
    if (perms?.briefings?.read) badges.push('Relatorios');
    return badges;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Carregando equipe...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Equipe</h3>
          <p className="text-sm text-gray-500 mt-1">
            {total} de {limit} funcionarios
          </p>
        </div>
        {!showForm && total < limit && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Funcionario
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">
              {editingEmployee ? 'Editar Funcionario' : 'Novo Funcionario'}
            </h4>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!!editingEmployee}
                placeholder="funcionario@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Nome do funcionario"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Permissions Grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Permissoes de acesso</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(PERMISSION_LABELS).map(([resource, config]) => (
                <div key={resource} className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800 mb-2">{config.label}</p>
                  <div className="space-y-1.5">
                    {config.actions.map(action => (
                      <label key={action.key} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!formPermissions[resource as keyof EmployeePermissions]?.[action.key as 'read' | 'write' | 'delete']}
                          onChange={() => togglePermission(resource, action.key)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{action.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : editingEmployee ? 'Salvar alteracoes' : 'Enviar convite'}
            </button>
          </div>
        </div>
      )}

      {/* Employees List */}
      {employees.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <h4 className="text-base font-medium text-gray-900 mb-1">Nenhum funcionario adicionado</h4>
          <p className="text-sm text-gray-500 mb-4">Adicione membros da sua equipe para dar acesso a plataforma.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Adicionar primeiro funcionario
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map(emp => (
            <div key={emp.id} className={`bg-white border rounded-lg p-4 ${!emp.is_active ? 'opacity-60' : ''} ${confirmDelete === emp.id ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-700">
                      {emp.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{emp.full_name}</p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(emp)}
                </div>
              </div>

              {/* Permission badges */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {getPermissionBadges(emp.permissions).map(badge => (
                  <span key={badge} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                    {badge}
                  </span>
                ))}
              </div>

              {/* Last login */}
              {emp.last_login && (
                <p className="text-xs text-gray-400 mt-2">
                  Ultimo acesso: {new Date(emp.last_login).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}

              {/* Actions */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => openEditForm(emp)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleToggleStatus(emp)}
                  className={`text-xs font-medium px-2 py-1 rounded ${emp.is_active ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50'}`}
                >
                  {emp.is_active ? 'Desativar' : 'Reativar'}
                </button>
                {emp.invitation_status === 'pending' && emp.is_active && (
                  <button
                    onClick={() => handleResendInvite(emp)}
                    className="text-xs font-medium text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50"
                  >
                    Reenviar convite
                  </button>
                )}
                {confirmDelete === emp.id ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-red-600">Tem certeza?</span>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-xs font-medium text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                    >
                      Sim, remover
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs font-medium text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(emp.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 ml-auto"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Limit warning */}
      {total >= limit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-700">
            Limite maximo de {limit} funcionarios atingido. Para adicionar mais, entre em contato com o suporte.
          </p>
        </div>
      )}
    </div>
  );
}
