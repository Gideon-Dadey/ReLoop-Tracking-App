import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Globe, BarChart3, ChevronRight } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { apiService } from '@/src/api/service';
import { Skeleton } from '@/components/Skeleton';

const RADIUS = 14;

export default function ResearchHubOverview() {
  const c = useThemeColors();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

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
        <Skeleton width="100%" height={160} borderRadius={RADIUS} />
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
      <LinearGradient
        colors={[c.accent + '18', c.accent + '06']}
        style={[styles.hero, { borderColor: c.accent + '28' }]}
      >
        <View style={styles.heroTop}>
          <View style={styles.heroText}>
            <Text style={[styles.heroEyebrow, { color: c.accent }]}>SDG 12 RESEARCH</Text>
            <Text style={[styles.heroTitle, { color: c.text }]}>Research Hub</Text>
            <Text style={[styles.heroDesc, { color: c.textSecondary }]}>
              Track campaigns, daily pulses, and SDG 12 alignment
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statPill, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <Flame size={16} color="#F59E0B" />
            <Text style={[styles.statValue, { color: c.text }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Streak</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <BarChart3 size={16} color="#3B82F6" />
            <Text style={[styles.statValue, { color: c.text }]}>{evaluated}/{total}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Evaluated</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <Globe size={16} color={c.accent} />
            <Text style={[styles.statValue, { color: c.text }]}>{sdg}%</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>SDG 12</Text>
          </View>
        </View>

        <View style={styles.chipRow}>
          <View style={[styles.chip, { backgroundColor: pulseDone ? c.accent + '18' : '#F59E0B18' }]}>
            <Text style={[styles.chipText, { color: pulseDone ? c.accent : '#F59E0B' }]}>
              {pulseDone ? '✓ Pulse done today' : '○ Pulse pending'}
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: researchDone ? c.accent + '18' : c.inputBg }]}>
            <Text style={[styles.chipText, { color: researchDone ? c.accent : c.textMuted }]}>
              {researchDone ? '✓ Research survey' : '○ Research survey'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {!pulseDone && (
        <TouchableOpacity
          style={[styles.pulseCta, { backgroundColor: c.accent }]}
          onPress={() => router.push('/surveys?tab=pulse' as any)}
          activeOpacity={0.85}
        >
          <Flame size={18} color="#FFF" />
          <View style={styles.pulseCtaText}>
            <Text style={styles.pulseCtaTitle}>Today's pulse is waiting</Text>
            <Text style={styles.pulseCtaSub}>30 seconds · keep your streak alive</Text>
          </View>
          <ChevronRight size={18} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, marginBottom: 8 },
  hero: { borderRadius: RADIUS, borderWidth: 1, padding: 16 },
  heroTop: { marginBottom: 16 },
  heroText: { flex: 1 },
  heroEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
  heroTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  heroDesc: { fontSize: 12, lineHeight: 17 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 15, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 11, fontWeight: '600' },
  pulseCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: RADIUS,
  },
  pulseCtaText: { flex: 1 },
  pulseCtaTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  pulseCtaSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
});
