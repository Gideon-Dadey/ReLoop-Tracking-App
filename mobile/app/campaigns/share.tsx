import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform,
} from 'react-native';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import { useQuery } from '@tanstack/react-query';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Share2, Leaf, Recycle, Flame, Download } from 'lucide-react-native';
import { useThemeColors, colors } from '@/src/store/useThemeStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { apiService, CampaignPlatform } from '@/src/api/service';
import { Skeleton } from '@/components/Skeleton';
import { PlatformIcon, PLATFORM_META } from '@/components/PlatformIcon';

const RADIUS = 14;

type CardTheme = 'dark' | 'light' | 'slate';

const CARD_THEMES: Record<CardTheme, { bg: string; text: string; accent: string; secondary: string }> = {
  dark: { bg: '#000000', text: '#ffffff', accent: '#ffffff', secondary: '#a1a1aa' },
  light: { bg: colors.light.surface, text: colors.light.text, accent: colors.light.accent, secondary: colors.light.textMuted },
  slate: { bg: '#111111', text: '#ffffff', accent: '#ffffff', secondary: '#a1a1aa' },
};

function ImpactCard({ theme, user }: { theme: CardTheme; user: any }) {
  const t = CARD_THEMES[theme];
  return (
    <View style={[styles.impactCard, { backgroundColor: t.bg }]}>
      <View style={styles.cardBrand}>
        <Recycle size={20} color={t.accent} />
        <Text style={[styles.brandText, { color: t.accent }]}>ReLoop</Text>
      </View>

      <Text style={[styles.cardHeading, { color: t.text }]}>My Sustainability Impact</Text>
      <Text style={[styles.cardName, { color: t.secondary }]}>@{user?.userName || 'user'}</Text>

      <View style={styles.cardStats}>
        <View style={styles.cardStatItem}>
          <Leaf size={18} color={t.accent} />
          <Text style={[styles.cardStatValue, { color: t.text }]}>{user?.impact?.plasticSaved || 0}g</Text>
          <Text style={[styles.cardStatLabel, { color: t.secondary }]}>Plastic Saved</Text>
        </View>
        <View style={styles.cardStatItem}>
          <Recycle size={18} color={t.accent} />
          <Text style={[styles.cardStatValue, { color: t.text }]}>{user?.impact?.totalReturns || 0}</Text>
          <Text style={[styles.cardStatLabel, { color: t.secondary }]}>Returns</Text>
        </View>
        <View style={styles.cardStatItem}>
          <Flame size={18} color={t.accent} />
          <Text style={[styles.cardStatValue, { color: t.text }]}>{user?.streakCount || 0}</Text>
          <Text style={[styles.cardStatLabel, { color: t.secondary }]}>Day Streak</Text>
        </View>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: t.secondary + '30' }]}>
        <Text style={[styles.footerText, { color: t.secondary }]}>Supporting SDG 12 · Responsible Consumption</Text>
      </View>
    </View>
  );
}

function CampaignHighlightCard({ theme, campaign }: { theme: CardTheme; campaign: any }) {
  const t = CARD_THEMES[theme];
  return (
    <View style={[styles.impactCard, { backgroundColor: t.bg }]}>
      <View style={styles.cardBrand}>
        <Recycle size={20} color={t.accent} />
        <Text style={[styles.brandText, { color: t.accent }]}>ReLoop Campaign</Text>
      </View>

      <Text style={[styles.cardHeading, { color: t.text }]}>{campaign.title}</Text>
      <View style={styles.campaignPlatformRow}>
        {campaign.platform && (
          <PlatformIcon platform={campaign.platform as CampaignPlatform} size={14} />
        )}
        <Text style={[styles.cardName, { color: t.secondary, marginBottom: 0 }]}>
          {campaign.platform ? `${PLATFORM_META[campaign.platform as CampaignPlatform]?.label ?? campaign.platform} · ` : ''}
          Score: {campaign.scores?.overallScore?.toFixed(1) || '—'} / 5
        </Text>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: t.secondary + '30' }]}>
        <Text style={[styles.footerText, { color: t.secondary }]}>Zero Waste · Circular Economy · SDG 12</Text>
      </View>
    </View>
  );
}

