import { Platform, ViewStyle } from 'react-native';
import { homeWells, menuWells, radii } from './tokens';

type ThemeMode = 'dark' | 'light';

export const surfaceRadius = {
  card: radii.card,
  chip: radii.chip,
  sheet: radii.sheet,
  full: radii.full,
};

export function cardShadow(mode: ThemeMode): ViewStyle {
  if (mode === 'dark') {
    return Platform.select({
      ios: { shadowOpacity: 0, shadowRadius: 0 },
      android: { elevation: 0 },
      default: {},
    }) as ViewStyle;
  }
  return Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }) as ViewStyle;
}

export function homeWell(mode: ThemeMode, kind: keyof typeof homeWells.light) {
  return homeWells[mode][kind];
}

export function menuWell(mode: ThemeMode, kind: keyof typeof menuWells.light) {
  return menuWells[mode][kind];
}

export const bankMenu = {
  wellSize: 42,
  rowMinHeight: 68,
  rowPadding: 16,
  labelSize: 16,
  subtitleSize: 12.5,
} as const;
