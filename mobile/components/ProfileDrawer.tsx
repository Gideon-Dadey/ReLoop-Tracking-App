import React, { useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  useWindowDimensions,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Settings,
  HelpCircle,
  Heart,
  LogOut,
  Leaf,
  Star,
  Recycle,
  Flame,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors } from '@/src/store/useThemeStore';
import { typography } from '@/src/theme/fonts';
import ShareInviteSheet from '@/components/ShareInviteSheet';
import UserAvatar from '@/components/UserAvatar';
import CardSurface from '@/components/CardSurface';
import MenuRow from '@/components/MenuRow';
import { surfaceRadius } from '@/src/theme/chrome';

const RADIUS = surfaceRadius.sheet;
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
    onClose();
    logout();
  }, [logout, onClose]);

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
                <UserAvatar name={user.userName} uri={user.avatar} size="md" verified={totalReturns > 0} />
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
            <CardSurface style={styles.impactCard}>
              <View style={styles.impactCardHeader}>
                <Leaf color={c.textMuted} size={18} strokeWidth={2.2} />
                <Text style={[styles.impactCardLabel, { color: c.textMuted }]}>YOUR IMPACT</Text>
              </View>
              <Text style={[styles.impactScore, { color: c.heading }]}>{impactScore}</Text>
              <Text style={[styles.impactSub, { color: c.textMuted }]}>Impact score</Text>
              <View style={[styles.impactStats, { borderTopColor: c.surfaceBorder }]}>
                <View style={styles.impactStat}>
                  <Star color="#FBBF24" size={14} fill="#FBBF24" />
                  <Text style={[styles.impactStatVal, { color: c.text }]}>{points}</Text>
                  <Text style={[styles.impactStatLbl, { color: c.textFaint }]}>pts</Text>
                </View>
                <View style={[styles.impactDivider, { backgroundColor: c.surfaceBorder }]} />
                <View style={styles.impactStat}>
                  <Recycle color={c.text} size={14} />
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
            </CardSurface>

            <CardSurface style={styles.actions}>
              <MenuRow
                icon={Settings}
                title="Account Settings"
                subtitle="Manage profile, security & preferences"
                well="slate"
                onPress={() => navigateThenClose('/profile')}
              />
              <MenuRow
                icon={HelpCircle}
                title="Help Center"
                subtitle="Support, guides & FAQs"
                well="sky"
                onPress={() => {
                  closeDrawer();
                  setTimeout(showHelp, 260);
                }}
              />
              <MenuRow
                icon={Heart}
                title="Share ReLoop"
                subtitle="Invite friends to join the movement"
                well="rose"
                onPress={openShareSheet}
                showDivider={false}
              />
            </CardSurface>

            <TouchableOpacity
              onPress={handleSignOut}
              style={styles.signOutRow}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <LogOut color={c.danger} size={20} strokeWidth={2} />
              <Text style={[styles.signOutText, { color: c.danger }]}>Sign out</Text>
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
    marginBottom: 28,
    overflow: 'hidden',
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
