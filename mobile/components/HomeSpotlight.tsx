import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';

const HORIZONTAL_PAD = 16;
const CARD_GAP = 12;
const AUTO_ADVANCE_MS = 7000;
const PAUSE_AFTER_INTERACTION_MS = 12000;

export type SpotlightItem = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  colors: [string, string];
  icon: LucideIcon;
  cta?: string;
  onPress: () => void;
};

type HomeSpotlightProps = {
  items: SpotlightItem[];
};

export default function HomeSpotlight({ items }: HomeSpotlightProps) {
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const cardWidth = width - HORIZONTAL_PAD * 2;
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<SpotlightItem>>(null);
  const pausedUntilRef = useRef(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      setActiveIndex((current) => {
        const next = (current + 1) % items.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [items.length]);

  const pauseAutoAdvance = () => {
    pausedUntilRef.current = Date.now() + PAUSE_AFTER_INTERACTION_MS;
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP));
    if (index >= 0 && index < items.length) {
      setActiveIndex(index);
    }
  };

  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        snapToInterval={cardWidth + CARD_GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PAD, gap: CARD_GAP }}
        keyExtractor={(item) => item.id}
        onScrollBeginDrag={pauseAutoAdvance}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                pauseAutoAdvance();
                item.onPress();
              }}
              style={{ width: cardWidth }}
              accessibilityRole="button"
              accessibilityLabel={`${item.eyebrow}: ${item.title}`}
            >
              <LinearGradient
                colors={item.colors}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.eyebrow}>{item.eyebrow}</Text>
                  <View style={styles.iconCircle}>
                    <Icon size={18} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                </View>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                <View style={styles.ctaRow}>
                  <Text style={styles.ctaText}>{item.cta ?? 'Explore'}</Text>
                  <ChevronRight size={16} color="rgba(255,255,255,0.92)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />

      {items.length > 1 && (
        <View style={styles.dots}>
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.dot,
                {
                  width: index === activeIndex ? 18 : 6,
                  backgroundColor: index === activeIndex ? c.accent : c.surfaceBorder,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24 },
  card: {
    borderRadius: 16,
    padding: 18,
    minHeight: 148,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: 'rgba(255,255,255,0.75)',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '500',
    flex: 1,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
