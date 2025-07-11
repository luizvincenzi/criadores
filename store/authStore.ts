import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
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

        // Registra o login no log de auditoria
        setTimeout(() => {
          import('@/app/actions/sheetsActions').then(({ logAction, createAuditLogSheet }) => {
            createAuditLogSheet().then(() => {
              logAction({
                action: 'user_login',
                entity_type: 'user',
                entity_id: userData.id,
                entity_name: userData.name,
                user_id: userData.id,
                user_name: userData.name,
                details: `Login realizado - ${userData.email} (${userData.role})`
              }).catch(error => {
                console.error('Erro ao registrar log de login:', error);
              });
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

        // Registra o logout no log de auditoria
        if (currentUser) {
          setTimeout(() => {
            import('@/app/actions/sheetsActions').then(({ logAction }) => {
              logAction({
                action: 'user_logout',
                entity_type: 'user',
                entity_id: currentUser.id,
                entity_name: currentUser.name,
                user_id: currentUser.id,
                user_name: currentUser.name,
                details: `Logout realizado - ${currentUser.email}`
              }).catch(error => {
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
