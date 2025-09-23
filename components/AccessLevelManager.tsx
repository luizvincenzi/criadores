'use client';

import React, { useState } from 'react';
import { UserRole, CreatorType, SubscriptionPlan, User } from '@/lib/auth-types';
import { Shield, Crown, Star, Users, Building, Zap, Check, X } from 'lucide-react';

interface AccessLevelManagerProps {
  user: User;
  onUpdateUser?: (updatedUser: Partial<User>) => void;
  readOnly?: boolean;
}

const AccessLevelManager: React.FC<AccessLevelManagerProps> = ({ 
  user, 
  onUpdateUser, 
  readOnly = false 
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [selectedCreatorType, setSelectedCreatorType] = useState<CreatorType | undefined>(user.creator_type);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>(user.subscription_plan);

  // Definir níveis de acesso disponíveis
  const accessLevels = [
    {
      role: UserRole.BUSINESS_OWNER,
      title: 'Empresa',
      description: 'Para empresas que querem contratar criadores',
      icon: <Building className="w-6 h-6" />,
      color: 'bg-blue-500',
      plans: [
        {
          plan: SubscriptionPlan.BUSINESS_BASIC,
          name: 'Básico',
          price: 'R$ 297/mês',
          features: ['Até 5 campanhas/mês', 'Até 10 criadores por campanha', 'Analytics básico', 'Suporte por email']
        },
        {
          plan: SubscriptionPlan.BUSINESS_PREMIUM,
          name: 'Premium',
          price: 'R$ 497/mês',
          features: ['Até 20 campanhas/mês', 'Até 50 criadores por campanha', 'Analytics avançado', 'Suporte prioritário', 'API access', 'Relatórios customizados']
        }
      ]
    },
    {
      role: UserRole.CREATOR_STRATEGIST,
      title: 'Criador Estrategista',
      description: 'Para criadores que querem gerenciar equipes e criar campanhas',
      icon: <Crown className="w-6 h-6" />,
      color: 'bg-purple-500',
      plans: [
        {
          plan: SubscriptionPlan.STRATEGIST,
          name: 'Estrategista',
          price: 'R$ 197/mês',
          features: ['Até 50 campanhas ativas', 'Gerenciar até 5 membros da equipe', 'Até 20 criadores gerenciados', 'Ferramentas de negócio', 'API access', 'White label']
        }
      ]
    },
    {
      role: UserRole.CREATOR,
      title: 'Criador',
      description: 'Para influenciadores e criadores de conteúdo',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-green-500',
      plans: [
        {
          plan: SubscriptionPlan.CREATOR_FREE,
          name: 'Gratuito',
          price: 'Grátis',
          features: ['Até 3 campanhas ativas', 'Portfólio básico', 'Analytics básico', 'Acesso à comunidade']
        },
        {
          plan: SubscriptionPlan.CREATOR_PRO,
          name: 'Pro',
          price: 'R$ 97/mês',
          features: ['Até 10 campanhas ativas', 'Portfólio ilimitado', 'Analytics avançado', 'Matching prioritário', 'Mensagens diretas']
        }
      ]
    }
  ];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    
    // Reset creator type and plan when changing role
    if (role !== UserRole.CREATOR && role !== UserRole.CREATOR_STRATEGIST) {
      setSelectedCreatorType(undefined);
    }
    
    // Set default plan based on role
    const levelData = accessLevels.find(level => level.role === role);
    if (levelData && levelData.plans.length > 0) {
      setSelectedPlan(levelData.plans[0].plan);
    }
  };

  const handleSave = () => {
    if (onUpdateUser) {
      onUpdateUser({
        role: selectedRole,
        creator_type: selectedCreatorType,
        subscription_plan: selectedPlan
      });
    }
  };

  const getCurrentLevelData = () => {
    return accessLevels.find(level => level.role === user.role);
  };

  const currentLevel = getCurrentLevelData();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${currentLevel?.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white`}>
            {currentLevel?.icon || <Shield className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentLevel?.title || 'Nível de Acesso'}
            </h3>
            <p className="text-sm text-gray-600">
              {currentLevel?.description || 'Gerenciar permissões e recursos'}
            </p>
          </div>
        </div>
        
        {user.subscription_plan && (
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {user.subscription_plan}
            </div>
            {user.subscription_expires_at && (
              <div className="text-xs text-gray-500">
                Expira em {new Date(user.subscription_expires_at).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecionar Nível de Acesso
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {accessLevels.map((level) => (
                <div
                  key={level.role}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedRole === level.role
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleRoleChange(level.role)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 ${level.color} rounded-full flex items-center justify-center text-white`}>
                      {level.icon}
                    </div>
                    <h4 className="font-medium text-gray-900">{level.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedRole && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecionar Plano
              </label>
              <div className="space-y-3">
                {accessLevels
                  .find(level => level.role === selectedRole)
                  ?.plans.map((planData) => (
                    <div
                      key={planData.plan}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPlan === planData.plan
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlan(planData.plan)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{planData.name}</h5>
                        <span className="text-lg font-bold text-gray-900">{planData.price}</span>
                      </div>
                      <ul className="space-y-1">
                        {planData.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => {
                setSelectedRole(user.role);
                setSelectedCreatorType(user.creator_type);
                setSelectedPlan(user.subscription_plan);
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              onClick={handleSave}
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {readOnly && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recursos Disponíveis</h4>
            <div className="grid grid-cols-2 gap-2">
              {user.features_enabled && Object.entries(user.features_enabled).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center space-x-2">
                  {enabled ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 capitalize">
                    {feature.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessLevelManager;
