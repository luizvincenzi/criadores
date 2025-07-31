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
              status,
              business_id,
              creator_id,
              permissions,
              avatar_url,
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

          // 3. Validar status do usuário
          if (userData.status !== UserStatus.ACTIVE) {
            console.error('❌ Usuário inativo:', userData.status);
            await supabase.auth.signOut();
            set({ error: 'Conta inativa. Entre em contato com o suporte.', isLoading: false });
            return { success: false, error: 'Conta inativa' };
          }

          // 4. Validar acesso baseado no tipo de usuário
          const clientBusinessId = process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID;
          
          if (userData.role === UserRole.BUSINESS || userData.role === UserRole.CREATOR) {
            if (!userData.business_id) {
              console.error('❌ Business ID não configurado para usuário:', userData.role);
              await supabase.auth.signOut();
              set({ error: 'Configuração de conta incompleta', isLoading: false });
              return { success: false, error: 'Configuração incompleta' };
            }

            // Verificar se o usuário pode acessar este business específico
            if (clientBusinessId && !canAccessBusiness(userData as User, clientBusinessId)) {
              console.error('❌ Usuário não autorizado para este business:', userData.business_id, 'vs', clientBusinessId);
              await supabase.auth.signOut();
              set({ error: 'Acesso não autorizado para esta empresa', isLoading: false });
              return { success: false, error: 'Acesso não autorizado' };
            }
          }

          // 5. Criar sessão
          const user: User = userData as User;
          const session: AuthSession = {
            user,
            business_id: user.business_id || clientBusinessId || undefined,
            creator_id: user.creator_id,
            permissions: user.permissions || [],
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
