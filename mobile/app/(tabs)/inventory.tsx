import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  QrCode,
  Search,
  X,
} from 'lucide-react-native';
import { InventorySkeleton } from '@/components/Skeleton';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import CardSurface from '@/components/CardSurface';
import StatusBadge from '@/components/StatusBadge';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { apiService } from '@/src/api/service';
import type { Container, Transaction } from '@/src/api/service';
import { queryKeys } from '@/src/lib/queryKeys';
import { homeWell } from '@/src/theme/chrome';
import { geist } from '@/src/theme/fonts';
import type { StatusKind } from '@/components/StatusBadge';

type Segment = 'borrows' | 'history';

const LOAN_DAYS = 14;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function dayLabel(iso: string) {
  const date = new Date(iso);
  const diff = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function dueState(updatedAt?: string): { label: string; kind: StatusKind; urgent: boolean } {
  const issued = new Date(updatedAt || Date.now());
  const due = new Date(issued);
  due.setDate(due.getDate() + LOAN_DAYS);
  const days = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, kind: 'failed', urgent: true };
  if (days === 0) return { label: 'Due today', kind: 'failed', urgent: true };
  if (days <= 2) return { label: `${days}d left`, kind: 'pending', urgent: true };
  return { label: `${days}d left`, kind: 'other', urgent: false };
}

function matchesQuery(haystacks: Array<string | undefined>, query: string) {
  if (!query) return true;
  return haystacks.some((value) => value?.toLowerCase().includes(query));
}

