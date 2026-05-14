import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, TextInput,
  StyleSheet, RefreshControl, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useThemeColors } from '@/src/store/useThemeStore';
import { apiService, Campaign, CampaignPlatform } from '@/src/api/service';
import { Skeleton } from '@/components/Skeleton';

const RADIUS = 14;

const PLATFORM_ICON_NAMES: Record<CampaignPlatform, string> = {
  instagram: 'instagram',
  tiktok: 'tiktok',
  facebook: 'facebook-f',
  pinterest: 'pinterest-p',
};

const PLATFORM_COLORS: Record<CampaignPlatform, string> = {
  instagram: '#F56040',
  tiktok: '#69C9D0',
  facebook: '#4599FF',
  pinterest: '#FF4757',
};

function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const c = useThemeColors();
  const pct = (score / 5) * 100;
  const color = pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : pct >= 40 ? '#F97316' : '#EF4444';
  return (
    <View style={[styles.scoreRing, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <Text style={[styles.scoreText, { color, fontSize: size * 0.32 }]}>{score.toFixed(1)}</Text>
    </View>
  );
}

function CampaignCard({ item }: { item: Campaign }) {
  const c = useThemeColors();
  const iconName = PLATFORM_ICON_NAMES[item.platform] || 'globe';
  const platformColor = PLATFORM_COLORS[item.platform] || c.accent;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
      onPress={() => router.push(`/campaigns/${item._id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.cardRow}>
        <View style={[styles.platformBadge, { backgroundColor: platformColor + '22' }]}>
          <FontAwesome5 name={iconName} size={18} color={platformColor} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[styles.cardMeta, { color: c.textSecondary }]}>
            {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)} · {new Date(item.createdAt).toLocaleDateString()}
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

  const platforms: CampaignPlatform[] = ['instagram', 'tiktok', 'facebook', 'pinterest'];

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
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>No campaigns yet. Submit the first one!</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.accent }]}
        onPress={() => setShowCreate(true)}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
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
              <Text style={[styles.label, { color: c.textSecondary }]}>Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.surfaceBorder }]}
                value={form.title}
                onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                placeholder="Campaign title"
                placeholderTextColor={c.textMuted}
                maxLength={200}
              />

              <Text style={[styles.label, { color: c.textSecondary }]}>Platform</Text>
              <View style={styles.platformRow}>
                {platforms.map((p) => {
                  const active = form.platform === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.platformChip, active && { backgroundColor: PLATFORM_COLORS[p] + '22', borderColor: PLATFORM_COLORS[p] }, { borderColor: c.surfaceBorder }]}
                      onPress={() => setForm((f) => ({ ...f, platform: p }))}
                    >
                      <FontAwesome5 name={PLATFORM_ICON_NAMES[p]} size={16} color={active ? PLATFORM_COLORS[p] : c.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.label, { color: c.textSecondary }]}>URL</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.surfaceBorder }]}
                value={form.url}
                onChangeText={(v) => setForm((f) => ({ ...f, url: v }))}
                placeholder="https://..."
                placeholderTextColor={c.textMuted}
                autoCapitalize="none"
                keyboardType="url"
              />

              <Text style={[styles.label, { color: c.textSecondary }]}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.multiline, { backgroundColor: c.inputBg, color: c.text, borderColor: c.surfaceBorder }]}
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="Brief description..."
                placeholderTextColor={c.textMuted}
                multiline
                maxLength={1000}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: c.accent, opacity: createMutation.isPending ? 0.7 : 1 }]}
                onPress={() => createMutation.mutate(form)}
                disabled={!form.title || !form.url || createMutation.isPending}
              >
                <Text style={styles.submitText}>{createMutation.isPending ? 'Submitting...' : 'Submit Campaign'}</Text>
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
  platformBadge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  cardMeta: { fontSize: 11 },
  scoreRing: { borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontWeight: '700' },
  pendingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pendingText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderRadius: RADIUS, padding: 14, fontSize: 15 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  platformRow: { flexDirection: 'row', gap: 10 },
  platformChip: { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  submitBtn: { marginTop: 24, padding: 16, borderRadius: RADIUS, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 13, textAlign: 'center', marginTop: 10 },
});
