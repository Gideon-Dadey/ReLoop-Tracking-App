import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '@/src/store/useThemeStore';
import DailyPulsePanel from '@/components/surveys/DailyPulsePanel';
import ResearchSurveyPanel from '@/components/surveys/ResearchSurveyPanel';

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
      <Stack.Screen options={{ title: 'Community Survey' }} />

      <View style={[styles.tabBar, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <TouchableOpacity
          style={[styles.tab, tab === 'pulse' && { backgroundColor: c.accent }]}
          onPress={() => setTab('pulse')}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'pulse' }}
        >
          <Text style={[styles.tabText, { color: tab === 'pulse' ? c.onAccent : c.textSecondary }]}>
            Daily Pulse
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'research' && { backgroundColor: c.accent }]}
          onPress={() => setTab('research')}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'research' }}
        >
          <Text style={[styles.tabText, { color: tab === 'research' ? c.onAccent : c.textSecondary }]}>
            Research Survey
          </Text>
        </TouchableOpacity>
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
    marginTop: 12,
    marginBottom: 8,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabText: { fontSize: 13, fontWeight: '700' },
});
