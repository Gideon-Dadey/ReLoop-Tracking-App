import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { AnimatedLogo } from '@/components/AnimatedLogo';

const HOLD_MS = 350;
const FADE_OUT_MS = 420;
const LOGO_SIZE = 112;

type AppSplashOverlayProps = {
  onFinish: () => void;
};

export function AppSplashOverlay({ onFinish }: AppSplashOverlayProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const [entranceDone, setEntranceDone] = useState(false);

  const bg = isDark ? '#15202B' : '#ffffff';
  const textColor = isDark ? '#8899A6' : '#6B7280';

  useEffect(() => {
    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 500,
      delay: 700,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [taglineOpacity]);

  useEffect(() => {
    if (!entranceDone) return;

    const timer = setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, HOLD_MS);

    return () => clearTimeout(timer);
  }, [entranceDone, overlayOpacity, onFinish]);

  const handleEntranceComplete = useCallback(() => {
    setEntranceDone(true);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { backgroundColor: bg, opacity: overlayOpacity }]}
    >
      <AnimatedLogo
        size={LOGO_SIZE}
        variant="entrance"
        onEntranceComplete={handleEntranceComplete}
      />
      <Animated.Text style={[styles.tagline, { color: textColor, opacity: taglineOpacity }]}>
        Circular Economy Platform
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 9999,
  },
  tagline: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
