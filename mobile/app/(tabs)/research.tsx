import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList, BarChart3, Share2, MessageCircle, ChevronRight,
  BookOpen, Users,
} from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import ResearchHubOverview from '@/components/ResearchHubOverview';
import { apiService } from '@/src/api/service';

const RADIUS = 14;

interface FeatureCardProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  color: string;
  badge?: string;
  onPress: () => void;
}

function FeatureCard({ icon: Icon, title, description, color, badge, onPress }: FeatureCardProps) {
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
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, { color: c.text }]}>{title}</Text>
          {badge ? (
            <View style={[styles.cardBadge, { backgroundColor: color + '18' }]}>
              <Text style={[styles.cardBadgeText, { color }]}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.cardDesc, { color: c.textSecondary }]} numberOfLines={2}>{description}</Text>
      </View>
      <ChevronRight size={18} color={c.textFaint} />
    </TouchableOpacity>
  );
}

function SectionLabel({ title }: { title: string }) {
  const c = useThemeColors();
  return (
    <Text style={[styles.sectionLabel, { color: c.textFaint }]}>{title}</Text>
  );
}

const showResearchBrief = () => {
  Alert.alert(
    'SDG 12 · Responsible Consumption',
    'ReLoop Research measures how social media campaigns influence sustainable packaging behavior and community resilience.\n\n' +
      '• Campaign evaluations score visual design, narrative, circular economy alignment, calls to action, and community orientation.\n\n' +
      '• Daily Pulse captures day-to-day behavioral signals.\n\n' +
      '• The one-time research survey establishes baseline behavioral intentions and community outcomes.\n\n' +
      'All responses are aggregated anonymously for academic and program insights.',
    [{ text: 'Got it' }],
  );
};

export default function ResearchScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => apiService.getCampaigns(),
    enabled: !!accessToken,
    staleTime: 30_000,
  });

  const { data: pulseStatus } = useQuery({
    queryKey: ['pulse-status'],
    queryFn: () => apiService.getPulseStatus(),
    enabled: !!accessToken,
    staleTime: 30_000,
  });

  const pendingCount = campaigns?.campaigns.filter((c) => !c.isEvaluated).length ?? 0;

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['campaign-stats'] });
    queryClient.invalidateQueries({ queryKey: ['pulse-status'] });
    queryClient.invalidateQueries({ queryKey: ['survey-status'] });
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <PinnedScreenHeader title="Research" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={c.accent} />
        }
      >
        <ResearchHubOverview />

        <SectionLabel title="CONTRIBUTE" />
        <View style={styles.cards}>
          <FeatureCard
            icon={ClipboardList}
            title="Evaluate Campaigns"
            description="Submit and score zero-waste campaigns from Instagram, TikTok, Facebook, and Pinterest"
            color="#8B5CF6"
            badge={pendingCount > 0 ? `${pendingCount} pending` : undefined}
            onPress={() => router.push('/campaigns' as any)}
          />
          <FeatureCard
            icon={MessageCircle}
            title="Community Survey"
            description="Daily pulse check-ins and the one-time research survey"
            color="#1E40AF"
            badge={pulseStatus && !pulseStatus.completedToday ? 'Today' : undefined}
            onPress={() => router.push('/surveys' as any)}
          />
        </View>

        <SectionLabel title="INSIGHTS & SHARE" />
        <View style={styles.cards}>
          <FeatureCard
            icon={BarChart3}
            title="Campaign Dashboard"
            description="Charts, platform breakdown, top campaigns, and SDG 12 alignment"
            color="#3B82F6"
            onPress={() => router.push('/campaigns/dashboard' as any)}
          />
          <FeatureCard
            icon={Share2}
            title="Share Your Impact"
            description="Generate impact cards for social media"
            color="#EC4899"
            onPress={() => router.push('/campaigns/share' as any)}
          />
          <FeatureCard
            icon={BookOpen}
            title="Research Framework"
            description="How ReLoop measures behavior change and SDG 12 responsible consumption"
            color="#F59E0B"
            onPress={showResearchBrief}
          />
          <FeatureCard
            icon={Users}
            title="Eco Network"
            description="Community leaderboard and collective plastic saved"
            color="#64748B"
            onPress={() => router.push('/community' as any)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 20,
    marginBottom: 10,
  },
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
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  cardBadgeText: { fontSize: 10, fontWeight: '700' },
  cardDesc: { fontSize: 12, lineHeight: 17 },
});
