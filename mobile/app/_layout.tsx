import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  useFonts,
} from '@expo-google-fonts/geist';
import { ThemeProvider } from '@react-navigation/native';
import { Stack, Redirect, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useSyncEngine } from '@/src/hooks/useSyncEngine';
import { useAppFocusRefresh } from '@/src/hooks/useAppFocusRefresh';
import { useThemeStore, useThemeColors, colors, getNavigationTheme, type ThemeMode } from '@/src/store/useThemeStore';
import { applyAppFonts } from '@/src/theme/applyAppFonts';
import * as NavigationBar from 'expo-navigation-bar';
import { queryClient, clearSessionQueries } from '@/src/lib/queryClient';
import { AppSplashOverlay } from '@/components/AppSplashOverlay';

export { queryClient };

if (Platform.OS === 'android') {
  NavigationBar.setBackgroundColorAsync(colors.dark.tabBg);
  NavigationBar.setButtonStyleAsync('light');
}

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)/welcome',
};

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Expo Go / hot reload may not have a registered splash controller yet */
});

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);
  const [loaded, error] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    ...FontAwesome.font,
    ...FontAwesome5.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded) return;
    applyAppFonts();
    SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
        {!splashDone && (
          <AppSplashOverlay onFinish={() => setSplashDone(true)} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

import { StatusBar, setStatusBarStyle } from 'expo-status-bar';

function getStatusBarStyle(segments: string[], mode: ThemeMode): 'light' | 'dark' {
  const inAuth = segments[0] === '(auth)';
  if (inAuth) return 'light';
  return mode === 'dark' ? 'light' : 'dark';
}

function RootLayoutNav() {
  const { user } = useAuthStore();
  const { queueCount } = useSyncEngine();
  useAppFocusRefresh();
  const mode = useThemeStore((s) => s.mode);
  const c = useThemeColors();
  const segments = useSegments();
  const statusBarStyle = getStatusBarStyle(segments, mode);
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const nextId = user?.id ?? null;
    if (prevUserIdRef.current !== nextId) {
      clearSessionQueries();
      prevUserIdRef.current = nextId;
    }
  }, [user?.id]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setBackgroundColorAsync(c.tabBg);
      NavigationBar.setButtonStyleAsync(mode === 'dark' ? 'light' : 'dark');
    }
  }, [mode, c.tabBg]);

  useEffect(() => {
    setStatusBarStyle(statusBarStyle);
  }, [statusBarStyle]);

  const inAuthGroup = segments[0] === '(auth)';

  return (
    <ThemeProvider value={getNavigationTheme(mode)}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/welcome" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={statusBarStyle} />
      {/* Auth redirects */}
      {!user && !inAuthGroup && <Redirect href="/(auth)/welcome" />}
      {user && inAuthGroup && <Redirect href="/(tabs)" />}
    </ThemeProvider>
  );
}
