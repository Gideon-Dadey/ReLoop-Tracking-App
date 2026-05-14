import React from 'react';
import { Platform, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutGrid, Layers, ScanLine, BarChart3, UserRound } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';

const ScanIcon = ({ color, size }: { color: string; size: number }) => (
  <ScanLine color={color} size={size} strokeWidth={2.5} />
);

const CustomScanButton = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => {
  const c = useThemeColors();
  return (
    <TouchableOpacity
      style={styles.scanButtonContainer}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityLabel="Scan container"
      accessibilityRole="button"
    >
      <View style={[styles.scanButton, { backgroundColor: c.accent }]}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const c = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: c.tabBg,
          borderTopColor: c.tabBorder,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 84 : 72,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 24 : 16,
          paddingHorizontal: 8,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <LayoutGrid color={color} size={22} strokeWidth={focused ? 2.2 : 1.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Layers color={color} size={22} strokeWidth={focused ? 2.2 : 1.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: '',
          tabBarIcon: () => (
            <ScanIcon color="#fff" size={26} />
          ),
          tabBarButton: (props) => <CustomScanButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="research"
        options={{
          title: 'Research',
          tabBarIcon: ({ color, focused }) => (
            <BarChart3 color={color} size={22} strokeWidth={focused ? 2.2 : 1.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <UserRound color={color} size={22} strokeWidth={focused ? 2.2 : 1.4} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
  },
  scanButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
});
