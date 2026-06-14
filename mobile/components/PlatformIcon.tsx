import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CampaignPlatform } from '@/src/api/service';

export type PlatformMeta = {
  label: string;
  icon: string;
  color: string;
  urlHint: string;
  urlHosts: string[];
};

export const PLATFORM_META: Record<CampaignPlatform, PlatformMeta> = {
  instagram: {
    label: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    urlHint: 'instagram.com/p/… or /reel/…',
    urlHosts: ['instagram.com', 'instagr.am'],
  },
  tiktok: {
    label: 'TikTok',
    icon: 'tiktok',
    color: '#FE2C55',
    urlHint: 'tiktok.com/@…/video/…',
    urlHosts: ['tiktok.com', 'vm.tiktok.com'],
  },
  facebook: {
    label: 'Facebook',
    icon: 'facebook-f',
    color: '#1877F2',
    urlHint: 'facebook.com/… post or page link',
    urlHosts: ['facebook.com', 'fb.com', 'fb.watch'],
  },
  pinterest: {
    label: 'Pinterest',
    icon: 'pinterest-p',
    color: '#E60023',
    urlHint: 'pinterest.com/pin/…',
    urlHosts: ['pinterest.com', 'pin.it'],
  },
};

export const PLATFORMS: CampaignPlatform[] = ['instagram', 'tiktok', 'facebook', 'pinterest'];

type PlatformIconProps = {
  platform: CampaignPlatform;
  size?: number;
  color?: string;
  style?: ViewStyle;
};

/** Brand icon for a social platform — uses FontAwesome5 brand glyphs. */
export function PlatformIcon({ platform, size = 20, color, style }: PlatformIconProps) {
  const meta = PLATFORM_META[platform];
  return (
    <View style={style}>
      <FontAwesome5 name={meta.icon} brand size={size} color={color ?? meta.color} />
    </View>
  );
}

type PlatformBadgeProps = {
  platform: CampaignPlatform;
  size?: 'sm' | 'md' | 'lg';
};

export function PlatformBadge({ platform, size = 'md' }: PlatformBadgeProps) {
  const meta = PLATFORM_META[platform];
  const dim = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 18;
  return (
    <View style={[styles.badge, { width: dim, height: dim, backgroundColor: meta.color + '18' }]}>
      <PlatformIcon platform={platform} size={iconSize} color={meta.color} />
    </View>
  );
}

type PlatformPickerProps = {
  value: CampaignPlatform;
  onChange: (platform: CampaignPlatform) => void;
  mutedColor: string;
  borderColor: string;
};

export function PlatformPicker({ value, onChange, mutedColor, borderColor }: PlatformPickerProps) {
  return (
    <View style={styles.pickerGrid}>
      {PLATFORMS.map((p) => {
        const meta = PLATFORM_META[p];
        const active = value === p;
        return (
          <TouchableOpacity
            key={p}
            style={[
              styles.pickerCard,
              { borderColor: active ? meta.color : borderColor },
              active && { backgroundColor: meta.color + '14' },
            ]}
            onPress={() => onChange(p)}
            activeOpacity={0.75}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={meta.label}
          >
            <View style={[styles.pickerIconWrap, { backgroundColor: active ? meta.color : meta.color + '20' }]}>
              <FontAwesome5
                name={meta.icon}
                brand
                size={20}
                color={active ? '#FFFFFF' : meta.color}
              />
            </View>
            <Text style={[styles.pickerLabel, { color: active ? meta.color : mutedColor }]}>
              {meta.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function urlMatchesPlatform(url: string, platform: CampaignPlatform): boolean {
  const normalized = url.trim().toLowerCase();
  if (!normalized) return false;
  return PLATFORM_META[platform].urlHosts.some((host) => normalized.includes(host));
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pickerCard: {
    width: '47%',
    flexGrow: 1,
    flexBasis: '45%',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  pickerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
