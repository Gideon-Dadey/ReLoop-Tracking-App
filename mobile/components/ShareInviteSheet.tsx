import React, { useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Animated,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  X,
  Share2,
  Copy,
  Check,
  Leaf,
  Recycle,
  Flame,
  Award,
} from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { typography } from '@/src/theme/fonts';
import { promoGradients } from '@/src/theme/tokens';
import {
  buildReferralUrl,
  buildInviteMessage as buildShareInviteMessage,
} from '@/src/lib/shareLinks';

const RADIUS = 16;

export interface ShareInviteSheetProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  impactScore: number;
  streakCount: number;
  totalReturns: number;
  plasticSaved?: number;
  onShareImpactCard?: () => void;
}

export default function ShareInviteSheet({
  visible,
  onClose,
  userName,
  impactScore,
  streakCount,
  totalReturns,
  plasticSaved = 0,
  onShareImpactCard,
}: ShareInviteSheetProps) {
  const c = useThemeColors();
  const slideAnim = useRef(new Animated.Value(320)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [copied, setCopied] = React.useState(false);

  const referralUrl = buildReferralUrl(userName);
  const inviteMessage = buildShareInviteMessage(
    userName,
    impactScore,
    totalReturns,
    streakCount,
    referralUrl,
  );

  useEffect(() => {
    if (visible) {
      setCopied(false);
      slideAnim.setValue(320);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 220,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const animateClose = useCallback(
    (then?: () => void) => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 320,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) then?.();
      });
    },
    [fadeAnim, slideAnim],
  );

  const handleClose = useCallback(() => {
    animateClose(onClose);
  }, [animateClose, onClose]);

  const handleCopyLink = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(referralUrl);
      setCopied(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Copy failed', 'Could not copy the link. Please try again.');
    }
  }, [referralUrl]);

  const handleNativeShare = useCallback(async () => {
    try {
      // Lead with the URL so WhatsApp / Telegram fetch OG preview (logo + title + image).
      const result = await Share.share(
        Platform.OS === 'ios'
          ? { url: referralUrl, message: inviteMessage }
          : { message: inviteMessage, title: `${userName} invited you to ReLoop` },
      );
      if (result.action === Share.sharedAction && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Sharing is not available on this device.';
      Alert.alert('Share failed', msg);
    }
  }, [inviteMessage, referralUrl, userName]);

  if (!visible) return null;

  return (
    <View style={styles.host} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} accessibilityLabel="Close share" />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: c.surface,
            borderColor: c.surfaceBorder,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: c.surfaceBorder }]} />

        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: c.text }]}>Invite Friends</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={[styles.closeBtn, { backgroundColor: c.inputBg }]}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <X color={c.text} size={20} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sheetSub, { color: c.textMuted }]}>
          Share your referral link and grow the ReLoop community.
        </Text>

        <LinearGradient
          colors={promoGradients.slate}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.previewCard}
        >
          <View style={styles.previewBrand}>
            <Recycle color="#E2E8F0" size={18} />
            <Text style={styles.previewBrandText}>ReLoop</Text>
          </View>
          <Text style={styles.previewHeadline}>@{userName} is reusing for good</Text>
          <View style={styles.previewStats}>
            <View style={styles.previewStat}>
              <Leaf color="#E2E8F0" size={14} />
              <Text style={styles.previewStatVal}>{impactScore}</Text>
              <Text style={styles.previewStatLbl}>score</Text>
            </View>
            <View style={styles.previewStat}>
              <Recycle color="#E2E8F0" size={14} />
              <Text style={styles.previewStatVal}>{totalReturns}</Text>
              <Text style={styles.previewStatLbl}>returns</Text>
            </View>
            <View style={styles.previewStat}>
              <Flame color="#FB923C" size={14} fill="#FB923C" />
              <Text style={styles.previewStatVal}>{streakCount}</Text>
              <Text style={styles.previewStatLbl}>streak</Text>
            </View>
          </View>
          {plasticSaved > 0 ? (
            <Text style={styles.previewFoot}>
              {plasticSaved.toFixed(2)} kg plastic saved · SDG 12
            </Text>
          ) : (
            <Text style={styles.previewFoot}>Supporting SDG 12 · Responsible Consumption</Text>
          )}
        </LinearGradient>

        <View style={[styles.linkBox, { backgroundColor: c.inputBg, borderColor: c.surfaceBorder }]}>
          <Text style={[styles.linkLabel, { color: c.textFaint }]}>YOUR REFERRAL LINK</Text>
          <Text style={[styles.linkText, { color: c.text }]} numberOfLines={2} selectable>
            {referralUrl}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleCopyLink}
          style={[styles.secondaryBtn, { borderColor: c.surfaceBorder, backgroundColor: c.inputBg }]}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Copy referral link"
        >
          {copied ? (
            <Check color={c.accent} size={20} strokeWidth={2.5} />
          ) : (
            <Copy color={c.text} size={20} strokeWidth={2} />
          )}
          <Text style={[styles.secondaryBtnText, { color: copied ? c.accent : c.text }]}>
            {copied ? 'Link copied!' : 'Copy link'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNativeShare}
          style={styles.primaryBtn}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Share with friends"
        >
          <View style={[styles.primaryBtnGradient, { backgroundColor: c.accent }]}>
            <Share2 color={c.onAccent} size={20} strokeWidth={2.2} />
            <Text style={[styles.primaryBtnText, { color: c.onAccent }]}>Share with friends</Text>
          </View>
        </TouchableOpacity>

        {onShareImpactCard ? (
          <TouchableOpacity
            onPress={() => {
              animateClose(() => {
                onClose();
                onShareImpactCard();
              });
            }}
            style={styles.impactCardLink}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Award color={c.accent} size={16} />
            <Text style={[styles.impactCardLinkText, { color: c.accent }]}>
              Create a shareable impact card
            </Text>
          </TouchableOpacity>
        ) : null}

        <Text style={[styles.bonusHint, { color: c.textFaint }]}>
          Links show the ReLoop logo and invite preview in WhatsApp, Telegram, and iMessage.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    paddingTop: 10,
    maxHeight: '88%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 20,
    letterSpacing: -0.3,
    ...typography.title,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSub: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    ...typography.subtitle,
  },
  previewCard: {
    borderRadius: RADIUS,
    padding: 18,
    marginBottom: 16,
  },
  previewBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  previewBrandText: {
    color: '#E2E8F0',
    fontSize: 14,
    letterSpacing: 0.5,
    ...typography.sectionTitle,
  },
  previewHeadline: {
    color: '#FFFFFF',
    fontSize: 17,
    marginBottom: 14,
    ...typography.sectionTitle,
  },
  previewStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  previewStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 4,
  },
  previewStatVal: {
    color: '#fff',
    fontSize: 18,
    ...typography.sectionTitle,
  },
  previewStatLbl: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    ...typography.label,
  },
  previewFoot: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    ...typography.subtitle,
  },
  linkBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  linkLabel: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 6,
    ...typography.label,
  },
  linkText: {
    fontSize: 13,
    lineHeight: 18,
    ...typography.bodyMedium,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: RADIUS,
    borderWidth: 1,
    marginBottom: 10,
  },
  secondaryBtnText: {
    fontSize: 15,
    ...typography.sectionTitle,
  },
  primaryBtn: {
    borderRadius: RADIUS,
    overflow: 'hidden',
    marginBottom: 12,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    ...typography.sectionTitle,
  },
  impactCardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    marginBottom: 4,
  },
  impactCardLinkText: {
    fontSize: 14,
    ...typography.label,
  },
  bonusHint: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    ...typography.subtitle,
  },
});
