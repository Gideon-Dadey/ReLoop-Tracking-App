import React, { useMemo } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, MapPin, Navigation, QrCode } from 'lucide-react-native';
import { useThemeColors, useThemeStore } from '@/src/store/useThemeStore';
import { apiService, type Vendor } from '@/src/api/service';
import { useCollectionStore } from '@/src/store/useCollectionStore';
import { formatDistanceKm, withDistance } from '@/src/lib/geo';
import { menuWell } from '@/src/theme/chrome';
import { geist } from '@/src/theme/fonts';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';
import CardSurface from '@/components/CardSurface';
import MenuRow from '@/components/MenuRow';
import StatusBadge from '@/components/StatusBadge';
import { Skeleton } from '@/components/Skeleton';

export default function CollectionBaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);
  const router = useRouter();
  const selectedBase = useCollectionStore((s) => s.selectedBase);
  const setSelectedBase = useCollectionStore((s) => s.setSelectedBase);
  const pendingSerial = useCollectionStore((s) => s.pendingSerial);
  const amber = menuWell(mode, 'amber');

  const { data: base, isLoading, isError } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => apiService.getVendor(id!),
    enabled: !!id,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => apiService.getVendors(),
    staleTime: 30_000,
  });

  const sameGroup = useMemo(() => {
    if (!base?.group) return [];
    const others = vendors.filter((v) => v.group === base.group && v._id !== base._id);
    return withDistance(others, base.location?.lat, base.location?.lng).slice(0, 5);
  }, [vendors, base]);

  const isSelected = selectedBase?._id === base?._id;

  const useThisBase = (vendor: Vendor, thenReturn: boolean) => {
    setSelectedBase(vendor);
    if (thenReturn) {
      router.push({ pathname: '/(tabs)/scanner', params: pendingSerial ? { resume: '1' } : {} } as any);
      return;
    }
    Alert.alert('Collection base set', `Returns will be logged at ${vendor.name}.`);
  };

  const openMaps = () => {
    if (!base?.location) return;
    const { lat, lng, address } = base.location;
    const label = encodeURIComponent(base.name);
    const q = encodeURIComponent(address || `${lat},${lng}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${label}`);
  };

  if (isLoading || !base) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <PinnedScreenHeader showBack title="Collection base" />
        <View style={{ padding: 16, gap: 12 }}>
          {isError ? (
            <Text style={[styles.heroBody, { color: c.danger }]}>This collection QR is not on the network.</Text>
          ) : (
            <>
              <Skeleton width="100%" height={140} borderRadius={14} />
              <Skeleton width="100%" height={72} borderRadius={14} />
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <PinnedScreenHeader showBack title={base.name} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <CardSurface padded>
          <Text style={[styles.eyebrow, { color: c.textFaint }]}>COLLECTION BASE</Text>
          <Text style={[styles.heroTitle, { color: c.heading }]}>{base.name}</Text>
          <Text style={[styles.heroBody, { color: c.textMuted }]}>
            {base.location?.address || 'Partner drop-off'}
          </Text>
          {base.hours ? (
            <Text style={[styles.heroBody, { color: c.textMuted, marginTop: 6 }]}>{base.hours}</Text>
          ) : null}
          <View style={styles.chipRow}>
            {isSelected ? <StatusBadge label="Selected" kind="success" /> : null}
            {base.group ? <StatusBadge label={base.group} kind="other" /> : null}
            <StatusBadge label={`${base.settings?.pointsPerReturn ?? 10} pts`} kind="pending" />
          </View>
          {base.acceptedMaterials?.length ? (
            <Text style={[styles.materials, { color: c.textMuted }]}>
              Accepts {base.acceptedMaterials.join(', ')}
            </Text>
          ) : null}
        </CardSurface>

        <View style={styles.actions}>
          <Pressable
            onPress={() => useThisBase(base, true)}
            android_ripple={null}
            style={[styles.primaryBtn, { backgroundColor: c.accent }]}
          >
            <QrCode color={c.onAccent} size={18} />
            <Text style={[styles.primaryLabel, { color: c.onAccent }]}>
              {pendingSerial ? `Return ${pendingSerial} here` : 'Return here'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => useThisBase(base, false)}
            android_ripple={null}
            style={[styles.secondaryBtn, { backgroundColor: c.muted }]}
          >
            <CheckCircle2 color={c.heading} size={18} />
            <Text style={[styles.secondaryLabel, { color: c.heading }]}>
              {isSelected ? 'Using this base' : 'Set as my base'}
            </Text>
          </Pressable>
          <Pressable
            onPress={openMaps}
            android_ripple={null}
            style={[styles.secondaryBtn, { backgroundColor: amber.bg }]}
          >
            <Navigation color={amber.icon} size={18} />
            <Text style={[styles.secondaryLabel, { color: amber.icon }]}>Directions</Text>
          </Pressable>
        </View>

        {sameGroup.length > 0 ? (
          <CardSurface style={{ marginTop: 16 }}>
            {sameGroup.map((item, index) => (
              <MenuRow
                key={item._id}
                icon={MapPin}
                title={item.name}
                subtitle={[
                  item.distanceKm != null ? formatDistanceKm(item.distanceKm) : null,
                  item.location?.address,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                well="sky"
                onPress={() => router.push(`/collection/${item._id}` as any)}
                showDivider={index < sameGroup.length - 1}
              />
            ))}
          </CardSurface>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  eyebrow: { fontSize: 11, letterSpacing: 1.2, marginBottom: 8, ...geist('700') },
  heroTitle: { fontSize: 24, letterSpacing: -0.5, marginBottom: 6, ...geist('700') },
  heroBody: { fontSize: 14, lineHeight: 21, ...geist('400') },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  materials: { fontSize: 13, marginTop: 12, ...geist('500') },
  actions: { marginTop: 16, gap: 10 },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryLabel: { fontSize: 15, ...geist('600') },
  secondaryLabel: { fontSize: 15, ...geist('600') },
  groupLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 4,
    ...geist('700'),
  },
});
