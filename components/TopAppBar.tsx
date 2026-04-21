import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
  showLogo?: boolean;
}

export function TopAppBar({ title, showBack, rightContent, showLogo = true }: TopAppBarProps) {
  const Colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.topAppBar, 
      { 
        backgroundColor: Colors.surface,
        paddingTop: Math.max(insets.top, 20),
        height: Math.max(insets.top, 20) + 60,
      }
    ]}>
      <View style={styles.topAppLeft}>
        {showBack && (
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/dashboard');
              }
            }}
          >
            <ArrowLeft color={Colors.onSurface} size={20} />
          </TouchableOpacity>
        )}
        {title && <Text style={[styles.brandTitle, { color: Colors.primaryContainer }]}>{title}</Text>}
        {!title && showLogo && <Text style={[styles.brandTitle, { color: Colors.primaryContainer }]}>MShipping</Text>}
      </View>
      <View style={styles.topAppRight}>
        {rightContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topAppBar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 50,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 70, 51, 0.15)',
  },
  topAppLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -1,
  },
  topAppRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    padding: 8,
    marginLeft: -8,
  },
});
