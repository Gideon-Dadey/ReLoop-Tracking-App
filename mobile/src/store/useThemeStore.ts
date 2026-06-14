import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { fonts } from '@/src/theme/fonts';

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

/**
 * ReLoop brand — refined teal (circular economy / trust / tech).
 * More distinctive than generic bright green; reads premium on OLED dark UI.
 */
export const brand = {
  /** Core identity */
  teal: '#14B8A6',
  tealDeep: '#0F766E',
  tealBright: '#2DD4BF',
  tealSoft: '#5EEAD4',
  /** Dark hero strip (light mode home) */
  heroDark: '#0A1614',
  heroDarkMid: '#0C1F1B',
};

/** Twitter / X dark surfaces + ReLoop teal accent */
export const colors = {
  dark: {
    bg: '#000000',
    surface: '#16181C',
    surfaceBorder: '#2F3336',
    headerBg: '#000000',
    tabBg: '#000000',
    tabBorder: '#2F3336',
    text: '#E7E9EA',
    textSecondary: '#D6D9DB',
    textMuted: '#71767B',
    textFaint: '#536471',
    accent: brand.tealBright,
    accentBright: brand.tealSoft,
    accentSoft: 'rgba(45, 212, 191, 0.12)',
    inputBg: '#202327',
    syncBg: 'rgba(29, 155, 240, 0.08)',
    syncBorder: 'rgba(29, 155, 240, 0.18)',
    syncText: '#1D9BF0',
    syncDot: '#1D9BF0',
  },
  light: {
    bg: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceBorder: '#E5E7EB',
    headerBg: '#FFFFFF',
    tabBg: '#FFFFFF',
    tabBorder: '#E5E7EB',
    text: '#1A1A1A',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    textFaint: '#9CA3AF',
    accent: brand.tealDeep,
    accentBright: brand.teal,
    accentSoft: 'rgba(15, 118, 110, 0.08)',
    inputBg: '#F3F4F6',
    syncBg: 'rgba(59, 130, 246, 0.05)',
    syncBorder: 'rgba(59, 130, 246, 0.12)',
    syncText: '#2563EB',
    syncDot: '#3B82F6',
  },
};

export const getNavigationTheme = (mode: ThemeMode): Theme => {
  const c = colors[mode];
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.accent,
      background: c.bg,
      card: c.surface,
      text: c.text,
      border: c.surfaceBorder,
      notification: c.accent,
    },
    fonts: {
      regular: { fontFamily: fonts.regular, fontWeight: '400' },
      medium: { fontFamily: fonts.medium, fontWeight: '500' },
      bold: { fontFamily: fonts.bold, fontWeight: '700' },
      heavy: { fontFamily: fonts.bold, fontWeight: '700' },
    },
  };
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
