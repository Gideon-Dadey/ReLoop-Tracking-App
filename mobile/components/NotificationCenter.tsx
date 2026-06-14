import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { useNotificationStore, Notification } from '../src/store/useNotificationStore';
import { useThemeColors } from '../src/store/useThemeStore';
import { screenHeader } from '@/src/theme/screenHeader';
import { Bell, X, CheckCheck, Info, CheckCircle, AlertTriangle, AlertCircle, Inbox } from 'lucide-react-native';

const { height } = Dimensions.get('window');

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ visible, onClose }: NotificationCenterProps) {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  const c = useThemeColors();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle color="#10B981" size={18} />;
      case 'WARNING': return <AlertTriangle color="#F59E0B" size={18} />;
      case 'ERROR': return <AlertCircle color="#EF4444" size={18} />;
      default: return <Info color="#3B82F6" size={18} />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: c.bg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: c.surfaceBorder }]}>
            <View style={styles.headerLeft}>
              <Text style={[screenHeader.modalTitle, { color: c.text }]}>Notifications</Text>
              {notifications.some(n => !n.isRead) && (
                <TouchableOpacity onPress={markAllAsRead}>
                   <Text style={[styles.markAll, { color: c.accent }]}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={c.text} size={22} />
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <TouchableOpacity 
                   key={notif.id} 
                   style={[styles.notifItem, { borderBottomColor: c.surfaceBorder }]}
                   onPress={() => markAsRead(notif.id)}
                   activeOpacity={0.7}
                >
                   <View style={styles.notifMain}>
                      <View style={[styles.iconBox, { backgroundColor: notif.isRead ? c.surfaceBorder + '55' : c.accent + '15' }]}>
                         {getIcon(notif.type)}
                      </View>
                      <View style={styles.textContent}>
                         <View style={styles.notifHeaderRow}>
                            <Text style={[styles.notifTitle, { color: c.text, fontWeight: notif.isRead ? '600' : '800' }]}>
                               {notif.title}
                            </Text>
                            {!notif.isRead && <View style={[styles.unreadDot, { backgroundColor: c.accent }]} />}
                         </View>
                         <Text style={[styles.notifMsg, { color: notif.isRead ? c.textMuted : c.textSecondary }]}>
                            {notif.message}
                         </Text>
                         <Text style={[styles.notifTime, { color: c.textFaint }]}>
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </Text>
                      </View>
                   </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                 <Inbox color={c.textFaint} size={48} strokeWidth={1} />
                 <Text style={[styles.emptyTitle, { color: c.textSecondary }]}>No notifications yet</Text>
                 <Text style={[styles.emptySub, { color: c.textFaint }]}>Your alerts and updates will appear here.</Text>
              </View>
            )}
          </ScrollView>

          {notifications.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
               <Text style={[styles.clearText, { color: c.textFaint }]}>Clear All History</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: height * 0.8,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  markAll: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  notifItem: {
    padding: 20,
    borderBottomWidth: 1,
  },
  notifMain: {
    flexDirection: 'row',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifMsg: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  clearBtn: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
