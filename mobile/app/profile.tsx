import React, { useState, useCallback, memo } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Image, TextInput,
  Alert, ScrollView, Platform, Modal, Share,
  KeyboardAvoidingView,
} from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { apiService } from '@/src/api/service';
import {
  LogOut, Edit2, Check, X,
  Camera, Key, Sun, Moon, ChevronRight, ShieldCheck,
  Bell, Heart, HelpCircle, Star, Leaf, Info, Package, ArrowLeft,
} from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import RewardsSection from '@/components/RewardsSection';
import { useRouter } from 'expo-router';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import { useNotificationPreferencesStore } from '@/src/store/useNotificationPreferences';
import * as ImagePicker from 'expo-image-picker';
import type { LucideIcon } from 'lucide-react-native';
import { ButtonLoader } from '@/components/Skeleton';
import { screenHeader } from '@/src/theme/screenHeader';

const RADIUS = 14;

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  color: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  surfaceColor: string;
  borderColor: string;
  textColor: string;
  faintColor: string;
}

const ProfileMenuItem = memo(function ProfileMenuItem({
  icon: Icon, label, color, onPress, rightElement,
  surfaceColor, borderColor, textColor, faintColor,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: surfaceColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIcon, { backgroundColor: color + '10' }]}>
          <Icon color={color} size={20} strokeWidth={2} />
        </View>
        <Text style={[styles.menuLabel, { color: textColor }]}>{label}</Text>
      </View>
      {rightElement || <ChevronRight color={faintColor} size={18} />}
    </TouchableOpacity>
  );
});

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const c = useThemeColors();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.userName || '');
  const [loading, setLoading] = useState(false);
  const notificationsEnabled = useNotificationPreferencesStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useNotificationPreferencesStore((s) => s.setNotificationsEnabled);

  const [passModalVisible, setPassModalVisible] = useState(false);
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

  if (!user) return null;

  const handleUpdateProfile = async (fieldUpdate: { userName?: string; avatar?: string | null }) => {
    setLoading(true);
    try {
      const updatedUser = await apiService.updateProfile({
        userName: fieldUpdate.userName,
        avatar: fieldUpdate.avatar as string,
      });
      updateUser({ userName: updatedUser.userName, avatar: updatedUser.avatar });
      if (fieldUpdate.userName) setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passData.new !== passData.confirm) {
      return Alert.alert('Error', 'New passwords do not match');
    }
    if (passData.new.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await apiService.changePassword({
        currentPassword: passData.current,
        newPassword: passData.new,
      });
      Alert.alert('Success', 'Password changed successfully');
      setPassModalVisible(false);
      setPassData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      Alert.alert('Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your gallery to update your profile.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await handleUpdateProfile({ avatar: base64Image });
      }
    } catch (error: any) {
      Alert.alert('Image Selection Failed', error.message);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join ReLoop and start your sustainability journey! Use my link to get a referral bonus: https://reloop.eco/join/${user.userName}`,
        title: 'Share ReLoop',
      });
    } catch (error: any) {
      Alert.alert('Sharing failed', error.message);
    }
  };

  const showHelp = () => {
    Alert.alert(
      'Help Center',
      'Need assistance? Our support team is here for you.\n\nEmail: support@reloop.eco\nHours: Mon-Fri, 9am - 5pm',
      [{ text: 'OK' }],
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About ReLoop',
      'Version 1.2.0 (Stable)\n\nReLoop is on a mission to eliminate single-use plastic through a circular economy of smart containers. Thank you for being part of the solution!',
      [{ text: 'Close' }],
    );
  };

  const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/initials/png?seed=${user.userName}&backgroundColor=10B981`;
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Member since 2024';
  const actionsCount = (user.activeBorrows ?? 0) + (user.impact?.totalReturns ?? 0);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <PinnedScreenHeader
        left={
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: c.surfaceBorder + '33' }]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft color={c.text} size={22} />
          </TouchableOpacity>
        }
        title="Settings"
        subtitle="Manage your account & impact"
        right={
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeBtn, { backgroundColor: c.surfaceBorder + '33' }]}
            accessibilityLabel={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            accessibilityRole="button"
          >
            {mode === 'dark' ? <Sun color={c.text} size={20} /> : <Moon color={c.text} size={20} />}
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
          <View style={styles.heroMain}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.8} accessibilityLabel="Change profile picture" accessibilityRole="button">
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              {loading && <View style={styles.avatarLoader}><ButtonLoader color={c.accent} /></View>}
              <View style={[styles.editBadge, { backgroundColor: c.accent }]}>
                <Camera color="#fff" size={12} />
              </View>
            </TouchableOpacity>

            <View style={styles.heroInfo}>
              {isEditing ? (
                <View style={styles.editActions}>
                  <TextInput
                    style={[styles.nameInput, { color: c.text, borderBottomColor: c.accent }]}
                    value={newName}
                    onChangeText={setNewName}
                    autoFocus
                    accessibilityLabel="Edit display name"
                  />
                  <TouchableOpacity onPress={() => handleUpdateProfile({ userName: newName })} accessibilityLabel="Save name" accessibilityRole="button"><Check color={c.accent} size={22} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsEditing(false)} accessibilityLabel="Cancel editing" accessibilityRole="button"><X color="#EF4444" size={22} /></TouchableOpacity>
                </View>
              ) : (
                <View style={styles.nameRow}>
                  <Text style={[styles.userName, { color: c.text }]}>{user.userName}</Text>
                  <TouchableOpacity onPress={() => setIsEditing(true)} accessibilityLabel="Edit name" accessibilityRole="button">
                    <Edit2 color={c.textFaint} size={14} />
                  </TouchableOpacity>
                </View>
              )}
              <Text style={[styles.userEmail, { color: c.textMuted }]}>{user.email}</Text>
              <Text style={[styles.membershipText, { color: c.accent }]}>{joinDate}</Text>
            </View>
          </View>

          <View style={[styles.statsRow, { borderColor: c.surfaceBorder + '66' }]}>
            <View style={styles.statBox}>
              <Star color="#F59E0B" size={16} fill="#F59E0B" />
              <Text style={[styles.statNum, { color: c.text }]}>{user.points || 0}</Text>
              <Text style={[styles.statName, { color: c.textFaint }]}>Points</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: c.surfaceBorder }]} />
            <View style={styles.statBox}>
              <Leaf color="#10B981" size={16} />
              <Text style={[styles.statNum, { color: c.text }]}>{user.impact?.plasticSaved?.toFixed(1) || 0}</Text>
              <Text style={[styles.statName, { color: c.textFaint }]}>Eco Score</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: c.surfaceBorder }]} />
            <View style={styles.statBox}>
              <Package color="#2563EB" size={16} strokeWidth={2} />
              <Text style={[styles.statNum, { color: c.text }]}>{actionsCount.toLocaleString()}</Text>
              <Text style={[styles.statName, { color: c.textFaint }]}>Actions</Text>
            </View>
          </View>
        </View>

        <RewardsSection />

        <View style={styles.sectionMargin}>
          <Text style={[styles.groupLabel, { color: c.textFaint }]}>ACCOUNT</Text>
          <View style={styles.groupCard}>
            <ProfileMenuItem
              icon={ShieldCheck} label="Security & Privacy" color="#10B981"
              surfaceColor={c.surface} borderColor={c.surfaceBorder} textColor={c.text} faintColor={c.textFaint}
              rightElement={<Text style={{ fontSize: 13, color: '#10B981', fontWeight: '700' }}>ACTIVE</Text>}
            />
            <ProfileMenuItem
              icon={Key} label="Change Password" color="#3B82F6"
              onPress={() => setPassModalVisible(true)}
              surfaceColor={c.surface} borderColor={c.surfaceBorder} textColor={c.text} faintColor={c.textFaint}
            />
            <ProfileMenuItem
              icon={Bell} label="Notifications" color="#F59E0B"
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              surfaceColor={c.surface} borderColor={c.surfaceBorder} textColor={c.text} faintColor={c.textFaint}
              rightElement={<Text style={{ fontSize: 12, color: notificationsEnabled ? '#10B981' : c.textFaint, fontWeight: '700' }}>{notificationsEnabled ? 'ON' : 'OFF'}</Text>}
            />
          </View>
        </View>

        <View style={styles.sectionMargin}>
          <Text style={[styles.groupLabel, { color: c.textFaint }]}>SUPPORT & SOCIAL</Text>
          <View style={styles.groupCard}>
            <ProfileMenuItem icon={Heart} label="Tell a Friend" color="#EC4899" onPress={handleShare} surfaceColor={c.surface} borderColor={c.surfaceBorder} textColor={c.text} faintColor={c.textFaint} />
            <ProfileMenuItem icon={HelpCircle} label="Help Center" color="#6366F1" onPress={showHelp} surfaceColor={c.surface} borderColor={c.surfaceBorder} textColor={c.text} faintColor={c.textFaint} />
            <ProfileMenuItem icon={Info} label="About ReLoop" color="#6B7280" onPress={showAbout} surfaceColor={c.surface} borderColor={c.surfaceBorder} textColor={c.text} faintColor={c.textFaint} />
          </View>
        </View>

        <TouchableOpacity
          onPress={logout}
          style={[styles.logoutBtn, { backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(239, 68, 68, 0.05)' }]}
          activeOpacity={0.6}
          accessibilityLabel="Sign out"
          accessibilityRole="button"
        >
          <LogOut color="#EF4444" size={20} strokeWidth={2} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={passModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[screenHeader.modalTitle, { color: c.text }]}>Update Password</Text>
              <TouchableOpacity onPress={() => setPassModalVisible(false)} style={styles.modalClose} accessibilityLabel="Close" accessibilityRole="button">
                <X color={c.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalSub, { color: c.textMuted }]}>Ensure your account stays secure by using a strong password.</Text>

              <View style={styles.inputGroup}>
                <TextInput
                  placeholder="Current Password"
                  placeholderTextColor={c.textFaint}
                  secureTextEntry
                  style={[styles.modalInput, { backgroundColor: c.inputBg, color: c.text }]}
                  value={passData.current}
                  onChangeText={(t) => setPassData({ ...passData, current: t })}
                  textContentType="password"
                  accessibilityLabel="Current password"
                />
                <TextInput
                  placeholder="New Password"
                  placeholderTextColor={c.textFaint}
                  secureTextEntry
                  style={[styles.modalInput, { backgroundColor: c.inputBg, color: c.text }]}
                  value={passData.new}
                  onChangeText={(t) => setPassData({ ...passData, new: t })}
                  textContentType="newPassword"
                  accessibilityLabel="New password"
                />
                <TextInput
                  placeholder="Confirm New Password"
                  placeholderTextColor={c.textFaint}
                  secureTextEntry
                  style={[styles.modalInput, { backgroundColor: c.inputBg, color: c.text }]}
                  value={passData.confirm}
                  onChangeText={(t) => setPassData({ ...passData, confirm: t })}
                  textContentType="newPassword"
                  accessibilityLabel="Confirm new password"
                />
              </View>

              <TouchableOpacity
                onPress={handleChangePassword}
                style={[styles.saveBtn, { backgroundColor: c.accent, opacity: loading ? 0.7 : 1 }]}
                disabled={loading}
                accessibilityLabel="Save new password"
                accessibilityRole="button"
              >
                {loading ? <ButtonLoader color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  themeBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  heroCard: {
    padding: 24, borderRadius: RADIUS, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 4,
  },
  heroMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative', width: 84, height: 84 },
  avatar: { width: '100%', height: '100%', borderRadius: 42 },
  avatarLoader: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 42, justifyContent: 'center', alignItems: 'center',
  },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0, width: 26, height: 26,
    borderRadius: 13, borderWidth: 2, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  heroInfo: { marginLeft: 20, flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  userEmail: { fontSize: 14, marginTop: 2, opacity: 0.8 },
  membershipText: { fontSize: 12, fontWeight: '700', marginTop: 6, opacity: 0.9 },
  editActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameInput: { fontSize: 20, fontWeight: '800', borderBottomWidth: 2, flex: 1, paddingVertical: 2 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20, borderTopWidth: 1 },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  statName: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 },
  statDivider: { width: 1, height: '60%', alignSelf: 'center', opacity: 0.3 },

  sectionMargin: { marginTop: 32 },
  groupLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12, paddingLeft: 4 },
  groupCard: { backgroundColor: 'transparent', gap: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: RADIUS, borderWidth: 1,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 16, fontWeight: '700' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, borderRadius: RADIUS, gap: 10, marginTop: 40,
    borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: { color: '#EF4444', fontSize: 17, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: {
    borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalClose: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  modalBody: { gap: 16 },
  modalSub: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  inputGroup: { gap: 16 },
  modalInput: { padding: 16, borderRadius: RADIUS, fontSize: 16, fontWeight: '600' },
  saveBtn: { paddingVertical: 18, borderRadius: RADIUS, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
