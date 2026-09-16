import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Pressable, TextInput,
  Alert, ScrollView, Platform, Modal, Share,
  KeyboardAvoidingView,
} from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { apiService } from '@/src/api/service';
import { useRouter } from 'expo-router';
import {
  LogOut, Edit2, Check, X,
  Camera, Key, Sun, Moon, ShieldCheck,
  Bell, Heart, HelpCircle, Star, Leaf, Info, Package, MapPin,
} from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import RewardsSection from '@/components/RewardsSection';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import { useNotificationPreferencesStore } from '@/src/store/useNotificationPreferences';
import * as ImagePicker from 'expo-image-picker';
import { ButtonLoader } from '@/components/Skeleton';
import { screenHeader } from '@/src/theme/screenHeader';
import { queryKeys } from '@/src/lib/queryKeys';
import { buildReferralUrl, buildInviteMessage } from '@/src/lib/shareLinks';
import UserAvatar from '@/components/UserAvatar';
import CardSurface from '@/components/CardSurface';
import MenuRow from '@/components/MenuRow';
import StatusBadge from '@/components/StatusBadge';

const RADIUS = 14;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const c = useThemeColors();
  const queryClient = useQueryClient();

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
      const payload: { userName?: string; avatar?: string | null } = {};
      if (fieldUpdate.userName !== undefined) payload.userName = fieldUpdate.userName;
      if ('avatar' in fieldUpdate) payload.avatar = fieldUpdate.avatar;

      const updatedUser = await apiService.updateProfile(payload);
      const patch: { userName?: string; avatar?: string } = {};
      if (fieldUpdate.userName !== undefined) patch.userName = updatedUser.userName;
      if ('avatar' in fieldUpdate) patch.avatar = updatedUser.avatar ?? undefined;
      updateUser(patch);

      if (fieldUpdate.userName) setIsEditing(false);
      if ('avatar' in fieldUpdate && !fieldUpdate.avatar) {
        Alert.alert('Photo removed', 'Your profile photo has been removed.');
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.userStats(user.id) });
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

  const confirmRemoveAvatar = () => {
    Alert.alert(
      'Remove profile photo?',
      'Your photo will be removed and replaced with your initials avatar.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => handleUpdateProfile({ avatar: null }),
        },
      ],
    );
  };

  const showAvatarOptions = () => {
    const buttons: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [
      { text: 'Choose Photo', onPress: pickImage },
    ];
    if (user.avatar) {
      buttons.push({ text: 'Remove Photo', style: 'destructive', onPress: confirmRemoveAvatar });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Profile Photo', undefined, buttons);
  };

  const handleShare = async () => {
    try {
      const url = buildReferralUrl(user.userName);
      const message = buildInviteMessage(
        user.userName,
        user.points ?? 0,
        user.impact?.totalReturns ?? 0,
        user.streakCount ?? 0,
        url,
      );
      await Share.share(
        Platform.OS === 'ios' ? { url, message } : { message, title: 'Join ReLoop' },
      );
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

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Member since 2024';
  const actionsCount = (user.activeBorrows ?? 0) + (user.impact?.totalReturns ?? 0);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <PinnedScreenHeader
        showBack
        title="Settings"
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
            <View style={styles.avatarColumn}>
              <Pressable
                onPress={showAvatarOptions}
                style={styles.avatarContainer}
                android_ripple={null}
                accessibilityLabel="Change profile picture"
                accessibilityRole="button"
              >
                <UserAvatar name={user.userName} uri={user.avatar} size="lg" verified={(user.impact?.totalReturns ?? 0) > 0} />
                {loading && <View style={styles.avatarLoader}><ButtonLoader color={c.onAccent} /></View>}
                <View style={[styles.editBadge, { backgroundColor: c.accent, borderColor: c.surface }]}>
                  <Camera color={c.onAccent} size={12} />
                </View>
              </Pressable>
              {user.avatar ? (
                <TouchableOpacity
                  onPress={confirmRemoveAvatar}
                  disabled={loading}
                  style={styles.removePhotoBtn}
                  accessibilityLabel="Remove profile photo"
                  accessibilityRole="button"
                >
                  <Text style={styles.removePhotoText}>Remove photo</Text>
                </TouchableOpacity>
              ) : null}
            </View>

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
              <Leaf color={c.success} size={16} />
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
          <CardSurface style={styles.groupCard}>
            <MenuRow
              icon={MapPin}
              title="Nearby Drop-off Points"
              well="sky"
              onPress={() => router.push('/map')}
            />
            <MenuRow
              icon={ShieldCheck}
              title="Security & Privacy"
              well="slate"
              right={<StatusBadge label="Active" kind="success" />}
            />
            <MenuRow
              icon={Key}
              title="Change Password"
              well="sky"
              onPress={() => setPassModalVisible(true)}
            />
            <MenuRow
              icon={Bell}
              title="Notifications"
              well="amber"
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              right={<StatusBadge label={notificationsEnabled ? 'On' : 'Off'} kind={notificationsEnabled ? 'success' : 'other'} />}
              showDivider={false}
            />
          </CardSurface>
        </View>

        <View style={styles.sectionMargin}>
          <CardSurface style={styles.groupCard}>
            <MenuRow icon={Heart} title="Tell a Friend" well="rose" onPress={handleShare} />
            <MenuRow icon={HelpCircle} title="Help Center" well="violet" onPress={showHelp} />
            <MenuRow icon={Info} title="About ReLoop" well="slate" onPress={showAbout} showDivider={false} />
          </CardSurface>
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
                {loading ? <ButtonLoader color={c.onAccent} /> : <Text style={[styles.saveBtnText, { color: c.onAccent }]}>Save Changes</Text>}
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
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  themeBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  heroCard: {
    padding: 24, borderRadius: RADIUS, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 4,
  },
  heroMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarColumn: { alignItems: 'center' },
  avatarContainer: { position: 'relative', width: 80, height: 80 },
  removePhotoBtn: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 8 },
  removePhotoText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  avatarLoader: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 40, justifyContent: 'center', alignItems: 'center',
  },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0, width: 26, height: 26,
    borderRadius: 13, borderWidth: 2,
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

  sectionMargin: { marginTop: 16 },
  groupLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12, paddingLeft: 4 },
  groupCard: { overflow: 'hidden' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: RADIUS, gap: 10, marginTop: 24,
    borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },

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
  saveBtnText: { fontSize: 17, fontWeight: '700' },
});
