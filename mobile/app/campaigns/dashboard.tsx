import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, useWindowDimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { TrendingUp, Award, Globe } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { apiService, CampaignPlatform } from '@/src/api/service';
import { Skeleton } from '@/components/Skeleton';
import { PlatformIcon, PLATFORM_META } from '@/components/PlatformIcon';

const RADIUS = 14;

const PLATFORM_COLORS: Record<CampaignPlatform, string> = {
  instagram: PLATFORM_META.instagram.color,
  tiktok: PLATFORM_META.tiktok.color,
  facebook: PLATFORM_META.facebook.color,
  pinterest: PLATFORM_META.pinterest.color,
};

export default function CampaignDashboard() {
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  const chartWidth = width - (isSmall ? 64 : 80);
  const barWidth = isSmall ? 24 : 32;
  const barSpacing = isSmall ? 10 : 16;

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: () => apiService.getCampaignStats(),
  });

  if (isLoading || !stats) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <PinnedScreenHeader showBack title="Campaign Dashboard" />
        <View style={{ padding: 20, gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={160} borderRadius={RADIUS} />
          ))}
        </View>
      </View>
    );
  }

  const barData = [
    { value: stats.averageScores.visualDesignQuality, label: 'Visual', frontColor: '#10B981' },
    { value: stats.averageScores.narrativeCoherence, label: 'Narrative', frontColor: '#3B82F6' },
    { value: stats.averageScores.circularEconomyAlignment, label: 'Circular', frontColor: '#8B5CF6' },
    { value: stats.averageScores.behavioralCallToAction, label: 'Action', frontColor: '#F59E0B' },
    { value: stats.averageScores.communityOrientation, label: 'Community', frontColor: '#EF4444' },
  ];

  const pieData = stats.platformDistribution.map((p) => ({
    value: p.count,
    color: PLATFORM_COLORS[p.platform] || '#6B7280',
    text: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
  }));

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <PinnedScreenHeader showBack title="Campaign Dashboard" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={c.accent} />}
      >
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <TrendingUp size={20} color={c.accent} />
            <Text style={[styles.statValue, { color: c.text }]}>{stats.totalCampaigns}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <Award size={20} color="#F59E0B" />
            <Text style={[styles.statValue, { color: c.text }]}>{stats.evaluatedCampaigns}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>Evaluated</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <Globe size={20} color="#3B82F6" />
            <Text style={[styles.statValue, { color: c.text }]}>{stats.sdg12AlignmentPercent}%</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>SDG 12</Text>
          </View>
        </View>

        {/* Score Distribution */}
        <View style={[styles.chartSection, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Average Scores by Criteria</Text>
          <BarChart
            data={barData}
            barWidth={barWidth}
            spacing={barSpacing}
            maxValue={5}
            noOfSections={5}
            yAxisTextStyle={{ color: c.textMuted, fontSize: 11 }}
            xAxisLabelTextStyle={{ color: c.textMuted, fontSize: isSmall ? 7 : 9 }}
            rulesColor={c.surfaceBorder}
            yAxisColor="transparent"
            xAxisColor="transparent"
            barBorderRadius={6}
            width={chartWidth}
            height={isSmall ? 150 : 180}
            isAnimated
          />
        </View>

        {/* Platform Distribution */}
        {pieData.length > 0 && (
          <View style={[styles.chartSection, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Platform Distribution</Text>
            <View style={styles.pieContainer}>
              <PieChart
                data={pieData}
                radius={isSmall ? 60 : 70}
                donut
                innerRadius={isSmall ? 38 : 45}
                centerLabelComponent={() => (
                  <View style={styles.pieCenter}>
                    <Text style={[styles.pieCenterValue, { color: '#ffffff' }]}>{stats.totalCampaigns}</Text>
                    <Text style={[styles.pieCenterLabel, { color: '#9CA3AF' }]}>Total</Text>
                  </View>
                )}
              />
              <View style={styles.legendContainer}>
                {stats.platformDistribution.map((p) => (
                  <View key={p.platform} style={styles.legendItem}>
                    <PlatformIcon platform={p.platform} size={16} />
                    <Text style={[styles.legendText, { color: c.textSecondary }]}>
                      {PLATFORM_META[p.platform].label}
                    </Text>
                    <Text style={[styles.legendCount, { color: c.text }]}>{p.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Top Campaigns */}
        {stats.topCampaigns.length > 0 && (
          <View style={[styles.chartSection, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Top Campaigns</Text>
            {stats.topCampaigns.map((cp, i) => (
              <View key={cp._id} style={[styles.topItem, i < stats.topCampaigns.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.surfaceBorder }]}>
                <View style={[styles.rankBadge, { backgroundColor: i === 0 ? '#F59E0B22' : c.inputBg }]}>
                  <Text style={[styles.rankText, { color: i === 0 ? '#F59E0B' : c.textMuted }]}>#{i + 1}</Text>
                </View>
                <View style={styles.topContent}>
                  <Text style={[styles.topTitle, { color: c.text }]} numberOfLines={1}>{cp.title}</Text>
                  <View style={styles.topPlatformRow}>
                    <PlatformIcon platform={cp.platform as CampaignPlatform} size={12} />
                    <Text style={[styles.topPlatform, { color: c.textMuted }]}>
                      {PLATFORM_META[cp.platform as CampaignPlatform]?.label ?? cp.platform}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.topScore, { color: c.accent }]}>{cp.scores.overallScore.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* SDG 12 Alignment */}
        <View style={[styles.chartSection, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>SDG 12 Alignment</Text>
          <View style={styles.alignmentContainer}>
            <View style={[styles.alignmentBg, { backgroundColor: c.inputBg }]}>
              <View style={[styles.alignmentFill, { width: `${stats.sdg12AlignmentPercent}%`, backgroundColor: c.accent }]} />
            </View>
            <Text style={[styles.alignmentText, { color: c.text }]}>
              {stats.sdg12AlignmentPercent}% alignment with responsible consumption & production goals
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: RADIUS, borderWidth: 1, padding: 12, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '500' },
  chartSection: { borderRadius: RADIUS, borderWidth: 1, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  pieContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 },
  pieCenter: { alignItems: 'center', justifyContent: 'center' },
  pieCenterValue: { fontSize: 24, fontWeight: '800' },
  pieCenterLabel: { fontSize: 11, marginTop: 2 },
  legendContainer: { gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendText: { fontSize: 13, flex: 1 },
  legendCount: { fontSize: 15, fontWeight: '700', minWidth: 24, textAlign: 'right' },
  topItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rankBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 13, fontWeight: '700' },
  topContent: { flex: 1, marginLeft: 12 },
  topTitle: { fontSize: 14, fontWeight: '600' },
  topPlatformRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  topPlatform: { fontSize: 12 },
  topScore: { fontSize: 16, fontWeight: '700' },
  alignmentContainer: { gap: 12 },
  alignmentBg: { height: 12, borderRadius: 6, overflow: 'hidden' },
  alignmentFill: { height: '100%', borderRadius: 6 },
  alignmentText: { fontSize: 13, lineHeight: 18 },
});
