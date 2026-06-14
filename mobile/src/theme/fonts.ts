import { TextStyle } from 'react-native';

/**
 * Inter — cross-platform UI font used in production apps (GitHub, Linear, etc.).
 * Each weight is a separate file; React Native does not synthesize weights reliably.
 */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export type FontWeightToken = keyof typeof fonts | '400' | '500' | '600' | '700' | '800' | '900';

/** Map numeric/string fontWeight to the correct Inter face. */
export function fontFamilyForWeight(weight?: TextStyle['fontWeight']): string {
  const raw = weight ?? '400';
  const numeric = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
  if (Number.isNaN(numeric) || numeric < 500) return fonts.regular;
  if (numeric < 600) return fonts.medium;
  if (numeric < 700) return fonts.semiBold;
  return fonts.bold;
}

/** Typography style helper — use in StyleSheet or inline styles. */
export function inter(weight?: TextStyle['fontWeight']): Pick<TextStyle, 'fontFamily' | 'fontWeight'> {
  const family = fontFamilyForWeight(weight);
  const numeric = typeof weight === 'number' ? weight : parseInt(String(weight ?? 400), 10);
  const resolved = Number.isNaN(numeric) ? 400 : Math.min(700, Math.max(400, numeric >= 800 ? 700 : numeric));
  return { fontFamily: family, fontWeight: String(resolved) as TextStyle['fontWeight'] };
}

export const typography = {
  body: inter('400'),
  bodyMedium: inter('500'),
  label: inter('500'),
  subtitle: inter('400'),
  sectionTitle: inter('600'),
  navTitle: inter('600'),
  title: inter('700'),
  headline: inter('700'),
} as const;
