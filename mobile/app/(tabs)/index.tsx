import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity,
  Animated, useWindowDimensions, Image, RefreshControl, ColorValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useSyncEngine } from '@/src/hooks/useSyncEngine';
import { useThemeStore, useThemeColors, brand } from '@/src/store/useThemeStore';
import { screenHeader } from '@/src/theme/screenHeader';
import { typography } from '@/src/theme/fonts';
import { apiService } from '@/src/api/service';
import type { CoachTip, Transaction } from '@/src/api/service';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import {
  Leaf, Wind, Star, ArrowUpRight, ArrowDownLeft,
  MapPin, ChevronRight, Bell, Globe, ArrowRight,
  HelpCircle, PlusCircle, Recycle, Trophy,
  Droplets, Car, TreePine, Target, Users, Lightbulb, ClipboardList,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import NotificationCenter from '@/components/NotificationCenter';
import ProfileDrawer from '@/components/ProfileDrawer';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import HomeSpotlight, { SpotlightItem } from '@/components/HomeSpotlight';
import StreakBadge from '@/components/StreakBadge';
import { DashboardSkeleton, ButtonLoader } from '@/components/Skeleton';
import * as Haptics from 'expo-haptics';
import { queryKeys } from '@/src/lib/queryKeys';

const RADIUS = 14;
const PADDING = 16;

const ECO_TIPS = [
  { title: 'Rinse, don\'t run', desc: 'A quick rinse uses far less water than leaving the tap on while washing containers.' },
  { title: 'Dry before you return', desc: 'Air-drying containers prevents mold and earns you full return points every time.' },
  { title: 'One swap at a time', desc: 'Replacing just one single-use item per week adds up to meaningful impact over a year.' },
  { title: 'Share the habit', desc: 'Invite a friend to ReLoop — collective action drives real circular economy change.' },
  { title: 'Check the map first', desc: 'Find the nearest partner drop-off before you head out to save time and trips.' },
  { title: 'Stack smart', desc: 'Nest clean containers at home so they\'re ready to grab and return on busy days.' },
  { title: 'Read the label', desc: 'Not sure if a container is ReLoop-compatible? Scan the QR code to confirm instantly.' },
];

export default function Dashboard() {
  const { user, accessToken, logout } = useAuthStore();
  const { queueCount } = useSyncEngine();
  const c = useThemeColors();
  const { mode } = useThemeStore();
  const pinnedHeaderBg = mode === 'dark' ? c.bg : brand.heroDarkMid;
  const headerActionBg = 'rgba(255,255,255,0.08)';
  const headerActionBorder = 'rgba(255,255,255,0.14)';
  const heroGradient: [ColorValue, ColorValue, ...ColorValue[]] = mode === 'dark'
    ? [c.bg, c.surface, c.bg]
    : [brand.heroDarkMid, brand.heroDark, '#071512'];
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const { data: communityStats, refetch: refetchCommunity } = useQuery({
    queryKey: ['community-stats'],
    queryFn: () => apiService.getCommunityStats(),
    enabled: !!accessToken,
    staleTime: 60_000,
  });

  const { data: pulseStatus, refetch: refetchPulse } = useQuery({
    queryKey: ['pulse-status'],
    queryFn: () => apiService.getPulseStatus(),
    enabled: !!accessToken,
    staleTime: 30_000,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const userId = user?.id;

  const { data: userData, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
    queryKey: queryKeys.userStats(userId ?? ''),
    queryFn: () => apiService.getProfile(),
    enabled: !!accessToken && !!userId,
    refetchOnMount: 'always' as const,
  });

  const { data: coachTips = [], refetch: refetchCoach } = useQuery<CoachTip[]>({
    queryKey: queryKeys.coachRecommendations(userId ?? ''),
    queryFn: () => apiService.getCoachRecommendations(),
    enabled: !!accessToken && !!userId,
    staleTime: 30_000,
  });

  const { data: recentActivity = [], refetch: refetchActivity } = useQuery<Transaction[]>({
    queryKey: queryKeys.transactionHistory(userId ?? ''),
    queryFn: () => apiService.getTransactionHistory(),
    enabled: !!accessToken && !!userId,
    refetchOnMount: 'always' as const,
  });

  const displayUser = useMemo(() => {
    if (userData && userData.id === userId) return userData;
    return user;
  }, [userData, userId, user]);

  const plasticSaved = useMemo(
    () => displayUser?.impact?.plasticSaved?.toFixed(2) || '0.00',
    [displayUser],
  );
  const co2Saved = useMemo(
    () => displayUser?.impact?.co2Saved?.toFixed(2) || '0.00',
    [displayUser],
  );
  const points = displayUser?.points ?? 0;

  useEffect(() => {
    if (userData && userData.id === userId) {
      useAuthStore.getState().updateUser(userData);
    }
  }, [userData, userId]);

  useFocusEffect(
    useCallback(() => {
      if (accessToken && userId) {
        void refetchStats();
      }
    }, [accessToken, userId, refetchStats]),
  );

  const impactScore = useMemo(
    () =>
      Math.round(
        points +
        parseFloat(plasticSaved) * 100 +
        parseFloat(co2Saved) * 50,
      ),
    [points, plasticSaved, co2Saved],
  );

  const weeklyGoalPercent = useMemo(
    () => Math.max(0, Math.min(100, displayUser?.weeklyGoal?.percent ?? 0)),
    [displayUser],
  );

  const avatarUrl = useMemo(
    () =>
      displayUser?.avatar ||
      `https://api.dicebear.com/7.x/initials/png?seed=${displayUser?.userName || 'User'}&backgroundColor=14B8A6`,
    [displayUser],
  );

  const recentItems = useMemo(() => recentActivity.slice(0, 2), [recentActivity]);

  const openNotifications = useCallback(() => setNotifVisible(true), []);
  const closeNotifications = useCallback(() => setNotifVisible(false), []);
  const openProfileDrawer = useCallback(() => setProfileDrawerVisible(true), []);
  const closeProfileDrawer = useCallback(() => setProfileDrawerVisible(false), []);
  const goToScanner = useCallback(() => { triggerHaptic(); router.push('/scanner'); }, [triggerHaptic, router]);
  const goToCommunity = useCallback(() => router.push('/community'), [router]);
  const goToGuide = useCallback(() => router.push('/guide'), [router]);
  const goToInventory = useCallback(() => router.push('/inventory'), [router]);
  const goToMap = useCallback(() => router.push('/(tabs)/map'), [router]);
  const goToSurvey = useCallback(() => router.push('/surveys' as any), [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchCoach(),
      refetchActivity(),
      refetchCommunity(),
      refetchPulse(),
    ]);
    setRefreshing(false);
  }, [refetchStats, refetchCoach, refetchActivity, refetchCommunity, refetchPulse]);

  const weeklyRemaining = useMemo(
    () => Math.max(0, (displayUser?.weeklyGoal?.target ?? 5) - (displayUser?.weeklyGoal?.current ?? 0)),
    [displayUser],
  );

  const tipOfDay = ECO_TIPS[new Date().getDay() % ECO_TIPS.length];

  const spotlightItems = useMemo((): SpotlightItem[] => {
    const items: SpotlightItem[] = [];

    if (weeklyGoalPercent < 100) {
      items.push({
        id: 'weekly-goal',
        eyebrow: 'THIS WEEK',
        title: weeklyRemaining === 1 ? '1 return to hit your goal' : `${weeklyRemaining} returns to hit your goal`,
        description: `You're ${weeklyGoalPercent}% there. Scan a return today and keep your momentum going.`,
        colors: ['#0F766E', '#14B8A6'],
        icon: Target,
        cta: 'Scan return',
        onPress: goToScanner,
      });
    }

    if (pulseStatus && !pulseStatus.completedToday) {
      items.push({
        id: 'survey',
        eyebrow: 'DAILY PULSE',
        title: 'Today\'s check-in',
        description: 'Answer one quick question to keep your streak and share how sustainability is going today.',
        colors: ['#7C3AED', '#8B5CF6'],
        icon: ClipboardList,
        cta: 'Take pulse',
        onPress: goToSurvey,
      });
    }

    if (communityStats) {
      const plasticKg = communityStats.totalPlasticSaved?.toFixed(1) ?? '0';
      items.push({
        id: 'community',
        eyebrow: 'COMMUNITY PULSE',
        title: `${plasticKg}kg saved together`,
        description: `${communityStats.totalUsers ?? 0} eco-warriors active. See where you rank on the leaderboard.`,
        colors: ['#1D4ED8', '#3B82F6'],
        icon: Users,
        cta: 'View leaderboard',
        onPress: goToCommunity,
      });
    }

    items.push({
      id: 'map',
      eyebrow: 'NEARBY',
      title: 'Find a drop-off point',
      description: 'Locate partner vendors and return spots on the map near you.',
      colors: ['#0369A1', '#0EA5E9'],
      icon: MapPin,
      cta: 'Open map',
      onPress: goToMap,
    });

    items.push({
      id: 'eco-tip',
      eyebrow: 'ECO TIP',
      title: tipOfDay.title,
      description: tipOfDay.desc,
      colors: ['#B45309', '#F59E0B'],
      icon: Lightbulb,
      cta: 'Return guide',
      onPress: goToGuide,
    });

    return items.slice(0, 4);
  }, [
    weeklyGoalPercent, weeklyRemaining, pulseStatus, communityStats, tipOfDay,
    goToScanner, goToSurvey, goToCommunity, goToMap, goToGuide,
  ]);

  const milestone = useMemo(() => {
    const totalReturns = displayUser?.impact?.totalReturns || 0;
    const milestones = [
      { name: 'First Return', target: 1, icon: '🌱' },
      { name: 'Eco Starter', target: 5, icon: '🌿' },
      { name: 'Green Champion', target: 15, icon: '🏅' },
      { name: 'Sustainability Hero', target: 30, icon: '🏆' },
      { name: 'Planet Guardian', target: 50, icon: '🌍' },
      { name: 'Eco Legend', target: 100, icon: '💎' },
    ];
    const next = milestones.find(m => totalReturns < m.target);
    if (!next) return { name: 'Eco Legend', progress: 100, remaining: 0, icon: '💎' };
    const prev = milestones[milestones.indexOf(next) - 1];
    const base = prev ? prev.target : 0;
    const progress = Math.round(((totalReturns - base) / (next.target - base)) * 100);
    return { name: next.name, progress, remaining: next.target - totalReturns, icon: next.icon };
  }, [displayUser]);

  const envEquivalents = useMemo(() => {
    const plastic = parseFloat(plasticSaved);
    const co2 = parseFloat(co2Saved);
    return {
      bottles: Math.round(plastic * 20),
      driving: (co2 * 4).toFixed(1),
      water: Math.round(plastic * 180),
    };
  }, [plasticSaved, co2Saved]);

  const formatActivityTime = useCallback((dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Pinned top bar — native pattern: greeting stays fixed while content scrolls */}
      <PinnedScreenHeader backgroundColor={pinnedHeaderBg} horizontalPadding={0}>
        <View style={[styles.headerRow, { paddingHorizontal: PADDING }]}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
            </Text>
            <Text style={styles.greeting}>
              Hi, {(userData?.userName || 'there').split(' ')[0]}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={openNotifications}
              style={[
                styles.headerActionBtn,
                { backgroundColor: headerActionBg, borderColor: headerActionBorder },
              ]}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Bell color="rgba(255,255,255,0.9)" size={20} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: c.accent, borderColor: pinnedHeaderBg }]}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openProfileDrawer}
              style={[
                styles.headerActionBtn,
                styles.avatarBtn,
                { borderColor: c.accent + '90', backgroundColor: headerActionBg },
              ]}
              accessibilityLabel="Open account menu"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
            </TouchableOpacity>
          </View>
        </View>
      </PinnedScreenHeader>

      <ScrollView
        style={[styles.scrollView, { backgroundColor: c.bg }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />
        }
      >
        <LinearGradient
          colors={heroGradient}
          style={{ paddingBottom: 44, paddingHorizontal: PADDING, overflow: 'hidden' }}
        >
          <View style={styles.mainCardContainer}>
            <LinearGradient
              colors={[c.accentSoft, 'rgba(0,0,0,0)']}
              style={[styles.heroCard, { borderColor: c.accent + '26' }]}
            >
              <View style={styles.heroContent}>
                <View style={[styles.impactScorePill, { backgroundColor: c.accentSoft }]}>
                  <Leaf color={c.accentBright} size={14} strokeWidth={2.2} />
                  <Text style={[styles.impactScorePillText, { color: c.accentBright }]}>IMPACT SCORE</Text>
                </View>

                <Text style={styles.heroScoreLarge}>{impactScore}</Text>

                <Text style={styles.impactScoreMeta}>Based on returns & environmental impact</Text>

                <View style={styles.headerBadges}>
                  <StreakBadge count={displayUser?.streakCount || 0} />
                  <View style={styles.pointsBadge}>
                    <Star color="#FBBF24" size={13} fill="#FBBF24" />
                    <Text style={styles.pointsText}>{points} pts</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={{ backgroundColor: c.bg, flex: 1, paddingBottom: 60, minHeight: windowHeight * 0.7 }}>
          {/* Quick Actions */}
          <View style={[styles.quickActionsRow, { paddingHorizontal: PADDING, marginTop: 20 }]}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
              onPress={goToScanner}
              accessibilityLabel="Borrow a container"
              accessibilityRole="button"
            >
              <View style={styles.actionIconPlaceholder}>
                <PlusCircle color={c.accent} size={40} strokeWidth={1.5} />
              </View>
              <Text style={[styles.actionLabel, { color: c.text }]}>BORROW</Text>
              <Text style={[styles.actionMeta, { color: c.textMuted }]}>
                <Text style={[styles.actionMetaValue, { color: c.textSecondary }]}>
                  {displayUser?.activeBorrows || 0}
                </Text>
                {' active holds'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
              onPress={goToScanner}
              accessibilityLabel="Return a container"
              accessibilityRole="button"
            >
              <View style={styles.actionIconPlaceholder}>
                <Recycle color={c.accent} size={40} strokeWidth={1.5} />
              </View>
              <Text style={[styles.actionLabel, { color: c.text }]}>RETURN</Text>
              <Text style={[styles.actionMeta, { color: c.textMuted }]}>
                <Text style={[styles.actionMetaValue, { color: c.textSecondary }]}>
                  {displayUser?.impact?.totalReturns || 0}
                </Text>
                {' total returns'}
              </Text>
            </TouchableOpacity>
          </View>

          <HomeSpotlight items={spotlightItems} />

          {/* Weekly Goal */}
          <View style={styles.sectionMargin}>
            <View style={styles.sectionHeader}>
              <Text style={[screenHeader.sectionTitle, { color: c.text }]}>Weekly Goal</Text>
              <Text style={[styles.sectionSubtitle, { color: c.textMuted }]}>
                {displayUser?.weeklyGoal?.current || 0} of {displayUser?.weeklyGoal?.target || 5} returned
              </Text>
            </View>
            <View style={[styles.goalTrack, { backgroundColor: c.surfaceBorder + '33' }]}>
              <LinearGradient
                colors={[c.accent, '#A3E635']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  top: 0, bottom: 0,
                  width: `${weeklyGoalPercent}%` as any,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>

          {/* Milestone */}
          <View style={styles.sectionMargin}>
            <View style={styles.sectionHeader}>
              <Text style={[screenHeader.sectionTitle, { color: c.text }]}>Next Milestone</Text>
              <Text style={[styles.sectionSubtitle, { color: c.textMuted }]}>{milestone.remaining} more to go</Text>
            </View>
            <View style={[styles.milestoneCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
              <View style={styles.milestoneTop}>
                <View style={[styles.milestoneIconBox, { backgroundColor: '#FBBF24' + '15' }]}>
                  <Trophy color="#FBBF24" size={22} strokeWidth={1.8} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.milestoneName, { color: c.text }]}>{milestone.icon} {milestone.name}</Text>
                  <Text style={[styles.milestonePercent, { color: c.textMuted }]}>{milestone.progress}% complete</Text>
                </View>
              </View>
              <View style={[styles.milestoneTrack, { backgroundColor: c.surfaceBorder + '33' }]}>
                <LinearGradient
                  colors={['#FBBF24', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    position: 'absolute', top: 0, bottom: 0,
                    width: `${milestone.progress}%` as any,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Environmental Equivalents */}
          <View style={styles.sectionMargin}>
            <View style={styles.sectionHeader}>
              <Text style={[screenHeader.sectionTitle, { color: c.text }]}>Your Impact</Text>
            </View>
            <View style={styles.envGrid}>
              <View style={[styles.envCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
                <View style={[styles.envIconBox, { backgroundColor: c.accentSoft }]}>
                  <Droplets color={c.accent} size={20} strokeWidth={1.8} />
                </View>
                <Text style={[styles.envValue, { color: c.text }]}>{envEquivalents.water}L</Text>
                <Text style={[styles.envLabel, { color: c.textFaint }]}>Water saved</Text>
              </View>
              <View style={[styles.envCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
                <View style={[styles.envIconBox, { backgroundColor: '#3B82F6' + '12' }]}>
                  <Car color="#3B82F6" size={20} strokeWidth={1.8} />
                </View>
                <Text style={[styles.envValue, { color: c.text }]}>{envEquivalents.driving}km</Text>
                <Text style={[styles.envLabel, { color: c.textFaint }]}>Driving offset</Text>
              </View>
              <View style={[styles.envCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
                <View style={[styles.envIconBox, { backgroundColor: '#F59E0B' + '12' }]}>
                  <TreePine color="#F59E0B" size={20} strokeWidth={1.8} />
                </View>
                <Text style={[styles.envValue, { color: c.text }]}>{envEquivalents.bottles}</Text>
                <Text style={[styles.envLabel, { color: c.textFaint }]}>Bottles saved</Text>
              </View>
            </View>
          </View>

          {/* Community */}
          <View style={styles.sectionMargin}>
            <View style={styles.sectionHeader}>
              <Text style={[screenHeader.sectionTitle, { color: c.text }]}>Community Hub</Text>
              <TouchableOpacity onPress={goToCommunity} accessibilityRole="link">
                <Text style={{ color: c.accent, fontSize: 13, fontWeight: '700' }}>Leaderboard</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.communityCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
              onPress={goToCommunity}
              accessibilityLabel="View community leaderboard"
              accessibilityRole="button"
            >
              <View style={styles.communityContent}>
                <View style={[styles.communityIcon, { backgroundColor: c.accent + '10' }]}>
                  <Globe color={c.accent} size={24} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={[styles.communityTitle, { color: c.text }]}>Join the Eco-Warriors</Text>
                  <Text style={[styles.communitySubtitle, { color: c.textFaint }]}>See how we're saving the city together.</Text>
                </View>
                <ArrowRight color={c.textFaint} size={18} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Guide */}
          <View style={styles.sectionMargin}>
            <TouchableOpacity
              style={[styles.guideCard, { backgroundColor: c.accent + '08', borderColor: c.accent + '30' }]}
              onPress={goToGuide}
              accessibilityLabel="Learn how to return containers"
              accessibilityRole="button"
            >
              <View style={styles.guideWrapper}>
                <View style={[styles.guideIconMain, { backgroundColor: c.accent }]}>
                  <HelpCircle color="#fff" size={24} />
                </View>
                <View style={styles.guideTextInfo}>
                  <Text style={[styles.guideTitle, { color: c.text }]}>New to Returning?</Text>
                  <Text style={[styles.guideDesc, { color: c.textMuted }]}>Learn how to clean and dry your containers for max points.</Text>
                </View>
                <ChevronRight color={c.accent} size={20} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Raw Stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.gridItem, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
              <View style={[styles.statIconContainer, { backgroundColor: c.accent + '10' }]}>
                <Leaf color={c.accent} size={22} strokeWidth={1.5} />
              </View>
              <Text style={[styles.statValue, { color: c.text }]} numberOfLines={1}>
                {plasticSaved}
              </Text>
              <Text style={[styles.statLabel, { color: c.textFaint }]} numberOfLines={2}>
                PLASTIC KG
              </Text>
            </View>

            <View style={[styles.gridItem, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#3B82F610' }]}>
                <Wind color="#3B82F6" size={22} strokeWidth={1.5} />
              </View>
              <Text style={[styles.statValue, { color: c.text }]} numberOfLines={1}>
                {co2Saved}
              </Text>
              <Text style={[styles.statLabel, { color: c.textFaint }]} numberOfLines={2}>
                CO₂ OFFSET
              </Text>
            </View>
          </View>

          {/* Recent Activity — driven by real data */}
          <View style={styles.sectionMargin}>
            <View style={styles.sectionHeader}>
              <Text style={[screenHeader.sectionTitle, { color: c.text }]}>Recent Activity</Text>
              <TouchableOpacity onPress={goToInventory} accessibilityRole="link">
                <Text style={{ color: c.accent, fontSize: 13, fontWeight: '700' }}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.miniHistoryCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
              {recentItems.length > 0 ? (
                recentItems.map((item, idx) => {
                  const isReturn = item.type === 'RETURN';
                  return (
                    <React.Fragment key={item._id}>
                      {idx > 0 && <View style={[styles.miniDivider, { backgroundColor: c.surfaceBorder }]} />}
                      <View style={styles.miniItem}>
                        <View style={[styles.miniIcon, { backgroundColor: isReturn ? c.accentSoft : '#3B82F615' }]}>
                          {isReturn ? <ArrowDownLeft color={c.accent} size={16} /> : <ArrowUpRight color="#3B82F6" size={16} />}
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[styles.miniTitle, { color: c.text }]}>
                            {isReturn ? 'Container Returned' : 'Borrowed Container'}
                          </Text>
                          <Text style={[styles.miniMeta, { color: c.textFaint }]}>
                            {formatActivityTime(item.createdAt)}
                            {isReturn && item.pointsAwarded ? ` • +${item.pointsAwarded} pts` : ''}
                          </Text>
                        </View>
                        <ChevronRight color={c.textFaint} size={16} />
                      </View>
                    </React.Fragment>
                  );
                })
              ) : (
                <View style={[styles.miniItem, { justifyContent: 'center' }]}>
                  <Text style={[styles.miniMeta, { color: c.textFaint }]}>No recent activity</Text>
                </View>
              )}
            </View>
          </View>

          {/* AI Coach */}
          <View style={styles.coachContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[screenHeader.sectionTitle, { color: c.text }]}>AI Coach</Text>
            </View>

            {coachTips.length > 0 ? (
              coachTips.map((tip, idx) => (
                <View
                  key={idx}
                  style={[styles.coachCard, { borderColor: c.surfaceBorder }]}
                >
                  <View style={styles.coachContent}>
                    <Text style={[styles.coachTitle, { color: c.text }]}>{tip.title}</Text>
                    <Text style={[styles.coachMessage, { color: c.textSecondary }]}>{tip.message}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.coachCard, { borderColor: c.surfaceBorder, borderStyle: 'dashed' }]}>
                <Text style={[styles.coachMessage, { color: c.textFaint }]}>
                  Tips will appear based on your activity.
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Sync Status */}
      {queueCount > 0 && (
        <View style={[styles.syncBar, { backgroundColor: c.accent }]}>
          <ButtonLoader color="#fff" />
          <Text style={[styles.syncBarText, { marginLeft: 10 }]}>Syncing {queueCount} events...</Text>
        </View>
      )}

      {/* Initial load only */}
      {isLoadingStats && !user && (
        <View style={StyleSheet.absoluteFill}>
          <DashboardSkeleton />
        </View>
      )}

      <NotificationCenter visible={notifVisible} onClose={closeNotifications} />

      <ProfileDrawer
        visible={profileDrawerVisible}
        onClose={closeProfileDrawer}
        impactScore={impactScore}
        points={points}
        streakCount={displayUser?.streakCount ?? 0}
        totalReturns={displayUser?.impact?.totalReturns ?? 0}
        plasticSaved={parseFloat(plasticSaved) || 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 0 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTextBlock: { flex: 1, marginRight: 12 },
  date: { fontSize: 11, fontWeight: '600', letterSpacing: 1.4, marginBottom: 4, color: 'rgba(255,255,255,0.45)' },
  greeting: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5, color: '#fff' },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  headerActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowOpacity: 0, shadowRadius: 0 },
      android: { elevation: 0 },
    }),
  },
  avatarBtn: {
    borderWidth: 2,
    padding: 0,
  },
  badge: {
    position: 'absolute', top: 2, right: 2,
    minWidth: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4, borderWidth: 2,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  headerAvatar: { width: '100%', height: '100%', borderRadius: 21 },

  mainCardContainer: { marginTop: 4 },
  heroCard: {
    borderRadius: 20, paddingVertical: 36, paddingHorizontal: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroContent: { alignItems: 'center' },
  heroScoreLarge: {
    fontSize: 64, fontWeight: '900', letterSpacing: -2, lineHeight: 72,
    color: '#fff', marginTop: 12,
  },
  impactScorePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, paddingHorizontal: 14, borderRadius: 999,
  },
  impactScorePillText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  impactScoreMeta: {
    marginTop: 8, fontSize: 13, fontWeight: '500',
    color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 18,
  },
  headerBadges: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 20 },
  pointsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  pointsText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },

  statsGrid: { flexDirection: 'row', gap: 12, marginTop: 16, paddingHorizontal: PADDING, alignItems: 'stretch' },
  gridItem: {
    flex: 1,
    borderRadius: RADIUS,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 148,
  },
  statIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 6, lineHeight: 28, width: '100%', textAlign: 'center' },
  statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textAlign: 'center', minHeight: 28, width: '100%' },

  quickActionsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  actionCard: {
    flex: 1, padding: 24, borderRadius: RADIUS, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  actionIconPlaceholder: { marginBottom: 12 },
  actionLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 1 },

  sectionMargin: { marginTop: 32, paddingHorizontal: PADDING },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionSubtitle: { fontSize: 13, fontWeight: '600' },
  goalTrack: { height: 8, borderRadius: 4, width: '100%', overflow: 'hidden' },

  miniHistoryCard: { borderRadius: RADIUS, borderWidth: 1, padding: 4 },
  miniItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  miniIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  miniTitle: { fontSize: 14, fontWeight: '700' },
  miniMeta: { fontSize: 12, marginTop: 2 },
  miniDivider: { height: 1, marginHorizontal: 12, opacity: 0.5 },

  narrativeCard: { padding: 24, borderRadius: RADIUS, borderWidth: 1, overflow: 'hidden' },
  narrativeContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  narrativeText: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '600' },

  coachContainer: { marginTop: 32, paddingHorizontal: PADDING },
  coachCard: { padding: 20, borderRadius: RADIUS, borderWidth: 1, marginBottom: 12 },
  coachContent: { flex: 1 },
  coachTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  coachMessage: { fontSize: 14, lineHeight: 20, opacity: 0.8 },

  syncBar: {
    position: 'absolute', bottom: 30, left: PADDING, right: PADDING,
    height: 52, borderRadius: RADIUS,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  syncBarText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  guideCard: { padding: 18, borderRadius: RADIUS, borderWidth: 1 },
  guideWrapper: { flexDirection: 'row', alignItems: 'center' },
  guideIconMain: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  guideTextInfo: { flex: 1, marginLeft: 14 },
  guideTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  guideDesc: { fontSize: 13, fontWeight: '600', lineHeight: 18 },

  communityCard: {
    borderRadius: RADIUS, borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  communityContent: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  communityIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  communityTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  communitySubtitle: { fontSize: 13, fontWeight: '600' },

  globalLoader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  actionMeta: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
    ...typography.label,
  },
  actionMetaValue: {
    fontSize: 13,
    lineHeight: 18,
    ...typography.sectionTitle,
  },

  milestoneCard: {
    borderRadius: RADIUS, borderWidth: 1, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  milestoneTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  milestoneIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  milestoneName: { fontSize: 16, fontWeight: '800' },
  milestonePercent: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  milestoneTrack: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },

  envGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: PADDING },
  envCard: {
    flex: 1, borderRadius: RADIUS, borderWidth: 1, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  envIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  envValue: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  envLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3, marginTop: 2 },
});
