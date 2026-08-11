import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { typography } from '@/src/theme/fonts';
import { authChrome } from '@/src/theme/tokens';

export const BRAND_MARK = require('../assets/reloop-star.png') as ImageSourcePropType;

type BrandMarkProps = {
  size?: number;
  showWordmark?: boolean;
  wordmarkSize?: number;
  align?: 'center' | 'left';
  ink?: string;
};

export default function BrandMark({
  size = 36,
  showWordmark = false,
  wordmarkSize = 22,
  align = 'left',
  ink = authChrome.ink,
}: BrandMarkProps) {
  return (
    <View style={[styles.row, align === 'center' && styles.center]}>
      <Image source={BRAND_MARK} style={{ width: size, height: size }} fadeDuration={0} />
      {showWordmark ? (
        <Text style={[styles.wordmark, { color: ink, fontSize: wordmarkSize, lineHeight: wordmarkSize + 4 }]}>
          ReLoop
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  center: {
    justifyContent: 'center',
  },
  wordmark: {
    letterSpacing: -0.5,
    ...typography.title,
  },
});
