import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { TopAppBar } from './TopAppBar';
import { BottomNav } from './BottomNav';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
  withScroll?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  showBottomNav?: boolean;
}

export function ScreenContainer({
  children,
  title,
  showBack,
  rightContent,
  withScroll = true,
  onRefresh,
  refreshing = false,
  showBottomNav = true,
}: ScreenContainerProps) {
  const Colors = useThemeColors();
  const insets = useSafeAreaInsets();

  // Dynamic padding based on safe area and header height (approx 60)
  const paddingTop = Math.max(insets.top, 20) + 70;
  const paddingBottom = showBottomNav ? 100 : 40;

  const content = withScroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent, 
        { paddingTop, paddingBottom: paddingBottom + insets.bottom }
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, { paddingTop }]}>{children}</View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.surface }]}>
      <TopAppBar title={title} showBack={showBack} rightContent={rightContent} />
      {content}
      {showBottomNav && <BottomNav />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
});
