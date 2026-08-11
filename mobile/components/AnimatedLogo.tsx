import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, ViewStyle } from 'react-native';
import { BRAND_MARK } from '@/components/BrandMark';

type AnimatedLogoProps = {
  size?: number;
  /** entrance: splash scale-in. settle: auth fade. loop: gentle pulse. */
  variant?: 'entrance' | 'settle' | 'loop';
  style?: ViewStyle;
  onEntranceComplete?: () => void;
};

export function AnimatedLogo({
  size = 100,
  variant = 'entrance',
  style,
  onEntranceComplete,
}: AnimatedLogoProps) {
  const scale = useRef(new Animated.Value(variant === 'entrance' ? 0.78 : 0.94)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant === 'loop') {
      opacity.setValue(1);
      scale.setValue(1);
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.04,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: variant === 'entrance' ? 7 : 9,
        tension: variant === 'entrance' ? 48 : 65,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: variant === 'entrance' ? 700 : 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onEntranceComplete?.();
    });
  }, [variant, scale, opacity, onEntranceComplete]);

  return (
    <Animated.View style={[styles.wrap, style, { opacity, transform: [{ scale }] }]}>
      <Image source={BRAND_MARK} style={{ width: size, height: size }} fadeDuration={0} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
