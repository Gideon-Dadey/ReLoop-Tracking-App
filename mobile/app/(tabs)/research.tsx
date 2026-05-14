import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ClipboardList, BarChart3, Share2, MessageCircle, ChevronRight,
} from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';

const RADIUS = 14;

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
}

function FeatureCard({ icon: Icon, title, description, color, onPress }: FeatureCardProps) {
  const c = useThemeColors();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '14' }]}>
        <Icon size={24} color={color} strokeWidth={2} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: c.text }]}>{title}</Text>
        <Text style={[styles.cardDesc, { color: c.textSecondary }]} numberOfLines={2}>{description}</Text>
      </View>
      <ChevronRight size={18} color={c.textFaint} />
    </TouchableOpacity>
  );
}

export default function ResearchScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: c.text }]}>Research</Text>
            <Text style={[styles.subtitle, { color: c.textFaint }]}>
              Evaluate campaigns & contribute to research
            </Text>
          </View>
        </View>

        <View style={styles.cards}>
          <FeatureCard
            icon={ClipboardList}
            title="Evaluate Campaigns"
            description="Submit and score social media campaigns on zero waste and circular economy"
            color="#8B5CF6"
            onPress={() => router.push('/campaigns' as any)}
          />
          <FeatureCard
            icon={BarChart3}
            title="Campaign Dashboard"
            description="Visualize campaign data with charts, scores, and SDG 12 alignment"
            color="#3B82F6"
            onPress={() => router.push('/campaigns/dashboard' as any)}
          />
          <FeatureCard
            icon={Share2}
            title="Share Your Impact"
            description="Generate and share beautiful impact cards to social media"
            color="#EC4899"
            onPress={() => router.push('/campaigns/share' as any)}
          />
          <FeatureCard
            icon={MessageCircle}
            title="Community Survey"
            description="Measure behavioral intentions and community resilience outcomes"
            color="#10B981"
            onPress={() => router.push('/surveys' as any)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: 14, marginTop: 2 },
  cards: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: RADIUS,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: { flex: 1, marginLeft: 12, marginRight: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardDesc: { fontSize: 12, lineHeight: 17 },
});
