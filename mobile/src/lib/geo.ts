export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km)) return '';
  if (km < 0.1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function withDistance<T extends { location?: { lat: number; lng: number } }>(
  items: T[],
  lat?: number,
  lng?: number,
): (T & { distanceKm?: number })[] {
  if (lat == null || lng == null) return items;
  const mapped: (T & { distanceKm?: number })[] = items.map((item) => {
    if (item.location?.lat == null || item.location?.lng == null) return item;
    return { ...item, distanceKm: haversineKm(lat, lng, item.location.lat, item.location.lng) };
  });
  return mapped.sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));
}
