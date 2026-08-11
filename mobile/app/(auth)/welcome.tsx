import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '@/src/theme/fonts';

const AUTO_MS = 4500;
const PAUSE_MS = 10000;
const INK = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.72)';

const SLIDES = [
  {
    id: 'borrow',
    image: require('../../assets/welcome/borrow.png'),
    lines: ['Skip.', 'Single-use.', 'Live.'],
  },
  {
    id: 'return',
    image: require('../../assets/welcome/return.png'),
    lines: ['Rinse.', 'Scan.', 'Return.'],
  },
  {
    id: 'community',
    image: require('../../assets/welcome/community.png'),
    lines: ['Close.', 'The loop.', 'Together.'],
  },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<(typeof SLIDES)[number]>>(null);
  const [index, setIndex] = useState(0);
  const pausedUntil = useRef(0);
  const copyOpacity = useRef(new Animated.Value(1)).current;

  const goTo = (next: number) => {
    copyOpacity.setValue(0);
    setIndex(next);
    Animated.timing(copyOpacity, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setIndex((current) => {
        const next = (current + 1) % SLIDES.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        copyOpacity.setValue(0);
        Animated.timing(copyOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }).start();
        return next;
      });
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, []);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next >= 0 && next < SLIDES.length && next !== index) goTo(next);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScrollBeginDrag={() => {
          pausedUntil.current = Date.now() + PAUSE_MS;
        }}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item }) => (
          <Image source={item.image} style={{ width, height }} resizeMode="cover" />
        )}
      />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.dim} />
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.55)']}
          locations={[0, 0.38, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={[styles.brand, { top: insets.top + 14 }]} pointerEvents="none">
        <Text style={styles.wordmark}>ReLoop</Text>
      </View>

      <Animated.View style={[styles.hero, { opacity: copyOpacity }]} pointerEvents="none">
        {SLIDES[index].lines.map((line) => (
          <Text key={line} style={[styles.line, { fontSize: Math.min(58, width * 0.148), lineHeight: Math.min(64, width * 0.162) }]}>
            {line}
          </Text>
        ))}
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            <Text style={styles.primaryLabel}>Create account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Text style={styles.secondaryLabel}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  brand: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  wordmark: {
    color: INK,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
    ...typography.title,
  },
  hero: {
    position: 'absolute',
    left: 22,
    right: 20,
    bottom: 156,
  },
  line: {
    color: INK,
    letterSpacing: -1.6,
    ...typography.headline,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: '#000000',
    fontSize: 16,
    ...typography.sectionTitle,
  },
  secondaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    color: MUTED,
    fontSize: 16,
    ...typography.sectionTitle,
  },
});
