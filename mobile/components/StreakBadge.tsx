import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useThemeStore } from '@/src/store/useThemeStore';
import { badgeTone } from '@/src/theme/tokens';
import { typography } from '@/src/theme/fonts';

interface StreakBadgeProps {
  count: number;
}

export default function StreakBadge({ count }: StreakBadgeProps) {
  const mode = useThemeStore((s) => s.mode);
  const tone = badgeTone[mode].pending;
  if (count === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: tone.bg }]}>
      <Flame color={tone.text} size={11} fill={tone.text} />
      <Text style={[styles.text, { color: tone.text }]}>{count}d streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 9999,
  },
  text: {
    fontSize: 10,
    textTransform: 'capitalize',
    ...typography.sectionTitle,
  },
});
