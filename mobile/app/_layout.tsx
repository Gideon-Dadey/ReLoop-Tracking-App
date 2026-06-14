import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useSyncEngine } from '@/src/hooks/useSyncEngine';
import { useAppFocusRefresh } from '@/src/hooks/useAppFocusRefresh';
import { useThemeStore, useThemeColors, colors, getNavigationTheme, type ThemeMode } from '@/src/store/useThemeStore';
import { applyAppFonts } from '@/src/theme/applyAppFonts';
import * as NavigationBar from 'expo-navigation-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

if (Platform.OS === 'android') {
  NavigationBar.setBackgroundColorAsync(colors.dark.tabBg);
  NavigationBar.setButtonStyleAsync('light');
}

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)/login',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...FontAwesome.font,
    ...FontAwesome5.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      applyAppFonts();
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

import { StatusBar, setStatusBarStyle } from 'expo-status-bar';

function getStatusBarStyle(segments: string[], mode: ThemeMode): 'light' | 'dark' {
  const isHome = segments[0] === '(tabs)' && (!segments[1] || segments[1] === 'index');
  if (isHome) return 'light';
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
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={statusBarStyle} />
      {/* Auth redirects */}
      {!user && !inAuthGroup && <Redirect href="/(auth)/login" />}
      {user && inAuthGroup && <Redirect href="/(tabs)" />}
    </ThemeProvider>
  );
}
