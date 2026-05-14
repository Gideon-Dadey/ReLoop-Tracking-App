import { Stack } from 'expo-router';
import { Platform, StatusBar } from 'react-native';
import { useThemeColors } from '@/src/store/useThemeStore';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

export default function CampaignsLayout() {
  const c = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: c.headerBg,
        },
        headerTintColor: c.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: c.bg },
        animation: 'fade',
        statusBarTranslucent: true,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    />
  );
}
