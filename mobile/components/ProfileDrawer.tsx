import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  useWindowDimensions,
  Image,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Settings,
  HelpCircle,
  Heart,
  ChevronRight,
  LogOut,
  Leaf,
  Star,
  Recycle,
  Flame,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors, brand } from '@/src/store/useThemeStore';
import { typography } from '@/src/theme/fonts';
import ShareInviteSheet from '@/components/ShareInviteSheet';

const RADIUS = 16;
const APP_VERSION = '1.2.0';

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
  impactScore?: number;
  points?: number;
  streakCount?: number;
  totalReturns?: number;
  plasticSaved?: number;
}

interface DrawerActionProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function DrawerAction({ icon: Icon, title, subtitle, onPress }: DrawerActionProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} accessibilityRole="button">
      <LinearGradient
        colors={[brand.tealDeep, '#0A1614']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionCard}
      >
        <View style={styles.actionIconWrap}>
          <Icon size={22} color={brand.tealSoft} strokeWidth={2} />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <ChevronRight size={20} color={brand.tealSoft} strokeWidth={2.5} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function ProfileDrawer({
  visible,
  onClose,
  impactScore = 0,
  points = 0,
  streakCount = 0,
  totalReturns = 0,
  plasticSaved = 0,
}: ProfileDrawerProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [shareSheetVisible, setShareSheetVisible] = React.useState(false);

  const drawerWidth = Math.min(width * 0.88, 360);
  const slideAnim = useRef(new Animated.Value(drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const avatarUrl = useMemo(
    () =>
      user?.avatar ||
      `https://api.dicebear.com/7.x/initials/png?seed=${user?.userName || 'User'}&backgroundColor=14B8A6`,
    [user],
  );

  const animateIn = useCallback(() => {
    slideAnim.setValue(drawerWidth);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerWidth, fadeAnim, slideAnim]);

  const animateOut = useCallback(
    (then?: () => void) => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: drawerWidth,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) then?.();
      });
    },
    [drawerWidth, fadeAnim, slideAnim],
  );

  useEffect(() => {
    if (visible) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      animateIn();
    } else {
      setShareSheetVisible(false);
    }
  }, [visible, animateIn]);

  const closeDrawer = useCallback(() => {
    animateOut(onClose);
  }, [animateOut, onClose]);

  const navigateThenClose = useCallback(
    (href: string) => {
      animateOut(() => {
        onClose();
        router.push(href as any);
      });
    },
    [animateOut, onClose, router],
  );

  const openShareSheet = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShareSheetVisible(true);
  }, []);

  const showHelp = useCallback(() => {
    Alert.alert(
      'Help Center',
      'Need assistance? Our support team is here for you.\n\nEmail: support@reloop.eco\nHours: Mon–Fri, 9am – 5pm',
      [{ text: 'OK' }],
    );
  }, []);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          animateOut(() => {
            onClose();
            logout();
          });
        },
      },
    ]);
  }, [animateOut, logout, onClose]);

  if (!user) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeDrawer}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} accessibilityLabel="Close menu" />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              backgroundColor: c.surface,
              paddingTop: insets.top + 12,
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            <View style={styles.headerRow}>
              <View style={styles.profileRow}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                <View style={styles.profileText}>
                  <Text style={[styles.userName, { color: c.text }]} numberOfLines={1}>
                    {user.userName}
                  </Text>
                  <Text style={[styles.userEmail, { color: c.textMuted }]} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={closeDrawer}
                style={[styles.closeBtn, { backgroundColor: c.inputBg }]}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <X color={c.text} size={22} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Impact member card (ReLoop equivalent of QR identity block) */}
            <LinearGradient
              colors={[c.accentSoft, c.surface]}
              style={[styles.impactCard, { borderColor: c.surfaceBorder }]}
            >
              <View style={styles.impactCardHeader}>
                <Leaf color={c.accent} size={18} strokeWidth={2.2} />
                <Text style={[styles.impactCardLabel, { color: c.accent }]}>YOUR IMPACT</Text>
              </View>
              <Text style={[styles.impactScore, { color: c.text }]}>{impactScore}</Text>
              <Text style={[styles.impactSub, { color: c.textMuted }]}>Impact score</Text>
              <View style={[styles.impactStats, { borderTopColor: c.surfaceBorder }]}>
                <View style={styles.impactStat}>
                  <Star color="#FBBF24" size={14} fill="#FBBF24" />
                  <Text style={[styles.impactStatVal, { color: c.text }]}>{points}</Text>
                  <Text style={[styles.impactStatLbl, { color: c.textFaint }]}>pts</Text>
                </View>
                <View style={[styles.impactDivider, { backgroundColor: c.surfaceBorder }]} />
                <View style={styles.impactStat}>
                  <Recycle color={c.accent} size={14} />
                  <Text style={[styles.impactStatVal, { color: c.text }]}>{totalReturns}</Text>
                  <Text style={[styles.impactStatLbl, { color: c.textFaint }]}>returns</Text>
                </View>
                <View style={[styles.impactDivider, { backgroundColor: c.surfaceBorder }]} />
                <View style={styles.impactStat}>
                  <Flame color="#F97316" size={14} fill="#F97316" />
                  <Text style={[styles.impactStatVal, { color: c.text }]}>{streakCount}</Text>
                  <Text style={[styles.impactStatLbl, { color: c.textFaint }]}>streak</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Actions */}
            <View style={styles.actions}>
              <DrawerAction
                icon={Settings}
                title="Account Settings"
                subtitle="Manage profile, security & preferences"
                onPress={() => navigateThenClose('/profile')}
              />
              <DrawerAction
                icon={HelpCircle}
                title="Help Center"
                subtitle="Support, guides & FAQs"
                onPress={() => {
                  closeDrawer();
                  setTimeout(showHelp, 260);
                }}
              />
              <DrawerAction
                icon={Heart}
                title="Share ReLoop"
                subtitle="Invite friends to join the movement"
                onPress={openShareSheet}
              />
            </View>

            <TouchableOpacity
              onPress={handleSignOut}
              style={styles.signOutRow}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <LogOut color={c.accent} size={20} strokeWidth={2} />
              <Text style={[styles.signOutText, { color: c.accent }]}>Sign out</Text>
            </TouchableOpacity>

            <Text style={[styles.version, { color: c.textFaint }]}>Version {APP_VERSION}</Text>
          </ScrollView>

          <ShareInviteSheet
            visible={shareSheetVisible}
            onClose={() => setShareSheetVisible(false)}
            userName={user.userName}
            impactScore={impactScore}
            streakCount={streakCount}
            totalReturns={totalReturns}
            plasticSaved={plasticSaved}
            onShareImpactCard={() => navigateThenClose('/campaigns/share')}
          />
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
    borderTopLeftRadius: RADIUS + 4,
    borderBottomLeftRadius: RADIUS + 4,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  profileText: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    letterSpacing: -0.3,
    ...typography.title,
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
    ...typography.subtitle,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactCard: {
    borderRadius: RADIUS,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
    alignItems: 'center',
  },
  impactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  impactCardLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    ...typography.label,
  },
  impactScore: {
    fontSize: 42,
    letterSpacing: -1,
    ...typography.headline,
  },
  impactSub: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
    ...typography.subtitle,
  },
  impactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 14,
  },
  impactStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  impactStatVal: {
    fontSize: 16,
    ...typography.sectionTitle,
  },
  impactStatLbl: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    ...typography.label,
  },
  impactDivider: {
    width: 1,
    height: 32,
  },
  actions: {
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: RADIUS,
    gap: 14,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 2,
    ...typography.sectionTitle,
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    ...typography.subtitle,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  signOutText: {
    fontSize: 16,
    ...typography.sectionTitle,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
    ...typography.subtitle,
  },
});
