import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity,
  Animated, useWindowDimensions, Image, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useSyncEngine } from '@/src/hooks/useSyncEngine';
import { useThemeStore, useThemeColors } from '@/src/store/useThemeStore';
import { apiService } from '@/src/api/service';
import type { CoachTip, Transaction } from '@/src/api/service';
import { useQuery } from '@tanstack/react-query';
import {
  Leaf, Wind, Star, ArrowUpRight, ArrowDownLeft,
  MapPin, ChevronRight, Bell, Globe, ArrowRight,
  HelpCircle, PlusCircle, Recycle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import NotificationCenter from '@/components/NotificationCenter';
import StreakBadge from '@/components/StreakBadge';
import { DashboardSkeleton, ButtonLoader } from '@/components/Skeleton';
import * as Haptics from 'expo-haptics';

const RADIUS = 14;
const PADDING = 16;
const HERO_BG = '#0F3A32';

export default function Dashboard() {
  const { user, accessToken, logout } = useAuthStore();
  const { queueCount } = useSyncEngine();
  const c = useThemeColors();
  const { mode } = useThemeStore();
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const [notifVisible, setNotifVisible] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const { data: userData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => apiService.getProfile(),
    initialData: user,
    enabled: !!accessToken,
    staleTime: 30_000,
  });

  const { data: coachTips = [] } = useQuery<CoachTip[]>({
    queryKey: ['coach-recommendations'],
    queryFn: () => apiService.getCoachRecommendations(),
    enabled: !!accessToken,
    staleTime: 60_000,
  });

  const { data: recentActivity = [] } = useQuery<Transaction[]>({
    queryKey: ['transaction-history'],
    queryFn: () => apiService.getTransactionHistory(),
    enabled: !!accessToken,
    staleTime: 30_000,
  });

  const displayUser = userData || user;

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
    if (userData) {
      useAuthStore.getState().updateUser(userData);
    }
  }, [userData]);

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
      `https://api.dicebear.com/7.x/initials/png?seed=${displayUser?.userName || 'User'}&backgroundColor=10B981`,
    [displayUser],
  );

  const recentItems = useMemo(() => recentActivity.slice(0, 2), [recentActivity]);

  const openNotifications = useCallback(() => setNotifVisible(true), []);
  const closeNotifications = useCallback(() => setNotifVisible(false), []);
  const goToProfile = useCallback(() => router.push('/profile'), [router]);
  const goToScanner = useCallback(() => { triggerHaptic(); router.push('/scanner'); }, [triggerHaptic, router]);
  const goToCommunity = useCallback(() => router.push('/community'), [router]);
  const goToGuide = useCallback(() => router.push('/guide'), [router]);
  const goToInventory = useCallback(() => router.push('/inventory'), [router]);

  const formatActivityTime = useCallback((dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: HERO_BG }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: HERO_BG }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[HERO_BG, '#062B26']}
          style={{ paddingBottom: 44, paddingHorizontal: PADDING, overflow: 'hidden' }}
        >
          <View pointerEvents="none" style={styles.heroOverlay} />

          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.date, { color: 'rgba(255,255,255,0.6)' }]}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
                </Text>
                <Text style={[styles.greeting, { color: '#fff' }]}>
                  Hi, {(userData?.userName || 'there').split(' ')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={openNotifications}
                  style={styles.iconBtn}
                  accessibilityLabel="Notifications"
                  accessibilityRole="button"
                >
                  <Bell color="#fff" size={22} strokeWidth={1.5} />
                  {unreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: c.accent }]}>
                      <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={goToProfile}
                  style={[styles.avatarBtn, { borderColor: 'rgba(255,255,255,0.3)' }]}
                  accessibilityLabel="Profile"
                  accessibilityRole="button"
                >
                  <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Impact Hero Card */}
          <View style={styles.mainCardContainer}>
            <View style={[styles.heroCard, { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)' }]}>
              <View style={[styles.decorBlob, styles.decorBlob1, { transform: [{ rotate: '15deg' }] }]}>
                <LinearGradient colors={['#0B7F5C', '#065F46', '#053D34']} style={styles.gradFull} />
              </View>
              <View style={[styles.decorBlob, styles.decorBlob3]}>
                <LinearGradient colors={['#0EA5E9', '#0B5CAD', '#064E3B']} style={styles.gradFull} />
              </View>
              <View style={[styles.decorBlob, styles.decorBlob5]} />

              <View style={styles.heroContent}>
                <View style={styles.scoreContainer}>
                  <View style={styles.impactScorePill}>
                    <Leaf color="#A7F3D0" size={14} strokeWidth={2} />
                    <Text style={styles.impactScorePillText}>Impact</Text>
                  </View>
                  <Text style={[styles.heroScoreLarge, { color: '#fff' }]}>{impactScore}</Text>
                  <Text style={[styles.heroSubTitle, { color: 'rgba(255,255,255,0.9)' }]}>Impact Score</Text>
                  <Text style={styles.impactScoreMeta}>Based on returns & environmental impact</Text>
                </View>

                <View style={styles.headerBadges}>
                  <StreakBadge count={displayUser?.streakCount || 0} />
                  <View style={[styles.pointsBadge, { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1 }]}>
                    <Star color="#FBBF24" size={14} fill="#FBBF24" />
                    <Text style={[styles.pointsText, { color: '#fff' }]}>{points} pts</Text>
                  </View>
                </View>
              </View>
            </View>
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
              <Text style={[styles.microTag, { color: c.textFaint }]}>
                {displayUser?.activeBorrows || 0} active holds
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
              <Text style={[styles.microTag, { color: c.textFaint }]}>
                {displayUser?.impact?.totalReturns || 0} total returns
              </Text>
            </TouchableOpacity>
          </View>

          {/* Weekly Goal */}
          <View style={styles.sectionMargin}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Weekly Goal</Text>
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

          {/* Community */}
          <View style={styles.sectionMargin}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Community Hub</Text>
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

          {/* Impact Narrative */}
          <View style={styles.sectionMargin}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Impact Narrative</Text>
            </View>
            <View style={[styles.narrativeCard, { backgroundColor: c.accent + '08', borderColor: c.accent + '15' }]}>
              <View style={styles.narrativeContent}>
                <Globe color={c.accent} size={28} strokeWidth={1.5} />
                <Text style={[styles.narrativeText, { color: c.textSecondary }]}>
                  You've offset the equivalent of <Text style={{ fontWeight: '800', color: c.text }}>{(parseFloat(co2Saved) * 4).toFixed(1)} km</Text> of driving this month!
                  Overall, your choice has saved enough resources to produce <Text style={{ fontWeight: '800', color: c.text }}>{Math.floor(parseFloat(plasticSaved) * 20)} new containers</Text>.
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.gridItem, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
              <View style={[styles.statIconContainer, { backgroundColor: c.accent + '10' }]}>
                <Leaf color={c.accent} size={22} strokeWidth={1.5} />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>{plasticSaved}</Text>
              <Text style={[styles.statLabel, { color: c.textFaint }]}>PLASTIC (KG)</Text>
            </View>

            <View style={[styles.gridItem, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#3B82F610' }]}>
                <Wind color="#3B82F6" size={22} strokeWidth={1.5} />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>{co2Saved}</Text>
              <Text style={[styles.statLabel, { color: c.textFaint }]}>CO₂ OFFSET</Text>
            </View>
          </View>

          {/* Recent Activity — driven by real data */}
          <View style={styles.sectionMargin}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Activity</Text>
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
                        <View style={[styles.miniIcon, { backgroundColor: isReturn ? '#10B98115' : '#3B82F615' }]}>
                          {isReturn ? <ArrowDownLeft color="#10B981" size={16} /> : <ArrowUpRight color="#3B82F6" size={16} />}
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
              <Text style={[styles.sectionTitle, { color: c.text }]}>AI Coach</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 0 },
  header: { paddingTop: Platform.OS === 'ios' ? 70 : 60, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4, opacity: 0.6 },
  greeting: { fontSize: 34, fontWeight: '800', letterSpacing: -1.2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, overflow: 'hidden', backgroundColor: '#fff',
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  badge: {
    position: 'absolute', top: 4, right: 4,
    minWidth: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4, borderWidth: 2, borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  headerAvatar: { width: '100%', height: '100%', borderRadius: 22 },

  mainCardContainer: { marginTop: 0 },
  heroCard: {
    borderRadius: RADIUS, padding: 40, borderWidth: 1.5,
    overflow: 'hidden', position: 'relative', minHeight: 240,
    justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12, shadowRadius: 30, elevation: 8,
  },
  decorBlob: { position: 'absolute', borderRadius: 100, opacity: 0.07 },
  decorBlob1: { width: 60, height: 60, top: -10, left: '15%' },
  decorBlob3: { width: 40, height: 40, bottom: -5, left: '30%' },
  decorBlob5: { width: 6, height: 6, top: '25%', left: '15%', backgroundColor: '#fff', opacity: 0.12 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.10)' },
  gradFull: { flex: 1, borderRadius: 100 },
  heroContent: { alignItems: 'center', marginBottom: 24 },
  scoreContainer: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, paddingVertical: 16, borderRadius: RADIUS,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 }, elevation: 4,
  },
  heroScoreLarge: {
    fontSize: 56, fontWeight: '900', letterSpacing: -1.2, lineHeight: 62,
    textShadowColor: 'rgba(255, 255, 255, 0.22)',
    textShadowOffset: { width: 0, height: 6 }, textShadowRadius: 12, marginTop: 10,
  },
  heroSubTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.7, marginTop: 8 },
  impactScorePill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  impactScorePillText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: 'rgba(255,255,255,0.92)' },
  impactScoreMeta: {
    marginTop: 6, fontSize: 12, fontWeight: '600',
    color: 'rgba(255,255,255,0.88)', textAlign: 'center', maxWidth: 260, lineHeight: 15,
  },
  headerBadges: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 },
  pointsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20,
  },
  pointsText: { fontSize: 13, fontWeight: '700' },

  statsGrid: { flexDirection: 'row', gap: 12, marginTop: 16, paddingHorizontal: PADDING },
  gridItem: { flex: 1, borderRadius: RADIUS, padding: 20, borderWidth: 1, alignItems: 'center' },
  statIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },

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
  sectionTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
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
  microTag: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginTop: 4 },
});
