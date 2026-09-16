import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  ChevronDown,
  Droplets,
  MapPin,
  QrCode,
  Wind,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { badgeTone, menuWells } from '@/src/theme/tokens';
import { menuWell } from '@/src/theme/chrome';
import { geist } from '@/src/theme/fonts';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import CardSurface from '@/components/CardSurface';
import StatusBadge from '@/components/StatusBadge';

type WellKind = keyof typeof menuWells.light;

const STEPS: {
  title: string;
  body: string;
  icon: LucideIcon;
  well: WellKind;
}[] = [
  {
    title: 'Rinse residue',
    body: 'A quick rinse removes food so the photo check can pass. Use a drop of soap on oily containers.',
    icon: Droplets,
    well: 'sky',
  },
  {
    title: 'Dry completely',
    body: 'Air-dry or wipe it down. Wet stacks smell, stick together, and can fail verification.',
    icon: Wind,
    well: 'slate',
  },
  {
    title: 'Scan the collection base',
    body: 'Point the in-app scanner at the QR on the bin or store. That opens this base and keeps same-group partners nearby.',
    icon: MapPin,
    well: 'amber',
  },
  {
    title: 'Scan the container, then photo',
    body: 'Scan the container QR, then photograph the empty inside. The return is logged at the base you just set.',
    icon: QrCode,
    well: 'violet',
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'Why do I need to rinse it?',
    answer:
      'Partners reuse these containers. Residue fails the photo check and can reduce points. A 10-second rinse is enough for most items.',
  },
  {
    question: 'Where can I find return points?',
    answer:
      'Scan the QR on a collection base, or open Map / Collection bases to see the nearest drop-offs. Partners in the same group are listed together.',
  },
  {
    question: 'What if my container is damaged?',
    answer:
      'Do not scan cracked, melted, or missing-lid containers. Hand it to the vendor and tell them it is damaged so it can be retired.',
  },
  {
    question: 'When do I get points?',
    answer:
      'Points post after a successful scan and photo check. Dirty or unreadable photos may earn a reduced score or need a retry.',
  },
];

function StepRow({
  index,
  title,
  body,
  icon: Icon,
  well,
  isLast,
}: {
  index: number;
  title: string;
  body: string;
  icon: LucideIcon;
  well: WellKind;
  isLast: boolean;
}) {
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);
  const tone = menuWell(mode, well);

  return (
    <View style={styles.stepRow}>
      <View style={styles.stepRail}>
        <View style={[styles.stepWell, { backgroundColor: tone.bg }]}>
          <Icon color={tone.icon} size={18} strokeWidth={2} />
        </View>
        {!isLast ? <View style={[styles.stepLine, { backgroundColor: c.surfaceBorder }]} /> : null}
      </View>
      <View style={[styles.stepCopy, isLast && styles.stepCopyLast]}>
        <Text style={[styles.stepIndex, { color: c.textFaint }]}>STEP {index + 1}</Text>
        <Text style={[styles.stepTitle, { color: c.heading }]}>{title}</Text>
        <Text style={[styles.stepBody, { color: c.textMuted }]}>{body}</Text>
      </View>
    </View>
  );
}

function FaqRow({
  question,
  answer,
  open,
  onToggle,
  showDivider,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
  showDivider: boolean;
}) {
  const c = useThemeColors();

  return (
    <View>
      <Pressable
        onPress={onToggle}
        android_ripple={null}
        style={styles.faqHit}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={question}
      >
        <Text style={[styles.faqQuestion, { color: c.heading }]}>{question}</Text>
        <ChevronDown
          color={c.textMuted}
          size={18}
          strokeWidth={2}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {open ? (
        <Text style={[styles.faqAnswer, { color: c.textMuted }]}>{answer}</Text>
      ) : null}
      {showDivider ? <View style={[styles.faqDivider, { backgroundColor: c.surfaceBorder }]} /> : null}
    </View>
  );
}

