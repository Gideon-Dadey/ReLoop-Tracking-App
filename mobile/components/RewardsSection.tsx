import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert } from 'react-native';
import { Skeleton, ButtonLoader } from './Skeleton';
import { Gift, Star, QrCode, CheckCircle, X, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../src/store/useAuthStore';
import { useThemeColors } from '../src/store/useThemeStore';
import { apiService } from '../src/api/service';
import type { Reward } from '../src/api/service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const RADIUS = 14;

export default function RewardsSection() {
  const { user, accessToken } = useAuthStore();
  const c = useThemeColors();
  const qc = useQueryClient();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redemptionStep, setRedemptionStep] = useState<'confirm' | 'success' | 'loading'>('confirm');
  const [voucherCode, setVoucherCode] = useState('');

  const userPoints = user?.points ?? 0;

  const { data: rewards = [], isFetching } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => apiService.getRewards(),
    enabled: !!accessToken,
  });

  const redeemMutation = useMutation({
    mutationFn: (id: string) => apiService.redeemReward(id),
    onSuccess: (data) => {
      setVoucherCode(data.voucherCode || `RELOOP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
      setRedemptionStep('success');
      qc.invalidateQueries({ queryKey: ['user-stats'] });
      qc.invalidateQueries({ queryKey: ['rewards'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message);
      setSelectedReward(null);
    },
  });

  const handleRedeemClick = (reward: Reward) => {
     setSelectedReward(reward);
     setRedemptionStep('confirm');
  };

  const confirmRedeem = () => {
    if (!selectedReward) return;
    setRedemptionStep('loading');
    redeemMutation.mutate(selectedReward.id || selectedReward._id);
  };

  const renderReward = useCallback((item: Reward) => {
    const canRedeem = userPoints >= item.points;
    return (
      <TouchableOpacity
        key={item.id || item._id}
        style={[styles.rewardCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
        onPress={() => handleRedeemClick(item)}
        activeOpacity={0.7}
      >
        <View style={styles.rewardLeft}>
          <View style={[styles.iconContainer, { backgroundColor: c.accent + '15' }]}>
              <Gift color={c.accent} size={20} strokeWidth={2} />
          </View>
          <View style={styles.rewardInfo}>
            <Text style={[styles.rewardTitle, { color: c.text }]}>{item.title}</Text>
            <Text style={[styles.rewardVendor, { color: c.textMuted }]}>{item.vendor}</Text>
          </View>
        </View>
        <View style={styles.rewardRight}>
           <Text style={[styles.pointsValue, { color: canRedeem ? c.accent : c.textFaint }]}>
             {item.points} pts
           </Text>
           <ChevronRight color={c.textFaint} size={16} />
        </View>
      </TouchableOpacity>
    );
  }, [c, userPoints]);

  return (
    <View style={styles.container}>
      <Text style={[styles.groupLabel, { color: c.textFaint }]}>ECO REWARDS</Text>
      
      <View style={styles.rewardsList}>
        {isFetching && (
          <View style={{ gap: 10, marginVertical: 10 }}>
            <Skeleton width="100%" height={56} borderRadius={14} />
            <Skeleton width="100%" height={56} borderRadius={14} />
          </View>
        )}
        
        {rewards.length > 0 ? (
          rewards.slice(0, 3).map(renderReward)
        ) : !isFetching && (
          <View style={[styles.emptyBox, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
             <Star color={c.textFaint} size={20} />
             <Text style={[styles.emptyText, { color: c.textMuted }]}>No active rewards to redeem</Text>
          </View>
        )}
        
        {rewards.length > 3 && (
          <TouchableOpacity style={styles.seeMoreBtn}>
             <Text style={[styles.seeMoreText, { color: c.accent }]}>See all {rewards.length} rewards</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Redemption Modal */}
      <Modal visible={!!selectedReward} transparent animationType="fade">
        <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedReward(null)}
              >
                <X color={c.text} size={24} />
              </TouchableOpacity>

              {redemptionStep === 'confirm' && (
                <View style={styles.confirmView}>
                   <View style={[styles.modalIconHuge, { backgroundColor: c.accent + '15' }]}>
                      <Gift color={c.accent} size={48} />
                   </View>
                   <Text style={[styles.modalTitle, { color: c.text }]}>{selectedReward?.title}</Text>
                   <Text style={[styles.modalVendor, { color: c.textMuted }]}>Offered by {selectedReward?.vendor}</Text>
                   
                   <View style={[styles.costBox, { backgroundColor: c.bg, borderColor: c.surfaceBorder }]}>
                      <Text style={[styles.costLabel, { color: c.textMuted }]}>COST</Text>
                      <Text style={[styles.costValue, { color: c.text }]}>{selectedReward?.points} pts</Text>
                   </View>

                   <TouchableOpacity 
                     style={[styles.redeemActionBtn, { backgroundColor: userPoints >= (selectedReward?.points || 0) ? c.accent : c.surfaceBorder }]}
                     disabled={userPoints < (selectedReward?.points || 0)}
                     onPress={confirmRedeem}
                   >
                     <Text style={styles.redeemActionText}>
                       {userPoints >= (selectedReward?.points || 0) ? 'Confirm Redemption' : 'Not Enough Points'}
                     </Text>
                   </TouchableOpacity>
                </View>
              )}

              {redemptionStep === 'loading' && (
                <View style={styles.loadingView}>
                   <ButtonLoader color={c.accent} />
                   <Text style={[styles.loadingTitle, { color: c.text }]}>Processing...</Text>
                </View>
              )}

              {redemptionStep === 'success' && (
                <View style={styles.successView}>
                   <CheckCircle color="#10B981" size={64} style={{ marginBottom: 20 }} />
                   <Text style={[styles.modalTitle, { color: c.text }]}>Reward Redeemed!</Text>
                   <Text style={[styles.successInstructions, { color: c.textMuted }]}>
                      Show this code to the vendor at checkout.
                   </Text>
                   
                   <View style={styles.qrContainer}>
                      <QrCode color={c.text} size={150} strokeWidth={1} />
                      <Text style={[styles.voucherCode, { color: c.text }]}>{voucherCode}</Text>
                   </View>

                   <TouchableOpacity 
                     style={[styles.doneBtn, { backgroundColor: c.accent }]}
                     onPress={() => setSelectedReward(null)}
                   >
                      <Text style={styles.doneBtnText}>Close</Text>
                   </TouchableOpacity>
                </View>
              )}
           </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 32 },
  groupLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
    paddingLeft: 4,
  },
  rewardsList: { gap: 12 },
  rewardCard: {
    borderRadius: RADIUS, padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', borderWidth: 1,
  },
  rewardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  rewardInfo: { marginLeft: 12, flex: 1 },
  rewardTitle: { fontSize: 16, fontWeight: '700' },
  rewardVendor: { fontSize: 12, marginTop: 2 },
  rewardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pointsValue: { fontSize: 13, fontWeight: '800' },
  emptyBox: { 
    padding: 24, borderRadius: RADIUS, borderWidth: 1, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderStyle: 'dashed'
  },
  emptyText: { fontSize: 13, fontWeight: '600' },
  seeMoreBtn: { alignSelf: 'center', marginTop: 4 },
  seeMoreText: { fontSize: 13, fontWeight: '700' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 24, borderRadius: 20 },
  closeBtn: { alignSelf: 'flex-end', width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  confirmView: { alignItems: 'center' },
  modalIconHuge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  modalVendor: { fontSize: 15, marginTop: 6, opacity: 0.8 },
  costBox: { width: '100%', padding: 16, borderRadius: RADIUS, borderWidth: 1, marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  costLabel: { fontSize: 11, fontWeight: '800' },
  costValue: { fontSize: 16, fontWeight: '800' },
  redeemActionBtn: { width: '100%', padding: 16, borderRadius: RADIUS, alignItems: 'center', marginTop: 16 },
  redeemActionText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loadingView: { height: 300, justifyContent: 'center', alignItems: 'center' },
  loadingTitle: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  successView: { alignItems: 'center' },
  successInstructions: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  qrContainer: { marginTop: 24, alignItems: 'center', gap: 16 },
  voucherCode: { fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  doneBtn: { width: '100%', padding: 16, borderRadius: RADIUS, alignItems: 'center', marginTop: 32 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
