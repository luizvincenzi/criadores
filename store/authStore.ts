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

          // 1. Autenticar com Supabase
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) {
            console.error('❌ Erro de autenticação:', authError);
            set({ error: authError.message, isLoading: false });
            return { success: false, error: authError.message };
          }

          if (!authData.user) {
            set({ error: 'Usuário não encontrado', isLoading: false });
            return { success: false, error: 'Usuário não encontrado' };
          }

          // 3. Buscar dados do usuário na tabela users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
              id,
              email,
              full_name,
              role,
              permissions,
              avatar_url,
              business_id,
              creator_id,
              managed_businesses,
              is_active,
              created_at,
              updated_at,
              last_login
            `)
            .eq('email', email)
            .eq('is_active', true)
            .single();

          if (userError || !userData) {
            console.error('❌ Usuário não encontrado na base:', userError);
            await supabase.auth.signOut();
            set({ error: 'Usuário não autorizado para esta plataforma', isLoading: false });
            return { success: false, error: 'Usuário não autorizado' };
          }

          // 3. Validar se usuário está ativo
          if (!userData.is_active) {
            console.error('❌ Usuário inativo');
            await supabase.auth.signOut();
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
            await supabase.auth.signOut();
            set({ error: 'Tipo de conta não autorizado para esta plataforma', isLoading: false });
            return { success: false, error: 'Acesso não autorizado' };
          }

          // 5. Criar sessão
          const user: User = {
            ...userData,
            status: 'active' as UserStatus,
            business_id: clientBusinessId, // Usar o business_id da plataforma cliente
            creator_id: undefined,
            permissions: userData.permissions || []
          };

          const session: AuthSession = {
            user,
            business_id: clientBusinessId,
            creator_id: undefined,
            permissions: userData.permissions || [],
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
          };

          // 6. Atualizar último login
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

          console.log('✅ [crIAdores] Login realizado com sucesso:', {
            role: user.role,
            business_id: session.business_id,
            creator_id: session.creator_id
          });

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

        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
        }

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
        const { session } = get();
        
        if (!session) {
          set({ isAuthenticated: false });
          return;
        }

        // Verificar se a sessão expirou
        if (new Date() > new Date(session.expires_at)) {
          console.log('🕐 Sessão expirada, fazendo logout...');
          get().logout();
          return;
        }

        // Verificar se o usuário ainda está ativo no Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.log('🔍 Usuário não encontrado no Supabase, fazendo logout...');
            get().logout();
            return;
          }

          set({ isAuthenticated: true });
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          get().logout();
        }
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
