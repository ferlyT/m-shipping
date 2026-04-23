import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, FileText, CheckCircle2, AlertCircle, Clock, Download, X, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../hooks/useThemeColors';
import { ScreenContainer } from '../components/ScreenContainer';
import { BlurView } from 'expo-blur';
import { useFetch } from '../hooks/useFetch';

// --- TS Interface ---
export interface Invoice {
  id: string;
  customer: string;
  amount: string;
  date: string;
  status: 'Cleared' | 'Pending' | 'Overdue';
}

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2024-0401', customer: 'Global Logistics Corp', amount: '12,450,000', date: '21 Oct 2024', status: 'Cleared' },
  { id: 'INV-2024-0402', customer: 'Indo Maritime Ltd', amount: '4,250,500', date: '21 Oct 2024', status: 'Cleared' },
  { id: 'INV-2024-0398', customer: 'Pacific Gateway Hub', amount: '8,900,000', date: '19 Oct 2024', status: 'Pending' },
  { id: 'INV-2024-0395', customer: 'Nusantara Freight', amount: '15,000,000', date: '15 Oct 2024', status: 'Overdue' },
  { id: 'INV-2024-0390', customer: 'Summit Supply Chain', amount: '2,100,000', date: '12 Oct 2024', status: 'Cleared' },
];

export default function InvoicesScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Cleared' | 'Overdue'>('All');

  const { data, loading, refreshing, refetch, error } = useFetch<Invoice[]>('/invoices', MOCK_INVOICES);

  const filteredInvoices = (data || []).filter(inv => {
    const matchesSearch = inv.customer.toLowerCase().includes(search.toLowerCase()) || 
                         inv.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || inv.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Cleared': return <CheckCircle2 color="#00e676" size={16} />;
      case 'Pending': return <Clock color="#fbc02d" size={16} />;
      case 'Overdue': return <AlertCircle color="#ff5252" size={16} />;
      default: return null;
    }
  };

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => router.push({ pathname: '/invoice-detail', params: { id: item.id } })}
      style={styles.cardWrapper}
    >
      <BlurView intensity={20} tint={Colors.blurTint} style={[styles.invoiceCard, item.status === 'Overdue' && styles.borderError]}>
        <View style={styles.cardTop}>
          <View style={styles.invoiceMeta}>
            <View style={[
              styles.iconBg, 
              item.status === 'Cleared' && styles.statusCleared,
              item.status === 'Overdue' && styles.statusOverdue,
              item.status === 'Pending' && styles.statusPending
            ]}>
              <FileText color={item.status === 'Cleared' ? '#00e676' : (item.status === 'Overdue' ? '#ff5252' : '#fbc02d')} size={18} />
            </View>
            <View>
              <Text style={styles.invoiceId}>{item.id}</Text>
              <Text style={styles.customerName}>{item.customer}</Text>
            </View>
          </View>
          <View style={styles.amountBox}>
            <Text style={styles.currency}>IDR</Text>
            <Text style={styles.amountText}>{item.amount}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          <View style={styles.dateInfo}>
            {getStatusIcon(item.status)}
            <View>
              <Text style={styles.dateLabel}>{item.status.toUpperCase()}</Text>
              <Text style={styles.dateValue}>{item.date}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.downloadBtn}>
            <Download color={Colors.primaryContainer} size={14} />
            <Text style={styles.downloadText}>PDF</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer showBack={true} title="Invoices" withScroll={false}>
      <View style={styles.controls}>
        <BlurView intensity={24} tint={Colors.blurTint} style={styles.searchBar}>
          <Search color={Colors.secondary} size={18} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search invoice or client..."
            placeholderTextColor={Colors.secondary}
            value={search}
            onChangeText={setSearch}
          />
           {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><X color={Colors.secondary} size={18} /></TouchableOpacity>}
        </BlurView>
        
        <View style={styles.tabs}>
          {(['All', 'Pending', 'Cleared', 'Overdue'] as const).map((t) => (
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
          data={filteredInvoices}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoiceItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primaryContainer} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <Text style={styles.emptyText}>{error ? `Error: ${error}` : "No invoices found"}</Text>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  controls: { paddingHorizontal: 24, marginBottom: 16, gap: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  searchInput: { flex: 1, marginLeft: 10, color: Colors.onSurface, fontSize: 14 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(79, 70, 51, 0.05)' },
  tabActive: { backgroundColor: Colors.primaryContainer },
  tabText: { fontSize: 11, fontWeight: 'bold', color: Colors.secondary },
  tabTextActive: { color: Colors.onPrimary },
  listContent: { paddingHorizontal: 24, paddingBottom: 120 },
  cardWrapper: { marginBottom: 12 },
  invoiceCard: { padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.cardBorder },
  borderError: { borderColor: 'rgba(239, 68, 68, 0.3)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(79, 70, 51, 0.1)' },
  statusCleared: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  statusOverdue: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  statusPending: { backgroundColor: 'rgba(251, 192, 45, 0.15)' },
  invoiceId: { fontSize: 13, fontWeight: 'bold', color: Colors.onSurface, fontFamily: 'monospace' },
  customerName: { fontSize: 11, color: Colors.secondary, marginTop: 2 },
  amountBox: { alignItems: 'flex-end' },
  currency: { fontSize: 8, fontWeight: 'bold', color: Colors.primaryContainer },
  amountText: { fontSize: 16, fontWeight: '900', color: Colors.onSurface },
  cardDivider: { height: 1, backgroundColor: 'rgba(79, 70, 51, 0.1)', marginVertical: 12 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateLabel: { fontSize: 8, fontWeight: 'bold', color: Colors.secondary, letterSpacing: 1 },
  dateValue: { fontSize: 10, fontWeight: 'bold', color: Colors.onSurface },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: 'rgba(251, 192, 45, 0.05)' },
  downloadText: { fontSize: 9, fontWeight: 'bold', color: Colors.primaryContainer },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: Colors.secondary, fontSize: 14, textAlign: 'center' },
});
