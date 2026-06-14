import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, useWindowDimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2, ChevronRight, ChevronLeft, Shield, Clock, Users, Target, BarChart3,
} from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { screenHeader } from '@/src/theme/screenHeader';
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

const SECTION_INFO = {
  A: {
    title: 'Behavioral Intentions',
    subtitle: 'Your plans and motivation around sustainable packaging',
    icon: Target,
    color: '#8B5CF6',
  },
  B: {
    title: 'Community Resilience',
    subtitle: 'How connected and empowered you feel as part of the eco community',
    icon: Users,
    color: '#10B981',
  },
};

type SurveyPhase = 'intro' | 'questions' | 'section-b' | 'complete';

function ScoreBar({ label, score, maxScore, color, trackColor, textColor }: {
  label: string; score: number; maxScore: number; color: string;
  trackColor: string; textColor: string;
}) {
  const pct = Math.min(100, (score / maxScore) * 100);
  return (
    <View style={styles.scoreBarBlock}>
      <View style={styles.scoreBarHeader}>
        <Text style={[styles.scoreBarLabel, { color: textColor }]}>{label}</Text>
        <Text style={[styles.scoreBarValue, { color }]}>{score.toFixed(1)} / {maxScore}</Text>
      </View>
      <View style={[styles.scoreBarTrack, { backgroundColor: trackColor }]}>
        <View style={[styles.scoreBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function ResearchSurveyPanel() {
  const c = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const isSmall = screenWidth < 360;
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<SurveyPhase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['survey-status'],
    queryFn: () => apiService.getSurveyStatus(SURVEY_VERSION),
  });

  const { data: results } = useQuery({
    queryKey: ['survey-results'],
    queryFn: () => apiService.getSurveyResults(SURVEY_VERSION),
    enabled: phase === 'complete' || !!status?.completed,
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
      setPhase('complete');
      queryClient.invalidateQueries({ queryKey: ['survey-status'] });
      queryClient.invalidateQueries({ queryKey: ['survey-results'] });
    },
  });

  const animateTransition = useCallback((direction: 'next' | 'prev', onMid?: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      onMid?.();
      setCurrentIndex((i) => (direction === 'next' ? i + 1 : i - 1));
    }, 120);
  }, [fadeAnim]);

  const handleSelect = (value: number) => {
    setAnswers((a) => ({ ...a, [QUESTIONS[currentIndex].id]: value }));
  };

  const startSurvey = () => {
    setPhase('questions');
    setCurrentIndex(0);
  };

  const goNext = () => {
    if (currentIndex === 4) {
      setPhase('section-b');
      return;
    }
    animateTransition('next');
  };

  const continueSectionB = () => {
    setPhase('questions');
    setCurrentIndex(5);
  };

  if (statusLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={{ padding: 20, gap: 16 }}>
          <Skeleton width="100%" height={200} borderRadius={RADIUS} />
        </View>
      </View>
    );
  }

  if (status?.completed || phase === 'complete') {
    const sectionA = results?.sectionAverages.behavioralIntentions ?? 0;
    const sectionB = results?.sectionAverages.communityResilience ?? 0;

    return (
      <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.completedContent}>
        <View style={[styles.completedCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
          <View style={[styles.completedIconWrap, { backgroundColor: c.accent + '18' }]}>
            <CheckCircle2 size={40} color={c.accent} />
          </View>
          <Text style={[screenHeader.modalTitle, { color: c.text }]}>Thank You!</Text>
          <Text style={[styles.completedSubtitle, { color: c.textSecondary }]}>
            Your response helps us measure how social campaigns shape sustainable behavior and community resilience.
          </Text>

          {results && (
            <View style={styles.resultsContainer}>
              <View style={[styles.resultsHeader, { borderColor: c.surfaceBorder }]}>
                <BarChart3 size={18} color={c.accent} />
                <Text style={[styles.resultsHeaderText, { color: c.text }]}>Community Averages</Text>
              </View>

              <ScoreBar
                label="Behavioral Intentions"
                score={sectionA}
                maxScore={5}
                color={SECTION_INFO.A.color}
                trackColor={c.inputBg}
                textColor={c.text}
              />
              <ScoreBar
                label="Community Resilience"
                score={sectionB}
                maxScore={5}
                color={SECTION_INFO.B.color}
                trackColor={c.inputBg}
                textColor={c.text}
              />

              <View style={[styles.respondentPill, { backgroundColor: c.inputBg }]}>
                <Users size={14} color={c.textMuted} />
                <Text style={[styles.respondentCount, { color: c.textMuted }]}>
                  {results.totalRespondents} community member{results.totalRespondents !== 1 ? 's' : ''} participated
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  if (phase === 'intro') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.introContent}>

        <View style={[styles.introHero, { backgroundColor: c.accent + '14', borderColor: c.accent + '30' }]}>
          <Text style={[styles.introEyebrow, { color: c.accent }]}>RESEARCH SURVEY</Text>
          <Text style={[styles.introTitle, { color: c.text }]}>Community Survey</Text>
          <Text style={[styles.introDesc, { color: c.textSecondary }]}>
            Help us understand how zero-waste social media campaigns influence real-world behavior and community connection.
          </Text>
        </View>

        <View style={styles.introMetaRow}>
          <View style={[styles.introMetaCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <Clock size={18} color={c.accent} />
            <Text style={[styles.introMetaValue, { color: c.text }]}>~3 min</Text>
            <Text style={[styles.introMetaLabel, { color: c.textMuted }]}>Duration</Text>
          </View>
          <View style={[styles.introMetaCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <BarChart3 size={18} color={SECTION_INFO.A.color} />
            <Text style={[styles.introMetaValue, { color: c.text }]}>10</Text>
            <Text style={[styles.introMetaLabel, { color: c.textMuted }]}>Questions</Text>
          </View>
          <View style={[styles.introMetaCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <Shield size={18} color={SECTION_INFO.B.color} />
            <Text style={[styles.introMetaValue, { color: c.text }]}>Private</Text>
            <Text style={[styles.introMetaLabel, { color: c.textMuted }]}>Anonymous</Text>
          </View>
        </View>

        <Text style={[styles.introSectionLabel, { color: c.textFaint }]}>TWO SECTIONS</Text>
        {(Object.keys(SECTION_INFO) as Array<'A' | 'B'>).map((key) => {
          const info = SECTION_INFO[key];
          const Icon = info.icon;
          const count = QUESTIONS.filter((q) => q.section === key).length;
          return (
            <View key={key} style={[styles.introSectionCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
              <View style={[styles.introSectionIcon, { backgroundColor: info.color + '18' }]}>
                <Icon size={20} color={info.color} />
              </View>
              <View style={styles.introSectionText}>
                <Text style={[styles.introSectionTitle, { color: c.text }]}>Section {key}: {info.title}</Text>
                <Text style={[styles.introSectionSub, { color: c.textMuted }]}>{info.subtitle} · {count} questions</Text>
              </View>
            </View>
          );
        })}

        <View style={[styles.privacyNote, { backgroundColor: c.inputBg }]}>
          <Shield size={14} color={c.textMuted} />
          <Text style={[styles.privacyText, { color: c.textMuted }]}>
            Responses are aggregated for research only. No personal data is shared publicly.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: c.accent }]}
          onPress={startSurvey}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>Begin Survey</Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (phase === 'section-b') {
    const info = SECTION_INFO.B;
    const Icon = info.icon;
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={styles.sectionTransition}>
          <View style={[styles.sectionTransitionIcon, { backgroundColor: info.color + '18' }]}>
            <Icon size={36} color={info.color} />
          </View>
          <Text style={[styles.sectionTransitionEyebrow, { color: info.color }]}>SECTION B</Text>
          <Text style={[styles.sectionTransitionTitle, { color: c.text }]}>{info.title}</Text>
          <Text style={[styles.sectionTransitionDesc, { color: c.textSecondary }]}>{info.subtitle}</Text>
          <Text style={[styles.sectionTransitionProgress, { color: c.textMuted }]}>5 more questions · halfway done</Text>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: c.accent, marginTop: 28 }]}
            onPress={continueSectionB}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>Continue</Text>
            <ChevronRight size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const question = QUESTIONS[currentIndex];
  const sectionInfo = SECTION_INFO[question.section as 'A' | 'B'];
  const SectionIcon = sectionInfo.icon;
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const isLast = currentIndex === QUESTIONS.length - 1;
  const allAnswered = QUESTIONS.every((q) => answers[q.id]);
  const answeredCount = Object.keys(answers).length;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <View style={[styles.sectionPill, { backgroundColor: sectionInfo.color + '18' }]}>
            <SectionIcon size={12} color={sectionInfo.color} />
            <Text style={[styles.sectionPillText, { color: sectionInfo.color }]}>
              Section {question.section}
            </Text>
          </View>
          <Text style={[styles.progressText, { color: c.textMuted }]}>
            {currentIndex + 1} / {QUESTIONS.length}
          </Text>
        </View>
        <View style={[styles.progressBg, { backgroundColor: c.inputBg }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: c.accent }]} />
        </View>
      </View>

      <View style={styles.sectionLabel}>
        <Text style={[styles.sectionText, { color: c.textSecondary }]}>
          {sectionInfo.title}
        </Text>
      </View>

      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <Text style={[styles.questionText, { color: c.text, fontSize: isSmall ? 17 : 20 }]}>{question.text}</Text>

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

      <View style={styles.footer}>
        <View style={[styles.privacyNote, styles.privacyNoteInline, { backgroundColor: c.inputBg }]}>
          <Shield size={12} color={c.textMuted} />
          <Text style={[styles.privacyText, { color: c.textMuted, fontSize: 11 }]}>
            Anonymous · {answeredCount} of {QUESTIONS.length} answered
          </Text>
        </View>

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
              onPress={() => answers[question.id] && goNext()}
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
      </View>

      {submitMutation.isError && (
        <Text style={styles.errorText}>{(submitMutation.error as Error).message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  introContent: { padding: 20, paddingBottom: 40 },
  introHero: { borderRadius: RADIUS, borderWidth: 1, padding: 20, marginBottom: 16 },
  introEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  introTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.4, marginBottom: 8 },
  introDesc: { fontSize: 14, lineHeight: 21 },
  introMetaRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  introMetaCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'center', gap: 4 },
  introMetaValue: { fontSize: 15, fontWeight: '700' },
  introMetaLabel: { fontSize: 10, fontWeight: '500' },
  introSectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  introSectionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: RADIUS, borderWidth: 1, padding: 14, marginBottom: 10 },
  introSectionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  introSectionText: { flex: 1 },
  introSectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  introSectionSub: { fontSize: 12, lineHeight: 17 },
  privacyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, padding: 12, marginTop: 8 },
  privacyNoteInline: { marginTop: 0, marginBottom: 12 },
  privacyText: { flex: 1, fontSize: 12, lineHeight: 17 },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, borderRadius: RADIUS, marginTop: 20 },
  startBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  sectionTransition: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  sectionTransitionIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  sectionTransitionEyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  sectionTransitionTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  sectionTransitionDesc: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  sectionTransitionProgress: { fontSize: 13, marginTop: 8 },
  progressContainer: { paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  sectionPillText: { fontSize: 11, fontWeight: '600' },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12 },
  sectionLabel: { paddingHorizontal: 20, paddingTop: 10 },
  sectionText: { fontSize: 12, fontWeight: '500' },
  questionContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  questionText: { fontSize: 20, fontWeight: '600', lineHeight: 28, textAlign: 'center', marginBottom: 36 },
  likertRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  likertBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, gap: 6 },
  likertEmoji: { fontSize: 22 },
  likertLabel: { fontSize: 10, textAlign: 'center', fontWeight: '500' },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 20, borderRadius: RADIUS, borderWidth: 1 },
  navBtnText: { fontSize: 15, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 13, textAlign: 'center', paddingBottom: 16 },
  completedContent: { padding: 20, paddingTop: 40 },
  completedCard: { borderRadius: RADIUS, borderWidth: 1, padding: 24, alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  completedIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  completedSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  resultsContainer: { width: '100%', marginTop: 16, gap: 14 },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 4, borderBottomWidth: 1, marginBottom: 4 },
  resultsHeaderText: { fontSize: 14, fontWeight: '600' },
  scoreBarBlock: { gap: 6 },
  scoreBarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreBarLabel: { fontSize: 13, fontWeight: '600' },
  scoreBarValue: { fontSize: 15, fontWeight: '700' },
  scoreBarTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  respondentPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, marginTop: 4 },
  respondentCount: { fontSize: 12 },
});
