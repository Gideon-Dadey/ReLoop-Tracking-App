import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { Skeleton, ButtonLoader } from '@/components/Skeleton';
import { Camera, CameraView } from 'expo-camera';
import { useSyncStore } from '@/src/store/useSyncStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors } from '@/src/store/useThemeStore';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import { apiService } from '@/src/api/service';
import { ScanLine, RotateCcw, HelpCircle, CheckCircle2, AlertCircle, Camera as CameraIcon, ArrowRight } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useRouter } from 'expo-router';

const RADIUS = 14;

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const isScanning = useRef(false);
  const cameraRef = useRef<CameraView>(null);
  
  const [step, setStep] = useState<'SCAN' | 'PHOTO' | 'VERIFY'>('SCAN');
  const stepRef = useRef(step);
  const [activeBarcode, setActiveBarcode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { user, updateUser } = useAuthStore();
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

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const handleBarCodeScanned = async ({ data }: { data?: string | null }) => {
    if (isScanning.current) return;
    if (stepRef.current !== 'SCAN') return;

    const code = (data ?? '').toString().trim();
    if (!code) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setActiveBarcode(code);
    setScanned(true);
    isScanning.current = true;
    setStep('PHOTO'); 
  };

  const captureAndVerify = async () => {
    if (!cameraRef.current) return;
    setIsVerifying(true);
    setStep('VERIFY');

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.3, base64: true });
      const verifyResult = await apiService.verifyClean(activeBarcode!, photo!.base64!);
      
      if (!verifyResult.success) {
        throw new Error(verifyResult.message || 'Container verification failed.');
      }

      const userEmail = user?.email || '';
      const result = await apiService.returnContainer(activeBarcode!, userEmail);
      
      // Immediate state synchronization
      if (result.user) {
        updateUser(result.user);
      }
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      showLocalNotification('Verified & Returned! ✨', `Earned ${result.impact?.points || 10} points!`);
      addNotification({
        title: 'Verified & Returned! ✨',
        message: `Success! +${result.impact?.points || 10} points added. AI confirmed it was clean!`,
        type: 'SUCCESS'
      });

      Alert.alert('Success! 🎉', `Container verified as clean.\n+${result.impact?.points || 10} points earned!`);
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      resetScanner();
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert(
        'Verification Failed',
        error.message || 'Something went wrong during AI analysis. Please scan again.'
      );
      // Reset fully so the user can scan the next container immediately.
      resetScanner();
    }
  };

  const resetScanner = () => {
    setScanned(false);
    isScanning.current = false;
    setStep('SCAN');
    setActiveBarcode(null);
    setIsVerifying(false);
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg }]}>
        <View style={{ alignItems: 'center', gap: 16 }}>
          <Skeleton width={64} height={64} borderRadius={32} />
          <Skeleton width={160} height={14} />
          <Skeleton width={120} height={12} />
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg }]}>
        <AlertCircle color="#EF4444" size={48} />
        <Text style={[styles.permissionText, { color: c.text }]}>Camera access denied</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <Text style={{ color: c.accent }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ 
          barcodeTypes: [
            'qr',
            'code128',
            'code39',
            'code93',
            'ean13',
            'ean8',
            'pdf417',
            'upc_e',
            'upc_a',
            'datamatrix',
            'aztec',
            'itf14',
            'codabar',
          ],
        }}
      />

      {/* Verification Overlay */}
      {step !== 'SCAN' && (
        <View style={styles.stepOverlay}>
           {step === 'PHOTO' && (
             <View style={styles.photoContainer}>
                <View style={[styles.instructionBox, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                   <CameraIcon color="#fff" size={32} />
                   <Text style={styles.instructionTitle}>Verify Cleanliness</Text>
                   <Text style={styles.instructionSub}>Please take a clear photo of the INSIDE of the container.</Text>
                </View>

                <TouchableOpacity 
                   style={[styles.captureBtn, { backgroundColor: c.accent }]} 
                   onPress={captureAndVerify}
                >
                   <View style={styles.captureInner} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={resetScanner}>
                   <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
             </View>
           )}

           {step === 'VERIFY' && (
             <View style={styles.verifyingContainer}>
                <View style={styles.blurredBg} />
                <ButtonLoader color="#fff" />
                <Text style={styles.verifyingTitle}>Analyzing Container...</Text>
                <Text style={styles.verifyingSub}>Our AI is checking for residue and moisture.</Text>
             </View>
           )}
        </View>
      )}

      {/* Default Scanner Overlay */}
      {step === 'SCAN' && (
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.topBar}>
            <Text style={styles.topTitle}>Scan Container</Text>
            <Text style={styles.topSub}>Point at a ReLoop QR code</Text>
          </View>

          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <View style={styles.bottomBar}>
             <Text style={styles.hintText}>Scanning will detect QR codes automatically</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  permissionText: { fontSize: 17, fontWeight: '600', marginTop: 16 },
  backBtn: { marginTop: 20, padding: 12 },

  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  topBar: { paddingTop: Platform.OS === 'ios' ? 70 : 50, alignItems: 'center' },
  topTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  topSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },

  scanFrame: { width: 240, height: 240, position: 'relative' },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderColor: '#10B981', borderTopLeftRadius: 10 },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderColor: '#10B981', borderTopRightRadius: 10 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderColor: '#10B981', borderBottomLeftRadius: 10 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderColor: '#10B981', borderBottomRightRadius: 10 },

  bottomBar: { paddingBottom: Platform.OS === 'ios' ? 100 : 80, alignItems: 'center' },
  hintText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },

  // New Verification Styles
  stepOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  photoContainer: { flex: 1, width: '100%', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 80 },
  instructionBox: { padding: 24, borderRadius: RADIUS, width: '85%', alignItems: 'center' },
  instructionTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 12 },
  instructionSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  
  captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.3)' },
  
  cancelBtn: { padding: 16 },
  cancelText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  verifyingContainer: { alignItems: 'center', gap: 20 },
  verifyingTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  verifyingSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' },
  blurredBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
});
