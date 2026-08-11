import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { typography } from '@/src/theme/fonts';
import { bankMenu, menuWell } from '@/src/theme/chrome';
import { menuWells } from '@/src/theme/tokens';

type WellKind = keyof typeof menuWells.light;

type MenuRowProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  well?: WellKind;
  onPress?: () => void;
  right?: React.ReactNode;
  showDivider?: boolean;
};

export default function MenuRow({
  icon: Icon,
  title,
  subtitle,
  well = 'slate',
  onPress,
  right,
  showDivider = true,
}: MenuRowProps) {
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);
  const tone = menuWell(mode, well);

  return (
    <View>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.82}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={title}
      >
        <View style={[styles.well, { backgroundColor: tone.bg }]}>
          <Icon color={tone.icon} size={18} strokeWidth={2} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: c.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ?? <ChevronRight color={c.textMuted} size={18} />}
      </TouchableOpacity>
      {showDivider ? <View style={[styles.divider, { backgroundColor: c.surfaceBorder }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: bankMenu.rowMinHeight,
    paddingVertical: 12,
    paddingHorizontal: bankMenu.rowPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  well: {
    width: bankMenu.wellSize,
    height: bankMenu.wellSize,
    borderRadius: bankMenu.wellSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: bankMenu.labelSize,
    ...typography.sectionTitle,
  },
  subtitle: {
    fontSize: bankMenu.subtitleSize,
    marginTop: 2,
    ...typography.subtitle,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: bankMenu.rowPadding + bankMenu.wellSize + 14,
  },
});
