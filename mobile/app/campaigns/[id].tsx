import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ExternalLink, CheckCircle, Star } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { apiService, EvaluateCampaignPayload } from '@/src/api/service';
import { Skeleton } from '@/components/Skeleton';

const RADIUS = 14;

const CRITERIA = [
  { key: 'visualDesignQuality', label: 'Visual Design Quality', description: 'Quality of visual elements, color, composition' },
  { key: 'narrativeCoherence', label: 'Narrative Coherence', description: 'Clear, consistent messaging and storytelling' },
  { key: 'circularEconomyAlignment', label: 'Circular Economy Alignment', description: 'Alignment with zero waste and reuse principles' },
  { key: 'behavioralCallToAction', label: 'Behavioral Call to Action', description: 'Motivates viewers to take sustainable action' },
  { key: 'communityOrientation', label: 'Community Orientation', description: 'Fosters community engagement and participation' },
] as const;

function ScoreSlider({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  const c = useThemeColors();
  return (
    <View style={styles.sliderRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onChange(n)}
          style={[styles.starBtn, n <= value && { backgroundColor: color + '20' }]}
        >
          <Star size={22} color={n <= value ? color : c.textFaint} fill={n <= value ? color : 'transparent'} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function CampaignDetailScreen() {
  const c = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => apiService.getCampaignById(id!),
    enabled: !!id,
  });

  const [scores, setScores] = useState<Record<string, number>>({
    visualDesignQuality: 0,
    narrativeCoherence: 0,
    circularEconomyAlignment: 0,
    behavioralCallToAction: 0,
    communityOrientation: 0,
  });
  const [notes, setNotes] = useState('');
  const [showEval, setShowEval] = useState(false);

  const evaluateMutation = useMutation({
    mutationFn: () => apiService.evaluateCampaign(id!, {
      ...scores,
      evaluatorNotes: notes,
    } as EvaluateCampaignPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowEval(false);
    },
  });

  if (isLoading || !campaign) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <Stack.Screen options={{ title: 'Campaign' }} />
        <View style={{ padding: 20, gap: 16 }}>
          <Skeleton width="100%" height={24} borderRadius={8} />
          <Skeleton width="70%" height={16} borderRadius={8} />
          <Skeleton width="100%" height={120} borderRadius={RADIUS} />
        </View>
      </View>
    );
  }

  const allScored = Object.values(scores).every((v) => v >= 1);

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: campaign.title }} />

      <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <Text style={[styles.title, { color: c.text }]}>{campaign.title}</Text>
        <Text style={[styles.platform, { color: c.textSecondary }]}>
          {campaign.platform.charAt(0).toUpperCase() + campaign.platform.slice(1)} · Submitted {new Date(campaign.createdAt).toLocaleDateString()}
        </Text>
        {campaign.description ? (
          <Text style={[styles.description, { color: c.textSecondary }]}>{campaign.description}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.linkBtn, { borderColor: c.surfaceBorder }]}
          onPress={() => Linking.openURL(campaign.url)}
        >
          <ExternalLink size={16} color={c.accent} />
          <Text style={[styles.linkText, { color: c.accent }]}>Open Campaign</Text>
        </TouchableOpacity>
      </View>

      {campaign.isEvaluated && (
        <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
          <View style={styles.evalHeader}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={[styles.evalTitle, { color: c.text }]}>Evaluation Results</Text>
          </View>

          {CRITERIA.map((cr) => (
            <View key={cr.key} style={styles.scoreRow}>
              <Text style={[styles.criteriaLabel, { color: c.textSecondary }]}>{cr.label}</Text>
              <View style={styles.scoreStars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={16}
                    color={n <= (campaign.scores as any)[cr.key] ? '#F59E0B' : c.textFaint}
                    fill={n <= (campaign.scores as any)[cr.key] ? '#F59E0B' : 'transparent'}
                  />
                ))}
                <Text style={[styles.scoreValue, { color: c.text }]}>{(campaign.scores as any)[cr.key]}</Text>
              </View>
            </View>
          ))}

          <View style={[styles.overallRow, { borderTopColor: c.surfaceBorder }]}>
            <Text style={[styles.overallLabel, { color: c.text }]}>Overall Score</Text>
            <Text style={[styles.overallValue, { color: c.accent }]}>{campaign.scores.overallScore.toFixed(1)} / 5</Text>
          </View>

          {campaign.evaluatorNotes ? (
            <View style={[styles.notesBox, { backgroundColor: c.inputBg }]}>
              <Text style={[styles.notesText, { color: c.textSecondary }]}>{campaign.evaluatorNotes}</Text>
            </View>
          ) : null}
        </View>
      )}

      {!campaign.isEvaluated && !showEval && (
        <TouchableOpacity
          style={[styles.evalBtn, { backgroundColor: c.accent }]}
          onPress={() => setShowEval(true)}
        >
          <Star size={18} color="#FFFFFF" />
          <Text style={styles.evalBtnText}>Evaluate This Campaign</Text>
        </TouchableOpacity>
      )}

      {showEval && (
        <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
          <Text style={[styles.evalFormTitle, { color: c.text }]}>Rate This Campaign</Text>

          {CRITERIA.map((cr) => (
            <View key={cr.key} style={styles.criteriaBlock}>
              <Text style={[styles.criteriaLabel, { color: c.text }]}>{cr.label}</Text>
              <Text style={[styles.criteriaDesc, { color: c.textMuted }]}>{cr.description}</Text>
              <ScoreSlider
                value={scores[cr.key]}
                onChange={(v) => setScores((s) => ({ ...s, [cr.key]: v }))}
                color={c.accent}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: c.accent, opacity: allScored && !evaluateMutation.isPending ? 1 : 0.5 }]}
            onPress={() => evaluateMutation.mutate()}
            disabled={!allScored || evaluateMutation.isPending}
          >
            <Text style={styles.submitText}>{evaluateMutation.isPending ? 'Submitting...' : 'Submit Evaluation'}</Text>
          </TouchableOpacity>

          {evaluateMutation.isError && (
            <Text style={styles.errorText}>{(evaluateMutation.error as Error).message}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  section: { borderRadius: RADIUS, borderWidth: 1, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  platform: { fontSize: 13, marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderRadius: RADIUS, alignSelf: 'flex-start' },
  linkText: { fontSize: 14, fontWeight: '600' },
  evalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  evalTitle: { fontSize: 16, fontWeight: '700' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  criteriaLabel: { fontSize: 13, flex: 1 },
  scoreStars: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  scoreValue: { fontSize: 13, fontWeight: '600', marginLeft: 8 },
  overallRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12, marginTop: 8 },
  overallLabel: { fontSize: 15, fontWeight: '600' },
  overallValue: { fontSize: 18, fontWeight: '700' },
  notesBox: { borderRadius: 10, padding: 12, marginTop: 12 },
  notesText: { fontSize: 13, lineHeight: 18 },
  evalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: RADIUS, marginBottom: 16 },
  evalBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  evalFormTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  criteriaBlock: { marginBottom: 20 },
  criteriaDesc: { fontSize: 12, marginTop: 2, marginBottom: 8 },
  sliderRow: { flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
  starBtn: { flex: 1, aspectRatio: 1, maxWidth: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  submitBtn: { marginTop: 8, padding: 16, borderRadius: RADIUS, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 13, textAlign: 'center', marginTop: 10 },
});
