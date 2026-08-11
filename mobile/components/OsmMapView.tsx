import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { Vendor } from '@/src/api/service';

const DEFAULT_LAT = 5.6037;
const DEFAULT_LNG = -0.187;

type OsmMapViewProps = {
  width: number;
  height: number;
  vendors: Vendor[];
  userLat?: number;
  userLng?: number;
  getMarkerColor: (vendor: Vendor) => string;
  onSelectVendor: (vendor: Vendor | null) => void;
  onMapPress?: () => void;
};

function buildMapHtml(
  vendors: Vendor[],
  userLat: number | undefined,
  userLng: number | undefined,
  getMarkerColor: (vendor: Vendor) => string,
): string {
  const centerLat = userLat ?? DEFAULT_LAT;
  const centerLng = userLng ?? DEFAULT_LNG;

  const markers = vendors
    .filter((v) => v.location?.lat != null && v.location?.lng != null)
    .map((v) => ({
      id: v._id,
      lat: v.location!.lat,
      lng: v.location!.lng,
      name: v.name.replace(/'/g, "\\'"),
      color: getMarkerColor(v),
    }));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #e5e7eb; }
    .reloop-pin {
      width: 28px; height: 28px; border-radius: 10px;
      border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,.25);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false }).setView([${centerLat}, ${centerLng}], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    map.on('click', () => {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dismiss' }));
    });

    const markers = ${JSON.stringify(markers)};
    const markerById = {};

    markers.forEach(m => {
      const icon = L.divIcon({
        className: '',
        html: '<div class="reloop-pin" style="background:' + m.color + '"></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'select', id: m.id }));
      });
      markerById[m.id] = marker;
    });

    ${userLat != null && userLng != null ? `
    L.circleMarker([${userLat}, ${userLng}], {
      radius: 8, color: '#000000', fillColor: '#000000', fillOpacity: 0.9, weight: 2
    }).addTo(map);
    ` : ''}

    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      ${userLat != null && userLng != null ? `bounds.extend([${userLat}, ${userLng}]);` : ''}
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
    }

    window.centerOnUser = function(lat, lng) {
      map.flyTo([lat, lng], 15, { duration: 1 });
    };

    window.flyToVendor = function(id) {
      const m = markers.find(x => x.id === id);
      if (m) map.flyTo([m.lat, m.lng], 16, { duration: 0.8 });
    };
  </script>
</body>
</html>`;
}

export type OsmMapViewRef = {
  centerOnUser: (lat: number, lng: number) => void;
};

export const OsmMapView = React.forwardRef<OsmMapViewRef, OsmMapViewProps>(function OsmMapView(
  {
    width,
    height,
    vendors,
    userLat,
    userLng,
    getMarkerColor,
    onSelectVendor,
  },
  ref,
) {
  const webRef = useRef<WebView>(null);

  const html = useMemo(
    () => buildMapHtml(vendors, userLat, userLng, getMarkerColor),
    [vendors, userLat, userLng, getMarkerColor],
  );

  React.useImperativeHandle(ref, () => ({
    centerOnUser: (lat: number, lng: number) => {
      webRef.current?.injectJavaScript(
        `window.centerOnUser(${lat}, ${lng}); true;`,
      );
    },
  }));

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as { type: string; id?: string };
        if (data.type === 'dismiss') {
          onSelectVendor(null);
          return;
        }
        if (data.type === 'select' && data.id) {
          const vendor = vendors.find((v) => v._id === data.id) ?? null;
          onSelectVendor(vendor);
        }
      } catch {
        /* ignore malformed messages */
      }
    },
    [onSelectVendor, vendors],
  );

  return (
    <View style={{ width, height }}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        setSupportMultipleWindows={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: 'transparent' },
});
