import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, Truck, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { ScreenContainer } from '../components/ScreenContainer';
import { DeliveryCard } from '../components/DeliveryCard';
import { BlurView } from 'expo-blur';
import { useFetch } from '../hooks/useFetch';

// --- TS Interface ---
export interface Shipment {
  id: string;
  route: string;
  status: 'In Transit' | 'Pending' | 'Delivered';
  statusColor?: string;
  progress: number;
  currentStepIndex: number;
  eta?: string;
  cargo?: string;
}

const MOCK_SHIPMENTS: Shipment[] = [
  { id: "SJ-2024-8892", route: "Jakarta Terminal -> Surabaya Hub", status: 'In Transit', progress: 0.65, currentStepIndex: 2, eta: "14:30 Today" },
  { id: "SJ-2024-9011", route: "Bandung DC -> Semarang South", status: 'Pending', progress: 0.0, currentStepIndex: 0, cargo: "12 Pallets • 450kg" },
  { id: "SJ-2024-9045", route: "Medan Hub -> Pekanbaru Central", status: 'In Transit', progress: 0.88, currentStepIndex: 3, eta: "18:45 Today" },
  { id: "SJ-2024-9112", route: "Makassar Port -> Manado DC", status: 'Pending', progress: 0.10, currentStepIndex: 0, eta: "Oct 28" },
  { id: "SJ-2024-8741", route: "Palembang Depot -> Lampung Hub", status: 'Delivered', progress: 1.0, currentStepIndex: 4, eta: "Delivered Yesterday" },
];

export default function ShipmentsScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  const { t } = useLanguage();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'In Transit' | 'Pending' | 'Delivered'>('All');

  const { data, loading, refreshing, refetch, error } = useFetch<Shipment[]>('/shipments', MOCK_SHIPMENTS);

  const commonSteps = ['Picked', 'Sorted', 'Transit', 'Dest'];

  const filteredShipments = (data || []).filter(s => {
    const matchesSearch = s.id.toLowerCase().includes(search.toLowerCase()) || 
                         s.route.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  const renderItem = ({ item }: { item: Shipment }) => (
    <DeliveryCard 
      id={item.id}
      route={item.route}
      status={item.status}
      statusColor={item.statusColor}
      progress={item.progress}
      steps={commonSteps}
      currentStepIndex={item.currentStepIndex}
      onPress={() => router.push({ pathname: '/shipment-detail', params: { id: item.id } })}
      footerContent={
        <React.Fragment>
          <Text style={styles.cardFooterLight}>
            {item.status === 'Delivered' ? 'Completed: ' : (item.eta ? `ETA: ` : '')}
            <Text style={styles.cardFooterBold}>{item.eta || item.cargo}</Text>
          </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/shipment-detail', params: { id: item.id } })}>
            <Text style={styles.linkText}>{item.status === 'Delivered' ? 'View Details' : (item.eta ? 'Track' : 'View manifest')}</Text>
          </TouchableOpacity>
        </React.Fragment>
      }
    />
  );

  return (
    <ScreenContainer showBack={true} withScroll={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.monoText}>{t.ops_dashboard}</Text>
          <Text style={styles.heroTextTitle}>{t.active_shipments}</Text>
        </View>

        {/* Search & Filter Bar */}
        <View style={styles.controls}>
           <BlurView intensity={20} tint={Colors.blurTint} style={styles.searchBar}>
              <Search color={Colors.secondary} size={18} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Search SJ ID..."
                placeholderTextColor={Colors.secondary}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><X color={Colors.secondary} size={18} /></TouchableOpacity>}
           </BlurView>
           
           <View style={styles.tabs}>
              {(['All', 'In Transit', 'Pending', 'Delivered'] as const).map((t) => (
                <TouchableOpacity key={t} onPress={() => setFilter(t)} style={[styles.tab, filter === t && styles.tabActive]}>
                  <Text style={[styles.tabText, filter === t && styles.tabTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
           </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
             {[1, 2, 3].map((i) => (
               <View key={i} style={styles.skeletonCard}>
                  <View style={styles.skeletonHeader} />
                  <View style={styles.skeletonBody} />
                  <View style={styles.skeletonFooter} />
               </View>
             ))}
          </View>
        ) : (
          <FlatList
            data={filteredShipments}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primaryContainer} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{error ? `Error: ${error}` : "No shipments found matching filters"}</Text>
              </View>
            }
          />
        )}
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  header: { paddingHorizontal: 24, marginBottom: 12 },
  monoText: { fontSize: 10, color: Colors.secondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  heroTextTitle: { fontSize: 32, fontWeight: '900', color: Colors.onSurface, letterSpacing: -1 },
  controls: { paddingHorizontal: 24, marginBottom: 16, gap: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  searchInput: { flex: 1, marginLeft: 12, color: Colors.onSurface, fontSize: 14 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(79, 70, 51, 0.05)' },
  tabActive: { backgroundColor: Colors.primaryContainer },
  tabText: { fontSize: 11, fontWeight: 'bold', color: Colors.secondary },
  tabTextActive: { color: Colors.onPrimary },
  listContent: { paddingHorizontal: 24, paddingBottom: 120 },
  cardFooterLight: { color: Colors.secondary, fontSize: 11 },
  cardFooterBold: { color: Colors.onSurface, fontWeight: 'bold' },
  linkText: { color: Colors.primaryContainer, fontWeight: 'bold', fontSize: 12 },
  loadingContainer: { flex: 1, paddingHorizontal: 24, gap: 16 },
  skeletonCard: { height: 180, backgroundColor: 'rgba(79, 70, 51, 0.03)', borderRadius: 20, padding: 20, gap: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  skeletonHeader: { height: 20, width: '40%', backgroundColor: 'rgba(79, 70, 51, 0.05)', borderRadius: 4 },
  skeletonBody: { height: 60, width: '100%', backgroundColor: 'rgba(79, 70, 51, 0.05)', borderRadius: 8 },
  skeletonFooter: { height: 15, width: '60%', backgroundColor: 'rgba(79, 70, 51, 0.05)', borderRadius: 4, marginTop: 'auto' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: Colors.secondary, fontSize: 14, textAlign: 'center' },
});
