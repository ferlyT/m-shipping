import { BlurView } from 'expo-blur';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Fingerprint, Lock, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../hooks/useThemeColors';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    router.replace('/dashboard');
  };

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Error', 'Perangkat tidak mendukung biometrik');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Error', 'Tidak ada biometrik yang terdaftar di perangkat');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: language === 'en' ? 'MShipping Secure Login' : 'Login Aman MShipping',
        fallbackLabel: t.login_password || 'Enter Password',
      });

      if (result.success) {
        router.replace('/dashboard');
      }
    } catch {
      Alert.alert('Error', 'Gagal memproses autentikasi biometrik');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar Extras */}
          <View style={styles.topBar}>
            <BlurView intensity={24} tint={Colors.blurTint} style={styles.langToggle}>
              <TouchableOpacity
                style={language === 'en' ? styles.langBtnActive : styles.langBtn}
                onPress={() => setLanguage('en')}
              >
                <Text style={language === 'en' ? styles.langTextActive : styles.langText}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={language === 'id' ? styles.langBtnActive : styles.langBtn}
                onPress={() => setLanguage('id')}
              >
                <Text style={language === 'id' ? styles.langTextActive : styles.langText}>ID</Text>
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* Main Connectivity Visual (Top 40%) */}
          <View style={styles.visualHeader}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-YkLh50AfI1AMPzwwTcXqascJzMSiXdjeM-daXCRTBU1GLJST2XSxXxvJ5dcXJtbFUsQvzCqEvED1_RDK1ZXhm1ecQ4Vz49gsWe5FmG2gF-kwom9eb7ebY34wG_axRXzV9XcRnILL-FM3X6rOrhWH64eQUudkZkd7OYbLQVyJqjVLWf9W8qkezCPdWmONQg7W4e_5IwzyRycOsOYen5drVNBxUM8EMVchDYqy7pSj0V-33YRRWpwyhehJ661C5foSJElbo5gIK2Y' }}
              style={styles.headerImage}
            />
            <View style={styles.brandOverlay}>
              <Text style={styles.brandTitle}>MShipping</Text>
              <Text style={styles.brandSubtitle}>{t.brand_subtitle}</Text>
            </View>
          </View>

          {/* Login Canvas */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.access_identity}</Text>
              <View style={styles.inputWrapper}>
                <User color={Colors.outlineVariant} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="User name or Email"
                  placeholderTextColor="rgba(79, 70, 51, 0.5)"
                />
              </View>
              <View style={styles.inputUnderline} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.secure_key}</Text>
              <View style={styles.inputWrapper}>
                <Lock color={Colors.outlineVariant} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor="rgba(79, 70, 51, 0.5)"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <Eye color={Colors.primaryContainer} size={20} />
                  ) : (
                    <EyeOff color={Colors.outlineVariant} size={20} />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.inputUnderline} />
            </View>

            {/* Action Area */}
            <View style={styles.actionArea}>
              <TouchableOpacity onPress={handleLogin} style={styles.loginBtn}>
                <Text style={styles.loginBtnText}>{t.login}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.biometricBtnRow}
                onPress={handleBiometricAuth}
              >
                <Fingerprint color={Colors.primaryContainer} size={32} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  topBar: { position: 'absolute', top: 50, right: 24, zIndex: 70 },
  langToggle: { flexDirection: 'row', alignItems: 'center', padding: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.15)', overflow: 'hidden' },
  langBtnActive: { paddingHorizontal: 16, paddingVertical: 4, backgroundColor: Colors.surfaceContainerHighest, borderRadius: 999 },
  langBtn: { paddingHorizontal: 16, paddingVertical: 4 },
  langTextActive: { color: Colors.primaryContainer, fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5 },
  langText: { color: Colors.outline, fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5 },
  visualHeader: { width: '100%', height: height * 0.4, position: 'relative' },
  headerImage: { ...StyleSheet.absoluteFillObject, opacity: 1.0 },
  brandOverlay: { position: 'absolute', bottom: 32, left: 24 },
  brandTitle: { fontSize: 44, fontWeight: '900', color: Colors.primaryContainer, letterSpacing: -2 },
  brandSubtitle: { fontSize: 12, color: Colors.secondary, textTransform: 'uppercase', letterSpacing: 4, marginTop: 4 },
  formContainer: { flex: 1, paddingHorizontal: 32, paddingTop: 48 },
  inputGroup: { marginBottom: 32 },
  label: { fontSize: 10, fontWeight: 'bold', color: Colors.secondary, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 },
  input: { flex: 1, color: Colors.onSurface, fontSize: 16, fontWeight: '500' },
  inputUnderline: { height: 1, backgroundColor: 'rgba(79, 70, 51, 0.15)', width: '100%' },
  actionArea: { flexDirection: 'row', gap: 16, alignItems: 'center', marginTop: 16 },
  loginBtn: { flex: 1, height: 64, borderRadius: 20, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { color: Colors.onPrimary, fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  biometricBtnRow: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255, 226, 170, 0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 226, 170, 0.3)' },
});
