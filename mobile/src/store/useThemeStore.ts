import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = {
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

export type ThemeMode = 'dark' | 'light';

export const colors = {
  dark: {
    bg: '#0B1120',
    surface: '#151D2E',
    surfaceBorder: '#1E293B',
    headerBg: '#0F1923',
    tabBg: '#0A0F1A',
    tabBorder: 'rgba(30, 41, 59, 0.5)',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textFaint: '#475569',
    accent: '#10B981',
    accentSoft: 'rgba(16, 185, 129, 0.12)',
    inputBg: '#1A2332',
    syncBg: 'rgba(59, 130, 246, 0.08)',
    syncBorder: 'rgba(59, 130, 246, 0.15)',
    syncText: '#93C5FD',
    syncDot: '#3B82F6',
  },
  light: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceBorder: '#E2E8F0',
    headerBg: '#FFFFFF',
    tabBg: '#FFFFFF',
    tabBorder: '#E2E8F0',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textFaint: '#94A3B8',
    accent: '#059669',
    accentSoft: 'rgba(5, 150, 105, 0.08)',
    inputBg: '#F1F5F9',
    syncBg: 'rgba(59, 130, 246, 0.06)',
    syncBorder: 'rgba(59, 130, 246, 0.12)',
    syncText: '#2563EB',
    syncDot: '#3B82F6',
  },
};

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      toggleTheme: () => set({ mode: get().mode === 'dark' ? 'light' : 'dark' }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

export const useThemeColors = () => {
  const mode = useThemeStore((s) => s.mode);
  return colors[mode];
};
