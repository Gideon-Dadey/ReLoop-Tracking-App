import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { fonts } from '@/src/theme/fonts';
import { darkColors, lightColors } from '@/src/theme/tokens';

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

/** Brand aliases are black — never mint-teal CTAs. */
export const brand = {
  primary: '#000000',
  teal: '#000000',
  tealDeep: '#000000',
  tealBright: '#ffffff',
  tealSoft: '#a1a1aa',
  heroDark: '#000000',
  heroDarkMid: '#000000',
};

export const colors = {
  dark: {
    bg: darkColors.background,
    surface: darkColors.card,
    surfaceBorder: darkColors.border,
    headerBg: darkColors.background,
    tabBg: darkColors.background,
    tabBorder: darkColors.border,
    text: darkColors.foreground,
    textSecondary: darkColors.foreground,
    textMuted: darkColors.mutedForeground,
    textFaint: darkColors.mutedForeground,
    heading: darkColors.heading,
    accent: darkColors.primary,
    onAccent: darkColors.primaryForeground,
    accentBright: darkColors.primary,
    accentSoft: darkColors.muted,
    inputBg: darkColors.muted,
    muted: darkColors.muted,
    success: darkColors.success,
    warning: darkColors.warning,
    danger: darkColors.destructive,
    syncBg: 'rgba(255, 255, 255, 0.06)',
    syncBorder: 'rgba(255, 255, 255, 0.14)',
    syncText: darkColors.foreground,
    syncDot: darkColors.primary,
  },
  light: {
    bg: lightColors.background,
    surface: lightColors.card,
    surfaceBorder: lightColors.border,
    headerBg: lightColors.background,
    tabBg: lightColors.background,
    tabBorder: lightColors.border,
    text: lightColors.foreground,
    textSecondary: lightColors.foreground,
    textMuted: lightColors.mutedForeground,
    textFaint: lightColors.mutedForeground,
    heading: lightColors.heading,
    accent: lightColors.primary,
    onAccent: lightColors.primaryForeground,
    accentBright: lightColors.primary,
    accentSoft: lightColors.muted,
    inputBg: lightColors.muted,
    muted: lightColors.muted,
    success: lightColors.success,
    warning: lightColors.warning,
    danger: lightColors.destructive,
    syncBg: 'rgba(15, 23, 42, 0.04)',
    syncBorder: 'rgba(15, 23, 42, 0.10)',
    syncText: lightColors.foreground,
    syncDot: lightColors.primary,
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
