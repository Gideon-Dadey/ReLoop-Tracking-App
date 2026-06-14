import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Flame, Users, Calendar } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { screenHeader } from '@/src/theme/screenHeader';
import { apiService } from '@/src/api/service';
import { Skeleton } from '@/components/Skeleton';
import {
  getQuestionForDate,
  getPulseVersion,
  formatLocalDateKey,
  PULSE_CATEGORY_COLORS,
} from '@/src/data/dailyPulseQuestions';

const RADIUS = 14;

const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly\nDisagree', emoji: '😟' },
  { value: 2, label: 'Disagree', emoji: '🙁' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Agree', emoji: '🙂' },
  { value: 5, label: 'Strongly\nAgree', emoji: '😊' },
];

export default function DailyPulsePanel() {
  const c = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const isSmall = screenWidth < 360;
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  const todayQuestion = getQuestionForDate();
  const pulseVersion = getPulseVersion();
  const categoryColor = PULSE_CATEGORY_COLORS[todayQuestion.category];

  const { data: pulseStatus, isLoading } = useQuery({
    queryKey: ['pulse-status', todayQuestion.dateKey],
    queryFn: () => apiService.getPulseStatus(formatLocalDateKey()),
  });

  const { data: pulseResults } = useQuery({
    queryKey: ['pulse-results', pulseVersion],
    queryFn: () => apiService.getSurveyResults(pulseVersion),
    enabled: !!(pulseStatus?.completedToday || justCompleted),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      apiService.submitSurvey({
        surveyVersion: pulseVersion,
        responses: [{ questionId: todayQuestion.id, value: selected! }],
      }),
    onSuccess: async () => {
      setJustCompleted(true);
      await queryClient.invalidateQueries({ queryKey: ['pulse-status'] });
      queryClient.invalidateQueries({ queryKey: ['pulse-results', pulseVersion] });
    },
  });

  if (isLoading) {
    return (
      <View style={{ padding: 20 }}>
        <Skeleton width="100%" height={220} borderRadius={RADIUS} />
      </View>
    );
  }

  const completed = pulseStatus?.completedToday || justCompleted;
  const streak = pulseStatus?.streak ?? 0;
  const communityAvg = pulseResults?.avgScore ?? pulseResults?.questions?.[0]?.avgScore ?? 0;

  if (completed) {
    return (
      <ScrollView contentContainerStyle={styles.completedContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.streakCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
          <View style={[styles.streakIcon, { backgroundColor: '#F59E0B18' }]}>
            <Flame size={28} color="#F59E0B" fill="#F59E0B" />
          </View>
          <Text style={[styles.streakValue, { color: c.text }]}>
            {pulseStatus?.streak ?? 0}
          </Text>
          <Text style={[styles.streakLabel, { color: c.textMuted }]}>day streak</Text>
        </View>

        <View style={[styles.doneCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
          <CheckCircle2 size={44} color={c.accent} />
          <Text style={[screenHeader.modalTitle, { color: c.text }]}>Today's pulse recorded</Text>
          <Text style={[styles.doneSubtitle, { color: c.textSecondary }]}>
            Come back tomorrow for a new question. Your streak grows with each daily check-in.
          </Text>

          {pulseResults && pulseResults.totalRespondents > 0 && (
            <View style={[styles.communityBox, { backgroundColor: c.inputBg }]}>
              <Users size={16} color={c.accent} />
              <View style={styles.communityText}>
                <Text style={[styles.communityTitle, { color: c.text }]}>Community today</Text>
                <Text style={[styles.communityMeta, { color: c.textMuted }]}>
                  Avg {communityAvg.toFixed(1)} / 5 · {pulseResults.totalRespondents} response{pulseResults.totalRespondents !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.totalPill, { backgroundColor: c.accent + '14' }]}>
            <Calendar size={14} color={c.accent} />
            <Text style={[styles.totalText, { color: c.accent }]}>
              {pulseStatus?.totalCompleted ?? 0} daily pulse{(pulseStatus?.totalCompleted ?? 0) !== 1 ? 's' : ''} completed
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.categoryPill, { backgroundColor: categoryColor + '18' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>{todayQuestion.category}</Text>
        </View>
        <View style={styles.streakPill}>
          <Flame size={14} color="#F59E0B" />
          <Text style={[styles.streakPillText, { color: c.textMuted }]}>{streak} day streak</Text>
        </View>
      </View>

      <Text style={[styles.pulseEyebrow, { color: c.textFaint }]}>TODAY'S QUESTION</Text>
      <Text style={[styles.questionText, { color: c.text, fontSize: isSmall ? 18 : 21 }]}>
        {todayQuestion.text}
      </Text>

      <View style={styles.likertRow}>
        {LIKERT_OPTIONS.map((opt) => {
          const active = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.likertBtn,
                {
                  backgroundColor: active ? c.accent + '20' : c.surface,
                  borderColor: active ? c.accent : c.surfaceBorder,
                  paddingVertical: isSmall ? 10 : 14,
                },
              ]}
              onPress={() => setSelected(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.likertEmoji, { fontSize: isSmall ? 18 : 22 }]}>{opt.emoji}</Text>
              <Text style={[styles.likertLabel, { color: active ? c.accent : c.textMuted, fontSize: isSmall ? 8 : 10 }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: c.accent, opacity: selected && !submitMutation.isPending ? 1 : 0.5 }]}
        onPress={() => submitMutation.mutate()}
        disabled={!selected || submitMutation.isPending}
      >
        <Text style={styles.submitText}>
          {submitMutation.isPending ? 'Saving...' : 'Submit today\'s pulse'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.hint, { color: c.textMuted }]}>
        One quick question each day · {DAILY_PULSE_HINT} questions rotate across the month
      </Text>

      {submitMutation.isError && (
        <Text style={styles.errorText}>{(submitMutation.error as Error).message}</Text>
      )}
    </View>
  );
}

const DAILY_PULSE_HINT = '21';

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  categoryPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryText: { fontSize: 12, fontWeight: '700' },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  streakPillText: { fontSize: 13, fontWeight: '600' },
  pulseEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  questionText: { fontSize: 21, fontWeight: '600', lineHeight: 30, marginBottom: 28 },
  likertRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  likertBtn: { flex: 1, alignItems: 'center', borderRadius: 12, borderWidth: 1.5, gap: 6 },
  likertEmoji: { fontSize: 22 },
  likertLabel: { fontSize: 10, textAlign: 'center', fontWeight: '500' },
  submitBtn: { marginTop: 28, paddingVertical: 16, borderRadius: RADIUS, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 14, lineHeight: 18 },
  errorText: { color: '#EF4444', fontSize: 13, textAlign: 'center', marginTop: 12 },
  completedContent: { padding: 20, paddingBottom: 40 },
  streakCard: {
    borderRadius: RADIUS, borderWidth: 1, padding: 20, alignItems: 'center', marginBottom: 16,
  },
  streakIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  streakValue: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  streakLabel: { fontSize: 14, fontWeight: '600' },
  doneCard: {
    borderRadius: RADIUS, borderWidth: 1, padding: 24, alignItems: 'center', gap: 10,
  },
  doneSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  communityBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, width: '100%', marginTop: 8 },
  communityText: { flex: 1 },
  communityTitle: { fontSize: 14, fontWeight: '600' },
  communityMeta: { fontSize: 12, marginTop: 2 },
  totalPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginTop: 8 },
  totalText: { fontSize: 12, fontWeight: '600' },
});
