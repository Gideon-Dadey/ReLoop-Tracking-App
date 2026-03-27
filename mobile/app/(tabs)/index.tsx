import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity, ActivityIndicator, Dimensions, Image } from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useSyncEngine } from '@/src/hooks/useSyncEngine';
import { useThemeStore, useThemeColors } from '@/src/store/useThemeStore';
import { apiService } from '@/src/api/service';
import { useQuery } from '@tanstack/react-query';
import { Sun, Moon, Leaf, Wind, Star, ArrowUpRight, ArrowDownLeft, MapPin, ChevronRight, Clock, Bell, Globe, ArrowRight, HelpCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import NotificationCenter from '@/components/NotificationCenter';

const { width } = Dimensions.get('window');
const RADIUS = 10;
const PADDING = 16;

export default function Dashboard() {
  const { user, accessToken, logout } = useAuthStore();
  const { queueCount, isSyncing } = useSyncEngine();
  const c = useThemeColors();
  const { mode, toggleTheme } = useThemeStore();
  const router = useRouter();
  const [notifVisible, setNotifVisible] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const { data: userData, isFetching: isFetchingStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => apiService.getProfile(),
    initialData: user,
    enabled: !!accessToken
  });

  const { data: coachTips = [], isFetching: isFetchingCoach } = useQuery({
    queryKey: ['coach-recommendations'],
    queryFn: () => apiService.getCoachRecommendations(),
    enabled: !!accessToken
  });

  // Reactive Stats: Priority to local store for instant optimistic updates, fallback to server data
  const displayUser = user || userData;
  const plasticSaved = displayUser?.impact?.plasticSaved?.toFixed(2) || '0.00';
  const co2Saved = displayUser?.impact?.co2Saved?.toFixed(2) || '0.00';
  const points = displayUser?.points ?? 0;

  // Impact Score: Accurate environmental contribution index
  const impactScore = Math.round(
    points +
    (parseFloat(plasticSaved) * 100) +
    (parseFloat(co2Saved) * 50)
  );

  const avatarUrl = displayUser?.avatar || `https://api.dicebear.com/7.x/initials/png?seed=${displayUser?.userName || 'User'}&backgroundColor=10B981`;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Apple-style Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.date, { color: c.textFaint }]}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
              </Text>
              <Text style={[styles.greeting, { color: c.text }]}>
                Hi, {(userData?.userName || 'there').split(' ')[0]}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setNotifVisible(true)}
                style={[styles.iconBtn, { backgroundColor: c.surfaceBorder + '33' }]}
              >
                <Bell color={c.text} size={22} strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: c.accent }]}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/profile')}
                style={[styles.avatarBtn, { borderColor: c.surfaceBorder }]}
              >
                <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Impact Hero Card - Redesigned to match Vytal-style aesthetic */}
        <View style={styles.mainCardContainer}>
          <View style={[styles.heroCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            {/* Organic Decorative Blobs */}
            <View style={[styles.blob, styles.blobRed]} />
            <View style={[styles.blob, styles.blobGreen]} />
            <View style={[styles.blob, styles.blobPurple]} />

            <View style={styles.heroContent}>
              <View style={styles.scoreContainer}>
                <Text style={[styles.heroScoreLarge, { color: c.text }]}>{impactScore}</Text>
                <Text style={[styles.heroSubTitle, { color: c.textMuted }]}>Your Impact Score</Text>
              </View>

              <View style={styles.pointsBadge}>
                <Star color="#F59E0B" size={14} fill="#F59E0B" />
                <Text style={[styles.pointsText, { color: c.textMuted }]}>{points} pts</Text>
              </View>
            </View>

            <View style={styles.heroFooter}>
              <Text style={[styles.statusTextBold, { color: c.text }]}>Almost there!</Text>
              <Text style={[styles.footerCaption, { color: c.textSecondary }]}>
                You're in the top 12% of eco-citizens this week!
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Row - Inspired by Vytal reference */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
            onPress={() => router.push('/scanner')}
          >
            <View style={styles.actionIconPlaceholder}>
              <ArrowUpRight color={c.text} size={32} strokeWidth={1.5} />
            </View>
            <Text style={[styles.actionLabel, { color: c.text }]}>BORROW</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
            onPress={() => router.push('/scanner')}
          >
            <View style={styles.actionIconPlaceholder}>
              <ArrowDownLeft color={c.text} size={32} strokeWidth={1.5} />
            </View>
            <Text style={[styles.actionLabel, { color: c.text }]}>RETURN</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Progress Goal */}
        <View style={styles.sectionMargin}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Weekly Goal</Text>
            <Text style={[styles.sectionSubtitle, { color: c.textMuted }]}>3 of 5 returned</Text>
          </View>
          <View style={[styles.goalTrack, { backgroundColor: c.surfaceBorder + '33' }]}>
            <View style={[styles.goalProgress, { backgroundColor: c.accent, width: '60%' }]} />
          </View>
        </View>

        {/* Community Impact Integration */}
        <View style={styles.sectionMargin}>
           <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Community Hub</Text>
              <TouchableOpacity onPress={() => router.push('/community')}>
                 <Text style={{ color: c.accent, fontSize: 13, fontWeight: '700' }}>Leaderboard</Text>
              </TouchableOpacity>
           </View>
           <TouchableOpacity 
             style={[styles.communityCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
             onPress={() => router.push('/community')}
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

        {/* Educational Guide Card */}
        <View style={styles.sectionMargin}>
           <TouchableOpacity 
             style={[styles.guideCard, { backgroundColor: c.accent + '08', borderColor: c.accent + '30' }]}
             onPress={() => router.push('/guide')}
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

        {/* Detailed Stats Grid */}
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

        {/* Recent Activity Mini-List */}
        <View style={styles.sectionMargin}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/inventory')}>
              <Text style={{ color: c.accent, fontSize: 13, fontWeight: '700' }}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.miniHistoryCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <View style={styles.miniItem}>
              <View style={[styles.miniIcon, { backgroundColor: '#10B98115' }]}>
                <ArrowDownLeft color="#10B981" size={16} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.miniTitle, { color: c.text }]}>Container Returned</Text>
                <Text style={[styles.miniMeta, { color: c.textFaint }]}>2 hours ago • +10 pts</Text>
              </View>
              <ChevronRight color={c.textFaint} size={16} />
            </View>
            <View style={[styles.miniDivider, { backgroundColor: c.surfaceBorder }]} />
            <View style={styles.miniItem}>
              <View style={[styles.miniIcon, { backgroundColor: '#3B82F615' }]}>
                <ArrowUpRight color="#3B82F6" size={16} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.miniTitle, { color: c.text }]}>Borrowed Container</Text>
                <Text style={[styles.miniMeta, { color: c.textFaint }]}>Yesterday • RE-2024</Text>
              </View>
              <ChevronRight color={c.textFaint} size={16} />
            </View>
          </View>
        </View>

        {/* AI Insight Section (Coach) */}
        <View style={styles.coachContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>AI Coach</Text>
          </View>

          {coachTips.length > 0 ? (
            coachTips.map((tip: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                style={[styles.coachCard, { backgroundColor: 'transparent', borderColor: c.surfaceBorder }]}
                activeOpacity={0.7}
              >
                <View style={styles.coachContent}>
                  <Text style={[styles.coachTitle, { color: c.text }]}>{tip.title}</Text>
                  <Text style={[styles.coachMessage, { color: c.textSecondary }]}>{tip.message}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.coachCard, { backgroundColor: 'transparent', borderColor: c.surfaceBorder, borderStyle: 'dashed' }]}>
              <ActivityIndicator color={c.accent} size="small" />
              <Text style={[styles.coachMessage, { color: c.textFaint, marginLeft: 12 }]}>Syncing insights...</Text>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Persistent Sync Status */}
      {queueCount > 0 && (
        <View style={[styles.syncBar, { backgroundColor: c.accent }]}>
          <ActivityIndicator color="#fff" size="small" style={{ marginRight: 10 }} />
          <Text style={styles.syncBarText}>Syncing {queueCount} events...</Text>
        </View>
      )}

      {/* Global Status Loader */}
      {(isFetchingStats) && (
        <View style={[styles.globalLoader, { backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }]}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      )}

      {/* Notification Center Modal */}
      <NotificationCenter visible={notifVisible} onClose={() => setNotifVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: PADDING },

  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
    opacity: 0.6,
  },
  greeting: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },

  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
  },

  mainCardContainer: { marginTop: 0 },
  heroCard: {
    borderRadius: RADIUS * 1.5,
    padding: 32,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 220,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  blob: {
    position: 'absolute',
    width: 140,
    height: 140,
    opacity: 0.8,
  },
  blobRed: {
    top: -40,
    left: -40,
    backgroundColor: '#FF5733',
    borderRadius: 70,
    transform: [{ scaleX: 1.4 }, { scaleY: 0.9 }],
  },
  blobGreen: {
    top: -60,
    alignSelf: 'center',
    backgroundColor: '#10B981',
    width: 100,
    height: 100,
    borderRadius: 50,
    transform: [{ rotate: '45deg' }, { scaleX: 1.2 }],
    opacity: 0.6,
  },
  blobPurple: {
    top: -30,
    right: -40,
    backgroundColor: '#A78BFA',
    borderRadius: 60,
    transform: [{ rotate: '-20deg' }],
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  heroScoreLarge: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 72,
  },
  heroSubTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  heroFooter: {
    alignItems: 'center',
  },
  statusTextBold: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  footerCaption: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 10,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  gridItem: {
    flex: 1,
    borderRadius: RADIUS,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionCard: {
    flex: 1,
    padding: 24,
    borderRadius: RADIUS,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconPlaceholder: {
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },

  sectionMargin: { marginTop: 32 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  goalTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  goalProgress: {
    height: '100%',
    borderRadius: 4,
  },

  miniHistoryCard: {
    borderRadius: RADIUS,
    borderWidth: 1,
    padding: 4,
  },
  miniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  miniIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  miniMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  miniDivider: {
    height: 1,
    marginHorizontal: 12,
    opacity: 0.5,
  },

  coachContainer: { marginTop: 32 },
  coachCard: {
    padding: 20,
    borderRadius: RADIUS,
    borderWidth: 1,
    marginBottom: 12,
  },
  coachContent: {
    flex: 1,
  },
  coachTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  coachMessage: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },

  syncBar: {
    position: 'absolute',
    bottom: 30,
    left: PADDING,
    right: PADDING,
    height: 52,
    borderRadius: RADIUS * 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  syncBarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  guideCard: {
    padding: 18,
    borderRadius: RADIUS,
    borderWidth: 1,
  },
  guideWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideIconMain: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideTextInfo: {
    flex: 1,
    marginLeft: 14,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  guideDesc: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  communityCard: {
    borderRadius: RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  communityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  communityIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  communitySubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },

  globalLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
