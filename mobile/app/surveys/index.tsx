import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, useWindowDimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { apiService, SurveyAnswer } from '@/src/api/service';
import { Skeleton } from '@/components/Skeleton';

const RADIUS = 14;
const SURVEY_VERSION = '1.0';

const QUESTIONS = [
  { id: 1, section: 'A', text: 'I intend to reduce my use of single-use packaging in the next month' },
  { id: 2, section: 'A', text: 'People important to me support my use of reusable containers' },
  { id: 3, section: 'A', text: 'I feel confident I can adopt zero waste practices in my daily life' },
  { id: 4, section: 'A', text: 'Seeing zero waste campaigns on social media motivates me to act sustainably' },
  { id: 5, section: 'A', text: 'I plan to recommend reusable packaging to friends and family' },
  { id: 6, section: 'B', text: 'I feel connected to a community of people who care about reducing waste' },
  { id: 7, section: 'B', text: 'I have learned practical skills for zero waste living from social media' },
  { id: 8, section: 'B', text: 'I believe our community can create meaningful change in waste reduction' },
  { id: 9, section: 'B', text: 'Social media campaigns have helped me understand the circular economy' },
  { id: 10, section: 'B', text: 'I feel motivated to advocate for systemic changes in packaging practices' },
];

const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly\nDisagree', emoji: '😟' },
  { value: 2, label: 'Disagree', emoji: '🙁' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Agree', emoji: '🙂' },
  { value: 5, label: 'Strongly\nAgree', emoji: '😊' },
];

