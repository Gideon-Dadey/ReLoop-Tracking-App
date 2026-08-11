import { Stack } from 'expo-router';
import { useThemeColors } from '@/src/store/useThemeStore';

export default function SurveysLayout() {
  const c = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
