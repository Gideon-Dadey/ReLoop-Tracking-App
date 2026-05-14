import { Stack } from 'expo-router';
import { useThemeColors } from '@/src/store/useThemeStore';

export default function CampaignsLayout() {
  const c = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.headerBg },
        headerTintColor: c.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: c.bg },
        animation: 'fade',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    />
  );
}
