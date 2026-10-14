import { create } from 'zustand';
import { UserDto } from '@ankirab/shared';
import { authService } from '../services/auth.service';

interface AuthState {
  user: UserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  initAuth: () => Promise<void>;
  setUser: (user: UserDto | null) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isLoginModalOpen: false,
  isRegisterModalOpen: false,

  initAuth: async () => {
    const token = localStorage.getItem('ankirab_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
      return;
    }

    try {
      const user = await authService.getMe();
      set({
        user,
        isAuthenticated: true,
        isAdmin: user.role === 'ADMIN',
        isLoading: false
      });
    } catch {
      localStorage.removeItem('ankirab_token');
      set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
    }
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      isLoading: false
    });
  },

  openLoginModal: () => set({ isLoginModalOpen: true, isRegisterModalOpen: false }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  openRegisterModal: () => set({ isRegisterModalOpen: true, isLoginModalOpen: false }),
  closeRegisterModal: () => set({ isRegisterModalOpen: false }),

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isAdmin: false });
    }
  }
}));
