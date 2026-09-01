export const lightColors = {
  primary: '#000000',
  primaryForeground: '#ffffff',
  background: '#FFFFFF',
  foreground: '#0F172A',
  heading: '#020617',
  card: '#ffffff',
  muted: '#F1F5F9',
  mutedForeground: '#64748B',
  border: '#D0D7E2',
  input: '#D0D7E2',
  ring: '#000000',
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
  primary: '#ffffff',
  primaryForeground: '#000000',
  background: '#000000',
  foreground: '#ffffff',
  heading: '#ffffff',
  card: '#1a1a1a',
  muted: '#141414',
  mutedForeground: '#a1a1aa',
  border: '#2c2c2e',
  input: '#2c2c2e',
  ring: '#ffffff',
  secondary: '#ffffff',
  destructive: '#f87171',
  warning: '#fbbf24',
  success: '#34D399',
  sidebar: '#1a1a1a',
  splashBackground: '#000000',
  surfaceElevated: '#1a1a1a',
  surfaceHover: '#141414',
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
    success: { bg: 'rgba(74,222,128,0.12)', text: '#4ade80' },
    pending: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24' },
    failed: { bg: 'rgba(248,113,113,0.12)', text: '#f87171' },
    other: { bg: 'rgba(155,155,166,0.12)', text: '#9b9ba6' },
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
    deposit: { bg: 'rgba(148,163,184,0.22)', icon: '#E2E8F0' },
    withdraw: { bg: 'rgba(248,113,113,0.2)', icon: '#FECACA' },
    goals: { bg: 'rgba(251,146,60,0.22)', icon: '#FED7AA' },
    activity: { bg: 'rgba(96,165,250,0.22)', icon: '#BFDBFE' },
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
    sky: { bg: 'rgba(96,165,250,0.22)', icon: '#BFDBFE' },
    rose: { bg: 'rgba(248,113,113,0.2)', icon: '#FECDD3' },
    amber: { bg: 'rgba(251,191,36,0.22)', icon: '#FDE68A' },
    violet: { bg: 'rgba(167,139,250,0.22)', icon: '#E9D5FF' },
    slate: { bg: 'rgba(148,163,184,0.22)', icon: '#E2E8F0' },
  },
} as const;

export const promoGradients = {
  slate: ['#1E293B', '#334155'] as [string, string],
  blue: ['#1D4ED8', '#3B82F6'] as [string, string],
  orange: ['#9A3412', '#EA580C'] as [string, string],
};

export const authChrome = {
  canvas: '#000000',
  field: '#1c1c1e',
  controlHeight: 54,
  controlRadius: 14,
  fieldBorder: 'rgba(255,255,255,0.10)',
  focused: 'rgba(255,255,255,0.28)',
  onBlackFill: '#ffffff',
  onBlackLabel: '#000000',
  ink: '#ffffff',
  inkMuted: 'rgba(255,255,255,0.62)',
  inkFaint: 'rgba(255,255,255,0.42)',
} as const;

export const avatarGradients: [string, string][] = [
  ['#18181b', '#09090b'],
  ['#27272a', '#18181b'],
  ['#3f3f46', '#18181b'],
  ['#52525b', '#27272a'],
  ['#09090b', '#27272a'],
  ['#18181b', '#3f3f46'],
];

export const avatarSizes = {
  sm: 44,
  md: 56,
  lg: 80,
  xl: 96,
  xxl: 112,
} as const;
