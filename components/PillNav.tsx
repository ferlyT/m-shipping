import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LayoutDashboard, Truck, FileText, Settings } from 'lucide-react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useLanguage } from '../context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function PillNav() {
  const Colors = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);

  const navItems = [
    { id: 'home', label: t.hub, icon: LayoutDashboard, path: '/dashboard' },
    { id: 'deliveries', label: t.deliveries, icon: Truck, path: '/shipments' },
    { id: 'invoices', label: t.invoices, icon: FileText, path: '/invoices' },
    { id: 'settings', label: t.settings, icon: Settings, path: '/settings' },
  ];

  return (
    <View style={[styles.pillNav, { bottom: 16 + bottomPadding, backgroundColor: Colors.surface }]}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        
        return (
          <TouchableOpacity 
            key={item.id}
            style={styles.pillBtn} 
            onPress={() => router.replace(item.path as any)}
          >
            <Icon color={isActive ? '#fbc02d' : Colors.secondary} size={20} />
            <Text style={[
              styles.pillText,
              { color: isActive ? '#fbc02d' : 'rgba(187, 200, 208, 0.6)' }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pillNav: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.15)',
    gap: 12,
    zIndex: 50,
  },
  pillBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  pillText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'rgba(187, 200, 208, 0.6)',
    letterSpacing: 1,
  },
});
