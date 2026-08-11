import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '@/src/store/useThemeStore';
import { typography } from '@/src/theme/fonts';
import { badgeTone } from '@/src/theme/tokens';

export type StatusKind = 'success' | 'pending' | 'failed' | 'other';

type StatusBadgeProps = {
  label: string;
  kind?: StatusKind;
};

export function statusKindFromLabel(label: string): StatusKind {
  const key = label.toLowerCase();
  if (/(complete|success|active|returned|done|on)/.test(key)) return 'success';
  if (/(pending|process|due|today|ongoing)/.test(key)) return 'pending';
  if (/(fail|reject|error|overdue)/.test(key)) return 'failed';
  return 'other';
}

export default function StatusBadge({ label, kind }: StatusBadgeProps) {
  const mode = useThemeStore((s) => s.mode);
  const tone = badgeTone[mode][kind ?? statusKindFromLabel(label)];

  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    textTransform: 'capitalize',
    ...typography.sectionTitle,
  },
});
