import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { cardShadow, surfaceRadius } from '@/src/theme/chrome';

type CardSurfaceProps = ViewProps & {
  padded?: boolean;
  radius?: number;
};

export default function CardSurface({
  style,
  children,
  padded = false,
  radius = surfaceRadius.card,
  ...rest
}: CardSurfaceProps) {
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);
  const shadow = cardShadow(mode);

  return (
    <View
      style={[
        styles.base,
        shadow,
        {
          backgroundColor: c.surface,
          borderColor: c.surfaceBorder,
          borderRadius: radius,
          padding: padded ? 16 : undefined,
        } satisfies ViewStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
