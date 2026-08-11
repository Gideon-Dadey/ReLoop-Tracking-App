import { TextStyle } from 'react-native';

/**
 * Geist — SusuFlow mobile UI font.
 * Each weight is a separate file; React Native does not synthesize weights reliably.
 */
export const fonts = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semiBold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
} as const;

export type FontWeightToken = keyof typeof fonts | '400' | '500' | '600' | '700' | '800' | '900';

/** Map numeric/string fontWeight to the correct Geist face. */
export function fontFamilyForWeight(weight?: TextStyle['fontWeight']): string {
  const raw = weight ?? '400';
  const numeric = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
  if (Number.isNaN(numeric) || numeric < 500) return fonts.regular;
  if (numeric < 600) return fonts.medium;
  if (numeric < 700) return fonts.semiBold;
  return fonts.bold;
}

/** Typography style helper — use in StyleSheet or inline styles. */
export function geist(weight?: TextStyle['fontWeight']): Pick<TextStyle, 'fontFamily' | 'fontWeight'> {
  const family = fontFamilyForWeight(weight);
  const numeric = typeof weight === 'number' ? weight : parseInt(String(weight ?? 400), 10);
  const resolved = Number.isNaN(numeric) ? 400 : Math.min(700, Math.max(400, numeric >= 800 ? 700 : numeric));
  return { fontFamily: family, fontWeight: String(resolved) as TextStyle['fontWeight'] };
}

/** @deprecated Use geist() */
export const inter = geist;

export const typography = {
  body: geist('400'),
  bodyMedium: geist('500'),
  label: geist('500'),
  subtitle: geist('400'),
  sectionTitle: geist('600'),
  navTitle: geist('600'),
  title: geist('700'),
  headline: geist('700'),
  amount: geist('700'),
} as const;
