import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ThumbsDown, Frown, Minus, Smile, ThumbsUp } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { geist } from '@/src/theme/fonts';

type LikertTone = { bg: string; icon: string };

const LIKERT_TONES: Record<'light' | 'dark', Record<number, LikertTone>> = {
  light: {
    1: { bg: '#FECDD3', icon: '#9F1239' },
    2: { bg: '#FED7AA', icon: '#9A3412' },
    3: { bg: '#E2E8F0', icon: '#1E293B' },
    4: { bg: '#BFDBFE', icon: '#1E3A8A' },
    5: { bg: '#BBF7D0', icon: '#166534' },
  },
  dark: {
    1: { bg: 'rgba(248,113,113,0.22)', icon: '#FECDD3' },
    2: { bg: 'rgba(251,146,60,0.22)', icon: '#FED7AA' },
    3: { bg: 'rgba(148,163,184,0.22)', icon: '#E2E8F0' },
    4: { bg: 'rgba(96,165,250,0.22)', icon: '#BFDBFE' },
    5: { bg: 'rgba(74,222,128,0.22)', icon: '#BBF7D0' },
  },
};

export const LIKERT_OPTIONS: {
  value: number;
  label: string;
  Icon: LucideIcon;
}[] = [
  { value: 1, label: 'Strongly\ndisagree', Icon: ThumbsDown },
  { value: 2, label: 'Disagree', Icon: Frown },
  { value: 3, label: 'Neutral', Icon: Minus },
  { value: 4, label: 'Agree', Icon: Smile },
  { value: 5, label: 'Strongly\nagree', Icon: ThumbsUp },
];

type LikertScaleProps = {
  value?: number | null;
  onChange: (value: number) => void;
  compact?: boolean;
};

export default function LikertScale({ value, onChange, compact }: LikertScaleProps) {
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);
  const tones = LIKERT_TONES[mode];

  return (
    <View style={styles.row}>
      {LIKERT_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        const Icon = opt.Icon;
        const tone = tones[opt.value];
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            android_ripple={null}
            style={styles.item}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label.replace('\n', ' ')}
          >
            <View
              style={[
                styles.well,
                compact && styles.wellCompact,
                {
                  backgroundColor: selected ? tone.bg : c.muted,
                  borderWidth: selected ? 1.5 : 0,
                  borderColor: selected ? tone.icon : 'transparent',
                },
              ]}
            >
              <Icon
                size={compact ? 18 : 20}
                color={selected ? tone.icon : c.textMuted}
                strokeWidth={selected ? 2.3 : 1.9}
              />
            </View>
            <Text
              style={[
                styles.label,
                compact && styles.labelCompact,
                { color: selected ? c.heading : c.textMuted },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  well: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wellCompact: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  label: {
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
    ...geist('500'),
  },
  labelCompact: {
    fontSize: 9,
    lineHeight: 12,
  },
});
