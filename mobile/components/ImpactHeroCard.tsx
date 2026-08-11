import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Flame, Leaf, LucideIcon, Wind } from 'lucide-react-native';
import CardSurface from '@/components/CardSurface';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { badgeTone, homeWells } from '@/src/theme/tokens';
import { geist } from '@/src/theme/fonts';

type ImpactHeroCardProps = {
  score: number;
  plasticKg: string;
  co2Kg: string;
  streakCount: number;
  weeklyCurrent: number;
  weeklyTarget: number;
  weeklyPercent: number;
};

function formatKg(raw: string) {
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return '0';
  if (n >= 10) return n.toFixed(0);
  return n.toFixed(1);
}

function LoopRing({
  percent,
  track,
  from,
  to,
  labelColor,
}: {
  percent: number;
  track: string;
  from: string;
  to: string;
  labelColor: string;
}) {
  const size = 92;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circ * (1 - clamped / 100);

  return (
    <View style={styles.ringWrap} accessibilityRole="progressbar" accessibilityValue={{ now: clamped, min: 0, max: 100 }}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Defs>
          <LinearGradient id="impact-loop" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#impact-loop)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.ringLabel} pointerEvents="none">
        <Text style={[styles.ringValue, { color: labelColor }]}>{Math.round(clamped)}</Text>
        <Text style={[styles.ringUnit, { color: labelColor }]}>%</Text>
      </View>
    </View>
  );
}

function StatCell({
  icon: Icon,
  value,
  label,
  well,
  ink,
  muted,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  well: string;
  ink: string;
  muted: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: well }]}>
        <Icon color={ink} size={14} strokeWidth={2.2} />
      </View>
      <Text style={[styles.statValue, { color: ink }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: muted }]}>{label}</Text>
    </View>
  );
}

export default function ImpactHeroCard({
  score,
  plasticKg,
  co2Kg,
  streakCount,
  weeklyCurrent,
  weeklyTarget,
  weeklyPercent,
}: ImpactHeroCardProps) {
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);
  const plastic = badgeTone[mode].success;
  const carbon = homeWells[mode].activity;
  const streak = badgeTone[mode].pending;
  const loopFrom = mode === 'dark' ? '#4ADE80' : '#059669';
  const loopTo = mode === 'dark' ? '#34D399' : '#10B981';
  const track = mode === 'dark' ? 'rgba(74,222,128,0.16)' : 'rgba(5,150,105,0.14)';
  const streakOn = streakCount > 0;
  const goalMet = weeklyPercent >= 100;

  return (
    <CardSurface padded style={styles.card}>
      <View style={styles.top}>
        <View style={styles.scoreCol}>
          <Text style={[styles.eyebrow, { color: c.textMuted }]}>Your impact</Text>
          <Text
            style={[styles.score, { color: c.heading }]}
            accessibilityLabel={`Impact score ${score}`}
          >
            {score.toLocaleString()}
          </Text>
          <Text style={[styles.caption, { color: c.textMuted }]}>
            Grows with every container you return
          </Text>
        </View>

        <View style={styles.loopCol}>
          <LoopRing
            percent={weeklyPercent}
            track={track}
            from={loopFrom}
            to={loopTo}
            labelColor={plastic.text}
          />
          <Text style={[styles.loopMeta, { color: c.textMuted }]}>
            {goalMet
              ? 'Week complete'
              : `${weeklyCurrent} of ${weeklyTarget} this week`}
          </Text>
        </View>
      </View>

      <View style={[styles.stats, { borderTopColor: c.surfaceBorder }]}>
        <StatCell
          icon={Leaf}
          value={`${formatKg(plasticKg)} kg`}
          label="Plastic saved"
          well={plastic.bg}
          ink={plastic.text}
          muted={c.textMuted}
        />
        <View style={[styles.statRule, { backgroundColor: c.surfaceBorder }]} />
        <StatCell
          icon={Wind}
          value={`${formatKg(co2Kg)} kg`}
          label="CO₂ avoided"
          well={carbon.bg}
          ink={carbon.icon}
          muted={c.textMuted}
        />
        <View style={[styles.statRule, { backgroundColor: c.surfaceBorder }]} />
        <StatCell
          icon={Flame}
          value={streakOn ? `${streakCount}d` : '—'}
          label={streakOn ? 'Streak' : 'Start a streak'}
          well={streakOn ? streak.bg : c.muted}
          ink={streakOn ? streak.text : c.textMuted}
          muted={c.textMuted}
        />
      </View>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 18,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreCol: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    ...geist('600'),
    fontSize: 12,
    letterSpacing: 0.2,
  },
  score: {
    ...geist('700'),
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1.6,
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  caption: {
    ...geist('400'),
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 180,
  },
  loopCol: {
    alignItems: 'center',
    width: 108,
  },
  ringWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSvg: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  ringLabel: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 1,
  },
  ringValue: {
    ...geist('700'),
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  ringUnit: {
    ...geist('600'),
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 1,
  },
  loopMeta: {
    ...geist('500'),
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    ...geist('700'),
    fontSize: 15,
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    ...geist('500'),
    fontSize: 11,
    textAlign: 'center',
  },
  statRule: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
});
