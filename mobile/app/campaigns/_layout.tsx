import { Stack } from 'expo-router';
import { useThemeColors } from '@/src/store/useThemeStore';
import { stackHeaderTitleStyle } from '@/src/theme/screenHeader';

export default function CampaignsLayout() {
  const c = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: c.headerBg,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: c.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: c.bg },
        animation: 'fade',
        headerTitleStyle: stackHeaderTitleStyle,
      }}
    />
  );
}
