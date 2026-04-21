import { usePathname, useRouter } from 'expo-router';
import { LayoutDashboard, Settings, Truck, Users, Wallet } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../hooks/useThemeColors';

export function BottomNav() {
  const Colors = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);

  const navItems = [
    { id: 'home', label: t.hub, icon: LayoutDashboard, path: '/dashboard' },
    { id: 'customers', label: t.customers, icon: Users, path: '/customers' },
    { id: 'deliveries', label: t.deliveries, icon: Truck, path: '/shipments' },
    { id: 'invoices', label: t.invoices, icon: Wallet, path: '/invoices' },
    { id: 'settings', label: t.settings, icon: Settings, path: '/settings' },
  ];

  return (
    <View style={[styles.bottomNav, {
      backgroundColor: Colors.surface,
      paddingBottom: bottomPadding,
      height: 60 + bottomPadding
    }]}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;

        return (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => router.replace(item.path as any)}
          >
            <Icon color={isActive ? '#fbc02d' : Colors.secondary} size={20} />
            <Text style={[
              isActive ? styles.navTextActive : styles.navText,
              { color: isActive ? '#fbc02d' : Colors.secondary }
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(79, 70, 51, 0.15)',
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  navText: {
    fontSize: 8,
    fontWeight: '500',
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
