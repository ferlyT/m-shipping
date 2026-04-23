import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronRight, TrendingUp, Package, Building2, MapPin, Phone, Mail, FileText, Star } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { ScreenContainer } from '../components/ScreenContainer';
import { useFetch } from '../hooks/useFetch';

// --- TS Interfaces ---
export interface CustomerActivity {
  id: string;
  type: 'SHIPMENT' | 'BILLING';
  title: string;
  subtitle: string;
  date: string;
  status: string;
}

export interface CustomerDetail {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  memberSince: string;
  image: string;
  stats: {
    delivered: number;
    credits: string;
    creditLimit: string;
    activeContracts: number;
    reliability: string;
  };
  contact: {
    zone: string;
    phone: string;
    email: string;
    address: string;
  };
  recentActivities: CustomerActivity[];
}

const MOCK_CUSTOMER: CustomerDetail = {
  id: 'CUST-001',
  name: 'Global Logistics Corp',
  status: 'ACTIVE',
  memberSince: 'JAN 2022',
  image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=200&auto=format&fit=crop',
  stats: {
    delivered: 1248,
    credits: '25.4M',
    creditLimit: '100M',
    activeContracts: 4,
    reliability: '99.4%'
  },
  contact: {
    zone: 'NORTH REGION HUB',
    phone: '+62 812 555 0192',
    email: 'ops@global-logistics.com',
    address: 'Jl. Sudirman Kav 52-53, Jakarta'
  },
  recentActivities: [
    { id: '1', type: 'SHIPMENT', title: 'SJ-2024-8892', subtitle: 'JKT -> SUB (In Transit)', date: '2h ago', status: 'ON_TRACK' },
    { id: '2', type: 'BILLING', title: 'INV-2024-0402', subtitle: 'IDR 4.25M Cleared', date: 'Yesterday', status: 'COMPLETED' },
    { id: '3', type: 'SHIPMENT', title: 'SJ-2024-8741', subtitle: 'MDN -> PKU Delivered', date: '3d ago', status: 'DELIVERED' }
  ]
};

