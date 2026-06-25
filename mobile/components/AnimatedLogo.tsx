import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, StyleSheet, ViewStyle } from 'react-native';

const LOGO = require('../assets/re-logo.webp');

type AnimatedLogoProps = {
  size?: number;
  /** entrance: one spin + scale (splash). settle: fade + scale (auth screens). loop: slow continuous spin. */
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
  const spin = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(variant === 'entrance' ? 0.72 : 0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant === 'loop') {
      opacity.setValue(1);
      scale.setValue(1);
      spin.setValue(0);
      const loop = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 3200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      loop.start();
      return () => loop.stop();
    }

    if (variant === 'settle') {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 9,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) onEntranceComplete?.();
      });
      return;
    }

    Animated.parallel([
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onEntranceComplete?.();
    });
  }, [variant, spin, scale, opacity, onEntranceComplete]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const radius = size / 2;
  const transform =
    variant === 'settle' ? [{ scale }] : [{ scale }, { rotate }];

  return (
    <Animated.View
      style={[styles.wrap, style, { opacity, transform }]}
    >
      <Image
        source={LOGO as ImageSourcePropType}
        style={{ width: size, height: size, borderRadius: radius }}
        fadeDuration={0}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
