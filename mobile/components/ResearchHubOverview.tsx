import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Flame, ClipboardCheck, Globe, ChevronRight } from 'lucide-react-native';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { apiService } from '@/src/api/service';
import { Skeleton } from '@/components/Skeleton';
import CardSurface from '@/components/CardSurface';
import StatusBadge from '@/components/StatusBadge';
import { menuWell } from '@/src/theme/chrome';
import { geist } from '@/src/theme/fonts';

export default function ResearchHubOverview() {
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const amber = menuWell(mode, 'amber');
  const sky = menuWell(mode, 'sky');
  const slate = menuWell(mode, 'slate');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: () => apiService.getCampaignStats(),
    enabled: !!accessToken,
    staleTime: 60_000,
  });

  const { data: pulseStatus } = useQuery({
    queryKey: ['pulse-status'],
    queryFn: () => apiService.getPulseStatus(),
    enabled: !!accessToken,
    staleTime: 30_000,
  });

  const { data: researchStatus } = useQuery({
    queryKey: ['survey-status'],
    queryFn: () => apiService.getSurveyStatus('1.0'),
    enabled: !!accessToken,
    staleTime: 60_000,
  });

  if (statsLoading) {
    return (
      <View style={styles.wrap}>
        <Skeleton width="100%" height={168} borderRadius={14} />
      </View>
    );
  }

  const sdg = stats?.sdg12AlignmentPercent ?? 0;
  const evaluated = stats?.evaluatedCampaigns ?? 0;
  const total = stats?.totalCampaigns ?? 0;
  const streak = pulseStatus?.streak ?? 0;
  const pulseDone = pulseStatus?.completedToday ?? false;
  const researchDone = researchStatus?.completed ?? false;

  return (
    <View style={styles.wrap}>
      <CardSurface padded>
        <Text style={[styles.eyebrow, { color: c.textFaint }]}>SDG 12 · RESEARCH</Text>
        <Text style={[styles.title, { color: c.heading }]}>Study progress</Text>
        <Text style={[styles.desc, { color: c.textMuted }]}>
          Campaign scores, daily signals, and responsible-consumption alignment.
        </Text>

        <View style={[styles.statsRow, { borderTopColor: c.surfaceBorder }]}>
          <View style={styles.statBox}>
            <View style={[styles.statWell, { backgroundColor: amber.bg }]}>
              <Flame size={16} color={amber.icon} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: c.heading }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: c.textFaint }]}>Streak</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: c.surfaceBorder }]} />
          <View style={styles.statBox}>
            <View style={[styles.statWell, { backgroundColor: slate.bg }]}>
              <ClipboardCheck size={16} color={slate.icon} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: c.heading }]}>{evaluated}/{total}</Text>
            <Text style={[styles.statLabel, { color: c.textFaint }]}>Evaluated</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: c.surfaceBorder }]} />
          <View style={styles.statBox}>
            <View style={[styles.statWell, { backgroundColor: sky.bg }]}>
              <Globe size={16} color={sky.icon} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: c.heading }]}>{sdg}%</Text>
            <Text style={[styles.statLabel, { color: c.textFaint }]}>SDG 12</Text>
          </View>
        </View>

        <View style={styles.chipRow}>
          <StatusBadge
            label={pulseDone ? 'Pulse complete' : 'Pulse pending'}
            kind={pulseDone ? 'success' : 'pending'}
          />
          <StatusBadge
            label={researchDone ? 'Survey complete' : 'Survey open'}
            kind={researchDone ? 'success' : 'other'}
          />
        </View>
      </CardSurface>

      {!pulseDone && (
        <TouchableOpacity
          onPress={() => router.push('/surveys?tab=pulse' as any)}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Complete today's pulse"
        >
          <CardSurface style={styles.pulseRow}>
            <View style={[styles.pulseWell, { backgroundColor: amber.bg }]}>
              <Flame size={18} color={amber.icon} strokeWidth={2} />
            </View>
            <View style={styles.pulseCopy}>
              <Text style={[styles.pulseTitle, { color: c.heading }]}>Today's pulse is waiting</Text>
              <Text style={[styles.pulseSub, { color: c.textMuted }]}>30 seconds · keep your streak</Text>
            </View>
            <ChevronRight size={18} color={c.textMuted} />
          </CardSurface>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, marginBottom: 8 },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 8,
    ...geist('700'),
  },
  title: {
    fontSize: 20,
    letterSpacing: -0.4,
    marginBottom: 6,
    ...geist('700'),
  },
  desc: {
    fontSize: 13,
    lineHeight: 19,
    ...geist('400'),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 6 },
  statWell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 16, ...geist('700') },
  statLabel: {
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    ...geist('600'),
  },
  statDivider: { width: StyleSheet.hairlineWidth, height: 36 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  pulseWell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCopy: { flex: 1 },
  pulseTitle: { fontSize: 15, ...geist('600') },
  pulseSub: { fontSize: 12.5, marginTop: 2, ...geist('400') },
});
