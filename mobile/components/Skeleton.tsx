import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '@/src/store/useThemeStore';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const c = useThemeColors();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: c.surfaceBorder,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function DashboardSkeleton() {
  const c = useThemeColors();
  return (
    <View style={[skeletonStyles.container, { backgroundColor: c.bg }]}>
      <View style={[skeletonStyles.heroCard, { backgroundColor: c.surface }]}>
        <Skeleton width={120} height={14} style={{ alignSelf: 'center' }} />
        <Skeleton width={80} height={48} borderRadius={12} style={{ alignSelf: 'center', marginTop: 16 }} />
        <Skeleton width={160} height={12} style={{ alignSelf: 'center', marginTop: 12 }} />
      </View>

      <View style={skeletonStyles.statsRow}>
        <View style={[skeletonStyles.statCard, { backgroundColor: c.surface }]}>
          <Skeleton width={36} height={36} borderRadius={10} />
          <Skeleton width={50} height={20} style={{ marginTop: 10 }} />
          <Skeleton width={40} height={10} style={{ marginTop: 6 }} />
        </View>
        <View style={[skeletonStyles.statCard, { backgroundColor: c.surface }]}>
          <Skeleton width={36} height={36} borderRadius={10} />
          <Skeleton width={50} height={20} style={{ marginTop: 10 }} />
          <Skeleton width={40} height={10} style={{ marginTop: 6 }} />
        </View>
      </View>

      <View style={skeletonStyles.section}>
        <Skeleton width={140} height={18} />
        <View style={[skeletonStyles.card, { backgroundColor: c.surface }]}>
          <Skeleton width="100%" height={8} borderRadius={4} />
          <Skeleton width="65%" height={12} style={{ marginTop: 10 }} />
        </View>
      </View>

      <View style={skeletonStyles.section}>
        <Skeleton width={120} height={18} />
        <View style={[skeletonStyles.listItem, { backgroundColor: c.surface }]}>
          <Skeleton width={32} height={32} borderRadius={8} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Skeleton width="70%" height={14} />
            <Skeleton width="40%" height={10} style={{ marginTop: 6 }} />
          </View>
        </View>
        <View style={[skeletonStyles.listItem, { backgroundColor: c.surface }]}>
          <Skeleton width={32} height={32} borderRadius={8} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="35%" height={10} style={{ marginTop: 6 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  const c = useThemeColors();
  return (
    <View style={[skeletonStyles.container, { backgroundColor: c.bg, paddingTop: 60 }]}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Skeleton width={84} height={84} borderRadius={42} />
        <Skeleton width={140} height={18} style={{ marginTop: 14 }} />
        <Skeleton width={100} height={12} style={{ marginTop: 8 }} />
      </View>
      <View style={[skeletonStyles.card, { backgroundColor: c.surface }]}>
        <Skeleton width="100%" height={52} borderRadius={14} />
        <Skeleton width="100%" height={52} borderRadius={14} style={{ marginTop: 10 }} />
        <Skeleton width="100%" height={52} borderRadius={14} style={{ marginTop: 10 }} />
        <Skeleton width="100%" height={52} borderRadius={14} style={{ marginTop: 10 }} />
      </View>
    </View>
  );
}

export function InventorySkeleton() {
  const c = useThemeColors();
  return (
    <View style={[skeletonStyles.container, { backgroundColor: c.bg }]}>
      <Skeleton width={200} height={22} style={{ marginBottom: 20 }} />
      <Skeleton width="100%" height={52} borderRadius={26} style={{ marginBottom: 20 }} />
      {[1, 2, 3].map((i) => (
        <View key={i} style={[skeletonStyles.inventoryCard, { backgroundColor: c.surface }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Skeleton width={48} height={48} borderRadius={14} />
            <View style={{ flex: 1 }}>
              <Skeleton width="70%" height={16} />
              <Skeleton width="45%" height={12} style={{ marginTop: 6 }} />
            </View>
          </View>
          <Skeleton width="100%" height={40} borderRadius={14} style={{ marginTop: 14 }} />
        </View>
      ))}
    </View>
  );
}

export function MapSkeleton() {
  const c = useThemeColors();
  return (
    <View style={[skeletonStyles.mapContainer, { backgroundColor: c.surface }]}>
      <Skeleton width="100%" height="100%" borderRadius={0} />
    </View>
  );
}

export function ButtonLoader({ color = '#fff' }: { color?: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -4, duration: 250, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]),
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);

  return (
    <View style={skeletonStyles.dotsContainer}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            skeletonStyles.dot,
            { backgroundColor: color, transform: [{ translateY: dot }] },
          ]}
        />
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heroCard: {
    borderRadius: 14, padding: 32, alignItems: 'center', marginBottom: 16,
  },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, borderRadius: 14, padding: 16, alignItems: 'center',
  },
  section: { marginTop: 20 },
  card: { borderRadius: 14, padding: 16, marginTop: 12 },
  listItem: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    padding: 14, marginTop: 8,
  },
  inventoryCard: { borderRadius: 14, padding: 20, marginBottom: 12 },
  mapContainer: { flex: 1 },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 20, justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
