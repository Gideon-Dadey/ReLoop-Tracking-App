import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, TextInput,
  StyleSheet, RefreshControl, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Plus, X, Link2, Sparkles, Share2, CheckCircle2 } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { apiService, Campaign, CampaignPlatform } from '@/src/api/service';
import { Skeleton } from '@/components/Skeleton';
import {
  PlatformBadge,
  PlatformPicker,
  PLATFORM_META,
  urlMatchesPlatform,
} from '@/components/PlatformIcon';

const RADIUS = 14;

function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const pct = (score / 5) * 100;
  const color = pct >= 80 ? '#059669' : pct >= 60 ? '#F59E0B' : pct >= 40 ? '#EA580C' : '#E11D48';
  return (
    <View style={[styles.scoreRing, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <Text style={[styles.scoreText, { color, fontSize: size * 0.32 }]}>{score.toFixed(1)}</Text>
    </View>
  );
}

function CampaignCard({ item }: { item: Campaign }) {
  const c = useThemeColors();
  const meta = PLATFORM_META[item.platform];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
      onPress={() => router.push(`/campaigns/${item._id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.cardRow}>
        <PlatformBadge platform={item.platform} />
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[styles.cardMeta, { color: c.textSecondary }]}>
            {meta.label} · {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {item.isEvaluated && <ScoreRing score={item.scores.overallScore} />}
        {!item.isEvaluated && (
          <View style={[styles.pendingBadge, { backgroundColor: c.accentSoft }]}>
            <Text style={[styles.pendingText, { color: c.accent }]}>Pending</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function CampaignsScreen() {
  const c = useThemeColors();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', platform: 'instagram' as CampaignPlatform, url: '', description: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => apiService.getCampaigns(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof form) => apiService.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowCreate(false);
      setForm({ title: '', platform: 'instagram', url: '', description: '' });
    },
  });

  const platformMeta = PLATFORM_META[form.platform];
  const urlValid = useMemo(() => urlMatchesPlatform(form.url, form.platform), [form.url, form.platform]);
  const canSubmit = form.title.trim().length > 0 && form.url.trim().length > 0;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <Stack.Screen options={{ title: 'Campaigns' }} />
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ padding: 16 }}>
            <Skeleton width="100%" height={80} borderRadius={RADIUS} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <Stack.Screen options={{ title: 'Campaigns' }} />

      <FlatList
        data={data?.campaigns || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <CampaignCard item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={c.accent} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Sparkles size={40} color={c.accent} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No campaigns yet</Text>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Submit a zero-waste campaign from Instagram, TikTok, Facebook, or Pinterest for the community to evaluate.
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.accent }]}
        onPress={() => setShowCreate(true)}
        activeOpacity={0.8}
      >
        <Plus size={24} color={c.onAccent} />
      </TouchableOpacity>

      <Modal visible={showCreate} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Submit Campaign</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <X size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.tipBanner, { backgroundColor: c.accent + '12', borderColor: c.accent + '30' }]}>
                <Text style={[styles.tipText, { color: c.textSecondary }]}>
                  Share campaigns about reusables, zero waste, or circular economy — then invite others to evaluate them.
                </Text>
              </View>

              <Text style={[styles.label, { color: c.textSecondary }]}>Platform</Text>
              <PlatformPicker
                value={form.platform}
                onChange={(platform) => setForm((f) => ({ ...f, platform }))}
                mutedColor={c.textMuted}
                borderColor={c.surfaceBorder}
              />

              <Text style={[styles.label, { color: c.textSecondary }]}>Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.surfaceBorder }]}
                value={form.title}
                onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                placeholder="e.g. #ReuseRevolution brand campaign"
                placeholderTextColor={c.textMuted}
                maxLength={200}
              />
              <Text style={[styles.charCount, { color: c.textMuted }]}>{form.title.length}/200</Text>

              <Text style={[styles.label, { color: c.textSecondary }]}>Campaign URL</Text>
              <View style={styles.urlInputWrap}>
                <Link2 size={16} color={c.textMuted} style={styles.urlIcon} />
                <TextInput
                  style={[
                    styles.input,
                    styles.urlInput,
                    {
                      backgroundColor: c.inputBg,
                      color: c.text,
                      borderColor: urlValid ? platformMeta.color + '80' : c.surfaceBorder,
                    },
                  ]}
                  value={form.url}
                  onChangeText={(v) => setForm((f) => ({ ...f, url: v }))}
                  placeholder={platformMeta.urlHint}
                  placeholderTextColor={c.textMuted}
                  autoCapitalize="none"
                  keyboardType="url"
                  autoCorrect={false}
                />
                {urlValid && (
                  <CheckCircle2 size={18} color={platformMeta.color} style={styles.urlCheck} />
                )}
              </View>
              <Text style={[styles.urlHint, { color: c.textMuted }]}>
                Paste the public link to the post on {platformMeta.label}
              </Text>

              <Text style={[styles.label, { color: c.textSecondary }]}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.multiline, { backgroundColor: c.inputBg, color: c.text, borderColor: c.surfaceBorder }]}
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="What makes this campaign stand out? Key message, audience, or impact…"
                placeholderTextColor={c.textMuted}
                multiline
                maxLength={1000}
              />

              {(form.title.trim() || form.url.trim()) && (
                <View style={[styles.previewCard, { backgroundColor: c.inputBg, borderColor: c.surfaceBorder }]}>
                  <Text style={[styles.previewLabel, { color: c.textMuted }]}>PREVIEW</Text>
                  <View style={styles.previewRow}>
                    <PlatformBadge platform={form.platform} size="sm" />
                    <View style={styles.previewContent}>
                      <Text style={[styles.previewTitle, { color: c.text }]} numberOfLines={2}>
                        {form.title.trim() || 'Campaign title'}
                      </Text>
                      <Text style={[styles.previewMeta, { color: platformMeta.color }]}>
                        {platformMeta.label}
                        {form.url.trim() ? ` · ${form.url.replace(/^https?:\/\//, '').slice(0, 28)}…` : ''}
                      </Text>
                    </View>
                    <Share2 size={16} color={c.textMuted} />
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: c.accent, opacity: createMutation.isPending || !canSubmit ? 0.7 : 1 }]}
                onPress={() => createMutation.mutate(form)}
                disabled={!canSubmit || createMutation.isPending}
              >
                <Share2 size={18} color={c.onAccent} />
                <Text style={[styles.submitText, { color: c.onAccent }]}>{createMutation.isPending ? 'Submitting...' : 'Submit Campaign'}</Text>
              </TouchableOpacity>

              {createMutation.isError && (
                <Text style={styles.errorText}>{(createMutation.error as Error).message}</Text>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 100 },
  card: { borderRadius: RADIUS, borderWidth: 1, marginBottom: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  cardMeta: { fontSize: 11 },
  scoreRing: { borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontWeight: '700' },
  pendingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pendingText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '600' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  tipBanner: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 4 },
  tipText: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 8, marginTop: 14 },
  input: { borderWidth: 1, borderRadius: RADIUS, padding: 14, fontSize: 15 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 4 },
  urlInputWrap: { position: 'relative' },
  urlIcon: { position: 'absolute', left: 14, top: 16, zIndex: 1 },
  urlInput: { paddingLeft: 40, paddingRight: 40 },
  urlCheck: { position: 'absolute', right: 14, top: 15 },
  urlHint: { fontSize: 11, marginTop: 6 },
  previewCard: { marginTop: 16, borderRadius: RADIUS, borderWidth: 1, padding: 14 },
  previewLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewContent: { flex: 1 },
  previewTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  previewMeta: { fontSize: 11, fontWeight: '500' },
  submitBtn: { marginTop: 24, padding: 16, borderRadius: RADIUS, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 13, textAlign: 'center', marginTop: 10 },
});
