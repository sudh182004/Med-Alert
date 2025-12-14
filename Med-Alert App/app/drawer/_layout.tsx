import { Drawer } from 'expo-router/drawer';
import React from 'react';
import 'react-native-reanimated';
import Sidebar from '../../components/Sidebar';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      drawerContent={() => <Sidebar />}
      screenOptions={{
        headerShown: true,
      }}
    />
  );
}
