'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { TasksSidebar } from '@/components/TasksSidebar';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useTaskNotifications } from '@/hooks/useTaskNotifications';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isTasksSidebarOpen, setIsTasksSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { pendingTasksCount, refreshCount } = useTaskNotifications();

  const handleSignOut = async () => {
    console.log('🚪 Layout: Iniciando logout');
    try {
      // Fazer logout no store (que já redireciona)
      logout();
    } catch (error) {
      console.error('❌ Layout: Erro no logout:', error);
      // Em caso de erro, forçar redirecionamento
      window.location.href = '/login';
    }
  };

  // Atualizar contador quando a sidebar for fechada
  const handleTasksSidebarClose = () => {
    setIsTasksSidebarOpen(false);
    refreshCount(); // Atualizar contador
  };

  const navigationItems = [
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
      )
    },
    {
      id: 'eventos',
      label: 'Eventos',
      href: '/eventos',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      )
    },
    {
      id: 'campanhas',
      label: 'Campanhas',
      href: '/campanhas',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M3 11l18-5v12L3 14v-3z"/>
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
        </svg>
      )
    },
    {
      id: 'criadores',
      label: 'Criadores',
      href: '/criadores',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      id: 'tarefas',
      label: 'Tarefas',
      href: '/tarefas',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M9 12l2 2 4-4"></path>
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      )
    }
  ];

  return (
    <NotificationProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CRM crIAdores</h1>
            </div>

            {/* Desktop User Info + Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Desktop User Info */}
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Olá, <span className="font-medium">{user?.full_name || 'Usuário'}</span>
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                  title="Sair"
                >
                  Sair
                </button>
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
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-between mt-4">
            {/* Espaço vazio à esquerda para centralizar */}
            <div className="flex-1"></div>

            {/* Links de navegação centralizados */}
            <div className="flex space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Tasks Icon - Sempre à direita */}
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setIsTasksSidebarOpen(!isTasksSidebarOpen)}
                className={`p-2 rounded-lg transition-colors relative ${
                  isTasksSidebarOpen
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Tarefas"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M3 6h18"/>
                  <path d="M3 12h18"/>
                  <path d="M3 18h18"/>
                </svg>
                {pendingTasksCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {pendingTasksCount}
                  </span>
                )}
              </button>
            </div>
          </nav>

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
        style={{ paddingTop: '120px' }}
        className={`p-6 transition-all duration-300 ${isTasksSidebarOpen ? 'pr-[320px]' : ''}`}
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
      </div>
    </NotificationProvider>
  );
}
