// components/ui/icon-symbol.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

type IconSymbolProps = {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
};

export function IconSymbol({ name, size = 24, color = '#000' }: IconSymbolProps) {
  return (
    <View>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}
