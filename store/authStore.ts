import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  permissions?: Record<string, Record<string, boolean>>;
  organization?: any;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,

      login: (userData: User) => {
        console.log('🔐 Login realizado no store:', userData.email);
        set({
          isAuthenticated: true,
          user: userData,
          isLoading: false,
        });

        // Registra o login no log de auditoria (Supabase)
        setTimeout(() => {
          import('@/lib/auditLogger').then(({ logUserLogin }) => {
            logUserLogin(userData.email, {
              role: userData.role,
              organization: userData.organization?.name || 'CRM Criadores'
            }).catch(error => {
              console.error('Erro ao registrar log de login:', error);
            });
          });
        }, 100);
      },

      logout: () => {
        const currentUser = get().user;
        console.log('🚪 Logout realizado no store:', currentUser?.email);

        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });

        // Registra o logout no log de auditoria (Supabase)
        if (currentUser) {
          setTimeout(() => {
            import('@/lib/auditLogger').then(({ logUserLogout }) => {
              logUserLogout(currentUser.email).catch(error => {
                console.error('Erro ao registrar log de logout:', error);
              });
            });
          }, 100);
        }

        // Redirecionar para login após logout
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage', // nome da chave no localStorage
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        // Não persistir isLoading
      }),
    }
  )
);
