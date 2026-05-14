import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';

interface StreakBadgeProps {
  count: number;
}

export default function StreakBadge({ count }: StreakBadgeProps) {
  const c = useThemeColors();
  
  if (count === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: c.accent + '20', borderColor: c.accent + '40' }]}>
      <Flame color={c.accent} size={14} fill={c.accent} />
      <Text style={[styles.text, { color: c.accent }]}>{count} DAY STREAK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
