import { create } from 'zustand';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';

type User = any;

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  initialize: async () => {
    try {
      const user = await getCurrentUser();
      set({ user, initialized: true, loading: false });

      // Listen for auth state changes
      onAuthStateChange((user) => {
        set({ user, loading: false });
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ initialized: true, loading: false });
    }
  },
}));