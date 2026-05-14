import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Platform, RefreshControl, TouchableOpacity } from 'react-native';
import { InventorySkeleton } from '@/components/Skeleton';
import { useThemeColors } from '@/src/store/useThemeStore';
import { apiService } from '@/src/api/service';
import type { Container, Transaction } from '@/src/api/service';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, ArrowUpRight, ArrowDownLeft, 
  ChevronRight, MapPin, Search, History as HistoryIcon, 
  ArrowLeft, ArrowRight, ClipboardList, Info
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const RADIUS = 14;
const PADDING = 16;

const BarcodeGraphic = ({ color, opacity = 0.5 }: { color: string, opacity?: number }) => (
  <View style={styles.barcodeContainer}>
    {[2, 7, 3, 5, 2, 8, 4, 1, 6, 3, 7, 2, 5, 3, 8, 2].map((h, i) => (
      <View 
        key={i} 
        style={[
          styles.barcodeStrip, 
          { 
            height: 14 + h, 
            width: i % 3 === 0 ? 2.5 : 1, 
            backgroundColor: color,
            opacity: i % 4 === 0 ? 1 : opacity 
          }
        ]} 
      />
    ))}
  </View>
);

export default function HistoryScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState<'borrows' | 'history'>('borrows');

  const { data: activeBorrows = [], isFetching: isFetchingActive, isLoading: isLoadingActive, refetch: refetchActive } = useQuery({
    queryKey: ['active-borrows'],
    queryFn: () => apiService.getActiveBorrows(),
  });

  const { data: history = [], isFetching: isFetchingHistory, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['transaction-history'],
    queryFn: () => apiService.getTransactionHistory(),
  });

  const onRefresh = () => {
    refetchActive();
    refetchHistory();
  };

  const isRefreshing = isFetchingActive || isFetchingHistory;
  const isInitialLoad = isLoadingActive || isLoadingHistory;

  const renderActiveBorrow = useCallback(({ item }: { item: Container }) => {
    const issueDate = new Date(item.updatedAt || Date.now());
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 14);
    
    const daysRemaining = Math.max(0, Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    return (
      <TouchableOpacity 
        style={[styles.activeCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
        onPress={() => router.push('/scanner')}
        activeOpacity={0.9}
      >
        <View style={styles.activeHeader}>
           <View style={[styles.statusBadge, { backgroundColor: daysRemaining <= 2 ? '#FEF2F2' : '#F0FDF4' }]}>
              <View style={[styles.statusDot, { backgroundColor: daysRemaining <= 2 ? '#EF4444' : '#22C55E' }]} />
              <Text style={[styles.statusText, { color: daysRemaining <= 2 ? '#EF4444' : '#16A34A' }]}>
                {daysRemaining === 0 ? 'DUE TODAY' : `${daysRemaining} DAYS LEFT`}
              </Text>
           </View>
           <Text style={[styles.idText, { color: c.textFaint }]}>#{item.serialNumber}</Text>
        </View>

        <View style={styles.activeBody}>
           <View style={styles.mainInfo}>
              <View style={[styles.packageIcon, { backgroundColor: c.accent + '10' }]}>
                 <Package color={c.accent} size={28} strokeWidth={1.5} />
              </View>
              <View style={styles.details}>
                 <Text style={[styles.itemName, { color: c.text }]}>{item.type || 'Standard Container'}</Text>
                 <View style={styles.metaRow}>
                    <MapPin color={c.textFaint} size={12} />
                    <Text style={[styles.metaText, { color: c.textFaint }]}>at {item.lastVendorId?.userName || 'Partner Vendor'}</Text>
                 </View>
              </View>
           </View>
           <View style={styles.activeFooter}>
              <TouchableOpacity 
                style={[styles.returnBtn, { backgroundColor: c.accent }]}
                onPress={() => router.push('/scanner')}
              >
                 <Text style={styles.returnBtnText}>RETURN NOW</Text>
                 <ArrowRight color="#fff" size={14} strokeWidth={3} />
              </TouchableOpacity>
           </View>
        </View>
      </TouchableOpacity>
    );
  }, [c, router]);

  const renderHistoryItem = useCallback(({ item }: { item: Transaction }) => {
    const isReturn = item.type === 'RETURN';
    const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const time = new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity style={[styles.historyCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
         <View style={styles.historyTop}>
            <View style={[styles.historyActionIcon, { backgroundColor: isReturn ? '#10B98110' : '#3B82F610' }]}>
               {isReturn ? <ArrowDownLeft color="#10B981" size={18} /> : <ArrowUpRight color="#3B82F6" size={18} />}
            </View>
            <View style={styles.historyMainContent}>
               <View style={styles.historyTextRow}>
                  <Text style={[styles.historyTitle, { color: c.text }]}>{isReturn ? 'Returned Container' : 'Borrowed Container'}</Text>
                  <Text style={[styles.impactBadge, { color: isReturn ? '#10B981' : c.textMuted }]}>
                     {isReturn ? `+${item.pointsAwarded} pts` : 'Ongoing'}
                  </Text>
               </View>
               <Text style={[styles.historyTime, { color: c.textFaint }]}>{date} • {time}</Text>
            </View>
         </View>

         <View style={[styles.barcodeSection, { backgroundColor: c.bg + '50', borderColor: c.surfaceBorder }]}>
            <View style={styles.barcodeInfo}>
               <Text style={[styles.barcodeLabel, { color: c.textFaint }]}>SERIAL ID</Text>
               <Text style={[styles.serialFull, { color: c.textSecondary }]}>{item.containerId?.serialNumber || 'CN-712-449-002'}</Text>
            </View>
            <BarcodeGraphic color={c.text} opacity={0.2} />
            <ChevronRight color={c.textFaint} size={16} />
         </View>
      </TouchableOpacity>
    );
  }, [c]);

  if (isInitialLoad) {
    return <InventorySkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      
      {/* Dynamic Header */}
      <View style={styles.header}>
         <View>
            <Text style={[styles.title, { color: c.text }]}>Activity</Text>
         </View>
         <TouchableOpacity 
           style={[styles.notifCircle, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
         >
            <Search color={c.text} size={20} />
         </TouchableOpacity>
      </View>

      {/* Segmented Control - Industrial Standard */}
      <View style={styles.segmentContainer}>
         <View style={[styles.segmentBg, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
            <TouchableOpacity 
               style={[styles.segment, activeSegment === 'borrows' && { backgroundColor: c.accent }]}
               onPress={() => setActiveSegment('borrows')}
            >
               <Text style={[styles.segmentText, { color: activeSegment === 'borrows' ? '#fff' : c.textFaint }]}>
                 Active ({activeBorrows.length})
               </Text>
            </TouchableOpacity>
            <TouchableOpacity 
               style={[styles.segment, activeSegment === 'history' && { backgroundColor: c.accent }]}
               onPress={() => setActiveSegment('history')}
            >
               <Text style={[styles.segmentText, { color: activeSegment === 'history' ? '#fff' : c.textFaint }]}>History</Text>
            </TouchableOpacity>
         </View>
      </View>

      <View style={{ flex: 1 }}>
        {activeSegment === 'borrows' ? (
          <FlatList
            data={activeBorrows}
            renderItem={renderActiveBorrow}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={c.accent} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                 <Package color={c.textFaint} size={64} strokeWidth={1} />
                 <Text style={[styles.emptyTitle, { color: c.text }]}>Nothing borrowed yet</Text>
                 <Text style={[styles.emptyMsg, { color: c.textMuted }]}>Scan a container at any partner location to start tracking your inventory.</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={c.accent} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                 <HistoryIcon color={c.textFaint} size={64} strokeWidth={1} />
                 <Text style={[styles.emptyTitle, { color: c.text }]}>No transactions found</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingHorizontal: PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  notifCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  segmentContainer: { paddingHorizontal: PADDING, marginBottom: 20 },
  segmentBg: { height: 52, borderRadius: 26, borderWidth: 1, flexDirection: 'row', padding: 5 },
  segment: { flex: 1, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  segmentText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },

  listPadding: { paddingHorizontal: PADDING, paddingBottom: 100 },
  
  // Active Card Styles
  activeCard: {
    padding: 24,
    borderRadius: RADIUS,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: RADIUS, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  idText: { fontSize: 11, fontWeight: '600' },

  activeBody: { gap: 16 },
  mainInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  packageIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  details: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12 },
  activeFooter: { marginTop: 4 },
  returnBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 12, 
    paddingVertical: 12, 
    borderRadius: RADIUS,
  },
  returnBtnText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },

  // History Card Styles - Professional Revision
  historyCard: {
    borderRadius: RADIUS,
    borderWidth: 1,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  historyTop: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 14 },
  historyActionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  historyMainContent: { flex: 1 },
  historyTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTitle: { fontSize: 15, fontWeight: '700' },
  impactBadge: { fontSize: 13, fontWeight: '900' },
  historyTime: { fontSize: 12, marginTop: 2 },

  barcodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS,
    borderWidth: 1,
    gap: 12,
  },
  barcodeInfo: { flex: 1 },
  barcodeLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  serialFull: { fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
  
  barcodeContainer: { 
    flexDirection: 'row', 
    gap: 2, 
    alignItems: 'flex-end',
    height: 30,
  },
  barcodeStrip: { width: 1.5, borderRadius: 0.5 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  emptyMsg: { fontSize: 15, textAlign: 'center', lineHeight: 22, opacity: 0.7 },
});
