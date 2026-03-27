import React from 'react';
import { Platform, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, UserCircle, History, Scan, ClipboardList, Gift, Map, Package } from 'lucide-react-native';
import { useThemeColors } from '@/src/store/useThemeStore';

const ExactScanIcon = ({ color, size }: { color: string, size: number }) => {
  const gridPadding = size * 0.28;
  const dotSize = size * 0.16;
  const gap = size * 0.05;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Scan color={color} size={size} strokeWidth={2.5} />
      <View style={{
        position: 'absolute',
        width: size * 0.45,
        height: size * 0.45,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignContent: 'space-between'
      }}>
        <View style={{ width: dotSize, height: dotSize, backgroundColor: color, borderRadius: 1.5 }} />
        <View style={{ width: dotSize, height: dotSize, backgroundColor: color, borderRadius: 1.5 }} />
        <View style={{ width: dotSize, height: dotSize, backgroundColor: color, borderRadius: 1.5 }} />
        <View style={{ width: dotSize, height: dotSize, backgroundColor: color, borderRadius: dotSize / 2 }} />
      </View>
    </View>
  );
};

const CustomScanButton = ({ children, onPress }: { children: any, onPress?: any }) => {
  return (
    <TouchableOpacity
      style={styles.scanButtonContainer}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.scanButton}>
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
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={24} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <ClipboardList color={color} size={24} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <ExactScanIcon color="#fff" size={28} />
          ),
          tabBarButton: (props) => <CustomScanButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Nearby',
          tabBarIcon: ({ color, focused }) => (
            <Map color={color} size={24} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <UserCircle color={color} size={24} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanButtonContainer: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
});
