import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';

interface StreakBadgeProps {
  count: number;
}

export default function StreakBadge({ count }: StreakBadgeProps) {
  if (count === 0) return null;

  return (
    <View style={styles.container}>
      <Flame color="#F97316" size={13} fill="#F97316" />
      <Text style={styles.text}>{count}d streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(249,115,22,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FB923C',
  },
});
