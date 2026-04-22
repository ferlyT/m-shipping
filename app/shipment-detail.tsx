import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Globe, MapPin, Package, PackageSearch, Truck, Share2 } from 'lucide-react-native';
import React, { useRef } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { ScreenContainer } from '../components/ScreenContainer';
import { useLanguage } from '../context/LanguageContext';
import { useFetch } from '../hooks/useFetch';
import { useThemeColors } from '../hooks/useThemeColors';

// --- TS Interfaces ---
export interface ManifestItem {
  name: string;
  count: number;
}

export interface JourneyStep {
  label: string;
  time: string;
  status: 'past' | 'active' | 'future';
  iconType: 'package' | 'search' | 'truck' | 'pin';
}

export interface ShipmentDetail {
  id: string;
  status: string;
  weight: number;
  palletCount: number;
  temperature: number;
  coordinates: string;
  courier: {
    name: string;
    id: string;
    image: string;
    phone: string;
  };
  route: {
    from: string;
    to: string;
    mapImage: string;
  };
  manifest: ManifestItem[];
  journeySteps: JourneyStep[];
}

const MOCK_SHIPMENT_DETAILS: Record<string, ShipmentDetail> = {
  'SJ-2024-8892': {
    id: 'SJ-2024-8892',
    status: 'IN TRANSIT',
    weight: 450.00,
    palletCount: 12,
    temperature: 4.2,
    coordinates: '6.1751° S, 106.8650° E',
    courier: {
      name: 'Marcus Vane',
      id: 'KNC-DRV-9901',
      image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
      phone: '+628123456789'
    },
    route: {
      from: 'HQ-ALPHA',
      to: 'WAREHOUSE-DELTA',
      mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjNUjZlXaUQFmp_LLMiA7SeRPtGhYnYlWUYyQpQsjHmmqXMbLveVSzR23Tn4NpKkRoxP5621HL5b22zqS1GUKQDCCCCZWmC7d3wHzZyaRoguSrMs0SICmVeoBPZiDEMV_TvzqHQ5ImZmcQ4eJ5hBB1rU4EsLmX4RPz-yplLLHxbI8Uxh0-mf_-QLpIGBE2GSf_8tUUb1X5BjoRrlLk0z4V_k7FGdo_BYQ9gB5PVBLm0tcJs4AABDM7sjjAh48TNuLEPIFYW42oAFc'
    },
    manifest: [
      { name: 'Industrial Compressors', count: 4 },
      { name: 'Coolant Sealed Units', count: 8 },
      { name: 'Hydraulic Fittings', count: 24 }
    ],
    journeySteps: [
      { label: 'Picked', time: '08:45 AM', status: 'past', iconType: 'package' },
      { label: 'Sorted', time: '11:30 AM', status: 'past', iconType: 'search' },
      { label: 'On Road', time: '02:15 PM', status: 'active', iconType: 'truck' },
      { label: 'Delivered', time: 'EST: 05:00 PM', status: 'future', iconType: 'pin' }
    ]
  }
};

