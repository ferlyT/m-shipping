import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { ShieldCheck, Key, Eye, EyeOff, Save, Lock, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../hooks/useThemeColors';
import { ScreenContainer } from '../components/ScreenContainer';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChangePasswordScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const handleUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing Info", "Please fill in all security fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Security Requirement", "Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    
    Alert.alert("Success", "Your security credentials have been updated.", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  return (
    <ScreenContainer showBack={true} title="Security Credentials" showBottomNav={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollWrapper}>
          
          {/* Hero Icon */}
          <View style={styles.heroSection}>
             <View style={styles.iconCircle}>
                <ShieldCheck color={Colors.primaryContainer} size={48} />
             </View>
             <Text style={styles.heroTitle}>Update Password</Text>
             <Text style={styles.heroSub}>Ensure your account remains safe for logistics operations.</Text>
          </View>

          {/* Form Card */}
          <BlurView intensity={24} tint={Colors.blurTint} style={styles.card}>
             <View style={styles.inputGroup}>
                <Text style={styles.label}>CURRENT PASSWORD</Text>
                <View style={styles.inputWrapper}>
                   <Lock color={Colors.secondary} size={18} style={styles.inputIcon} />
                   <TextInput 
                      style={styles.input}
                      secureTextEntry={secureCurrent}
                      placeholder="Enter current password"
                      placeholderTextColor={Colors.outline}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                   />
                   <TouchableOpacity onPress={() => setSecureCurrent(!secureCurrent)} style={styles.eyeBtn}>
                      {secureCurrent ? <EyeOff color={Colors.secondary} size={20} /> : <Eye color={Colors.secondary} size={20} />}
                   </TouchableOpacity>
                </View>
             </View>

             <View style={styles.inputGroup}>
                <Text style={styles.label}>NEW PASSWORD</Text>
                <View style={styles.inputWrapper}>
                   <Key color={Colors.secondary} size={18} style={styles.inputIcon} />
                   <TextInput 
                      style={styles.input}
                      secureTextEntry={secureNew}
                      placeholder="Enter new strong password"
                      placeholderTextColor={Colors.outline}
                      value={newPassword}
                      onChangeText={setNewPassword}
                   />
                   <TouchableOpacity onPress={() => setSecureNew(!secureNew)} style={styles.eyeBtn}>
                      {secureNew ? <EyeOff color={Colors.secondary} size={20} /> : <Eye color={Colors.secondary} size={20} />}
                   </TouchableOpacity>
                </View>
             </View>

             <View style={styles.inputGroup}>
                <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
                <View style={styles.inputWrapper}>
                   <Key color={Colors.secondary} size={18} style={styles.inputIcon} />
                   <TextInput 
                      style={styles.input}
                      secureTextEntry={secureConfirm}
                      placeholder="Repeat new password"
                      placeholderTextColor={Colors.outline}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                   />
                   <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eyeBtn}>
                      {secureConfirm ? <EyeOff color={Colors.secondary} size={20} /> : <Eye color={Colors.secondary} size={20} />}
                   </TouchableOpacity>
                </View>
             </View>

             <TouchableOpacity 
               style={styles.submitBtn} 
               onPress={handleUpdate}
               disabled={loading}
             >
                <LinearGradient colors={['#ffe2aa', '#fbc02d']} style={styles.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                   {loading ? (
                     <ActivityIndicator color="#000" size="small" />
                   ) : (
                     <React.Fragment>
                        <Save color="#000" size={18} />
                        <Text style={styles.btnText}>UPDATE CREDENTIALS</Text>
                     </React.Fragment>
                   )}
                </LinearGradient>
             </TouchableOpacity>
          </BlurView>

          {/* Security Tips */}
          <BlurView intensity={10} tint={Colors.blurTint} style={styles.tipsCard}>
             <View style={styles.tipsHeader}>
                <AlertCircle color="#ffb4ab" size={16} />
                <Text style={styles.tipsTitle}>SECURITY REQUIREMENTS</Text>
             </View>
             <Text style={styles.tipItem}>• Use at least 8 characters</Text>
             <Text style={styles.tipItem}>• Include numbers and special characters</Text>
             <Text style={styles.tipItem}>• Avoid reusing old passwords</Text>
             <Text style={styles.tipItem}>• Keep your corporate credentials private</Text>
          </BlurView>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  scrollWrapper: { paddingBottom: 40 },
  heroSection: { alignItems: 'center', marginVertical: 32, paddingHorizontal: 40 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(251, 192, 45, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(251, 192, 45, 0.2)' },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.onSurface, marginBottom: 8 },
  heroSub: { fontSize: 13, color: Colors.secondary, textAlign: 'center', lineHeight: 20 },
  card: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '900', color: Colors.secondary, letterSpacing: 1.5, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(53, 53, 53, 0.3)', borderRadius: 14, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: Colors.cardBorder },

  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: Colors.onSurface, fontSize: 15 },
  eyeBtn: { padding: 8 },
  submitBtn: { marginTop: 12, borderRadius: 16, overflow: 'hidden' },
  gradientBtn: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  btnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  tipsCard: { marginTop: 24, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(251, 180, 171, 0.1)' },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tipsTitle: { fontSize: 10, fontWeight: '900', color: '#ffb4ab', letterSpacing: 1 },
  tipItem: { fontSize: 12, color: Colors.secondary, marginBottom: 6, opacity: 0.8 },
});
