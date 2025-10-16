'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { TasksSidebar } from '@/components/TasksSidebar';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useTaskNotifications } from '@/hooks/useTaskNotifications';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isTasksSidebarOpen, setIsTasksSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'conta' | 'assinaturas' | 'produtos'>('conta');
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [businessData, setBusinessData] = useState<any>(null);
  const { user, logout } = useAuthStore();
  const { pendingTasksCount, refreshCount } = useTaskNotifications();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    console.log('🚪 Layout: Iniciando logout');
    try {
      // Fazer logout no store
      await logout();
      // Redirecionar para página inicial
      router.push('/');
    } catch (error) {
      console.error('❌ Layout: Erro no logout:', error);
      // Em caso de erro, forçar redirecionamento para página inicial
      router.push('/');
    }
  };

  const handleSettings = async () => {
    setIsUserDropdownOpen(false);
    setIsSettingsModalOpen(true);

    // Carregar dados para as abas
    try {
      // Carregar produtos
      const productsResponse = await fetch('/api/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.data || []);
      }

      // Carregar assinaturas
      const subscriptionsResponse = await fetch('/api/user/subscriptions');
      if (subscriptionsResponse.ok) {
        const subscriptionsData = await subscriptionsResponse.json();
        if (subscriptionsData.success) {
          setSubscriptions([subscriptionsData.data.current_subscription]);
        }
      }

      // Carregar informações do negócio para mostrar o produto/deal
      if (user?.business_id) {
        const businessResponse = await fetch(`/api/businesses/${user.business_id}`);
        if (businessResponse.ok) {
          const businessData = await businessResponse.json();
          setBusinessData(businessData);
          console.log('Business data:', businessData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados das configurações:', error);
    }
  };

  const handleInstagramConnect = async () => {
    setIsConnectingInstagram(true);
    try {
      // Obter business_id do usuário ou usar o configurado no ambiente
      const businessId = user?.business_id || process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID || '00000000-0000-0000-0000-000000000002';

      const response = await fetch('/api/instagram/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirecionar para autorização do Instagram
        window.location.href = data.authUrl;
      } else {
        console.error('Erro ao conectar Instagram:', data.error);
        alert('Erro ao conectar com Instagram. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao conectar Instagram:', error);
      alert('Erro ao conectar com Instagram. Tente novamente.');
    } finally {
      setIsConnectingInstagram(false);
    }
  };

  // Atualizar contador quando a sidebar for fechada
  const handleTasksSidebarClose = () => {
    setIsTasksSidebarOpen(false);
    refreshCount(); // Atualizar contador
  };

  // Verificar se usuário é creator
  const isCreator = user?.role === 'creator' || (user?.roles && user.roles.includes('creator'));
  const isOnlyCreator = user?.role === 'creator' && (!user?.roles || user.roles.length === 1);

  // Verificar se é creator ou strategist (roles que devem ter configurações limitadas)
  const isCreatorOrStrategist = isCreator || (user?.roles && user.roles.includes('marketing_strategist'));

  // Itens de navegação baseados no role
  const allNavigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
      ),
      roles: ['admin', 'manager', 'business_owner', 'marketing_strategist'] // Creators não veem dashboard
    },
    {
      id: 'campanhas_criador',
      label: 'Campanhas',
      href: '/campanhas-criador',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M3 11l18-5v12L3 14v-3z"/>
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
        </svg>
      ),
      roles: ['creator'] // Apenas creators puros
    },
    {
      id: 'conteudo_estrategista',
      label: 'Conteúdo',
      href: '/conteudo-estrategista',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      roles: ['marketing_strategist'] // Apenas marketing strategists
    },
    {
      id: 'campaigns',
      label: 'Campanhas',
      href: '/campaigns',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M3 11l18-5v12L3 14v-3z"/>
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
        </svg>
      ),
      roles: ['admin', 'manager'] // CRM interno apenas
    },
    {
      id: 'conteudo',
      label: 'Conteúdo',
      href: '/conteudo',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      roles: ['admin', 'manager', 'ops', 'vendas', 'user'] // APENAS CRM interno
    },
    {
      id: 'conteudo-empresa',
      label: 'Conteúdo',
      href: '/conteudo-empresa',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      roles: ['business_owner'] // APENAS business owners
    },
    {
      id: 'campanhas-empresa',
      label: 'Campanhas',
      href: '/campanhas-empresa',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M3 11l18-5v12L3 14v-3z"/>
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
        </svg>
      ),
      roles: ['business_owner'] // Timeline de campanhas para business owner
    },
    {
      id: 'reports',
      label: 'Relatórios',
      href: '/reports',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      ),
      roles: ['admin', 'manager'] // CRM interno apenas
    }
  ];

  // CORREÇÃO: Forçar role correto baseado no email
  const correctedUser = user?.email === 'comercial@criadores.app' ? { ...user, role: 'creator' } : user;

  // Filtrar itens baseado no role do usuário
  const navigationItems = allNavigationItems.filter(item => {
    if (!item.roles) return true; // Se não tem restrição, mostra para todos

    // Verificar se o role principal do usuário está na lista
    if (correctedUser?.role && item.roles.includes(correctedUser.role)) return true;

    // Verificar se algum dos roles do usuário está na lista
    if (correctedUser?.roles && correctedUser.roles.some(role => item.roles?.includes(role))) return true;

    return false;
  });

  // DEBUG: Log para verificar o que está acontecendo
  console.log('🔍 [Layout] User role:', user?.role);
  console.log('🔍 [Layout] CORRECTED User role:', correctedUser?.role);
  console.log('🔍 [Layout] User roles:', user?.roles);
  console.log('🔍 [Layout] Navigation items before filter:', allNavigationItems.length);

  return (
    <NotificationProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow border-b border-gray-200">
        <div className="px-6 py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-onest tracking-tight">
                <span className="text-gray-600 font-light">cr</span>
                <span className="text-black font-bold">IA</span>
                <span className="text-gray-600 font-light">dores</span>
              </span>
            </div>

            {/* Desktop Navigation - Centralizada */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center mx-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Side - Tasks & User */}
            <div className="hidden md:flex items-center gap-3">
              {/* Tasks Button */}
              <button
                onClick={() => setIsTasksSidebarOpen(!isTasksSidebarOpen)}
                className="p-2 rounded-lg transition-colors relative text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Tarefas"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"></path>
                  <path d="M3 6h18"></path>
                  <path d="M3 12h18"></path>
                  <path d="M3 18h18"></path>
                </svg>
                {pendingTasksCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {pendingTasksCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="text-sm text-gray-700 font-semibold">
                    {(user?.full_name || 'U').substring(0, 2).toUpperCase()}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform duration-200 text-gray-500 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500">{user?.email || ''}</p>
                    </div>
                    <button
                      onClick={handleSettings}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configurações
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-100">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* Mobile Tasks Button */}
                <button
                  onClick={() => {
                    setIsTasksSidebarOpen(!isTasksSidebarOpen);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isTasksSidebarOpen
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M3 6h18"/>
                      <path d="M3 12h18"/>
                      <path d="M3 18h18"/>
                    </svg>
                  </span>
                  <span>Tarefas</span>
                  {pendingTasksCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {pendingTasksCount}
                    </span>
                  )}
                </button>

                {/* Mobile User Info */}
                <div className="px-4 py-3 border-t border-gray-100 mt-4">
                  <div className="text-sm text-gray-700 mb-2">
                    Olá, <span className="font-medium">{user?.full_name || 'Usuário'}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{ paddingTop: '80px' }}
        className={`dashboard-bg p-6 transition-all duration-300 ${isTasksSidebarOpen ? 'pr-[320px]' : ''}`}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Tasks Sidebar */}
      <TasksSidebar
        isOpen={isTasksSidebarOpen}
        onClose={handleTasksSidebarClose}
      />

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs Navigation - Limitada para creators e strategists */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveSettingsTab('conta')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeSettingsTab === 'conta'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📋 Conta
                </button>
                {!isCreatorOrStrategist && (
                  <>
                    <button
                      onClick={() => setActiveSettingsTab('assinaturas')}
                      className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeSettingsTab === 'assinaturas'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      💳 Assinaturas
                    </button>
                    <button
                      onClick={() => setActiveSettingsTab('produtos')}
                      className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeSettingsTab === 'produtos'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🛍️ Produtos
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Aba Conta - Disponível para todos */}
              {activeSettingsTab === 'conta' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Informações do Usuário */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Conta</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                        <input
                          type="text"
                          value={user?.full_name || 'Usuário'}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
                        <input
                          type="text"
                          value={user?.role === 'creator' ? 'Criador' : user?.role === 'marketing_strategist' ? 'Estrategista' : user?.role || 'Usuário'}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Ativo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Segurança */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Segurança</h3>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">Alterar Senha</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Mantenha sua conta segura alterando sua senha regularmente.
                          </p>
                          <button
                            onClick={() => setIsChangingPassword(true)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Alterar Senha
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Assinaturas - Apenas para business owners e admins */}
              {activeSettingsTab === 'assinaturas' && !isCreatorOrStrategist && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Assinaturas</h3>

                  {/* Informações do Produto/Deal */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-1">Seu Produto/Serviço</h4>
                        <p className="text-sm text-blue-700 mb-2">
                          <strong>Marketing de Influência</strong> - Estratégia completa de marketing digital focada em influenciadores e conteúdo orgânico.
                        </p>
                        <div className="text-xs text-blue-600 mb-3">
                          <p>• Gestão de campanhas com influenciadores</p>
                          <p>• Estratégia de conteúdo orgânico</p>
                          <p>• Análise de performance e ROI</p>
                          <p>• Suporte técnico e consultoria</p>
                        </div>
                        {businessData?.total_value && (
                          <div className="bg-blue-100 rounded-md p-2">
                            <p className="text-xs text-blue-800">
                              <strong>Valor:</strong> R$ {businessData.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Histórico de Pagamentos */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Histórico de Pagamentos</h4>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700">Pagamentos Recentes</h5>
                      </div>

                      <div className="divide-y divide-gray-200">
                        {/* Exemplo de pagamentos - será integrado com dados reais */}
                        <div className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Outubro 2025</p>
                              <p className="text-xs text-gray-500">Pago em 15/10/2025</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">R$ {businessData?.total_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '800,00'}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Pago
                            </span>
                          </div>
                        </div>

                        <div className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Novembro 2025</p>
                              <p className="text-xs text-gray-500">Vence em 15/11/2025</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">R$ {businessData?.total_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '800,00'}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pendente
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                      Histórico completo disponível em breve
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Produtos - Apenas para business owners e admins */}
              {activeSettingsTab === 'produtos' && !isCreatorOrStrategist && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Disponíveis</h3>

                  {products.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                      <p className="text-gray-500">Os produtos disponíveis aparecerão aqui em breve.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-600">{product.category}</p>
                            </div>
                            <span className="text-lg font-bold text-blue-600">R$ {product.default_price}</span>
                          </div>

                          <p className="text-sm text-gray-600 mb-4">{product.description}</p>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Modelo:</span>
                              <span className="font-medium">{product.pricing_model === 'recurring' ? 'Recorrente' : 'Único'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Ciclo:</span>
                              <span className="font-medium">{product.billing_cycle === 'monthly' ? 'Mensal' : 'Único'}</span>
                            </div>
                          </div>

                          {product.features && product.features.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Recursos incluídos:</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {product.features.slice(0, 3).map((feature: string, idx: number) => (
                                  <li key={idx} className="flex items-center">
                                    <svg className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Troca de Senha */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h3>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const currentPassword = formData.get('current_password') as string;
                  const newPassword = formData.get('new_password') as string;
                  const confirmPassword = formData.get('confirm_password') as string;

                  try {
                    const response = await fetch('/api/user/change-password', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        current_password: currentPassword,
                        new_password: newPassword,
                        confirm_password: confirmPassword,
                      }),
                    });

                    const data = await response.json();

                    if (data.success) {
                      alert('Senha alterada com sucesso!');
                      setIsChangingPassword(false);
                    } else {
                      alert(data.error || 'Erro ao alterar senha');
                    }
                  } catch (error) {
                    console.error('Erro:', error);
                    alert('Erro ao alterar senha. Tente novamente.');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                  <input
                    name="current_password"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                  <input
                    name="new_password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite sua nova senha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                  <input
                    name="confirm_password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirme sua nova senha"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Alterar Senha
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </NotificationProvider>
  );
}