export default function SuratJalanScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();

  const targetId = (id as string) || 'SJ-2024-8892';
  const { data: shipment, loading, refreshing, refetch, error } = useFetch<ShipmentDetail>(`/shipments/${targetId}`, MOCK_SHIPMENT_DETAILS['SJ-2024-8892']);
  const viewShotRef = useRef<any>(null);

  if (loading && !shipment) {
    return (
      <ScreenContainer showBack={true} showBottomNav={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryContainer} />
          <Text style={styles.loadingText}>Synchronizing Logistics Data...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!shipment) return null;

  const onShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `Share Shipment ${shipment.id}`,
        UTI: 'public.png',
      });
    } catch (error) {
      console.log('Share Error:', error);
    }
  };

  const HeaderRight = (
    <TouchableOpacity style={styles.iconBtn} onPress={onShare}>
      <Share2 color={Colors.secondary} size={20} />
    </TouchableOpacity>
  );

  const getJourneyIcon = (type: string, color: string) => {
    switch (type) {
      case 'package': return <Package color={color} size={20} />;
      case 'search': return <PackageSearch color={color} size={20} />;
      case 'truck': return <Truck color={color} size={20} />;
      case 'pin': return <MapPin color={color} size={20} />;
      default: return <Package color={color} size={20} />;
    }
  };

  return (
    <ScreenContainer showBack={true} rightContent={HeaderRight} showBottomNav={false} withScroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primaryContainer} />
        }
      >
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={{ backgroundColor: Colors.surface }}>
          <View style={styles.content}>
          {/* Hero Header */}
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroSubtitle}>{t.delivery_order_detail}</Text>
              <Text style={styles.heroTitle}>{shipment.id}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{shipment.status}</Text>
            </View>
          </View>

          {/* Journey Progression */}
          <BlurView intensity={24} tint={Colors.blurTint} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{t.journey_progression}</Text>
              <Text style={styles.cardHeaderLight}>{t.real_time_sync}</Text>
            </View>

            <View style={styles.journeyContainer}>
              <View style={styles.journeyLine} />

              {shipment.journeySteps.map((step, idx) => (
                <View key={idx} style={styles.journeyStep}>
                  <View style={[
                    styles.stepIcon,
                    step.status === 'past' && styles.stepIconPast,
                    step.status === 'active' && styles.stepIconActive,
                    step.status === 'future' && styles.stepIconFuture
                  ]}>
                    {getJourneyIcon(step.iconType, step.status === 'active' ? '#003548' : (step.status === 'past' ? Colors.onPrimary : Colors.onSurfaceVariant))}
                  </View>
                  <View style={styles.stepTextContainerCenter}>
                    <Text style={[styles.stepTextBold, step.status === 'active' && { color: Colors.primaryContainer }]}>{step.label}</Text>
                    <Text style={styles.stepTextLight}>{step.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </BlurView>

          {/* Route Map Placeholder */}
          {/* <View style={styles.mapCard}>
            <Image source={{ uri: shipment.route.mapImage }} style={styles.mapImage} />
            <BlurView intensity={24} tint={Colors.blurTint} style={styles.mapBadge}>
              <Navigation color={Colors.primary} size={16} />
              <Text style={styles.mapBadgeText}>ROUTE: {shipment.route.from} → {shipment.route.to}</Text>
            </BlurView>
          </View> */}

          {/* Courier  */}
          <View style={styles.twoColumnGrid}>
            <BlurView intensity={24} tint={Colors.blurTint} style={[styles.card, styles.splitCard]}>
              <View style={styles.courierRow}>
                {shipment.courier.image ? (
                  <Image source={{ uri: shipment.courier.image }} style={styles.courierImage} />
                ) : (
                  <View style={[styles.courierImage, styles.initialsAvatar]}>
                    <Text style={styles.initialsText}>{shipment.courier.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.courierLabel}>{t.courier_lead}</Text>
                  <Text style={styles.courierName}>{shipment.courier.name}</Text>
                  <Text style={styles.courierId}>ID: {shipment.courier.id}</Text>
                </View>
                {/* <TouchableOpacity style={styles.callBtn}>
                  <Phone color={Colors.primary} size={16} />
                </TouchableOpacity> */}
              </View>
            </BlurView>
          </View>


          {/* Technical Metrics */}
          <BlurView intensity={24} tint={Colors.blurTint} style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.cardHeaderLight}>{t.technical_metrics}</Text>
            <View style={styles.metricsContainer}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>{t.gross_weight}</Text>
                <Text style={[styles.metricValue, { color: Colors.primary }]}>{shipment.weight.toFixed(2)} <Text style={styles.metricUnit}>KG</Text></Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>{t.pallet_count}</Text>
                <Text style={styles.metricValue}>{shipment.palletCount} <Text style={styles.metricUnit}>UNIT</Text></Text>
              </View>
              {/* <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>{t.temperature}</Text>
                    <Text style={[styles.metricValue, {color: '#c8eaff'}]}>{shipment.temperature.toFixed(1)} <Text style={styles.metricUnit}>°C</Text></Text>
                </View> */}
            </View>
            {/* <View style={styles.metricFooter}>
                <Text style={styles.metricFooterLabel}>{t.dest_coordinates}</Text>
                <Text style={styles.metricFooterValue}>{shipment.coordinates}</Text>
              </View> */}
          </BlurView>

          {/* Manifesto */}
          <View style={styles.twoColumnGrid}>

            <BlurView intensity={24} tint={Colors.blurTint} style={[styles.card, styles.splitCard]}>
              <View style={styles.manifestoHeader}>
                <Text style={styles.courierLabel}>{t.cargo_manifest}</Text>
                <Text style={styles.courierId}>{shipment.manifest.length} Items</Text>
              </View>
              <View style={styles.manifestoList}>
                {shipment.manifest.map((item, idx) => (
                  <View key={idx} style={styles.manifestoItem}>
                    <Text style={styles.manifestoItemName}>{item.name}</Text>
                    <Text style={styles.manifestoItemCount}>{item.count.toString().padStart(2, '0')}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>
          <View style={{ height: 100 }} />
          </View>
        </ViewShot>
      </ScrollView>
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: Colors.secondary, fontSize: 13, fontWeight: '500', letterSpacing: 1 },
  content: { padding: 24 },
  iconBtn: { padding: 8 },
  heroHeader: { flexDirection: 'column', gap: 16, marginBottom: 32 },
  heroSubtitle: { color: Colors.secondary, fontSize: 12, letterSpacing: 2, fontWeight: '500' },
  heroTitle: { fontSize: 36, fontWeight: '900', color: Colors.onSurface, letterSpacing: -1 },
  statusBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(125, 211, 255, 0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(125, 211, 255, 0.2)' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#c8eaff' },
  statusText: { color: '#c8eaff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  card: { borderRadius: 16, padding: 24, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden', marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.onSurface, flex: 1 },
  cardHeaderLight: { fontSize: 10, color: Colors.secondary, letterSpacing: 1, fontWeight: 'bold', textAlign: 'right' },
  journeyContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', marginTop: 16 },
  journeyLine: { position: 'absolute', top: 24, left: 20, right: 20, height: 2, backgroundColor: 'rgba(79, 70, 51, 0.2)' },
  journeyStep: { alignItems: 'center', zIndex: 10, flex: 1 },
  stepIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  stepIconPast: { backgroundColor: Colors.primaryContainer },
  stepIconActive: { backgroundColor: '#c8eaff', shadowColor: '#c8eaff', shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  stepIconFuture: { backgroundColor: Colors.surfaceContainerHighest, borderWidth: 1, borderColor: Colors.cardBorder },
  stepTextContainerCenter: { alignItems: 'center', marginTop: 12 },
  stepTextBold: { color: Colors.onSurface, fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  stepTextLight: { color: Colors.secondary, fontSize: 8, marginTop: 4, textAlign: 'center' },
  mapCard: { height: 260, borderRadius: 16, overflow: 'hidden', marginBottom: 24, position: 'relative' },
  mapImage: { width: '100%', height: '100%', opacity: 0.6 },
  mapBadge: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  mapBadgeText: { color: Colors.onSurface, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  metricsContainer: { marginTop: 16, gap: 16 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 12, color: Colors.secondary, fontWeight: 'bold' },
  metricValue: { fontSize: 24, fontWeight: '900', color: Colors.onSurface },
  metricUnit: { fontSize: 12, opacity: 0.5 },
  metricFooter: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(79, 70, 51, 0.1)' },
  metricFooterLabel: { fontSize: 8, color: Colors.secondary, letterSpacing: 1, fontWeight: 'bold' },
  metricFooterValue: { fontSize: 14, color: Colors.onSurface, fontWeight: 'bold', marginTop: 4 },
  twoColumnGrid: { flexDirection: 'column', gap: 16 },
  splitCard: { marginBottom: 0 },
  courierRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  courierImage: { width: 56, height: 56, borderRadius: 16 },
  initialsAvatar: { backgroundColor: 'rgba(251, 192, 45, 0.1)', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.primaryContainer },
  initialsText: { fontSize: 24, fontWeight: 'bold', color: Colors.primaryContainer },
  courierLabel: { fontSize: 8, fontWeight: 'bold', color: Colors.secondary, letterSpacing: 1 },
  courierName: { fontSize: 16, fontWeight: 'bold', color: Colors.onSurface, marginTop: 2 },
  courierId: { fontSize: 10, color: Colors.secondary, marginTop: 2 },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 226, 170, 0.1)', alignItems: 'center', justifyContent: 'center' },
  manifestoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  manifestoList: { gap: 8 },
  manifestoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  manifestoItemName: { fontSize: 12, color: Colors.secondary },
  manifestoItemCount: { fontSize: 12, fontWeight: 'bold', color: Colors.onSurface },
});
