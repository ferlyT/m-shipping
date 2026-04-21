import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Share2, Download, Receipt, Calendar, CreditCard, Box, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { ScreenContainer } from '../components/ScreenContainer';

// --- TS Interface ---
interface InvoiceDetail {
  id: string;
  status: 'CLEARED' | 'PENDING' | 'OVERDUE';
  amount: string;
  customer: {
    name: string;
    address: string;
  };
  dueDate: string;
  issueDate: string;
  paymentMethod: string;
  paymentDetail: string;
  items: {
    name: string;
    description: string;
    amount: string;
  }[];
  subtotal: string;
  tax: string;
  total: string;
}

const MOCK_INVOICE_DETAIL: InvoiceDetail = {
  id: 'INV/2024/0402',
  status: 'CLEARED',
  amount: '4.250.000',
  customer: {
    name: 'Global Tech Solution',
    address: 'Sudirman Central Business District, Jakarta'
  },
  dueDate: 'OCT 24, 2023',
  issueDate: 'OCT 12, 2023',
  paymentMethod: 'VISA',
  paymentDetail: 'Vault (•••• 9012)',
  items: [
    { name: 'Standard Freight', description: 'Jakarta -> Surabaya (32 Pallets)', amount: '3.800.000' },
    { name: 'Handling Fee', description: 'Loading & Priority Placement', amount: '450.000' }
  ],
  subtotal: '4.250.000',
  tax: '0',
  total: '4.250.000'
};

