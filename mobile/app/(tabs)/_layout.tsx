import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/src/store/useThemeStore';
import { useTabBarInsets } from '@/src/hooks/useTabBarInsets';
import { fonts } from '@/src/theme/fonts';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';

const SCAN_CIRCLE_SIZE = 50;
const TAB_ICON_SIZE = 24;

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  focused,
  color,
  activeIcon,
  inactiveIcon,
}: {
  focused: boolean;
  color: string;
  activeIcon: IoniconName;
  inactiveIcon: IoniconName;
}) {
  return (
    <Ionicons
      name={focused ? activeIcon : inactiveIcon}
      size={TAB_ICON_SIZE}
      color={color}
    />
  );
}

const CustomScanButton = ({ onPress, accessibilityState, style }: BottomTabBarButtonProps) => {
  const c = useThemeColors();
  const isFocused = accessibilityState?.selected;

  return (
    <TouchableOpacity
      style={[style, styles.scanTabItem]}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityLabel="Scan QR"
      accessibilityRole="button"
      accessibilityState={accessibilityState}
    >
      <View style={styles.scanButtonFloating} pointerEvents="none">
        <View style={[styles.scanButton, { backgroundColor: c.accent }]}>
          <Ionicons name="qr-code" size={26} color="#fff" />
        </View>
      </View>
      <View style={styles.iconSlot} />
      <Text style={[TAB_LABEL_STYLE, styles.scanLabel, { color: isFocused ? c.accent : c.textMuted }]}>
        Scan QR
      </Text>
    </TouchableOpacity>
  );
};

const TAB_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: '500' as const,
  fontFamily: fonts.medium,
  marginTop: 2,
};

export default function TabLayout() {
  const c = useThemeColors();
  const { bottomInset, tabBarHeight } = useTabBarInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: TAB_LABEL_STYLE,
        tabBarStyle: {
          backgroundColor: c.tabBg,
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: bottomInset,
          paddingHorizontal: 4,
          elevation: 0,
          overflow: 'visible',
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} activeIcon="home" inactiveIcon="home-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} activeIcon="pulse" inactiveIcon="pulse-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scan QR',
          tabBarShowLabel: false,
          tabBarIcon: () => null,
          tabBarButton: (props) => <CustomScanButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="research"
        options={{
          title: 'Research',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} activeIcon="bar-chart" inactiveIcon="bar-chart-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} activeIcon="map" inactiveIcon="map-outline" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    overflow: 'visible',
  },
  scanButtonFloating: {
    position: 'absolute',
    top: -(SCAN_CIRCLE_SIZE / 2 + 4),
    alignSelf: 'center',
  },
  iconSlot: {
    width: TAB_ICON_SIZE,
    height: TAB_ICON_SIZE,
  },
  scanButton: {
    width: SCAN_CIRCLE_SIZE,
    height: SCAN_CIRCLE_SIZE,
    borderRadius: SCAN_CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  scanLabel: {
    textAlign: 'center',
  },
});
