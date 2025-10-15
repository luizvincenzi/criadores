import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { UserRole, UserStatus, AuthSession, canAccessBusiness } from '@/lib/auth-types';

// Definir interface User aqui para evitar dependência circular
interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  business_id?: string;
  creator_id?: string;
  managed_businesses?: string[];
  permissions: string[];
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 🔐 LOGIN COM VALIDAÇÃO DE TIPO DE USUÁRIO
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log('🔐 [crIAdores] Iniciando login para:', email);

          // 1. Tentar login em platform_users primeiro
          let response = await fetch('/api/platform/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          let loginData = await response.json();

          // Se falhar em platform_users, tentar em users (fallback)
          if (!loginData.success) {
            console.log('⚠️ [crIAdores] Não encontrado em platform_users, tentando users...');
            response = await fetch('/api/supabase/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            });
            loginData = await response.json();
          }

          if (!loginData.success) {
            console.error('❌ Erro de autenticação:', loginData.error);
            set({ error: loginData.error || 'Email ou senha incorretos', isLoading: false });
            return { success: false, error: loginData.error };
          }

          const userData = loginData.user;

          if (!userData) {
            console.error('❌ Usuário não encontrado após autenticação');
            set({ error: 'Erro na autenticação', isLoading: false });
            return { success: false, error: 'Usuário não encontrado' };
          }

          // 2. Validar se usuário está ativo
          if (!userData.is_active) {
            console.error('❌ Usuário inativo');
            set({ error: 'Conta inativa. Entre em contato com o suporte.', isLoading: false });
            return { success: false, error: 'Conta inativa' };
          }

          // 4. Validar acesso baseado no tipo de usuário
          const clientBusinessId = process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID || '00000000-0000-0000-0000-000000000002';

          // Admins e managers podem acessar tudo
          if (['admin', 'manager'].includes(userData.role)) {
            console.log('✅ Acesso de administrador/gerente autorizado');
          }
          // Business owners têm acesso à sua empresa
          else if (userData.role === 'business_owner') {
            console.log('✅ Acesso de business owner autorizado');
            if (!userData.business_id) {
              console.warn('⚠️ Business owner sem business_id definido');
            }
          }
          // Marketing strategists têm acesso às empresas gerenciadas
          else if (userData.role === 'marketing_strategist') {
            console.log('✅ Acesso de marketing strategist autorizado');
            if (!userData.managed_businesses || userData.managed_businesses.length === 0) {
              console.warn('⚠️ Marketing strategist sem empresas gerenciadas');
            }
          }
          // Creators têm acesso aos próprios dados
          else if (userData.role === 'creator') {
            console.log('✅ Acesso de creator autorizado');
            if (!userData.creator_id) {
              console.warn('⚠️ Creator sem creator_id definido');
            }
          }
          // Outros usuários padrão
          else if (['user', 'viewer'].includes(userData.role)) {
            console.log('✅ Acesso de usuário padrão autorizado');
          }
          else {
            console.error('❌ Tipo de usuário não autorizado:', userData.role);
            set({ error: 'Tipo de conta não autorizado para esta plataforma', isLoading: false });
            return { success: false, error: 'Acesso não autorizado' };
          }

          // 5. Criar sessão
          // Para business_owner, manter o business_id original do usuário
          // Para outros tipos, usar o business_id da plataforma cliente
          const finalBusinessId = userData.role === 'business_owner' && userData.business_id
            ? userData.business_id
            : clientBusinessId;

          const user: User = {
            ...userData,
            status: 'active' as UserStatus,
            business_id: finalBusinessId,
            creator_id: userData.creator_id || undefined,
            permissions: userData.permissions || []
          };

          const session: AuthSession = {
            user,
            business_id: finalBusinessId,
            creator_id: userData.creator_id || undefined,
            permissions: userData.permissions || [],
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
          };

          // 6. Atualizar último login (já feito na API de login)
          // Não precisa fazer aqui pois a API já atualiza

          console.log('✅ [crIAdores] Login realizado com sucesso:', {
            email: user.email,
            role: user.role,
            business_id: session.business_id,
            creator_id: session.creator_id,
            original_business_id: userData.business_id,
            final_business_id: finalBusinessId
          });

          // Verificar se foi salvo no localStorage
          setTimeout(() => {
            const saved = localStorage.getItem('auth-storage');
            console.log('🔍 [crIAdores] Verificando localStorage após login:', {
              exists: !!saved,
              content: saved ? JSON.parse(saved) : null
            });
          }, 100);

          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };

        } catch (error) {
          console.error('❌ Erro inesperado no login:', error);
          set({ 
            error: 'Erro interno. Tente novamente.', 
            isLoading: false 
          });
          return { success: false, error: 'Erro interno' };
        }
      },

      // 🚪 LOGOUT
      logout: async () => {
        console.log('🚪 [crIAdores] Fazendo logout...');

        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      // ⏳ LOADING
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 🧹 LIMPAR ERRO
      clearError: () => {
        set({ error: null });
      },

      // 🔍 VERIFICAR AUTENTICAÇÃO
      checkAuth: async () => {
        const { session, user } = get();

        if (!session || !user) {
          set({ isAuthenticated: false });
          return;
        }

        // Verificar se a sessão expirou
        if (new Date() > new Date(session.expires_at)) {
          console.log('🕐 Sessão expirada, fazendo logout...');
          get().logout();
          return;
        }

        set({ isAuthenticated: true });
      },
    }),
    {
      name: 'criadores-auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
