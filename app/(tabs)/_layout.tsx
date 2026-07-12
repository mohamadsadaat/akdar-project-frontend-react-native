import { Tabs } from 'expo-router';
import React from 'react';
import { BottomTabBar } from '@/src/components/BottomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'المواعيد',
        }}
      />
      <Tabs.Screen
        name="healthRecord"
        options={{
          title: 'السجل',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'التنبيهات',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'الملف',
        }}
      />
    </Tabs>
  );
}
