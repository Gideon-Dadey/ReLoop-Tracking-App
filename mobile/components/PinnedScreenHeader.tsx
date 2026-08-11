import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { screenHeader } from '@/src/theme/screenHeader';

const SIDE = 44;

type PinnedScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Adds a native-style back chevron on the left. */
  showBack?: boolean;
  onBack?: () => void;
  /** Fully custom header body (e.g. Home greeting row). */
  children?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  horizontalPadding?: number;
  style?: ViewStyle;
};

export default function PinnedScreenHeader({
  title,
  subtitle,
  left,
  right,
  showBack = false,
  onBack,
  children,
  backgroundColor,
  titleColor,
  subtitleColor,
  horizontalPadding = 16,
  style,
}: PinnedScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const router = useRouter();
  const navigation = useNavigation();
  const bg = backgroundColor ?? c.bg;
  const ink = titleColor ?? c.text;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (navigation.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };

  const leftNode = showBack ? (
    <Pressable
      onPress={handleBack}
      style={styles.sideHit}
      hitSlop={8}
      android_ripple={null}
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <ChevronLeft color={ink} size={26} strokeWidth={2.2} />
    </Pressable>
  ) : left;

  return (
    <View
      style={[
        styles.wrapper,
        { paddingTop: insets.top + 8, backgroundColor: bg, paddingHorizontal: horizontalPadding },
        style,
      ]}
    >
      {children ?? (
        <View style={styles.bar}>
          <View style={styles.center} pointerEvents="none">
            {title ? (
              <Text
                style={[screenHeader.navTitle, styles.title, { color: ink }]}
                numberOfLines={1}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text
                style={[screenHeader.subtitle, styles.subtitle, { color: subtitleColor ?? c.textFaint }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
          <View style={styles.side}>{leftNode}</View>
          <View style={[styles.side, styles.sideEnd]}>{right}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
    paddingBottom: 12,
  },
  bar: {
    minHeight: SIDE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIDE + 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 17,
    letterSpacing: -0.3,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 1,
  },
  side: {
    minWidth: SIDE,
    minHeight: SIDE,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  sideEnd: {
    alignItems: 'flex-end',
  },
  sideHit: {
    width: SIDE,
    height: SIDE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
});