export default function ShareScreen() {
  const c = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const viewShotRef = useRef<any>(null);
  const campaignShotRef = useRef<any>(null);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('dark');
  const [shareType, setShareType] = useState<'impact' | 'campaign'>('impact');

  const { data: stats } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: () => apiService.getCampaignStats(),
  });

  const topCampaign = stats?.topCampaigns?.[0];

  const handleShare = async () => {
    try {
      const ref = shareType === 'impact' ? viewShotRef : campaignShotRef;
      const uri = await (ref.current as any)?.capture?.();
      if (!uri) {
        Alert.alert('Error', 'Could not capture card image');
        return;
      }
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your impact' });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to share');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <PinnedScreenHeader showBack title="Share Your Impact" />
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>

      {/* Type Selector */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, shareType === 'impact' && { backgroundColor: c.accent }]}
          onPress={() => setShareType('impact')}
        >
          <Text style={[styles.typeText, { color: shareType === 'impact' ? c.onAccent : c.textSecondary }]}>My Impact</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, shareType === 'campaign' && { backgroundColor: c.accent }]}
          onPress={() => setShareType('campaign')}
        >
          <Text style={[styles.typeText, { color: shareType === 'campaign' ? c.onAccent : c.textSecondary }]}>Top Campaign</Text>
        </TouchableOpacity>
      </View>

      {/* Theme Selector */}
      <Text style={[styles.label, { color: c.textSecondary }]}>Card Style</Text>
      <View style={styles.themeRow}>
        {(['dark', 'light', 'slate'] as CardTheme[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.themeChip,
              { backgroundColor: CARD_THEMES[t].bg, borderColor: selectedTheme === t ? c.accent : c.surfaceBorder },
              selectedTheme === t && { borderWidth: 2 },
            ]}
            onPress={() => setSelectedTheme(t)}
          >
            <Text style={[styles.themeLabel, { color: CARD_THEMES[t].text }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preview */}
      {shareType === 'impact' && (
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <ImpactCard theme={selectedTheme} user={user} />
        </ViewShot>
      )}

      {shareType === 'campaign' && topCampaign && (
        <ViewShot ref={campaignShotRef} options={{ format: 'png', quality: 1 }}>
          <CampaignHighlightCard theme={selectedTheme} campaign={topCampaign} />
        </ViewShot>
      )}

      {shareType === 'campaign' && !topCampaign && (
        <View style={[styles.emptyCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            No evaluated campaigns yet. Evaluate a campaign to create a highlight card!
          </Text>
        </View>
      )}

      {/* Share Button */}
      <TouchableOpacity style={[styles.shareBtn, { backgroundColor: c.accent }]} onPress={handleShare}>
        <Share2 size={20} color={c.onAccent} />
        <Text style={[styles.shareBtnText, { color: c.onAccent }]}>Share Card</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: RADIUS, alignItems: 'center' },
  typeText: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 10 },
  themeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  themeChip: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  themeLabel: { fontSize: 13, fontWeight: '600' },
  impactCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
  cardBrand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  brandText: { fontSize: 13, fontWeight: '700' },
  cardHeading: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  campaignPlatformRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 },
  cardName: { fontSize: 13, marginBottom: 18 },
  cardStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 18 },
  cardStatItem: { alignItems: 'center', gap: 4, flex: 1 },
  cardStatValue: { fontSize: 16, fontWeight: '700' },
  cardStatLabel: { fontSize: 10 },
  cardFooter: { borderTopWidth: 1, paddingTop: 12 },
  footerText: { fontSize: 11, textAlign: 'center' },
  emptyCard: { borderRadius: RADIUS, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 20 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: RADIUS },
  shareBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