export default function ActivityScreen() {
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const [segment, setSegment] = useState<Segment>('borrows');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const borrowWell = homeWell(mode, 'activity');
  const returnWell = homeWell(mode, 'deposit');
  const urgentWell = homeWell(mode, 'withdraw');

  const {
    data: activeBorrows = [],
    isFetching: fetchingBorrows,
    isLoading: loadingBorrows,
    refetch: refetchBorrows,
  } = useQuery({
    queryKey: queryKeys.activeBorrows(userId ?? ''),
    queryFn: () => apiService.getActiveBorrows(),
    enabled: !!userId,
    staleTime: 5_000,
    refetchOnMount: 'always' as const,
  });

  const {
    data: history = [],
    isFetching: fetchingHistory,
    isLoading: loadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: queryKeys.transactionHistory(userId ?? ''),
    queryFn: () => apiService.getTransactionHistory(),
    enabled: !!userId,
    staleTime: 5_000,
    refetchOnMount: 'always' as const,
  });

  const q = query.trim().toLowerCase();

  const filteredBorrows = useMemo(
    () =>
      activeBorrows.filter((item) =>
        matchesQuery([item.serialNumber, item.type, item.lastVendorId?.userName], q),
      ),
    [activeBorrows, q],
  );

  const filteredHistory = useMemo(
    () =>
      history.filter((item) =>
        matchesQuery(
          [item.containerId?.serialNumber, item.organizationId?.name, item.organizationId?.group, item.type],
          q,
        ),
      ),
    [history, q],
  );

  const historySections = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    for (const item of filteredHistory) {
      const title = dayLabel(item.createdAt);
      const bucket = groups.get(title) ?? [];
      bucket.push(item);
      groups.set(title, bucket);
    }
    return Array.from(groups, ([title, data]) => ({ title, data }));
  }, [filteredHistory]);

  const dueSoon = activeBorrows.filter((item) => dueState(item.updatedAt).urgent).length;
  const refreshing = fetchingBorrows || fetchingHistory;

  const onRefresh = useCallback(() => {
    refetchBorrows();
    refetchHistory();
  }, [refetchBorrows, refetchHistory]);

  const goScan = useCallback(() => router.push('/(tabs)/scanner'), [router]);

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setQuery('');
      return !open;
    });
  };

  const renderBorrow = useCallback(
    ({ item }: { item: Container }) => {
      const due = dueState(item.updatedAt);
      const well = due.urgent ? urgentWell : borrowWell;
      return (
        <CardSurface style={styles.holdCard}>
          <Pressable
            onPress={goScan}
            android_ripple={null}
            style={styles.holdHit}
            accessibilityRole="button"
            accessibilityLabel={`Return ${item.serialNumber}`}
          >
            <View style={[styles.well, { backgroundColor: well.bg }]}>
              <Package color={well.icon} size={18} strokeWidth={2} />
            </View>
            <View style={styles.holdCopy}>
              <Text style={[styles.holdTitle, { color: c.heading }]} numberOfLines={1}>
                {item.type || 'Reusable container'}
              </Text>
              <Text style={[styles.holdMeta, { color: c.textMuted }]} numberOfLines={1}>
                {item.serialNumber}
                {item.lastVendorId?.userName ? ` · ${item.lastVendorId.userName}` : ''}
              </Text>
            </View>
            <StatusBadge label={due.label} kind={due.kind} />
          </Pressable>
          <Pressable
            onPress={goScan}
            android_ripple={null}
            style={[styles.returnBtn, { backgroundColor: c.accent }]}
            accessibilityRole="button"
            accessibilityLabel="Return this container"
          >
            <QrCode color={c.onAccent} size={16} strokeWidth={2} />
            <Text style={[styles.returnLabel, { color: c.onAccent }]}>Return</Text>
          </Pressable>
        </CardSurface>
      );
    },
    [borrowWell, c.accent, c.heading, c.onAccent, c.textMuted, goScan, urgentWell],
  );

  const renderHistoryDay = useCallback(
    ({ item: section }: { item: { title: string; data: Transaction[] } }) => (
      <View style={styles.dayBlock}>
        <Text style={[styles.sectionLabel, { color: c.textFaint }]}>{section.title}</Text>
        <CardSurface style={styles.ledgerCard}>
          {section.data.map((item, index) => {
            const isReturn = item.type === 'RETURN';
            const well = isReturn ? returnWell : borrowWell;
            const Icon = isReturn ? ArrowDownLeft : ArrowUpRight;
            const serial = item.containerId?.serialNumber;
            return (
              <View key={item._id}>
                <View style={styles.ledgerRow}>
                  <View style={[styles.well, { backgroundColor: well.bg }]}>
                    <Icon color={well.icon} size={18} strokeWidth={2} />
                  </View>
                  <View style={styles.ledgerCopy}>
                    <Text style={[styles.ledgerTitle, { color: c.heading }]}>
                      {isReturn ? 'Returned' : 'Borrowed'}
                    </Text>
                    <Text style={[styles.ledgerMeta, { color: c.textMuted }]} numberOfLines={1}>
                      {[serial, item.organizationId?.name, formatTime(item.createdAt)].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  {isReturn ? (
                    <StatusBadge label={`+${item.pointsAwarded ?? 0} pts`} kind="success" />
                  ) : (
                    <StatusBadge label="Out" kind="pending" />
                  )}
                </View>
                {index < section.data.length - 1 ? (
                  <View style={[styles.ledgerDivider, { backgroundColor: c.surfaceBorder }]} />
                ) : null}
              </View>
            );
          })}
        </CardSurface>
      </View>
    ),
    [borrowWell, c.heading, c.surfaceBorder, c.textFaint, c.textMuted, returnWell],
  );

  if (loadingBorrows || loadingHistory) {
    return <InventorySkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <PinnedScreenHeader
        title="Activity"
        right={
          <Pressable
            onPress={toggleSearch}
            android_ripple={null}
            style={styles.iconHit}
            accessibilityRole="button"
            accessibilityLabel={searchOpen ? 'Close search' : 'Search activity'}
          >
            {searchOpen ? <X color={c.text} size={22} /> : <Search color={c.text} size={22} />}
          </Pressable>
        }
      />

      {searchOpen ? (
        <View style={[styles.searchWrap, { backgroundColor: c.muted }]}>
          <Search color={c.textMuted} size={16} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Serial, location, or type"
            placeholderTextColor={c.textFaint}
            style={[styles.searchInput, { color: c.heading }]}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            accessibilityLabel="Search activity"
          />
        </View>
      ) : null}

      <View style={[styles.segment, { backgroundColor: c.muted }]}>
        <Pressable
          onPress={() => setSegment('borrows')}
          android_ripple={null}
          style={[styles.segmentTab, segment === 'borrows' && { backgroundColor: c.accent }]}
          accessibilityRole="tab"
          accessibilityState={{ selected: segment === 'borrows' }}
        >
          <Text style={[styles.segmentLabel, { color: segment === 'borrows' ? c.onAccent : c.textMuted }]}>
            Out now{activeBorrows.length ? ` · ${activeBorrows.length}` : ''}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSegment('history')}
          android_ripple={null}
          style={[styles.segmentTab, segment === 'history' && { backgroundColor: c.accent }]}
          accessibilityRole="tab"
          accessibilityState={{ selected: segment === 'history' }}
        >
          <Text style={[styles.segmentLabel, { color: segment === 'history' ? c.onAccent : c.textMuted }]}>
            History
          </Text>
        </Pressable>
      </View>

      {segment === 'borrows' ? (
        <FlatList
          data={filteredBorrows}
          keyExtractor={(item) => item._id}
          renderItem={renderBorrow}
          ListHeaderComponent={
            filteredBorrows.length ? (
              <Text style={[styles.sectionLabel, styles.listHeader, { color: c.textFaint }]}>
                {dueSoon > 0 ? `${dueSoon} due soon` : `${filteredBorrows.length} out`}
              </Text>
            ) : null
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyWell, { backgroundColor: c.muted }]}>
                <Package color={c.textMuted} size={22} strokeWidth={1.8} />
              </View>
              <Text style={[styles.emptyTitle, { color: c.heading }]}>
                {q ? 'No matching holds' : 'Nothing out'}
              </Text>
              <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                {q
                  ? 'Try another serial or location.'
                  : 'Borrow a container and it will show up here until you return it.'}
              </Text>
              {!q ? (
                <Pressable
                  onPress={goScan}
                  android_ripple={null}
                  style={[styles.emptyCta, { backgroundColor: c.accent }]}
                >
                  <Text style={[styles.emptyCtaLabel, { color: c.onAccent }]}>Scan to borrow</Text>
                </Pressable>
              ) : null}
            </View>
          }
        />
      ) : (
        <FlatList
          data={historySections}
          keyExtractor={(item) => item.title}
          renderItem={renderHistoryDay}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyWell, { backgroundColor: c.muted }]}>
                <ArrowDownLeft color={c.textMuted} size={22} strokeWidth={1.8} />
              </View>
              <Text style={[styles.emptyTitle, { color: c.heading }]}>
                {q ? 'No matching activity' : 'No activity yet'}
              </Text>
              <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                {q ? 'Try another serial or collection base.' : 'Returns and borrows will land here, newest first.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    ...geist('400'),
  },
  segment: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 4,
    borderRadius: 14,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  segmentLabel: { fontSize: 13, ...geist('600') },
  list: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.1,
    marginBottom: 8,
    paddingLeft: 4,
    textTransform: 'uppercase',
    ...geist('700'),
  },
  listHeader: { marginTop: 8 },
  dayBlock: { marginTop: 16 },
  ledgerCard: { paddingHorizontal: 14 },
  holdCard: { padding: 14, marginBottom: 10 },
  holdHit: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  well: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdCopy: { flex: 1, minWidth: 0 },
  holdTitle: { fontSize: 16, letterSpacing: -0.2, ...geist('600') },
  holdMeta: { fontSize: 12.5, marginTop: 2, ...geist('400') },
  returnBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  returnLabel: { fontSize: 15, ...geist('600') },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    minHeight: 68,
  },
  ledgerCopy: { flex: 1, minWidth: 0 },
  ledgerTitle: { fontSize: 16, ...geist('600') },
  ledgerMeta: { fontSize: 12.5, marginTop: 2, ...geist('400') },
  ledgerDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 54,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 72,
    paddingHorizontal: 28,
  },
  emptyWell: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, letterSpacing: -0.2, marginBottom: 6, ...geist('600') },
  emptyBody: { fontSize: 14, lineHeight: 20, textAlign: 'center', ...geist('400') },
  emptyCta: {
    marginTop: 20,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCtaLabel: { fontSize: 15, ...geist('600') },
});
