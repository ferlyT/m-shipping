import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function AppContent() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="customers" />
        <Stack.Screen name="customer-detail" />
        <Stack.Screen name="shipments" />
        <Stack.Screen name="shipment-detail" />
        <Stack.Screen name="invoices" />
        <Stack.Screen name="invoice-detail" />
        <Stack.Screen name="invoice-report" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="change-password" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
