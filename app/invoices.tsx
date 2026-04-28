import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, FileText, CheckCircle2, AlertCircle, Clock, Download, X, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../hooks/useThemeColors';
import { ScreenContainer } from '../components/ScreenContainer';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useFetch } from '../hooks/useFetch';

// --- TS Interface ---
export interface Invoice {
  id: string;
  customer: string;
  amount: string;
  currency: string;
  date: string;
  status: 'Cleared' | 'Pending' | 'Overdue';
}

const formatCurrency = (amount: string) => {
  const val = parseFloat(amount.replace(/,/g, '')) || 0;
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2024-0401', customer: 'Global Logistics Corp', amount: '12450000', currency: 'IDR', date: '21 Oct 2024', status: 'Cleared' },
  { id: 'INV-2024-0402', customer: 'Indo Maritime Ltd', amount: '4250500', currency: 'USD', date: '21 Oct 2024', status: 'Cleared' },
  { id: 'INV-2024-0398', customer: 'Pacific Gateway Hub', amount: '8900000', currency: 'IDR', date: '19 Oct 2024', status: 'Pending' },
  { id: 'INV-2024-0395', customer: 'Nusantara Freight', amount: '15000000000', currency: 'IDR', date: '15 Oct 2024', status: 'Overdue' },
  { id: 'INV-2024-0390', customer: 'Summit Supply Chain', amount: '2100000', currency: 'IDR', date: '12 Oct 2024', status: 'Cleared' },
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

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'Cleared': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircle2 color="#10b981" size={14} /> };
      case 'Pending': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: <Clock color="#f59e0b" size={14} /> };
      case 'Overdue': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <AlertCircle color="#ef4444" size={14} /> };
      default: return { color: Colors.secondary, bg: 'rgba(0,0,0,0.05)', icon: null };
    }
  };

  const renderInvoiceItem = ({ item }: { item: Invoice }) => {
    const statusCfg = getStatusConfig(item.status);
    
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => router.push({ pathname: '/invoice-detail', params: { id: item.id } })}
        style={styles.cardWrapper}
      >
        <View style={styles.invoiceCard}>
          <View style={styles.cardHeader}>
            <View style={styles.idBadge}>
              <Text style={styles.invoiceId}>{item.id}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
              {statusCfg.icon}
              <Text style={[styles.statusText, { color: statusCfg.color }]}>{item.status}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.mainInfo}>
              <Text style={styles.customerName} numberOfLines={1}>{item.customer}</Text>
              <Text style={styles.dateValue}>{item.date}</Text>
            </View>
            
            <View style={styles.amountBox}>
              <Text style={styles.currency}>{item.currency}</Text>
              <Text 
                style={styles.amountText} 
                numberOfLines={1} 
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatCurrency(item.amount)}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.footerAction}>
              <Download color={Colors.secondary} size={16} />
              <Text style={styles.footerActionText}>Download PDF</Text>
            </TouchableOpacity>
            <ChevronRight color={Colors.secondary} size={18} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer showBack={true} title="Billing & Invoices" withScroll={false}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search color={Colors.secondary} size={20} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search invoices..."
            placeholderTextColor={Colors.secondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X color={Colors.secondary} size={20} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.tabContainer}>
          {(['All', 'Pending', 'Cleared', 'Overdue'] as const).map((t) => (
            <TouchableOpacity 
              key={t} 
              onPress={() => setFilter(t)} 
              style={[styles.tabButton, filter === t && styles.tabButtonActive]}
            >
              <Text style={[styles.tabButtonText, filter === t && styles.tabButtonTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}><ActivityIndicator color={Colors.primaryContainer} size="large" /></View>
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
               <Text style={styles.emptyText}>{error ? `Error: ${error}` : "No matches found"}</Text>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 52, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    backgroundColor: Colors.surfaceVariant || 'rgba(0,0,0,0.03)',
    marginBottom: 16
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: Colors.onSurface, fontSize: 16, fontWeight: '500' },
  tabContainer: { flexDirection: 'row', gap: 8 },
  tabButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 12, 
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.outlineVariant || 'rgba(0,0,0,0.1)'
  },
  tabButtonActive: { 
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer
  },
  tabButtonText: { fontSize: 13, fontWeight: '600', color: Colors.secondary },
  tabButtonTextActive: { color: Colors.onPrimaryContainer || '#fff' },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 },
  cardWrapper: { marginBottom: 16 },
  invoiceCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: 24, 
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.outlineVariant || 'rgba(0,0,0,0.05)'
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16
  },
  idBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8, 
    backgroundColor: Colors.surfaceVariant || 'rgba(0,0,0,0.05)' 
  },
  invoiceId: { fontSize: 12, fontWeight: 'bold', color: Colors.secondary, fontFamily: 'monospace' },
  statusPill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  
  cardBody: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end',
    marginBottom: 16
  },
  mainInfo: { flex: 1, marginRight: 16 },
  customerName: { fontSize: 18, fontWeight: '800', color: Colors.onSurface, marginBottom: 4 },
  dateValue: { fontSize: 13, color: Colors.secondary, fontWeight: '500' },
  
  amountBox: { alignItems: 'flex-end', maxWidth: '45%' },
  currency: { fontSize: 10, fontWeight: 'bold', color: Colors.primary, marginBottom: 2 },
  amountText: { fontSize: 22, fontWeight: '900', color: Colors.onSurface },
  
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant || 'rgba(0,0,0,0.05)'
  },
  footerAction: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerActionText: { fontSize: 13, fontWeight: '600', color: Colors.secondary },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: Colors.secondary, fontSize: 15, fontWeight: '500' },
});
