import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { User, Mail, Phone, Building2, Camera, Save, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { ScreenContainer } from '../components/ScreenContainer';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfileScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Alex Sterling',
    email: 'sterling.alex@mshipping.com',
    phone: '+62 812 555 0192',
    company: 'Sterling Group Logistics',
    address: 'Jl. Sudirman Kav 52-53, Jakarta'
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API update
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    
    Alert.alert("Success", "Profile updated successfully.", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  const renderInput = (label: string, value: string, field: string, icon: any, placeholder: string) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon}
        <TextInput 
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.secondary}
          value={value}
          onChangeText={(text) => setFormData({...formData, [field]: text})}
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer showBack={true} title="Edit Profile" showBottomNav={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollWrapper}>
          
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
             <View style={styles.avatarWrapper}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGUKg52UXRDXiRhQTaFi7m-5lc0ifcmxUYFcPGRQhK4NGKXBFrb8ahHPJceQBE_D-by6xTtSz6Dlvyz7Q4ldAECScVUGfBGrDx5Ba2R_jSc95ZGTM0pYrdpQ3RwY2XOnFcvm80ZZML90dncd_tcIztP5UHF8sVAhPu6ubKPbNFciSVZYGhewHsF2JtCTzx9lULCD41Z0zWS_WuHR0AG8jzY0JlSzsMG8WEwEPcdPOFX9Bld6NShPFlIryW3t464ZLEB2jCMsJshs4' }} 
                  style={styles.avatar} 
                />
                <TouchableOpacity style={styles.cameraBtn}>
                   <Camera color={Colors.onPrimary} size={16} />
                </TouchableOpacity>
             </View>
             <Text style={styles.avatarHint}>Tap to change operational photo</Text>
          </View>

          {/* Form Card */}
          <BlurView intensity={24} tint={Colors.blurTint} style={styles.card}>
             {renderInput("FULL NAME", formData.name, "name", <User color={Colors.secondary} size={18} style={styles.inputIcon} />, "Alex Sterling")}
             {renderInput("EMAIL ADDRESS", formData.email, "email", <Mail color={Colors.secondary} size={18} style={styles.inputIcon} />, "email@mshipping.com")}
             {renderInput("PHONE NUMBER", formData.phone, "phone", <Phone color={Colors.secondary} size={18} style={styles.inputIcon} />, "+62...")}
             {renderInput("COMPANY", formData.company, "company", <Building2 color={Colors.secondary} size={18} style={styles.inputIcon} />, "Sterling Group")}
             {renderInput("OPERATIONAL ADDRESS", formData.address, "address", <MapPin color={Colors.secondary} size={18} style={styles.inputIcon} />, "Jl. ...")}

             <TouchableOpacity 
               style={styles.submitBtn} 
               onPress={handleSave}
               disabled={loading}
             >
                <LinearGradient colors={['#ffe2aa', '#fbc02d']} style={styles.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                   {loading ? (
                     <ActivityIndicator color="#000" size="small" />
                   ) : (
                     <React.Fragment>
                        <Save color="#000" size={18} />
                        <Text style={styles.btnText}>SAVE CHANGES</Text>
                     </React.Fragment>
                   )}
                </LinearGradient>
             </TouchableOpacity>
          </BlurView>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  scrollWrapper: { paddingBottom: 40, paddingHorizontal: 24 },
  avatarSection: { alignItems: 'center', marginVertical: 32 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: Colors.cardBorder },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primaryContainer, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.surface },
  avatarHint: { fontSize: 11, color: Colors.secondary, marginTop: 12, fontWeight: '500' },
  card: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '900', color: Colors.secondary, letterSpacing: 1.5, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.blurTint === 'dark' ? 'rgba(53, 53, 53, 0.4)' : 'rgba(79, 70, 51, 0.05)', borderRadius: 14, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: Colors.cardBorder },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: Colors.onSurface, fontSize: 15, fontWeight: '500' },
  submitBtn: { marginTop: 12, borderRadius: 16, overflow: 'hidden' },
  gradientBtn: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  btnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
});