export default function SurveyScreen() {
  const c = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const isSmall = screenWidth < 360;
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['survey-status'],
    queryFn: () => apiService.getSurveyStatus(SURVEY_VERSION),
  });

  const { data: results } = useQuery({
    queryKey: ['survey-results'],
    queryFn: () => apiService.getSurveyResults(SURVEY_VERSION),
    enabled: completed || !!status?.completed,
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      const responses: SurveyAnswer[] = QUESTIONS.map((q) => ({
        questionId: q.id,
        value: answers[q.id] || 3,
      }));
      return apiService.submitSurvey({ responses, surveyVersion: SURVEY_VERSION });
    },
    onSuccess: () => {
      setCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['survey-status'] });
      queryClient.invalidateQueries({ queryKey: ['survey-results'] });
    },
  });

  const animateTransition = useCallback((direction: 'next' | 'prev') => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      setCurrentIndex((i) => direction === 'next' ? i + 1 : i - 1);
    }, 120);
  }, [fadeAnim]);

  const handleSelect = (value: number) => {
    setAnswers((a) => ({ ...a, [QUESTIONS[currentIndex].id]: value }));
  };

  if (statusLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <Stack.Screen options={{ title: 'Community Survey' }} />
        <View style={{ padding: 20, gap: 16 }}>
          <Skeleton width="100%" height={200} borderRadius={RADIUS} />
        </View>
      </View>
    );
  }

  if (status?.completed || completed) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.completedContent}>
        <Stack.Screen options={{ title: 'Community Survey' }} />
        <View style={[styles.completedCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
          <CheckCircle2 size={48} color={c.accent} />
          <Text style={[styles.completedTitle, { color: c.text }]}>Thank You!</Text>
          <Text style={[styles.completedSubtitle, { color: c.textSecondary }]}>
            Your response has been recorded. Here's how the community is doing:
          </Text>

          {results && (
            <View style={styles.resultsContainer}>
              <View style={[styles.resultSection, { borderColor: c.surfaceBorder }]}>
                <Text style={[styles.resultSectionTitle, { color: c.text }]}>Behavioral Intentions</Text>
                <Text style={[styles.resultScore, { color: c.accent }]}>
                  {results.sectionAverages.behavioralIntentions.toFixed(1)} / 5
                </Text>
              </View>
              <View style={[styles.resultSection, { borderColor: c.surfaceBorder }]}>
                <Text style={[styles.resultSectionTitle, { color: c.text }]}>Community Resilience</Text>
                <Text style={[styles.resultScore, { color: c.accent }]}>
                  {results.sectionAverages.communityResilience.toFixed(1)} / 5
                </Text>
              </View>
              <Text style={[styles.respondentCount, { color: c.textMuted }]}>
                {results.totalRespondents} respondent{results.totalRespondents !== 1 ? 's' : ''} so far
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  const question = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const isLast = currentIndex === QUESTIONS.length - 1;
  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <Stack.Screen options={{ title: 'Community Survey' }} />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBg, { backgroundColor: c.inputBg }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: c.accent }]} />
        </View>
        <Text style={[styles.progressText, { color: c.textMuted }]}>
          {currentIndex + 1} of {QUESTIONS.length}
        </Text>
      </View>

      {/* Section Label */}
      <View style={styles.sectionLabel}>
        <Text style={[styles.sectionText, { color: c.textSecondary }]}>
          {question.section === 'A' ? 'Section A: Sustainable Behavioral Intentions' : 'Section B: Community Resilience Outcomes'}
        </Text>
      </View>

      {/* Question */}
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <Text style={[styles.questionText, { color: c.text, fontSize: isSmall ? 17 : 20 }]}>{question.text}</Text>

        {/* Likert Scale */}
        <View style={styles.likertRow}>
          {LIKERT_OPTIONS.map((opt) => {
            const selected = answers[question.id] === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.likertBtn,
                  { backgroundColor: selected ? c.accent + '20' : c.surface, borderColor: selected ? c.accent : c.surfaceBorder, paddingVertical: isSmall ? 10 : 14 },
                ]}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.likertEmoji, { fontSize: isSmall ? 18 : 22 }]}>{opt.emoji}</Text>
                <Text style={[styles.likertLabel, { color: selected ? c.accent : c.textMuted, fontSize: isSmall ? 8 : 10 }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: c.surface, borderColor: c.surfaceBorder, opacity: currentIndex === 0 ? 0.4 : 1 }]}
          onPress={() => currentIndex > 0 && animateTransition('prev')}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} color={c.text} />
          <Text style={[styles.navBtnText, { color: c.text }]}>Back</Text>
        </TouchableOpacity>

        {!isLast && (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: c.accent, borderColor: c.accent, opacity: answers[question.id] ? 1 : 0.5 }]}
            onPress={() => answers[question.id] && animateTransition('next')}
            disabled={!answers[question.id]}
          >
            <Text style={[styles.navBtnText, { color: '#FFF' }]}>Next</Text>
            <ChevronRight size={20} color="#FFF" />
          </TouchableOpacity>
        )}

        {isLast && (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: c.accent, borderColor: c.accent, opacity: allAnswered && !submitMutation.isPending ? 1 : 0.5 }]}
            onPress={() => submitMutation.mutate()}
            disabled={!allAnswered || submitMutation.isPending}
          >
            <Text style={[styles.navBtnText, { color: '#FFF' }]}>
              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </Text>
            <CheckCircle2 size={18} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {submitMutation.isError && (
        <Text style={styles.errorText}>{(submitMutation.error as Error).message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressContainer: { paddingHorizontal: 20, paddingTop: 16, gap: 6 },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, textAlign: 'right' },
  sectionLabel: { paddingHorizontal: 20, paddingTop: 12 },
  sectionText: { fontSize: 12, fontWeight: '500' },
  questionContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  questionText: { fontSize: 20, fontWeight: '600', lineHeight: 28, textAlign: 'center', marginBottom: 36 },
  likertRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  likertBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, gap: 6 },
  likertEmoji: { fontSize: 22 },
  likertLabel: { fontSize: 10, textAlign: 'center', fontWeight: '500' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 20, borderRadius: RADIUS, borderWidth: 1 },
  navBtnText: { fontSize: 15, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 13, textAlign: 'center', paddingBottom: 16 },
  completedContent: { padding: 20, paddingTop: 40 },
  completedCard: { borderRadius: RADIUS, borderWidth: 1, padding: 24, alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  completedTitle: { fontSize: 24, fontWeight: '700' },
  completedSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  resultsContainer: { width: '100%', marginTop: 20, gap: 12 },
  resultSection: { borderWidth: 1, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultSectionTitle: { fontSize: 14, fontWeight: '600' },
  resultScore: { fontSize: 18, fontWeight: '700' },
  respondentCount: { fontSize: 12, textAlign: 'center', marginTop: 4 },
});
