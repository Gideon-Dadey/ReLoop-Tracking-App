import React, { useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Platform, RefreshControl, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { apiService } from '@/src/api/service';
import type { LeaderboardEntry } from '@/src/api/service';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Leaf, TrendingUp, Globe, ArrowLeft, Trophy,
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import { screenHeader } from '@/src/theme/screenHeader';
import UserAvatar from '@/components/UserAvatar';

const RADIUS = 14;
const PADDING = 16;

export default function CommunityScreen() {
  const c = useThemeColors();
  const router = useRouter();

  const { data: stats, isFetching: isFetchingStats, refetch: refetchStats } = useQuery({
    queryKey: ['community-stats'],
    queryFn: () => apiService.getCommunityStats(),
  });

  const { data: leaderboard = [], isFetching: isFetchingLeaderboard, refetch: refetchLeaderboard } = useQuery({
    queryKey: ['community-leaderboard'],
    queryFn: () => apiService.getLeaderboard(20),
  });

  const onRefresh = () => {
    refetchStats();
    refetchLeaderboard();
  };

  const isRefreshing = isFetchingStats || isFetchingLeaderboard;

  const renderLeaderboardItem = useCallback(({ item, index }: { item: LeaderboardEntry, index: number }) => {
    const isTop3 = index < 3;
    const rankColors = ['#F59E0B', '#94A3B8', '#B45309'];

    return (
      <TouchableOpacity 
        style={[styles.userCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
        activeOpacity={0.7}
      >
        <View style={styles.rankContainer}>
           {isTop3 ? (
             <Trophy color={rankColors[index]} size={20} fill={rankColors[index]} />
           ) : (
             <Text style={[styles.rankText, { color: c.textFaint }]}>{index + 1}</Text>
           )}
        </View>

        <View style={styles.avatar}>
          <UserAvatar name={item.userName} uri={item.avatar} size="sm" />
        </View>

        <View style={styles.userInfo}>
           <Text style={[styles.userName, { color: c.text }]}>{item.userName}</Text>
           <View style={styles.impactRow}>
              <Leaf color={c.success} size={12} />
              <Text style={[styles.impactText, { color: c.textFaint }]}>
                 {item.impact?.plasticSaved?.toFixed(1) || 0}kg saved
              </Text>
           </View>
        </View>

        <View style={styles.pointsInfo}>
           <Text style={[styles.pointsValue, { color: c.accent }]}>{item.points}</Text>
           <Text style={[styles.pointsLabel, { color: c.textFaint }]}>pts</Text>
        </View>
      </TouchableOpacity>
    );
  }, [c]);

  const Header = useCallback(() => (
    <View style={styles.communityHeader}>
       <View style={[styles.statsGrid]}>
          <View style={[styles.statItem, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
             <View style={[styles.statIcon, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                <Leaf color={c.success} size={20} />
             </View>
             <Text style={[styles.statValue, { color: c.text }]}>
               {stats?.totalPlasticSaved?.toFixed(1) || '0.0'}
             </Text>
             <Text style={[styles.statLabel, { color: c.textFaint }]}>KG PLASTIC</Text>
          </View>

          <View style={[styles.statItem, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
             <View style={[styles.statIcon, { backgroundColor: '#3B82F615' }]}>
                <Globe color="#3B82F6" size={20} />
             </View>
             <Text style={[styles.statValue, { color: c.text }]}>
               {stats?.totalUsers || 0}
             </Text>
             <Text style={[styles.statLabel, { color: c.textFaint }]}>ECO HEROES</Text>
          </View>
       </View>

       <View style={styles.leaderboardTitleRow}>
          <TrendingUp color={c.accent} size={18} />
          <Text style={[styles.leaderboardTitle, { color: c.text }]}>Monthly Eco-Warriors</Text>
       </View>
    </View>
  ), [c, stats]);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <PinnedScreenHeader
        left={
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
          >
            <ArrowLeft color={c.text} size={22} />
          </TouchableOpacity>
        }
        title="Eco Network"
      />

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={Header}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={c.accent} />}
        ListEmptyComponent={
          isRefreshing ? null : (
            <View style={styles.emptyState}>
               <Users color={c.textFaint} size={64} strokeWidth={1} />
               <Text style={[screenHeader.emptyTitle, { color: c.text }]}>No warriors yet</Text>
               <Text style={[styles.emptyMsg, { color: c.textMuted }]}>Invite your friends and be the first Eco-Warrior in your city!</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
     width: 44,
     height: 44,
     borderRadius: 22,
     borderWidth: 1,
     justifyContent: 'center',
     alignItems: 'center',
  },
  communityHeader: { paddingHorizontal: PADDING, marginBottom: 24, marginTop: 10 },
  statsGrid: { flexDirection: 'row', gap: PADDING, marginBottom: 32 },
  statItem: { 
    flex: 1, 
    padding: 20, 
    borderRadius: RADIUS, 
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  leaderboardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  leaderboardTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },

  listContent: { paddingBottom: 60 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: PADDING,
    borderRadius: RADIUS,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  rankContainer: { width: 30, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 14, fontWeight: '800' },
  avatar: { marginHorizontal: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  impactRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  impactText: { fontSize: 12 },
  pointsInfo: { alignItems: 'flex-end', minWidth: 60 },
  pointsValue: { fontSize: 18, fontWeight: '800' },
  pointsLabel: { fontSize: 10, fontWeight: '800' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyTitle: { marginTop: 24, marginBottom: 12 },
  emptyMsg: { fontSize: 15, textAlign: 'center', lineHeight: 22, opacity: 0.7 },
});
