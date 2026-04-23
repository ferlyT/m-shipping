import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, UserPlus, ChevronRight, Globe, Building2, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../hooks/useThemeColors';
import { ScreenContainer } from '../components/ScreenContainer';
import { BlurView } from 'expo-blur';
import { useFetch } from '../hooks/useFetch';

// --- TS Interface ---
export interface Customer {
  id: string;
  name: string;
  category: string;
  type: string;
  revenue: string;
  status: 'Active' | 'Inactive';
  image: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'CUST-001', name: 'Global Logistics Corp', category: 'Major Account', type: 'Broker', revenue: '4.2B', status: 'Active', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=200&auto=format&fit=crop' },
  { id: 'CUST-002', name: 'Indo Maritime Ltd', category: 'Standard', type: 'Direct', revenue: '1.2B', status: 'Active', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop' },
  { id: 'CUST-003', name: 'Pacific Gateway Hub', category: 'Major Account', type: 'Broker', revenue: '8.5B', status: 'Active', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=200&auto=format&fit=crop' },
  { id: 'CUST-004', name: 'Nusantara Freight', category: 'SME', type: 'Direct', revenue: '450M', status: 'Inactive', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=200&auto=format&fit=crop' },
  { id: 'CUST-005', name: 'Summit Supply Chain', category: 'Major Account', type: 'Agent', revenue: '2.1B', status: 'Active', image: 'https://images.unsplash.com/photo-1454165833767-02a698a487ed?q=80&w=200&auto=format&fit=crop' },
];

export default function CustomersScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // API READY: Fetching data via standardized hook
  const { data, loading, refreshing, refetch, error } = useFetch<Customer[]>('/customers', MOCK_CUSTOMERS);

  const filteredCustomers = (data || []).filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         c.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const HeaderRight = (
    <TouchableOpacity style={styles.iconBtn}>
      <UserPlus color={Colors.primaryContainer} size={22} />
    </TouchableOpacity>
  );

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => router.push({ pathname: '/customer-detail', params: { id: item.id } })}
      style={styles.cardWrapper}
    >
      <BlurView intensity={20} tint={Colors.blurTint} style={styles.customerCard}>
        <Image source={{ uri: item.image }} style={styles.customerAvatar} />
        <View style={styles.customerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.customerName} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.statusDot, { backgroundColor: item.status === 'Active' ? '#00e676' : '#ff5252' }]} />
          </View>
          <Text style={styles.customerIdText}>{item.id} • {item.type}</Text>
          
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Building2 size={10} color={Colors.secondary} />
              <Text style={styles.tagText}>{item.category}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: 'rgba(251, 192, 45, 0.1)' }]}>
              <Text style={[styles.tagText, { color: Colors.primaryContainer }]}>IDR {item.revenue}</Text>
            </View>
          </View>
        </View>
        <ChevronRight color={Colors.outline} size={20} />
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer showBack={true} title="Customers" rightContent={HeaderRight} withScroll={false}>
      <View style={styles.container}>
        {/* Search & Filter Bar */}
        <View style={styles.controls}>
          <BlurView intensity={30} tint={Colors.blurTint} style={styles.searchBar}>
            <Search color={Colors.secondary} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search customers..."
              placeholderTextColor={Colors.secondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><X color={Colors.secondary} size={18} /></TouchableOpacity>}
          </BlurView>
          
          <View style={styles.tabs}>
            {(['All', 'Active', 'Inactive'] as const).map((t) => (
              <TouchableOpacity key={t} onPress={() => setFilter(t)} style={[styles.tab, filter === t && styles.tabActive]}>
                <Text style={[styles.tabText, filter === t && styles.tabTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}><ActivityIndicator color={Colors.primaryContainer} /></View>
        ) : (
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            renderItem={renderCustomerItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primaryContainer} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Globe size={48} color={Colors.outline} />
                <Text style={styles.emptyText}>{error ? `Error: ${error}` : "No customers found matching filters"}</Text>
              </View>
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, marginTop: 12 },
  iconBtn: { padding: 8 },
  controls: { paddingHorizontal: 24, marginBottom: 20, gap: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50, borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  searchInput: { flex: 1, marginLeft: 12, color: Colors.onSurface, fontSize: 14 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(79, 70, 51, 0.05)' },
  tabActive: { backgroundColor: Colors.primaryContainer },
  tabText: { fontSize: 12, fontWeight: 'bold', color: Colors.secondary },
  tabTextActive: { color: Colors.onPrimary },
  listContent: { paddingHorizontal: 24, paddingBottom: 120 },
  cardWrapper: { marginBottom: 12 },
  customerCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.cardBorder },
  customerAvatar: { width: 54, height: 54, borderRadius: 14, backgroundColor: Colors.surfaceContainerHighest },
  customerInfo: { flex: 1, marginLeft: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: Colors.onSurface },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  customerIdText: { fontSize: 11, color: Colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(79, 70, 51, 0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 9, fontWeight: 'bold', color: Colors.secondary, textTransform: 'uppercase' },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 16 },
  emptyText: { color: Colors.secondary, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center' },
});
