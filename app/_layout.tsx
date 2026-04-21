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
        <Stack.Screen name="customer-profile" />
        <Stack.Screen name="shipments" />
        <Stack.Screen name="surat-jalan" />
        <Stack.Screen name="invoices" />
        <Stack.Screen name="invoice" />
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
