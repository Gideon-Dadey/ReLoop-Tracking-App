import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, Platform, ScrollView } from 'react-native';
import { MapSkeleton } from '@/components/Skeleton';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import {
  MapPin, Navigation, Search, Filter,
  ChevronRight, LocateFixed, Droplet,
  Layers, Package, Shapes, Box, ArrowLeft,
} from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { useTabBarInsets } from '@/src/hooks/useTabBarInsets';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/src/api/service';
import type { Vendor } from '@/src/api/service';

const MATERIAL_FILTERS = [
  { id: 'All', label: 'All', icon: Shapes, color: '#8B5CF6' },
  { id: 'Plastic', label: 'Plastic', icon: Droplet, color: '#10B981' },
  { id: 'Glass', label: 'Glass', icon: Layers, color: '#3B82F6' },
  { id: 'Metal', label: 'Metal', icon: Box, color: '#F59E0B' },
  { id: 'Electronic', label: 'E-Waste', icon: Package, color: '#EF4444' },
];

type NearbyMapScreenProps = {
  showBackButton?: boolean;
  embeddedInTab?: boolean;
};

export default function NearbyMapScreen({
  showBackButton = false,
  embeddedInTab = false,
}: NearbyMapScreenProps) {
  const c = useThemeColors();
  const { width, height } = useWindowDimensions();
  const { tabBarHeight } = useTabBarInsets();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const bottomInset = embeddedInTab ? tabBarHeight : 0;

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => apiService.getVendors(),
  });

  const filteredVendors = useMemo(() => {
    if (activeFilter === 'All') return vendors;
    return vendors.filter((v) =>
      v.acceptedMaterials?.includes(activeFilter),
    );
  }, [vendors, activeFilter]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);

  const centerOnUser = useCallback(() => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [location]);

  const getMarkerColor = useCallback((vendor: Vendor) => {
    if (activeFilter !== 'All') {
      const filter = MATERIAL_FILTERS.find((f) => f.id === activeFilter);
      return filter?.color || c.accent;
    }
    if (vendor.acceptedMaterials?.includes('Glass')) return '#3B82F6';
    if (vendor.acceptedMaterials?.includes('Plastic')) return '#10B981';
    return c.accent;
  }, [activeFilter, c.accent]);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <MapView
        ref={mapRef}
        style={{ width, height }}
        initialRegion={{
          latitude: 5.6037,
          longitude: -0.1870,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        onPress={() => setSelectedVendor(null)}
        customMapStyle={MapStyle}
      >
        {filteredVendors.map((vendor) => (
          vendor.location && (
            <Marker
              key={vendor._id}
              coordinate={{ latitude: vendor.location.lat, longitude: vendor.location.lng }}
              onPress={() => setSelectedVendor(vendor)}
            >
              <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(vendor), borderColor: '#fff' }]}>
                <MapPin color="#fff" size={16} strokeWidth={2.5} />
              </View>
            </Marker>
          )
        ))}
      </MapView>

      <View style={styles.topContainer}>
        <View style={styles.topRow}>
          {showBackButton ? (
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: c.tabBg, borderColor: c.surfaceBorder }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ArrowLeft color={c.text} size={20} />
            </TouchableOpacity>
          ) : null}
          <View style={[styles.searchBar, { backgroundColor: c.tabBg, borderColor: c.surfaceBorder }]}>
            <Search color={c.textMuted} size={18} />
            <Text style={[styles.searchPlaceholder, { color: c.textMuted }]}>Find recycling points...</Text>
            <Filter color={c.textMuted} size={16} />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {MATERIAL_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            const Icon = filter.icon;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? filter.color : c.tabBg,
                    borderColor: isActive ? filter.color : c.surfaceBorder,
                  },
                ]}
              >
                <Icon color={isActive ? '#fff' : c.textMuted} size={14} strokeWidth={2.5} />
                <Text style={[styles.filterLabel, { color: isActive ? '#fff' : c.textSecondary }]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[
          styles.locateButton,
          { backgroundColor: c.tabBg, borderColor: c.surfaceBorder, bottom: 20 + bottomInset },
        ]}
        onPress={centerOnUser}
        accessibilityLabel="Center on my location"
        accessibilityRole="button"
      >
        <LocateFixed color={c.accent} size={24} />
      </TouchableOpacity>

      {selectedVendor && (
        <View
          style={[
            styles.vendorSheet,
            {
              backgroundColor: c.tabBg,
              borderTopColor: c.surfaceBorder,
              paddingBottom: (Platform.OS === 'ios' ? 40 : 24) + bottomInset,
            },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <Text style={[styles.vendorName, { color: c.text }]}>{selectedVendor.name}</Text>
              <View style={styles.badgeRow}>
                {selectedVendor.acceptedMaterials?.map((m) => (
                  <View key={m} style={[styles.materialBadge, { backgroundColor: c.surfaceBorder + '50' }]}>
                    <Text style={[styles.materialBadgeText, { color: c.textSecondary }]}>{m}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.vendorAddress, { color: c.textMuted }]}>{selectedVendor.location.address}</Text>
            </View>
            <TouchableOpacity style={[styles.navBtn, { backgroundColor: c.accent }]}>
              <Navigation color="#fff" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.vendorStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: c.accent }]}>{selectedVendor.settings?.pointsPerReturn || 10}</Text>
              <Text style={[styles.statLabel, { color: c.textFaint }]}>pts/return</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: c.surfaceBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: c.text }]}>Open</Text>
              <Text style={[styles.statLabel, { color: c.textFaint }]}>until 8:00 PM</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.viewDetailsBtn, { backgroundColor: c.surfaceBorder + '44' }]}>
            <Text style={[styles.viewDetailsText, { color: c.textSecondary }]}>View Points Info</Text>
            <ChevronRight color={c.textFaint} size={16} />
          </TouchableOpacity>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <MapSkeleton />
        </View>
      )}
    </View>
  );
}

const MapStyle: any[] = [];

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  markerContainer: {
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterScroll: {
    marginTop: 12,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  locateButton: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  vendorSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  sheetHeaderLeft: {
    flex: 1,
    marginRight: 16,
  },
  vendorName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  materialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  materialBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  vendorAddress: {
    fontSize: 14,
    marginTop: 2,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorStats: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
