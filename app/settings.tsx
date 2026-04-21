import { View, Text, StyleSheet, Image, TouchableOpacity, Switch, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { Edit3, Shield, Bell, Settings as SettingsIcon, Key, LogOut, Trash2, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { ScreenContainer } from '../components/ScreenContainer';
import { useTheme } from '../context/ThemeContext';
import { useFetch } from '../hooks/useFetch';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../services/api';
import React, { useState } from 'react';

interface ProfileData {
  name: string;
  email: string;
  avatar: string;
  stats: {
    trustScore: number;
    activeStreak: number;
  };
}

const MOCK_PROFILE: ProfileData = {
  name: 'Loading...',
  email: '...',
  avatar: '',
  stats: { trustScore: 0, activeStreak: 0 }
};

export default function SettingsScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { mode, setMode } = useTheme();

  const { data: profileRaw, loading, refetch } = useFetch<any>('/profile', MOCK_PROFILE);

  // Prevent blank screen by merging raw data with mock as fallback
  // Also force filter out any accidental "Local Mode" string if it persists in cache
  const profile = (profileRaw && !profileRaw.error && profileRaw.name !== 'Ferly (Local Mode)') 
    ? profileRaw 
    : MOCK_PROFILE;

  const [showEditName, setShowEditName] = useState(false);
  const [showEditPass, setShowEditPass] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // Sync with database value when profile loads
  React.useEffect(() => {
    if (profileRaw && typeof profileRaw.isBiometricEnabled !== 'undefined') {
      setIsBiometricEnabled(profileRaw.isBiometricEnabled);
    }
  }, [profileRaw]);

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm identity to enable Biometrics',
      });
      if (result.success) {
        setIsBiometricEnabled(true);
        await apiClient.patch('/profile/biometric', { enabled: true });
      }
    } else {
      setIsBiometricEnabled(false);
      await apiClient.patch('/profile/biometric', { enabled: false });
    }
  };

  const handleLogout = () => {
    router.replace('/');
  };

  const handleEditAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;
        
        const resp = await apiClient.upload('/profile/avatar', selectedUri);
        
        if (!resp.error) {
          Alert.alert('Success', 'Profile photo updated!');
          refetch();
        } else {
          Alert.alert('Error', 'Failed to update avatar: ' + resp.error);
        }
      }
    } catch (error) {
      console.error('Pick Image Error:', error);
      Alert.alert('Error', 'An error occurred while picking the image');
    }
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      Alert.alert('Error', 'Name and Email are required');
      return;
    }
    const resp = await apiClient.patch('/profile/update', { name: newName, email: newEmail });
    if (!resp.error) {
      Alert.alert('Success', 'Profile updated successfully!');
      setShowEditName(false);
      refetch();
    } else {
      Alert.alert('Error', resp.error);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPass.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    const resp = await apiClient.patch('/profile/password', { password: newPass });
    if (!resp.error) {
      Alert.alert('Success', 'Password changed. Remember it for your next login!');
      setShowEditPass(false);
      setNewPass('');
    } else {
      Alert.alert('Error', resp.error);
    }
  };

  return (
    <ScreenContainer showBack={true} title={t.settings}>
        <BlurView intensity={24} tint={Colors.blurTint} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {loading ? (
                 <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
                   <ActivityIndicator color={Colors.primaryContainer} />
                 </View>
              ) : (profile?.avatar && profile.avatar.startsWith('http')) ? (
                <Image 
                  source={{ uri: profile.avatar }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={[styles.avatar, styles.initialsAvatar]}>
                  <Text style={styles.initialsText}>{profile?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEditAvatar}>
                <Edit3 color={Colors.onPrimary} size={14} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.profileHeaderRow}>
              <Text style={styles.profileName}>{profile?.name}</Text>
            </View>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
            <View style={styles.profileActions}>
              <TouchableOpacity style={styles.editProfileBtn} onPress={() => {
                setNewName(profile?.name || '');
                setNewEmail(profile?.email || '');
                setShowEditName(true);
              }}>
                <LinearGradient colors={['#ffe2aa', '#fbc02d']} style={styles.editProfileGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>

        <View style={styles.gridRow}>
          <BlurView intensity={24} tint={Colors.blurTint} style={styles.statsCard}>
            <Text style={styles.sectionLabel}>{t.acc_integrity}</Text>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.stats?.trustScore || 0}<Text style={styles.statUnit}>%</Text></Text>
              <Text style={styles.statLabel}>{t.trust_score}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.stats?.activeStreak || 0}<Text style={styles.statUnit}>d</Text></Text>
              <Text style={styles.statLabel}>{t.active_streak}</Text>
            </View>
          </BlurView>
        </View>

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
              <Switch 
                value={isBiometricEnabled} 
                onValueChange={toggleBiometric}
                trackColor={{ false: '#353535', true: Colors.primaryContainer }} 
                thumbColor={Colors.onPrimary} 
              />
            </View>
            <TouchableOpacity style={styles.passwordBtn} onPress={() => setShowEditPass(true)}>
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

        <Modal visible={showEditName} transparent animationType="fade">
          <View style={styles.modalBg}>
            <BlurView intensity={80} tint="dark" style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Identity</Text>
                <TouchableOpacity onPress={() => setShowEditName(false)}>
                  <X color={Colors.secondary} size={24} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput 
                style={styles.modalInput} 
                value={newName} 
                onChangeText={setNewName} 
                placeholder="Enter new name"
                placeholderTextColor={Colors.secondary}
              />

              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput 
                style={styles.modalInput} 
                value={newEmail} 
                onChangeText={setNewEmail} 
                placeholder="Enter new email"
                placeholderTextColor={Colors.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity onPress={handleUpdateProfile} style={styles.modalBtn}>
                <LinearGradient colors={['#ffe2aa', '#fbc02d']} style={styles.modalBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.modalBtnText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </View>
        </Modal>

        <Modal visible={showEditPass} transparent animationType="fade">
          <View style={styles.modalBg}>
            <BlurView intensity={80} tint="dark" style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Secure Key Access</Text>
                <TouchableOpacity onPress={() => setShowEditPass(false)}>
                  <X color={Colors.secondary} size={24} />
                </TouchableOpacity>
              </View>
              <TextInput 
                style={styles.modalInput} 
                value={newPass} 
                onChangeText={setNewPass} 
                placeholder="Enter new password"
                placeholderTextColor={Colors.secondary}
                secureTextEntry
              />
              <TouchableOpacity onPress={handleUpdatePassword} style={styles.modalBtn}>
                <LinearGradient colors={['#ffe2aa', '#fbc02d']} style={styles.modalBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.modalBtnText}>Secure Update</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </View>
        </Modal>
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  profileCard: { borderRadius: 24, padding: 24, flexDirection: 'row', gap: 20, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 24 },
  avatarContainer: { justifyContent: 'center' },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,226,170,0.2)' },
  initialsAvatar: { backgroundColor: 'rgba(255, 226, 170, 0.1)', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' },
  initialsText: { fontSize: 32, fontWeight: 'bold', color: Colors.primaryContainer },
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

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  modalContent: { width: '100%', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,226,170,0.2)', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  inputLabel: { fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
  modalInput: { height: 56, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 20, color: '#fff', fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalBtn: { borderRadius: 16, overflow: 'hidden' },
  modalBtnGradient: { height: 56, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { color: '#4f3100', fontWeight: 'bold', fontSize: 16 },

});
