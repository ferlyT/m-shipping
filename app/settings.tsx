import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch } from 'react-native';
import { BlurView } from 'expo-blur';
import { Edit3, Shield, Bell, Settings as SettingsIcon, Key, LogOut, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { ScreenContainer } from '../components/ScreenContainer';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { mode, setMode } = useTheme();

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <ScreenContainer showBack={true} title={t.settings}>
        {/* Profile Card (Bento Wide) */}
        <BlurView intensity={24} tint={Colors.blurTint} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGUKg52UXRDXiRhQTaFi7m-5lc0ifcmxUYFcPGRQhK4NGKXBFrb8ahHPJceQBE_D-by6xTtSz6Dlvyz7Q4ldAECScVUGfBGrDx5Ba2R_jSc95ZGTM0pYrdpQ3RwY2XOnFcvm80ZZML90dncd_tcIztP5UHF8sVAhPu6ubKPbNFciSVZYGhewHsF2JtCTzx9lULCD41Z0zWS_WuHR0AG8jzY0JlSzsMG8WEwEPcdPOFX9Bld6NShPFlIryW3t464ZLEB2jCMsJshs4' }} 
                style={styles.avatar} 
              />
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Edit3 color={Colors.onPrimary} size={14} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.profileHeaderRow}>
              <Text style={styles.profileName}>Alexander Sterling</Text>
            </View>
            <Text style={styles.profileEmail}>a.sterling@kinetic-logistics.com</Text>
            <View style={styles.profileActions}>
              <TouchableOpacity style={styles.editProfileBtn} onPress={() => router.push('/edit-profile')}>
                <LinearGradient colors={['#ffe2aa', '#fbc02d']} style={styles.editProfileGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>

        {/* Quick Stats & Account Integrity (Bento Grid) */}
        <View style={styles.gridRow}>
          <BlurView intensity={24} tint={Colors.blurTint} style={styles.statsCard}>
            <Text style={styles.sectionLabel}>{t.acc_integrity}</Text>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>98.2<Text style={styles.statUnit}>%</Text></Text>
              <Text style={styles.statLabel}>{t.trust_score}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>142<Text style={styles.statUnit}>d</Text></Text>
              <Text style={styles.statLabel}>{t.active_streak}</Text>
            </View>
          </BlurView>
        </View>

        {/* Security & Notifications (Bento Grid) */}
        <View style={styles.gridRow}>
          <BlurView intensity={24} tint={Colors.blurTint} style={styles.settingsBox}>
            <View style={styles.boxHeader}>
              <Shield color={Colors.primaryContainer} size={20} />
              <Text style={styles.boxTitle}>{t.acc_security}</Text>
            </View>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingMainText}>{t.biometric_login}</Text>
                <Text style={styles.settingSubText}>Face ID / Fingerprint</Text>
              </View>
              <Switch value={true} trackColor={{ false: '#353535', true: Colors.primaryContainer }} thumbColor={Colors.onPrimary} />
            </View>
            <TouchableOpacity style={styles.passwordBtn} onPress={() => router.push('/change-password')}>
              <Key color={Colors.onSurface} size={16} />
              <Text style={styles.passwordBtnText}>Change Password</Text>
            </TouchableOpacity>
          </BlurView>
        </View>

        <View style={styles.gridRow}>
          <BlurView intensity={24} tint={Colors.blurTint} style={styles.settingsBox}>
            <View style={styles.boxHeader}>
              <Bell color={Colors.primaryContainer} size={20} />
              <Text style={styles.boxTitle}>{t.notifications}</Text>
            </View>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingMainText}>{t.notifications}</Text>
                <Text style={styles.settingSubText}>Real-time logistics alerts</Text>
              </View>
              <Switch value={true} trackColor={{ false: '#353535', true: Colors.primaryContainer }} thumbColor={Colors.onPrimary} />
            </View>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingMainText}>Email Summaries</Text>
                <Text style={styles.settingSubText}>Weekly financial reports</Text>
              </View>
              <Switch value={false} trackColor={{ false: '#353535', true: Colors.primaryContainer }} thumbColor={Colors.onPrimary} />
            </View>
          </BlurView>
        </View>

        {/* System Preferences */}
        <BlurView intensity={24} tint={Colors.blurTint} style={styles.preferencesCard}>
          <View style={styles.boxHeader}>
            <SettingsIcon color={Colors.primaryContainer} size={20} />
            <Text style={styles.boxTitle}>{t.settings}</Text>
          </View>
          
          <View style={styles.prefSection}>
            <Text style={styles.prefLabel}>{t.app_theme}</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity 
                style={mode === 'dark' ? styles.segmentedBtnActive : styles.segmentedBtn}
                onPress={() => setMode('dark')}
              >
                <Text style={mode === 'dark' ? styles.segmentedTextActive : styles.segmentedText}>Dark Mode</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={mode === 'light' ? styles.segmentedBtnActive : styles.segmentedBtn}
                onPress={() => setMode('light')}
              >
                <Text style={mode === 'light' ? styles.segmentedTextActive : styles.segmentedText}>Light Mode</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.prefSection}>
            <Text style={styles.prefLabel}>{t.language}</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity 
                style={language === 'en' ? styles.segmentedBtnActive : styles.segmentedBtn}
                onPress={() => setLanguage('en')}
              >
                <Text style={language === 'en' ? styles.segmentedTextActive : styles.segmentedText}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={language === 'id' ? styles.segmentedBtnActive : styles.segmentedBtn}
                onPress={() => setLanguage('id')}
              >
                <Text style={language === 'id' ? styles.segmentedTextActive : styles.segmentedText}>ID</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>

        {/* Danger Zone & Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut color="#ffb4ab" size={20} />
            <Text style={styles.logoutText}>{t.logout}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.dangerZone}>
          <View>
            <Text style={styles.dangerTitle}>{t.danger_zone}</Text>
            <Text style={styles.dangerSubtitle}>Permanently deactivate account</Text>
          </View>
          <Trash2 color="#ffb4ab" size={20} />
        </TouchableOpacity>
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  profileCard: { borderRadius: 24, padding: 24, flexDirection: 'row', gap: 20, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 24 },
  avatarContainer: { justifyContent: 'center' },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,226,170,0.2)' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primaryContainer, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.surface },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: Colors.onSurface },

  profileEmail: { color: Colors.secondary, fontSize: 12, marginBottom: 12 },
  profileActions: { flexDirection: 'row', gap: 12 },
  editProfileBtn: { borderRadius: 999, overflow: 'hidden' },
  editProfileGradient: { paddingHorizontal: 16, paddingVertical: 6 },
  editProfileText: { color: Colors.onPrimary, fontSize: 10, fontWeight: 'bold' },

  gridRow: { marginBottom: 16 },
  statsCard: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: Colors.cardBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: { position: 'absolute', top: -10, left: 20, backgroundColor: Colors.surface, paddingHorizontal: 8, color: Colors.secondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: Colors.onSurface },
  statUnit: { fontSize: 12, opacity: 0.6 },
  statLabel: { fontSize: 10, color: Colors.secondary, marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: Colors.cardBorder },
  settingsBox: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: Colors.cardBorder },
  boxHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  boxTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.onSurface },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  settingMainText: { fontSize: 14, fontWeight: 'bold', color: Colors.onSurface },
  settingSubText: { fontSize: 10, color: Colors.secondary, marginTop: 2 },
  passwordBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, opacity: 0.8 },
  passwordBtnText: { color: Colors.onSurface, fontSize: 12, fontWeight: '500' },
  preferencesCard: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 24 },
  prefSection: { marginBottom: 24 },
  prefLabel: { fontSize: 12, fontWeight: 'bold', color: Colors.secondary, marginBottom: 12, letterSpacing: 1 },
  segmentedControl: { flexDirection: 'row', backgroundColor: 'rgba(53, 53, 53, 0.4)', borderRadius: 12, padding: 4 },
  segmentedBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentedBtnActive: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: Colors.surfaceContainerHighest, borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.2)' },
  segmentedText: { color: Colors.secondary, fontSize: 12, fontWeight: 'bold' },
  segmentedTextActive: { color: Colors.onSurface, fontSize: 12, fontWeight: 'bold' },
  logoutContainer: { marginBottom: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, borderRadius: 16, backgroundColor: 'rgba(255, 180, 171, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 180, 171, 0.2)' },
  logoutText: { color: '#ffb4ab', fontSize: 16, fontWeight: 'bold' },
  dangerZone: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255, 180, 171, 0.3)' },
  dangerTitle: { color: '#ffb4ab', fontSize: 14, fontWeight: 'bold' },
  dangerSubtitle: { color: 'rgba(255, 180, 171, 0.6)', fontSize: 10, marginTop: 4 },

});