export default function CustomerProfileScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();

  const targetId = (id as string) || 'CUST-001';
  const { data: customer, loading, refreshing, refetch } = useFetch<CustomerDetail>(`/customers/${targetId}`, MOCK_CUSTOMER);

  if (loading && !customer) {
    return (
      <ScreenContainer showBack={true} title="Profile">
         <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryContainer} />
            <Text style={styles.loadingText}>Loading Client Profile...</Text>
         </View>
      </ScreenContainer>
    );
  }

  if (!customer) return null;

  const parseCurrency = (val: string) => {
    if (!val) return 0;
    const num = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (val.includes('B')) return num * 1000000000;
    if (val.includes('M')) return num * 1000000;
    return num;
  };

  const creditUsed = parseCurrency(customer.stats.credits);
  const creditLimit = parseCurrency(customer.stats.creditLimit);
  const creditProgress = Math.min((creditUsed / creditLimit) * 100, 100);

  return (
    <ScreenContainer showBack={true} title={customer.name} withScroll={false}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primaryContainer} />
        }
      >
        <View style={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarGrid}>
              {customer.image ? (
                <Image source={{ uri: customer.image }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, styles.initialsAvatar]}>
                  <Text style={styles.initialsText}>{customer.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={[styles.statusPill, customer.status === 'INACTIVE' && styles.statusPillInactive]}>
                <View style={[styles.statusDot, customer.status === 'INACTIVE' && styles.statusDotInactive]} />
                <Text style={[styles.statusText, customer.status === 'INACTIVE' && styles.statusTextInactive]}>{customer.status}</Text>
              </View>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.sinceText}>{t.membership}: {customer.memberSince}</Text>
              <View style={styles.idBadge}><Text style={styles.idText}>{t.customer_id}: {customer.id}</Text></View>
            </View>
          </View>

          {/* Bento Stats Grid */}
          <View style={styles.statsGrid}>
            <BlurView intensity={24} tint={Colors.blurTint} style={[styles.statCard, { flex: 1.2 }]}>
              <Package color={Colors.primaryContainer} size={20} />
              <Text style={styles.statNumber}>{customer.stats.delivered.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{t.shipments_delivered}</Text>
            </BlurView>
            
            <View style={{ flex: 1, gap: 12 }}>
              <BlurView intensity={24} tint={Colors.blurTint} style={styles.statCardSmall}>
                <View style={styles.contractRow}>
                  <Building2 color={Colors.secondary} size={16} />
                  <Text style={styles.smallStatValue}>{customer.stats.activeContracts}</Text>
                </View>
                <Text style={styles.statLabel}>{t.active_contracts}</Text>
              </BlurView>
              <BlurView intensity={24} tint={Colors.blurTint} style={styles.statCardSmall}>
                <View style={styles.contractRow}>
                  <Star color="#fbc02d" size={16} />
                  <Text style={styles.smallStatValue}>{customer.stats.reliability}</Text>
                </View>
                <Text style={styles.statLabel}>{t.reliability}</Text>
              </BlurView>
            </View>
          </View>

          {/* Financial Stewardship Card */}
          <BlurView intensity={24} tint={Colors.blurTint} style={styles.financeCard}>
            <View style={styles.financeHeader}>
              <View>
                <Text style={styles.financeLabel}>{t.available_credits}</Text>
                <Text style={styles.financeValue}>IDR {customer.stats.credits}</Text>
              </View>
              <View style={styles.financeTrend}><TrendingUp color="#00e676" size={16} /></View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${creditProgress}%` }]} /></View>
              <Text style={styles.progressText}>IDR {customer.stats.credits} {t.on_limit} {customer.stats.creditLimit}</Text>
            </View>
          </BlurView>

          {/* Info Rows */}
          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <MapPin color={Colors.primaryContainer} size={18} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t.shipping_zone}</Text>
                <Text style={styles.infoValue}>{customer.contact.zone}</Text>
                <Text style={styles.infoSub}>{customer.contact.address}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Phone color={Colors.primaryContainer} size={18} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>CONTACT HOTLINE</Text>
                <Text style={styles.infoValue}>{customer.contact.phone}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Mail color={Colors.primaryContainer} size={18} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>OPERATIONS EMAIL</Text>
                <Text style={styles.infoValue}>{customer.contact.email}</Text>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{t.recent_activity}</Text>
              <Text style={styles.sectionSubtitle}>{t.activity_subtitle}</Text>
            </View>
          </View>

          <View style={styles.activityList}>
            {customer.recentActivities.map((act) => (
              <TouchableOpacity 
                key={act.id} 
                activeOpacity={0.7}
                onPress={() => {
                  if (act.type === 'SHIPMENT') {
                    router.push({ pathname: '/shipment-detail', params: { id: act.title } });
                  } else if (act.type === 'BILLING') {
                    router.push({ pathname: '/invoice-detail', params: { id: act.title } });
                  }
                }}
              >
                <BlurView intensity={12} tint={Colors.blurTint} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    {act.type === 'SHIPMENT' ? <Package color={Colors.secondary} size={16} /> : <FileText color={Colors.secondary} size={16} />}
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{act.title}</Text>
                    <Text style={styles.activityDesc}>{act.subtitle}</Text>
                  </View>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityDate}>{act.date}</Text>
                    <ChevronRight color={Colors.outline} size={14} />
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: Colors.secondary, fontSize: 13, fontWeight: '500', letterSpacing: 1 },
  content: { padding: 24 },
  profileHeader: { flexDirection: 'row', gap: 24, paddingHorizontal: 4, marginBottom: 32 },
  avatarGrid: { alignItems: 'center', gap: 12 },
  profileImage: { width: 100, height: 100, borderRadius: 24, borderWidth: 3, borderColor: 'rgba(251, 192, 45, 0.2)' },
  initialsAvatar: { backgroundColor: 'rgba(251, 192, 45, 0.1)', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' },
  initialsText: { fontSize: 36, fontWeight: 'bold', color: Colors.primaryContainer },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusPillInactive: { backgroundColor: 'rgba(255, 180, 171, 0.1)' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00e676' },
  statusDotInactive: { backgroundColor: '#ffb4ab' },
  statusText: { color: '#00e676', fontSize: 10, fontWeight: 'bold' },
  statusTextInactive: { color: '#ffb4ab' },
  headerInfo: { flex: 1, justifyContent: 'center' },
  customerName: { fontSize: 24, fontWeight: 'bold', color: Colors.onSurface, marginBottom: 4 },
  sinceText: { fontSize: 12, color: Colors.secondary, marginBottom: 12 },
  idBadge: { backgroundColor: 'rgba(79, 70, 51, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  idText: { fontSize: 10, color: Colors.secondary, fontWeight: 'bold', fontFamily: 'monospace' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: Colors.cardBorder, justifyContent: 'space-between' },
  statNumber: { fontSize: 32, fontWeight: '900', color: Colors.onSurface, marginTop: 12 },
  statLabel: { fontSize: 10, color: Colors.secondary, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  statCardSmall: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.cardBorder, justifyContent: 'center' },
  contractRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  smallStatValue: { fontSize: 18, fontWeight: 'bold', color: Colors.onSurface },
  financeCard: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 32 },
  financeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  financeLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.secondary, letterSpacing: 1, marginBottom: 4 },
  financeValue: { fontSize: 28, fontWeight: 'bold', color: Colors.onSurface },
  financeTrend: { backgroundColor: 'rgba(0, 230, 118, 0.1)', padding: 8, borderRadius: 12 },
  progressContainer: { gap: 12 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(79, 70, 51, 0.1)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.primaryContainer },
  progressText: { fontSize: 10, color: Colors.secondary, fontWeight: 'bold' },
  infoRows: { gap: 24, marginBottom: 40, paddingHorizontal: 4 },
  infoRow: { flexDirection: 'row', gap: 16 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 8, fontWeight: 'bold', color: Colors.secondary, letterSpacing: 1, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: 'bold', color: Colors.onSurface },
  infoSub: { fontSize: 11, color: Colors.secondary, marginTop: 2 },
  sectionHeader: { marginBottom: 20, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.onSurface },
  sectionSubtitle: { fontSize: 12, color: Colors.secondary, marginTop: 4 },
  activityList: { gap: 10 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  activityIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(79, 70, 51, 0.05)', alignItems: 'center', justifyContent: 'center' },
  activityInfo: { flex: 1, marginLeft: 16 },
  activityTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.onSurface },
  activityDesc: { fontSize: 12, color: Colors.secondary, marginTop: 2 },
  activityMeta: { alignItems: 'flex-end', gap: 4 },
  activityDate: { fontSize: 10, color: Colors.secondary },
});
