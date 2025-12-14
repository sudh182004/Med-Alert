// ...existing code...
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Sidebar() {
  const router = useRouter();
  const navigation: any = useNavigation();

  const go = (path: '/' | '/reports' | '/sos') => {
    router.push(path);
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  return (
    <DrawerContentScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>MyFirstApp</Text>

        <TouchableOpacity onPress={() => go('/')} style={styles.link}>
          <Text>🏠 Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => go('/reports')} style={styles.link}>
          <Text>📊 Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => go('/sos')} style={styles.link}>
          <Text>🚨 SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('/sos')} style={styles.link}>
          <Text>🚨 SOS</Text>
        </TouchableOpacity>
        
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  link: { paddingVertical: 10 }
});
// ...existing code...