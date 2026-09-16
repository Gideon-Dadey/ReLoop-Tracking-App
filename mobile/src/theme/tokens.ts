export const lightColors = {
  primary: '#059669',
  primaryForeground: '#ffffff',
  background: '#FFFFFF',
  foreground: '#0F172A',
  heading: '#020617',
  card: '#ffffff',
  muted: '#F1F5F9',
  mutedForeground: '#64748B',
  border: '#D0D7E2',
  input: '#D0D7E2',
  ring: '#059669',
  secondary: '#0F172A',
  destructive: '#E11D48',
  warning: '#F59E0B',
  success: '#059669',
  sidebar: '#F8FAFC',
  splashBackground: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceHover: '#F8FAFC',
} as const;

export const darkColors = {
  primary: '#10B981',
  primaryForeground: '#000000',
  background: '#0B1120',
  foreground: '#F1F5F9',
  heading: '#F1F5F9',
  card: '#151D2E',
  muted: '#1A2332',
  mutedForeground: '#64748B',
  border: '#1E293B',
  input: '#1A2332',
  ring: '#10B981',
  secondary: '#F1F5F9',
  destructive: '#f87171',
  warning: '#fbbf24',
  success: '#10B981',
  sidebar: '#151D2E',
  splashBackground: '#0B1120',
  surfaceElevated: '#151D2E',
  surfaceHover: '#1A2332',
} as const;

export const radii = {
  card: 14,
  chip: 12,
  sheet: 18,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pageGutter: 16,
} as const;

export const badgeTone = {
  light: {
    success: { bg: 'rgba(34,197,94,0.12)', text: '#15803d' },
    pending: { bg: 'rgba(245,158,11,0.12)', text: '#b45309' },
    failed: { bg: 'rgba(239,68,68,0.12)', text: '#dc2626' },
    other: { bg: 'rgba(100,116,139,0.12)', text: '#64748b' },
  },
  dark: {
    success: { bg: 'rgba(16,185,129,0.15)', text: '#34D399' },
    pending: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
    failed: { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
    other: { bg: 'rgba(100,116,139,0.15)', text: '#94A3B8' },
  },
} as const;

export const homeWells = {
  light: {
    deposit: { bg: '#E2E8F0', icon: '#1E293B' },
    withdraw: { bg: '#FEE2E2', icon: '#991B1B' },
    goals: { bg: '#FFEDD5', icon: '#9A3412' },
    activity: { bg: '#DBEAFE', icon: '#1E40AF' },
  },
  dark: {
    deposit: { bg: 'rgba(148,163,184,0.18)', icon: '#E2E8F0' },
    withdraw: { bg: 'rgba(248,113,113,0.18)', icon: '#FECACA' },
    goals: { bg: 'rgba(251,146,60,0.18)', icon: '#FED7AA' },
    activity: { bg: 'rgba(96,165,250,0.18)', icon: '#BFDBFE' },
  },
} as const;

export const menuWells = {
  light: {
    sky: { bg: '#BFDBFE', icon: '#1E3A8A' },
    rose: { bg: '#FECDD3', icon: '#9F1239' },
    amber: { bg: '#FDE68A', icon: '#92400E' },
    violet: { bg: '#E9D5FF', icon: '#6B21A8' },
    slate: { bg: '#E2E8F0', icon: '#1E293B' },
  },
  dark: {
    sky: { bg: 'rgba(96,165,250,0.18)', icon: '#BFDBFE' },
    rose: { bg: 'rgba(248,113,113,0.18)', icon: '#FECDD3' },
    amber: { bg: 'rgba(251,191,36,0.18)', icon: '#FDE68A' },
    violet: { bg: 'rgba(167,139,250,0.18)', icon: '#E9D5FF' },
    slate: { bg: 'rgba(148,163,184,0.18)', icon: '#E2E8F0' },
  },
} as const;

export const promoGradients = {
  slate: ['#0F766E', '#10B981'] as [string, string],
  blue: ['#1D4ED8', '#3B82F6'] as [string, string],
  orange: ['#9A3412', '#EA580C'] as [string, string],
};

export const authChrome = {
  canvas: '#0B1120',
  field: '#151D2E',
  controlHeight: 54,
  controlRadius: 14,
  fieldBorder: '#1E293B',
  focused: 'rgba(16, 185, 129, 0.5)',
  onBlackFill: '#10B981',
  onBlackLabel: '#ffffff',
  ink: '#F1F5F9',
  inkMuted: 'rgba(241,245,249,0.72)',
  inkFaint: 'rgba(241,245,249,0.45)',
} as const;

export const avatarGradients: [string, string][] = [
  ['#0F766E', '#10B981'],
  ['#1E293B', '#0B1120'],
  ['#1D4ED8', '#0F172A'],
  ['#047857', '#064E3B'],
  ['#334155', '#1E293B'],
  ['#151D2E', '#0B1120'],
];

export const avatarSizes = {
  sm: 44,
  md: 56,
  lg: 80,
  xl: 96,
  xxl: 112,
} as const;
