import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { typography } from '@/src/theme/fonts';
import { avatarGradients, avatarSizes } from '@/src/theme/tokens';

type AvatarSize = keyof typeof avatarSizes;

type UserAvatarProps = {
  name?: string | null;
  uri?: string | null;
  size?: AvatarSize;
  verified?: boolean;
};

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function initialsFromName(name?: string | null) {
  const parts = (name || 'U').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function UserAvatar({ name, uri, size = 'sm', verified = false }: UserAvatarProps) {
  const c = useThemeColors();
  const dim = avatarSizes[size];
  const initials = useMemo(() => initialsFromName(name), [name]);
  const gradient = useMemo(() => {
    const idx = hashSeed(name || initials) % avatarGradients.length;
    return avatarGradients[idx];
  }, [name, initials]);
  const fontSize = Math.round(dim * 0.36);
  const badge = Math.max(14, Math.round(dim * 0.32));

  return (
    <View style={{ width: dim, height: dim }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: dim, height: dim, borderRadius: dim / 2 }} />
      ) : (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fallback, { width: dim, height: dim, borderRadius: dim / 2 }]}
        >
          <Text style={[styles.initials, { fontSize, lineHeight: fontSize + 2 }]}>{initials}</Text>
        </LinearGradient>
      )}
      {verified ? (
        <View
          style={[
            styles.verified,
            {
              width: badge,
              height: badge,
              borderRadius: badge / 2,
              backgroundColor: c.accent,
              borderColor: c.surface,
            },
          ]}
        >
          <Check color={c.onAccent} size={Math.round(badge * 0.62)} strokeWidth={3} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#ffffff',
    ...typography.title,
  },
  verified: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
