import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList, BarChart3, Share2, MessageCircle,
  BookOpen, Users, ChevronRight,
} from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import ResearchHubOverview from '@/components/ResearchHubOverview';
import CardSurface from '@/components/CardSurface';
import MenuRow from '@/components/MenuRow';
import StatusBadge from '@/components/StatusBadge';
import { apiService } from '@/src/api/service';
import { geist } from '@/src/theme/fonts';

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

  const pendingCount = campaigns?.campaigns.filter((item) => !item.isEvaluated).length ?? 0;
  const pulseWaiting = pulseStatus && !pulseStatus.completedToday;

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

        <CardSurface style={[styles.groupCard, { marginTop: 16 }]}>
          <MenuRow
            icon={ClipboardList}
            title="Evaluate Campaigns"
            subtitle={pendingCount > 0 ? `${pendingCount} awaiting your score` : 'Score zero-waste social campaigns'}
            well="violet"
            onPress={() => router.push('/campaigns' as any)}
            right={
              <View style={styles.rowEnd}>
                {pendingCount > 0 ? (
                  <StatusBadge label={`${pendingCount} pending`} kind="pending" />
                ) : null}
                <ChevronRight color={c.textMuted} size={18} />
              </View>
            }
          />
          <MenuRow
            icon={MessageCircle}
            title="Community Survey"
            subtitle={pulseWaiting ? 'Daily pulse is waiting' : 'Daily pulse and research survey'}
            well="sky"
            onPress={() => router.push('/surveys' as any)}
            right={
              <View style={styles.rowEnd}>
                {pulseWaiting ? <StatusBadge label="Today" kind="pending" /> : null}
                <ChevronRight color={c.textMuted} size={18} />
              </View>
            }
            showDivider={false}
          />
        </CardSurface>

        <CardSurface style={[styles.groupCard, { marginTop: 16 }]}>
          <MenuRow
            icon={BarChart3}
            title="Campaign Dashboard"
            subtitle="Scores, platforms, and SDG 12 alignment"
            well="sky"
            onPress={() => router.push('/campaigns/dashboard' as any)}
          />
          <MenuRow
            icon={Share2}
            title="Share Your Impact"
            subtitle="Generate cards for social media"
            well="rose"
            onPress={() => router.push('/campaigns/share' as any)}
          />
          <MenuRow
            icon={BookOpen}
            title="Research Framework"
            subtitle="How ReLoop measures behavior change"
            well="amber"
            onPress={showResearchBrief}
          />
          <MenuRow
            icon={Users}
            title="Eco Network"
            subtitle="Leaderboard and collective plastic saved"
            well="slate"
            onPress={() => router.push('/community' as any)}
            showDivider={false}
          />
        </CardSurface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  groupLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 4,
    ...geist('700'),
  },
  groupCard: { overflow: 'hidden' },
  rowEnd: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
