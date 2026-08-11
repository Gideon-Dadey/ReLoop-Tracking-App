import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Flame, ClipboardList } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import DailyPulsePanel from '@/components/surveys/DailyPulsePanel';
import ResearchSurveyPanel from '@/components/surveys/ResearchSurveyPanel';
import { geist } from '@/src/theme/fonts';

type SurveyTab = 'pulse' | 'research';

export default function SurveyScreen() {
  const c = useThemeColors();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<SurveyTab>('pulse');

  useEffect(() => {
    if (tabParam === 'research' || tabParam === 'pulse') {
      setTab(tabParam);
    }
  }, [tabParam]);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <PinnedScreenHeader showBack title="Community Survey" />

      <View style={[styles.tabBar, { backgroundColor: c.muted }]}>
        <Pressable
          style={[styles.tab, tab === 'pulse' && { backgroundColor: c.accent }]}
          onPress={() => setTab('pulse')}
          android_ripple={null}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'pulse' }}
        >
          <Flame size={14} color={tab === 'pulse' ? c.onAccent : c.textMuted} strokeWidth={2} />
          <Text style={[styles.tabText, { color: tab === 'pulse' ? c.onAccent : c.textMuted }]}>
            Daily Pulse
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'research' && { backgroundColor: c.accent }]}
          onPress={() => setTab('research')}
          android_ripple={null}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'research' }}
        >
          <ClipboardList size={14} color={tab === 'research' ? c.onAccent : c.textMuted} strokeWidth={2} />
          <Text style={[styles.tabText, { color: tab === 'research' ? c.onAccent : c.textMuted }]}>
            Research
          </Text>
        </Pressable>
      </View>

      {tab === 'pulse' ? <DailyPulsePanel /> : <ResearchSurveyPanel />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    padding: 4,
    borderRadius: 14,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: { fontSize: 13, ...geist('600') },
});
