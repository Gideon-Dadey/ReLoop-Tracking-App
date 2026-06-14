import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/store/useThemeStore';
import { screenHeader } from '@/src/theme/screenHeader';

type PinnedScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
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
  children,
  backgroundColor,
  titleColor,
  subtitleColor,
  horizontalPadding = 16,
  style,
}: PinnedScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const bg = backgroundColor ?? c.bg;

  return (
    <View
      style={[
        styles.wrapper,
        { paddingTop: insets.top + 8, backgroundColor: bg, paddingHorizontal: horizontalPadding },
        style,
      ]}
    >
      {children ?? (
        <View style={styles.row}>
          {left ? <View style={styles.leftSlot}>{left}</View> : null}
          <View style={[styles.titleBlock, !left && styles.titleBlockFlush]}>
            {title ? (
              <Text style={[screenHeader.title, { color: titleColor ?? c.text }]}>{title}</Text>
            ) : null}
            {subtitle ? (
              <Text style={[screenHeader.subtitle, { color: subtitleColor ?? c.textFaint }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {right ? <View style={styles.rightSlot}>{right}</View> : null}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leftSlot: {
    flexShrink: 0,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  titleBlockFlush: {
    marginRight: 0,
  },
  rightSlot: {
    flexShrink: 0,
  },
});
