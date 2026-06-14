import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const zustandStorage = {
  setItem: async (name: string, value: string) => {
    await AsyncStorage.setItem(name, value);
  },
  getItem: async (name: string) => {
    return (await AsyncStorage.getItem(name)) ?? null;
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  },
};

interface User {
  id: string;
  email: string;
  userName: string;
  role: 'user' | 'vendor' | 'admin';
  organizationId?: string;
  points: number;
  streakCount: number;
  lastReturnAt?: string;
  weeklyGoal?: { current: number; target: number; percent: number };
  impact: { plasticSaved: number; co2Saved: number; totalReturns: number };
  activeBorrows?: number;
  avatar?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      updateUser: (updatedUser) => set((state) => {
        if (!state.user) return { user: null };
        return {
          user: {
            ...state.user,
            ...updatedUser,
            impact: updatedUser.impact
              ? { ...state.user.impact, ...updatedUser.impact }
              : state.user.impact,
            weeklyGoal: updatedUser.weeklyGoal
              ? { ...state.user.weeklyGoal, ...updatedUser.weeklyGoal }
              : state.user.weeklyGoal,
          },
        };
      }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
