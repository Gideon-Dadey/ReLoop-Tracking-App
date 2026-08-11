import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';

export default function HeaderBackButton() {
  const router = useRouter();
  const c = useThemeColors();

  return (
    <TouchableOpacity
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(tabs)');
      }}
      style={styles.hit}
      hitSlop={8}
      accessibilityLabel="Go back"
      accessibilityRole="button"
      activeOpacity={0.82}
    >
      <ChevronLeft color={c.text} size={26} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
});
