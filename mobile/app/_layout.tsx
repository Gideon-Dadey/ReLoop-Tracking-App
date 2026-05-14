import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useSyncEngine } from '@/src/hooks/useSyncEngine';
import { useAppFocusRefresh } from '@/src/hooks/useAppFocusRefresh';
import { useThemeStore, useThemeColors } from '@/src/store/useThemeStore';
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
  NavigationBar.setBackgroundColorAsync('#0A0F1A');
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
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

import { StatusBar } from 'expo-status-bar';

function RootLayoutNav() {
  const { user } = useAuthStore();
  const { queueCount } = useSyncEngine();
  useAppFocusRefresh();
  const mode = useThemeStore((s) => s.mode);
  const c = useThemeColors();
  const segments = useSegments();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(c.tabBg);
      NavigationBar.setButtonStyleAsync(mode === 'dark' ? 'light' : 'dark');
    }
  }, [mode, c.tabBg]);

  const inAuthGroup = segments[0] === '(auth)';

  return (
    <ThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
      {/* Auth redirects */}
      {!user && !inAuthGroup && <Redirect href="/(auth)/login" />}
      {user && inAuthGroup && <Redirect href="/(tabs)" />}
    </ThemeProvider>
  );
}
