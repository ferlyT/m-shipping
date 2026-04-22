import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import {
  ArrowUpRight,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useLanguage } from '../context/LanguageContext';
import { useFetch } from '../hooks/useFetch';
import { useThemeColors } from '../hooks/useThemeColors';

// --- TS Interfaces ---
interface DashboardData {
  stats: {
    revenue: string;
    activeShipments: number;
    failedShipments: number;
    inProgress: number;
    revenueGrowth: string;
  };
  customerAnalytics: {
    retention: string;
    newCustomers: number;
    tier: string;
  };
  recentCustomers: {
    id: string;
    name: string;
    image?: string;
    revenue: string;
  }[];
  activeShipmentsList: {
    id: string;
    route: string;
    progress: number;
    status: string;
  }[];
}

const MOCK_DASHBOARD: DashboardData = {
  stats: {
    revenue: '124.5M',
    activeShipments: 42,
    failedShipments: 3,
    inProgress: 18,
    revenueGrowth: '+12.5%'
  },
  customerAnalytics: {
    retention: '85%',
    newCustomers: 12,
    tier: 'Platinum'
  },
  recentCustomers: [
    { id: '1', name: 'Global Logistics', revenue: '42.5M', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=100&auto=format&fit=crop' },
    { id: '2', name: 'Indo Maritime', revenue: '12.8M' },
    { id: '3', name: 'Pacific Gateway', revenue: '8.2M', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=100&auto=format&fit=crop' },
  ],
  activeShipmentsList: [
    { id: 'SJ-8892', route: 'JKT -> SUB', progress: 0.65, status: 'In Transit' },
    { id: 'SJ-9011', route: 'BDG -> SRG', progress: 0.15, status: 'Departed' },
  ]
};

export default function DashboardScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  const { t } = useLanguage();

  const { data, loading, refreshing, refetch, error } = useFetch<DashboardData>('/dashboard', MOCK_DASHBOARD);
  const { data: profileData } = useFetch<{ name?: string; avatar?: string }>('/profile', { name: 'User', avatar: '' });

  if (loading && !data) {
    return (
      <ScreenContainer showBottomNav={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryContainer} />
          <Text style={styles.loadingText}>Loading Operations Hub...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const d = data || MOCK_DASHBOARD;

  return (
    <ScreenContainer showBottomNav={true} withScroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primaryContainer} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Project Vibe</Text>
            <Text style={styles.pTitle}>Operations Hub</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.avatarBtn}>
            {profileData?.avatar && profileData.avatar.startsWith('http') ? (
              <Image source={{ uri: profileData.avatar }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerInitials}>
                <Text style={styles.headerInitialsText}>
                  {(profileData?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Dashboard Card */}
        <BlurView intensity={24} tint={Colors.blurTint} style={[styles.card, styles.heroCard]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.label}>Logistics Performance</Text>
              <Text style={styles.cardTitle}>Active Deliveries</Text>
            </View>
            <TouchableOpacity style={styles.iconBg} onPress={() => router.push('/shipments')}>
              <TrendingUp color={Colors.primaryContainer} size={22} />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsTripleRow}>
            <View style={[styles.metricItem, { backgroundColor: 'rgba(255,255,255,1)' }]}>
              <Text style={[styles.metricLabel, { color: '#000', opacity: 1 }]}>ACTIVE</Text>
              <Text style={[styles.metricValue, { color: '#000' }]}>{d.stats.activeShipments}</Text>
              <View style={[styles.metricIndicator, { backgroundColor: Colors.primaryContainer }]} />
            </View>

            <View style={[styles.metricItem, { backgroundColor: 'rgba(24, 24, 24, 0.4)' }]}>
              <Text style={styles.metricLabel}>IN PROGRESS</Text>
              <Text style={[styles.metricValue, { color: '#7dd3ff' }]}>{d.stats.inProgress}</Text>
              <View style={[styles.metricIndicator, { backgroundColor: '#7dd3ff' }]} />
            </View>


            <View style={[styles.metricItem, { backgroundColor: 'rgba(255, 255, 255, 0.4)' }]}>
              <Text style={[styles.metricLabel, { color: '#ff5252', opacity: 1 }]}>FAILED</Text>
              <Text style={[styles.metricValue, { color: '#ff5252' }]}>{d.stats.failedShipments}</Text>
              <View style={[styles.metricIndicator, { backgroundColor: '#ff5252' }]} />
            </View>

          </View>

          <View style={styles.heroFooter}>
            <View style={styles.segmentedProgress}>
              <View style={[styles.segment, { width: '70%', backgroundColor: Colors.primaryContainer }]} />
              <View style={[styles.segment, { width: '20%', backgroundColor: '#7dd3ff' }]} />
              <View style={[styles.segment, { width: '10%', backgroundColor: '#ff5252' }]} />
            </View>
            <Text style={styles.heroFooterText}>Real-time global tracking synchronization active.</Text>
          </View>
        </BlurView>

        {/* Bento Grid: Financial & Summary */}
        <View style={styles.bentoRow}>
          <BlurView intensity={24} tint={Colors.blurTint} style={[styles.card, styles.bentoCard, { flex: 1 }]}>
            <View style={styles.cardHeader}>
              <DollarSign color={Colors.primaryContainer} size={18} />
              <TouchableOpacity onPress={() => router.push('/invoices')}>
                <ArrowUpRight color={Colors.secondary} size={16} />
              </TouchableOpacity>
            </View>
            <Text style={styles.revenueValue}>IDR {d.stats.revenue}</Text>
            <Text style={styles.tinyLabel}>Total Monthly Revenue</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '78%', backgroundColor: Colors.primaryContainer }]} />
            </View>
          </BlurView>

          <BlurView intensity={24} tint={Colors.blurTint} style={[styles.card, styles.bentoCard, { width: 120 }]}>
            <Text style={[styles.label, { marginBottom: 12 }]}>Growth</Text>
            <Text style={[styles.smallStatValue, { color: '#00e676' }]}>{d.stats.revenueGrowth}</Text>
            <Text style={styles.tinyLabel}>vs Last Month</Text>
          </BlurView>
        </View>

        {/* Customer Analytics Bento */}
        <BlurView intensity={24} tint={Colors.blurTint} style={[styles.card, styles.analyticsCard]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.label}>Customer Lifecycle</Text>
              <Text style={styles.cardTitle}>Client Retention</Text>
            </View>
            <TouchableOpacity style={styles.iconBg} onPress={() => router.push('/customers')}>
              <Users color={Colors.primaryContainer} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{d.customerAnalytics.retention}</Text>
              <Text style={styles.analyticsLabel}>Retention</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>+{d.customerAnalytics.newCustomers}</Text>
              <Text style={styles.analyticsLabel}>New (Q4)</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.analyticsItem}>
              <Text style={[styles.analyticsValue, { color: Colors.primaryContainer }]}>{d.customerAnalytics.tier}</Text>
              <Text style={styles.analyticsLabel}>Primary Tier</Text>
            </View>
          </View>
        </BlurView>

        {/* Recent Customers List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Clients</Text>
          <TouchableOpacity onPress={() => router.push('/customers')}>
            <Text style={styles.viewAllBtn}>View Directory</Text>
          </TouchableOpacity>
        </View>

        <BlurView intensity={24} tint={Colors.blurTint} style={[styles.card, styles.listCard]}>
          <View style={styles.listContainer}>
            {d.recentCustomers.map((cust) => (
              <TouchableOpacity
                key={cust.id}
                style={styles.listItem}
                onPress={() => router.push({ pathname: '/customer-profile', params: { id: cust.id } })}
              >
                <View style={styles.itemLeft}>
                  {cust.image ? (
                    <Image source={{ uri: cust.image }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarInitials}>
                      <Text style={styles.initialsText}>{cust.name[0]}</Text>
                    </View>
                  )}
                  <View>
                    <Text style={styles.itemName}>{cust.name}</Text>
                    <Text style={styles.itemSub}>IDR {cust.revenue} Revenue</Text>
                  </View>
                </View>
                <ChevronRight color={Colors.outline} size={16} />
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer >
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: Colors.secondary, fontSize: 13, fontWeight: '500', letterSpacing: 1 },
  header: { paddingHorizontal: 24, paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { color: Colors.secondary, fontSize: 12, fontWeight: '500', letterSpacing: 1 },
  pTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.onSurface },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: Colors.cardBorder },
  headerAvatar: { width: '100%', height: '100%' },
  headerInitials: { width: '100%', height: '100%', backgroundColor: 'rgba(251, 192, 45, 0.15)', alignItems: 'center', justifyContent: 'center' },
  headerInitialsText: { color: Colors.primaryContainer, fontWeight: '900', fontSize: 18 },
  card: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 16, marginHorizontal: 24 },
  heroCard: { minHeight: 220, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontSize: 9, fontWeight: '900', color: Colors.secondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.onSurface },
  iconBg: { backgroundColor: 'rgba(251, 192, 45, 0.1)', padding: 10, borderRadius: 12 },
  metricsTripleRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 24, gap: 12 },
  metricItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 16 },
  metricLabel: { fontSize: 8, fontWeight: '900', color: '#c8eaff', letterSpacing: 0.5, marginBottom: 8, opacity: 0.8 },
  metricValue: { fontSize: 28, fontWeight: '900', color: '#fff' },
  metricIndicator: { height: 2, width: 20, borderRadius: 1, marginTop: 12 },
  heroFooter: { marginTop: 8 },
  segmentedProgress: { height: 4, flexDirection: 'row', borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(79, 70, 51, 0.1)' },
  segment: { height: '100%' },
  heroFooterText: { fontSize: 10, color: Colors.secondary, marginTop: 12, fontStyle: 'italic' },
  bentoRow: { flexDirection: 'row', gap: 12, marginBottom: 16, marginHorizontal: 24 },
  bentoCard: { marginBottom: 0, marginHorizontal: 0 },
  revenueValue: { fontSize: 24, fontWeight: 'bold', color: Colors.onSurface },
  progressBarBg: { height: 6, backgroundColor: 'rgba(79, 70, 51, 0.1)', borderRadius: 3, marginTop: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  smallStatValue: { fontSize: 18, fontWeight: 'bold', color: Colors.onSurface },
  tinyLabel: { fontSize: 10, color: Colors.secondary, marginTop: 4 },
  analyticsCard: { padding: 20 },
  analyticsGrid: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  analyticsItem: { flex: 1, alignItems: 'center' },
  analyticsValue: { fontSize: 18, fontWeight: 'bold', color: Colors.onSurface },
  analyticsLabel: { fontSize: 8, color: Colors.secondary, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 4 },
  vDivider: { width: 1, height: 30, backgroundColor: 'rgba(79, 70, 51, 0.1)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.onSurface },
  viewAllBtn: { color: Colors.primaryContainer, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  listCard: { paddingBottom: 8 },
  listContainer: { marginTop: 12, gap: 4 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 12 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(251, 192, 45, 0.2)' },
  avatarInitials: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  initialsText: { color: Colors.secondary, fontWeight: 'bold', fontSize: 12 },
  itemName: { color: Colors.onSurface, fontWeight: 'bold', fontSize: 13 },
  itemSub: { color: Colors.secondary, fontSize: 11 },
});
