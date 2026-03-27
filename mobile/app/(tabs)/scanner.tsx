import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useSyncStore } from '@/src/store/useSyncStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors } from '@/src/store/useThemeStore';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import { apiService } from '@/src/api/service';
import { ScanLine, RotateCcw, HelpCircle } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useRouter } from 'expo-router';

const RADIUS = 10;

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const isScanning = useRef(false);
  const { user } = useAuthStore();
  const { addToQueue } = useSyncStore();
  const c = useThemeColors();
  const queryClient = useQueryClient();
  const { showLocalNotification } = useNotifications();
  const { addNotification } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (isScanning.current) return;
    isScanning.current = true;
    setScanned(true);

    const serialNumber = data;
    const userEmail = user?.email || '';

    try {
      // 1. Try to return first (standard workflow for returning items)
      const result = await apiService.returnContainer(serialNumber, userEmail);
      
      // Success Haptic!
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // System Notification
      showLocalNotification(
        'Container Returned! ♻️', 
        `You earned ${result.impact?.points || 10} points and saved ${result.impact?.plasticSaved || 0.05}kg of plastic.`
      );

      // In-app Notification
      addNotification({
        title: 'Container Returned! ♻️',
        message: `Success! +${result.impact?.points || 10} points added to your account for container ${serialNumber}.`,
        type: 'SUCCESS'
      });

      Alert.alert(
        'Container Returned! 🎉',
        `+${result.impact?.points || 10} points earned\n` +
        `Plastic saved: ${result.impact?.plasticSaved || 0.05} kg\n` +
        `CO₂ offset: ${result.impact?.co2Saved || 0.1} kg`,
        [{ 
          text: 'OK', 
          onPress: () => {
            // Optimistically update the store immediately for instant UI feedback
            if (user && result.impact) {
              useAuthStore.getState().updateUser({
                points: user.points + result.impact.points,
                impact: {
                  plasticSaved: user.impact.plasticSaved + result.impact.plasticSaved,
                  co2Saved: user.impact.co2Saved + result.impact.co2Saved,
                }
              });
            }
            queryClient.invalidateQueries({ queryKey: ['user-stats'] });
          } 
        }]
      );
    } catch (error: any) {
      // 2. If return fails, it's likely a new scan or not issued to this user. Try issuing it.
      try {
        await apiService.issueContainer(serialNumber, userEmail);
        
        showLocalNotification(
          'Container Issued ✅', 
          `Container ${serialNumber} has been registered to your account.`
        );

        // In-app Notification
        addNotification({
          title: 'Container Issued ✅',
          message: `Container ${serialNumber} has been successfully registered to you. Make sure to return it to earn points!`,
          type: 'SUCCESS'
        });

        Alert.alert('Container Issued ✅', `Container registered successfully.`);
        queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      } catch (issueError: any) {
        // 3. If both fail, the server might be down. Save to local sync engine.
        addToQueue({
          id: Date.now().toString(),
          serialNumber,
          userEmail: userEmail,
          type: 'ISSUE',
          timestamp: new Date().toISOString(),
        });
        Alert.alert('Saved Offline 📶', 'Scan logged. Will sync when online.');
      }
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg }]}>
        <ScanLine color={c.textMuted} size={48} strokeWidth={1.2} />
        <Text style={[styles.permissionText, { color: c.textSecondary }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg }]}>
        <ScanLine color={c.textMuted} size={48} strokeWidth={1.2} />
        <Text style={[styles.permissionText, { color: c.text }]}>Camera access denied</Text>
        <Text style={[styles.permissionSub, { color: c.textMuted }]}>
          Enable camera in your device settings to scan containers.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ 
          barcodeTypes: ['qr', 'ean13', 'upc_a', 'code128', 'code39'],
        }}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top area */}
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>Scan Container</Text>
          <Text style={styles.topSub}>Point at a ReLoop QR code</Text>
          
          <TouchableOpacity 
            style={styles.helpToggle}
            onPress={() => router.push('/guide')}
            activeOpacity={0.7}
          >
             <HelpCircle color="#fff" size={20} strokeWidth={2.5} />
             <Text style={styles.helpToggleText}>How to Return?</Text>
          </TouchableOpacity>
        </View>

        {/* Scanner frame */}
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        {/* Bottom area */}
        <View style={styles.bottomBar}>
          {scanned ? (
            <TouchableOpacity
              onPress={() => {
                isScanning.current = false;
                setScanned(false);
              }}
              style={styles.scanAgainBtn}
              activeOpacity={0.8}
            >
              <RotateCcw color="#fff" size={20} strokeWidth={2} />
              <Text style={styles.scanAgainText}>Scan Again</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.hintText}>
              Scanning will detect QR codes automatically
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  permissionText: { fontSize: 17, fontWeight: '600', marginTop: 16 },
  permissionSub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },

  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  topBar: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    alignItems: 'center',
  },
  topTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  topSub: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 },

  scanFrame: {
    width: 240, height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  topLeft: {
    top: 0, left: 0,
    borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH,
    borderColor: '#10B981', borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0, right: 0,
    borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH,
    borderColor: '#10B981', borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH,
    borderColor: '#10B981', borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH,
    borderColor: '#10B981', borderBottomRightRadius: 8,
  },

  bottomBar: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    alignItems: 'center',
  },
  scanAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: RADIUS,
    gap: 8,
  },
  scanAgainText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hintText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  helpToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  helpToggleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
