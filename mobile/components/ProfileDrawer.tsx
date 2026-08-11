import React, { useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
  Alert,
  Platform,
  Share,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { useNotificationPreferencesStore } from '@/src/store/useNotificationPreferences';
import { typography } from '@/src/theme/fonts';
import {
  buildReferralUrl,
  buildInviteMessage,
} from '@/src/lib/shareLinks';

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
  impactScore?: number;
  streakCount?: number;
  totalReturns?: number;
}

export default function ProfileDrawer({
  visible,
  onClose,
  impactScore = 0,
  streakCount = 0,
  totalReturns = 0,
}: ProfileDrawerProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const notificationsEnabled = useNotificationPreferencesStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useNotificationPreferencesStore((s) => s.setNotificationsEnabled);
  const { user, logout } = useAuthStore();

  const drawerWidth = Math.min(width * 0.75, 320);
  const [mounted, setMounted] = React.useState(false);
  const slideAnim = useRef(new Animated.Value(drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

  const referralUrl = user ? buildReferralUrl(user.userName) : '';
  const inviteMessage = user
    ? buildInviteMessage(user.userName, impactScore, totalReturns, streakCount, referralUrl)
    : '';

  const animateIn = useCallback(() => {
    slideAnim.setValue(drawerWidth);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 28,
        stiffness: 240,
        mass: 0.88,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerWidth, fadeAnim, slideAnim]);

  const animateOut = useCallback(
    (then?: () => void) => {
      if (closingRef.current) return;
      closingRef.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: drawerWidth,
          duration: 280,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 240,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        closingRef.current = false;
        if (finished) then?.();
      });
    },
    [drawerWidth, fadeAnim, slideAnim],
  );

  useEffect(() => {
    if (!visible) return;
    closingRef.current = false;
    setMounted(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(animateIn);
    });
    return () => cancelAnimationFrame(frame);
  }, [visible, animateIn]);

  const finishClose = useCallback(() => {
    setMounted(false);
    onClose();
  }, [onClose]);

  const closeDrawer = useCallback(() => {
    animateOut(finishClose);
  }, [animateOut, finishClose]);

  const showHelp = useCallback(() => {
    Alert.alert(
      'Help Center',
      'Need assistance? Our support team is here for you.\n\nEmail: support@reloop.eco\nHours: Mon–Fri, 9am – 5pm',
      [{ text: 'OK' }],
    );
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { url: referralUrl, message: inviteMessage }
          : { message: inviteMessage, title: 'Join me on ReLoop' },
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Sharing is not available on this device.';
      Alert.alert('Share failed', msg);
    }
  }, [inviteMessage, referralUrl]);

  if (!user) return null;

  const switchTrack = {
    false: mode === 'dark' ? '#3A3A3C' : '#D0D7E2',
    true: mode === 'dark' ? '#FFFFFF' : '#000000',
  };
  const switchThumb = mode === 'dark' ? '#000000' : '#FFFFFF';

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeDrawer}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} accessibilityLabel="Close menu" />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              backgroundColor: c.bg,
              paddingTop: insets.top + 18,
              paddingBottom: Math.max(insets.bottom, 24),
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.title, { color: c.heading }]}>Options</Text>
          <View style={[styles.rule, { backgroundColor: c.surfaceBorder }]} />

          <Pressable
            onPress={() => {
              closeDrawer();
              setTimeout(showHelp, 260);
            }}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel="Help Center"
          >
            <Text style={[styles.rowLabel, { color: c.text }]}>Help Center</Text>
          </Pressable>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={switchTrack}
              thumbColor={switchThumb}
              ios_backgroundColor={switchTrack.false}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Dark mode</Text>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={switchTrack}
              thumbColor={switchThumb}
              ios_backgroundColor={switchTrack.false}
            />
          </View>

          <Pressable
            onPress={handleShare}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel="Share ReLoop"
          >
            <Text style={[styles.rowLabel, { color: c.text }]}>Share ReLoop</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setMounted(false);
              onClose();
              logout();
            }}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Text style={[styles.rowLabel, { color: c.danger }]}>Sign out</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    height: '100%',
    borderTopLeftRadius: 36,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 28,
  },
  title: {
    fontSize: 20,
    letterSpacing: -0.3,
    ...typography.sectionTitle,
    marginBottom: 14,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 17,
    ...typography.body,
  },
});
