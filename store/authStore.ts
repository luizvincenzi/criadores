import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'user';
  permissions?: string[];
  organization?: any;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      
      login: (userData: User) => {
        set({
          isAuthenticated: true,
          user: userData,
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

        set({
          isAuthenticated: false,
          user: null,
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
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: 'auth-storage', // nome da chave no localStorage
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
