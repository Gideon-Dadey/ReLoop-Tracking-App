import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { MapPin, Navigation } from 'lucide-react-native';
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

export default function CollectionListScreen() {
  const c = useThemeColors();
  const mode = useThemeStore((s) => s.mode);
  const router = useRouter();
  const selectedBase = useCollectionStore((s) => s.selectedBase);
  const pendingSerial = useCollectionStore((s) => s.pendingSerial);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const amber = menuWell(mode, 'amber');

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch {
        /* Map list still works without GPS */
      }
    })();
  }, []);

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => apiService.getVendors(),
    staleTime: 30_000,
  });

  const ranked = useMemo(
    () => withDistance(vendors, coords?.lat, coords?.lng),
    [vendors, coords],
  );

  const sameGroup = useMemo(() => {
    if (!selectedBase?.group) return [];
    return ranked.filter((v) => v.group === selectedBase.group && v._id !== selectedBase._id);
  }, [ranked, selectedBase]);

  const nearest = ranked.slice(0, 8);

  const openBase = (base: Vendor) => {
    router.push(`/collection/${base._id}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <PinnedScreenHeader showBack title="Collection bases" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <CardSurface padded>
          <Text style={[styles.eyebrow, { color: c.textFaint }]}>RETURN HERE</Text>
          <Text style={[styles.heroTitle, { color: c.heading }]}>
            {pendingSerial ? `Choose a base for ${pendingSerial}` : 'Nearest drop-offs'}
          </Text>
          <Text style={[styles.heroBody, { color: c.textMuted }]}>
            Scan a collection QR or pick a base. Same-group partners appear together.
          </Text>
          {selectedBase ? (
            <View style={styles.chipRow}>
              <StatusBadge label={selectedBase.name} kind="success" />
              {selectedBase.group ? <StatusBadge label={selectedBase.group} kind="other" /> : null}
            </View>
          ) : null}
        </CardSurface>

        {isLoading ? (
          <View style={{ marginTop: 20, gap: 12 }}>
            <Skeleton width="100%" height={72} borderRadius={14} />
            <Skeleton width="100%" height={72} borderRadius={14} />
          </View>
        ) : (
          <>
            <CardSurface style={{ marginTop: 16 }}>
              {nearest.map((base, index) => (
                <MenuRow
                  key={base._id}
                  icon={index === 0 ? Navigation : MapPin}
                  title={base.name}
                  subtitle={[
                    base.distanceKm != null ? formatDistanceKm(base.distanceKm) : null,
                    base.group,
                    base.location?.address,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  well={index === 0 ? 'amber' : 'slate'}
                  onPress={() => openBase(base)}
                  showDivider={index < nearest.length - 1}
                />
              ))}
            </CardSurface>

            {sameGroup.length > 0 ? (
              <CardSurface style={{ marginTop: 16 }}>
                {sameGroup.map((base, index) => (
                  <MenuRow
                    key={base._id}
                    icon={MapPin}
                    title={base.name}
                    subtitle={[
                      base.distanceKm != null ? formatDistanceKm(base.distanceKm) : null,
                      base.location?.address,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    well="sky"
                    onPress={() => openBase(base)}
                    showDivider={index < sameGroup.length - 1}
                  />
                ))}
              </CardSurface>
            ) : null}
          </>
        )}

        <Pressable
          onPress={() => router.push('/(tabs)/map')}
          android_ripple={null}
          style={[styles.mapLink, { backgroundColor: amber.bg }]}
        >
          <MapPin color={amber.icon} size={18} />
          <Text style={[styles.mapLinkText, { color: amber.icon }]}>Open map</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  eyebrow: { fontSize: 11, letterSpacing: 1.2, marginBottom: 8, ...geist('700') },
  heroTitle: { fontSize: 22, letterSpacing: -0.4, marginBottom: 8, ...geist('700') },
  heroBody: { fontSize: 14, lineHeight: 21, ...geist('400') },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  groupLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 4,
    ...geist('700'),
  },
  mapLink: {
    marginTop: 24,
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapLinkText: { fontSize: 15, ...geist('600') },
});
