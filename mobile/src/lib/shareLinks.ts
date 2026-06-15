import Constants from 'expo-constants';

/** Public base URL for referral / OG link previews (must match backend PUBLIC_WEB_URL). */
export function getShareBaseUrl(): string {
  const raw =
    process.env.EXPO_PUBLIC_WEB_URL ||
    (Constants.expoConfig?.extra as { webUrl?: string } | undefined)?.webUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    'http://192.168.0.32:3000';
  return raw.replace(/\/$/, '');
}

export function buildReferralUrl(userName: string): string {
  const slug = encodeURIComponent(userName.trim());
  return `${getShareBaseUrl()}/join/${slug}`;
}

export function buildReferralOgImageUrl(userName: string): string {
  const slug = encodeURIComponent(userName.trim());
  return `${getShareBaseUrl()}/og/join/${slug}.png`;
}

export function buildInviteMessage(
  userName: string,
  impactScore: number,
  totalReturns: number,
  streakCount: number,
  referralUrl: string,
): string {
  const stats = [`Impact score ${impactScore}`, `${totalReturns} returns`];
  if (streakCount > 0) stats.push(`${streakCount}-day streak`);
  return (
    `${userName} invited you to ReLoop 🌱\n\n` +
    `${stats.join(' · ')}\n\n` +
    `Join the circular economy — reuse containers, cut waste, earn rewards:\n${referralUrl}`
  );
}
