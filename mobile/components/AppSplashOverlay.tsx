import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { typography } from '@/src/theme/fonts';

const LOGO_SIZE = 128;
const STORY = [
  'Borrow what you need.',
  'Return it clean.',
  'Keep the loop going.',
] as const;

const BEAT_MS = 1100;
const HOLD_AFTER_STORY_MS = 520;
const FADE_OUT_MS = 480;

type AppSplashOverlayProps = {
  onFinish: () => void;
};

export function AppSplashOverlay({ onFinish }: AppSplashOverlayProps) {
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkY = useRef(new Animated.Value(10)).current;
  const lineOpacity = useRef(new Animated.Value(0)).current;
  const lineY = useRef(new Animated.Value(8)).current;
  const [beat, setBeat] = useState(0);
  const [markReady, setMarkReady] = useState(false);

  useEffect(() => {
    if (!markReady) return;

    Animated.parallel([
      Animated.timing(wordmarkOpacity, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(wordmarkY, {
        toValue: 0,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [markReady, wordmarkOpacity, wordmarkY]);

  useEffect(() => {
    if (!markReady) return;

    const showBeat = (index: number) => {
      lineOpacity.setValue(0);
      lineY.setValue(8);
      setBeat(index);
      Animated.parallel([
        Animated.timing(lineOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(lineY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    };

    const start = setTimeout(() => showBeat(0), 280);
    const timers = STORY.slice(1).map((_, i) =>
      setTimeout(() => showBeat(i + 1), 280 + BEAT_MS * (i + 1)),
    );

    const finishAt = 280 + BEAT_MS * STORY.length + HOLD_AFTER_STORY_MS;
    const closer = setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, finishAt);

    return () => {
      clearTimeout(start);
      timers.forEach(clearTimeout);
      clearTimeout(closer);
    };
  }, [markReady, lineOpacity, lineY, overlayOpacity, onFinish]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { opacity: overlayOpacity }]}
    >
      <View style={styles.stage}>
        <AnimatedLogo
          size={LOGO_SIZE}
          variant="entrance"
          onEntranceComplete={() => setMarkReady(true)}
        />

        <Animated.Text
          style={[
            styles.wordmark,
            {
              opacity: wordmarkOpacity,
              transform: [{ translateY: wordmarkY }],
            },
          ]}
        >
          ReLoop
        </Animated.Text>

        <View style={styles.storySlot}>
          <Animated.Text
            style={[
              styles.story,
              {
                opacity: lineOpacity,
                transform: [{ translateY: lineY }],
              },
            ]}
          >
            {STORY[beat]}
          </Animated.Text>
        </View>

        <View style={styles.dots}>
          {STORY.map((line, i) => (
            <View
              key={line}
              style={[styles.dot, i === beat && markReady ? styles.dotOn : styles.dotOff]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: '#0B1120',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 9999,
  },
  stage: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  wordmark: {
    marginTop: 18,
    color: '#ffffff',
    fontSize: 34,
    letterSpacing: -0.8,
    ...typography.headline,
  },
  storySlot: {
    height: 28,
    marginTop: 14,
    justifyContent: 'center',
  },
  story: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 16,
    textAlign: 'center',
    ...typography.body,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 28,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotOff: {
    width: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  dotOn: {
    width: 16,
    backgroundColor: '#10B981',
  },
});