export default function GuideScreen() {
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const notice = badgeTone[mode].failed;

  const goScan = useCallback(() => router.push('/(tabs)/scanner'), [router]);
  const goMap = useCallback(() => router.push('/collection' as any), [router]);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <PinnedScreenHeader showBack title="How to Return" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 24 + 54 + 12 + 48 + insets.bottom }]}
      >
        <CardSurface padded>
          <Text style={[styles.eyebrow, { color: c.textFaint }]}>RETURN GUIDE</Text>
          <Text style={[styles.heroTitle, { color: c.heading }]}>Rinse. Scan. Earn.</Text>
          <Text style={[styles.heroBody, { color: c.textMuted }]}>
            Clean containers pass the photo check and earn full points. The whole return takes about a minute.
          </Text>
          <View style={styles.chipRow}>
            <StatusBadge label="Photo check" kind="other" />
            <StatusBadge label="Full points" kind="success" />
          </View>
        </CardSurface>

        <CardSurface style={[styles.stepCard, { marginTop: 16 }]}>
          {STEPS.map((step, index) => (
            <StepRow
              key={step.title}
              index={index}
              isLast={index === STEPS.length - 1}
              {...step}
            />
          ))}
        </CardSurface>

        <View style={[styles.notice, { backgroundColor: notice.bg }]}>
          <AlertTriangle color={notice.text} size={18} strokeWidth={2} />
          <Text style={[styles.noticeText, { color: notice.text }]}>
            Dirty, wet, or damaged containers may earn reduced points or be declined.
          </Text>
        </View>

        <CardSurface style={{ marginTop: 16 }}>
          {FAQS.map((faq, index) => (
            <FaqRow
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              open={openFaq === index}
              onToggle={() => setOpenFaq((current) => (current === index ? null : index))}
              showDivider={index < FAQS.length - 1}
            />
          ))}
        </CardSurface>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: c.bg,
            borderTopColor: c.surfaceBorder,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <Pressable
          onPress={goMap}
          android_ripple={null}
          style={[styles.secondaryBtn, { backgroundColor: c.muted }]}
          accessibilityRole="button"
          accessibilityLabel="Find a return point"
        >
          <MapPin color={c.text} size={18} strokeWidth={2} />
          <Text style={[styles.secondaryLabel, { color: c.heading }]}>Find a point</Text>
        </Pressable>
        <Pressable
          onPress={goScan}
          android_ripple={null}
          style={[styles.primaryBtn, { backgroundColor: c.accent }]}
          accessibilityRole="button"
          accessibilityLabel="Scan to return"
        >
          <QrCode color={c.onAccent} size={18} strokeWidth={2} />
          <Text style={[styles.primaryLabel, { color: c.onAccent }]}>Scan to return</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 8,
    ...geist('700'),
  },
  heroTitle: {
    fontSize: 26,
    letterSpacing: -0.6,
    marginBottom: 8,
    ...geist('700'),
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 21,
    ...geist('400'),
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  groupLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 4,
    ...geist('700'),
  },
  stepCard: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8 },
  stepRow: { flexDirection: 'row', gap: 14 },
  stepRail: { width: 42, alignItems: 'center' },
  stepWell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: { width: StyleSheet.hairlineWidth, flex: 1, minHeight: 16, marginVertical: 6 },
  stepCopy: { flex: 1, paddingBottom: 20 },
  stepCopyLast: { paddingBottom: 12 },
  stepIndex: {
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 4,
    ...geist('600'),
  },
  stepTitle: { fontSize: 16, marginBottom: 4, ...geist('600') },
  stepBody: { fontSize: 13, lineHeight: 19, ...geist('400') },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
  },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 19, ...geist('500') },
  faqHit: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faqQuestion: { flex: 1, fontSize: 15, ...geist('600') },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 13,
    lineHeight: 20,
    ...geist('400'),
  },
  faqDivider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  secondaryBtn: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtn: {
    flex: 1.15,
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryLabel: { fontSize: 15, ...geist('600') },
  primaryLabel: { fontSize: 15, ...geist('600') },
});
