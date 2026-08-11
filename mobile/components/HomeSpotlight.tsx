import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image,
  useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { useThemeStore } from '@/src/store/useThemeStore';
import { cardShadow } from '@/src/theme/chrome';
import { geist } from '@/src/theme/fonts';

const HORIZONTAL_PAD = 16;
const CARD_GAP = 12;
const AUTO_ADVANCE_MS = 7000;
const PAUSE_AFTER_INTERACTION_MS = 12000;

const PROMO_IMAGES: Record<string, ImageSourcePropType> = {
  'weekly-goal': require('../assets/promo/goal.jpg'),
  survey: require('../assets/promo/pulse.jpg'),
  community: require('../assets/promo/community.jpg'),
  map: require('../assets/promo/map.jpg'),
  'eco-tip': require('../assets/promo/tip.jpg'),
};

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
  const mode = useThemeStore((s) => s.mode);
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
          const photo = PROMO_IMAGES[item.id];
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                pauseAutoAdvance();
                item.onPress();
              }}
              style={[styles.cardWrap, { width: cardWidth }, cardShadow(mode)]}
              accessibilityRole="button"
              accessibilityLabel={`${item.eyebrow}: ${item.title}`}
            >
              {photo ? (
                <Image source={photo} style={styles.photo} resizeMode="cover" />
              ) : (
                <LinearGradient
                  colors={item.colors}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              )}
              <LinearGradient
                colors={[
                  'rgba(0,0,0,0.42)',
                  'rgba(0,0,0,0.12)',
                  'rgba(0,0,0,0.52)',
                  'rgba(0,0,0,0.88)',
                ]}
                locations={[0, 0.28, 0.56, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.eyebrowChip}>
                    <Text style={styles.eyebrow}>{item.eyebrow}</Text>
                  </View>
                  <View style={styles.iconCircle}>
                    <Icon size={16} color="#FFFFFF" strokeWidth={2.3} />
                  </View>
                </View>
                <View style={styles.copy}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                  <View style={styles.ctaRow}>
                    <Text style={styles.ctaText}>{item.cta ?? 'Explore'}</Text>
                    <ChevronRight size={15} color="#FFFFFF" strokeWidth={2.4} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24 },
  cardWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: 228,
    backgroundColor: '#111111',
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  card: {
    padding: 16,
    minHeight: 228,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrowChip: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  eyebrow: {
    ...geist('700'),
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: 6,
  },
  title: {
    ...geist('700'),
    fontSize: 22,
    lineHeight: 26,
    color: '#FFFFFF',
    letterSpacing: -0.45,
  },
  description: {
    ...geist('500'),
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.92)',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  ctaText: {
    ...geist('700'),
    fontSize: 13,
    color: '#FFFFFF',
  },
});
