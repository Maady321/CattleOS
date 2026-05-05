import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id?: string | number;
  full_name: string;
  email?: string;
  phone_number?: string;
  language?: string;
  profile_image?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      updateUser: (updatedUser) => set((state) => ({ 
        user: state.user ? { ...state.user, ...updatedUser } : null 
      })),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'cattleos-auth',
    }
  )
);