export default function InvoiceDetailScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);

  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setInvoice(MOCK_INVOICE_DETAIL);
      setLoading(false);
    };
    fetchInvoiceDetail();
  }, [id]);

  if (loading || !invoice) {
    return (
      <ScreenContainer showBack={true} showBottomNav={false}>
         <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryContainer} />
            <Text style={styles.loadingText}>Retreiving Billing Data...</Text>
         </View>
      </ScreenContainer>
    );
  }

  const HeaderRight = (
    <TouchableOpacity style={styles.iconBtn}>
      <Share2 color={Colors.secondary} size={20} />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer showBack={true} rightContent={HeaderRight} showBottomNav={false}>
         {/* Top Header Card */}
         <BlurView intensity={24} tint={Colors.blurTint} style={styles.headerCard}>
            <View style={styles.statusRow}>
               <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{invoice.status}</Text>
                  <View style={styles.checkIcon}><Check color={Colors.onPrimary} size={10} /></View>
               </View>
               <Text style={styles.invoiceId}>{invoice.id}</Text>
            </View>
            <View style={styles.amountContainer}>
               <Text style={styles.amountLabel}>{t.invoice_amount}</Text>
               <Text style={styles.amountValue}>IDR {invoice.amount}</Text>
            </View>
            <View style={styles.actionRow}>
               <TouchableOpacity style={styles.primaryAction}>
                  <Download color={Colors.onPrimary} size={16} />
                  <Text style={styles.primaryActionText}>{t.download_pdf}</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.secondaryAction}>
                  <Text style={styles.secondaryActionText}>{t.view_receipt}</Text>
               </TouchableOpacity>
            </View>
         </BlurView>

         {/* Info Grid */}
         <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
               <BlurView intensity={24} tint={Colors.blurTint} style={[styles.infoCard, { flex: 1.5 }]}>
                  <Text style={styles.infoCardLabel}>{t.bill_to}</Text>
                  <Text style={styles.infoCardValue}>{invoice.customer.name}</Text>
                  <Text style={styles.infoCardSub}>{invoice.customer.address}</Text>
               </BlurView>
               <BlurView intensity={24} tint={Colors.blurTint} style={[styles.infoCard, { flex: 1 }]}>
                  <Text style={styles.infoCardLabel}>{t.due_date}</Text>
                  <Text style={styles.dateTextPrimary}>{invoice.dueDate}</Text>
                  <Text style={styles.infoCardSub}>Issued: {invoice.issueDate}</Text>
               </BlurView>
            </View>

            <View style={styles.infoRow}>
               <BlurView intensity={24} tint={Colors.blurTint} style={[styles.infoCard, { flex: 1, padding: 16 }]}>
                  <Text style={styles.infoCardLabel}>{t.payment_method}</Text>
                  <View style={styles.paymentRow}>
                     <View style={styles.visaBox}><Text style={styles.visaText}>{invoice.paymentMethod}</Text></View>
                     <View>
                        <Text style={styles.paymentText}>{invoice.paymentDetail}</Text>
                     </View>
                  </View>
               </BlurView>
            </View>
         </View>

         {/* Itemized Breakdown */}
         <View style={styles.sectionHeader}>
            <Receipt color={Colors.primaryContainer} size={18} />
            <Text style={styles.sectionTitle}>{t.service_details}</Text>
         </View>

         <BlurView intensity={24} tint={Colors.blurTint} style={styles.itemsCard}>
            {invoice.items.map((item, idx) => (
              <View key={idx} style={[styles.itemRow, idx !== 0 && styles.itemBorder]}>
                 <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                 </View>
                 <Text style={styles.itemAmount}>IDR {item.amount}</Text>
              </View>
            ))}

            <View style={styles.recessContainer}>
               <View style={styles.recessRow}>
                  <Text style={styles.recessLabel}>{t.subtotal}</Text>
                  <Text style={styles.recessValue}>IDR {invoice.subtotal}</Text>
               </View>
               <View style={styles.recessRow}>
                  <Text style={styles.recessLabel}>{t.tax} (0%)</Text>
                  <Text style={styles.recessValue}>IDR {invoice.tax}</Text>
               </View>
               <View style={[styles.recessRow, styles.totalRecess]}>
                  <Text style={styles.totalLabel}>{t.total_amount_due}</Text>
                  <Text style={styles.totalValue}>IDR {invoice.total}</Text>
               </View>
            </View>
         </BlurView>
         
         <View style={{ height: 100 }} />
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: Colors.secondary, fontSize: 13, fontWeight: '500', letterSpacing: 1 },
  iconBtn: { padding: 8 },
  headerCard: { borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.15)', marginBottom: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(34, 197, 94, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusText: { color: '#22c55e', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  checkIcon: { backgroundColor: '#22c55e', width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  invoiceId: { color: Colors.secondary, fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' },
  amountContainer: { alignItems: 'center', marginBottom: 32 },
  amountLabel: { color: Colors.secondary, fontSize: 11, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 },
  amountValue: { color: Colors.onSurface, fontSize: 36, fontWeight: '900' },
  actionRow: { flexDirection: 'row', gap: 12 },
  primaryAction: { flex: 1, backgroundColor: Colors.primaryContainer, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  primaryActionText: { color: Colors.onPrimary, fontSize: 13, fontWeight: 'bold' },
  secondaryAction: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.2)', borderRadius: 12 },
  secondaryActionText: { color: Colors.onSurface, fontSize: 13, fontWeight: 'bold' },
  infoGrid: { gap: 12, marginBottom: 32 },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoCard: { padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.1)' },
  infoCardLabel: { fontSize: 8, fontWeight: '900', color: Colors.secondary, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  infoCardValue: { fontSize: 14, fontWeight: 'bold', color: Colors.onSurface, marginBottom: 4 },
  infoCardSub: { fontSize: 10, color: Colors.secondary, lineHeight: 14 },
  dateTextPrimary: { fontSize: 14, fontWeight: 'bold', color: Colors.secondary, marginBottom: 4 },
  paymentRow: { flexDirection: 'column', gap: 8 },
  visaBox: { backgroundColor: Colors.surfaceContainerHighest, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  visaText: { color: Colors.onSurface, fontSize: 10, fontWeight: '900' },
  paymentText: { color: Colors.onSurface, fontSize: 13, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { color: Colors.onSurface, fontSize: 16, fontWeight: 'bold' },
  itemsCard: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.1)' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16 },
  itemBorder: { borderTopWidth: 1, borderTopColor: 'rgba(79, 70, 51, 0.1)' },
  itemName: { color: Colors.onSurface, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  itemDesc: { color: Colors.secondary, fontSize: 11, lineHeight: 16 },
  itemAmount: { color: Colors.onSurface, fontSize: 14, fontWeight: 'bold' },
  recessContainer: { marginTop: 8, gap: 12, paddingTop: 20, borderTopWidth: 2, borderTopColor: 'rgba(79, 70, 51, 0.1)' },
  recessRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recessLabel: { color: Colors.secondary, fontSize: 13 },
  recessValue: { color: Colors.onSurface, fontSize: 13, fontWeight: 'bold' },
  totalRecess: { marginTop: 8, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(79, 70, 51, 0.1)', flexDirection: 'column', alignItems: 'flex-start', gap: 8 },
  totalLabel: { color: Colors.primaryContainer, fontWeight: 'bold', fontSize: 11, letterSpacing: 2 },
  totalValue: { color: Colors.onSurface, fontSize: 28, fontWeight: '900' },
});
