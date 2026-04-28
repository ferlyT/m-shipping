import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Calendar, CreditCard, Download, Receipt, Share2, User } from 'lucide-react-native';
import React, { useRef } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { ScreenContainer } from '../components/ScreenContainer';
import { useLanguage } from '../context/LanguageContext';
import { useFetch } from '../hooks/useFetch';
import { useThemeColors } from '../hooks/useThemeColors';

const { width } = Dimensions.get('window');

// --- TS Interface ---
interface InvoiceDetail {
  id: string;
  status: 'CLEARED' | 'PENDING' | 'OVERDUE';
  amount: string;
  currency: string;
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
  id: 'INV-2024-0395',
  status: 'OVERDUE',
  amount: '15000000000',
  currency: 'IDR',
  customer: {
    name: 'Nusantara Freight Services',
    address: 'Jl. Jend. Sudirman No. 55, Jakarta Selatan, 12190'
  },
  dueDate: 'Oct 15, 2024',
  issueDate: 'Oct 01, 2024',
  paymentMethod: 'Bank Transfer',
  paymentDetail: 'BCA Vault (•••• 8821)',
  items: [
    { name: 'Major Logistics Hub Rental', description: 'Jakarta International Port Area', amount: '12000000000' },
    { name: 'Security & Surveillance', description: '24/7 Monitoring & Armed Guard', amount: '2000000000' },
    { name: 'Utility & Maintenance', description: 'Electricity, Water & Building Care', amount: '1000000000' }
  ],
  subtotal: '15000000000',
  tax: '0',
  total: '15000000000'
};

const formatCurrency = (val: string) => {
  const num = parseFloat(val.replace(/,/g, '')) || 0;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function InvoiceDetailScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const router = useRouter();

  const { data: invoice, loading, refreshing, refetch } = useFetch<InvoiceDetail>(`/invoices/${id}`, MOCK_INVOICE_DETAIL);
  const viewShotRef = useRef<any>(null);

  if (loading || !invoice) {
    return (
      <ScreenContainer showBack={true} showBottomNav={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading invoice details...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLEARED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'OVERDUE': return '#ef4444';
      default: return Colors.secondary;
    }
  };

  const onShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `Share Invoice ${invoice.id}`,
        UTI: 'public.png',
      });
    } catch (error) {
      console.log('Share Error:', error);
    }
  };

  const onDownloadPDF = async () => {
    // Terbilang: convert number to Indonesian words
    const terbilang = (n: number): string => {
      if (n === 0) return "";
      if (n < 12) return ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"][n];
      if (n < 20) return terbilang(n - 10) + " Belas";
      if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
      if (n < 200) return "Seratus " + terbilang(n - 100);
      if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
      if (n < 2000) return "Seribu " + terbilang(n - 1000);
      if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
      if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
      if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + " Miliar " + terbilang(n % 1000000000);
      return "";
    };

    const currencySymbol = invoice.currency === 'USD' ? 'S$' : (invoice.currency === 'IDR' ? 'Rp' : invoice.currency);
    const cleanAmount = parseInt(invoice.total.replace(/[^0-9]/g, '')) || 0;
    const terbilangText = cleanAmount === 0 ? "Nol" : terbilang(cleanAmount).trim();
    const formattedTotal = formatCurrency(invoice.total);

    // Generate nested table rows for items
    const qtyRows = invoice.items.map(item => `<tr><td style="padding:3px 12px; border:none; text-align:center;">1 Unit</td></tr>`).join('');
    const descRows = invoice.items.map(item => `<tr><td style="padding:3px 12px; border:none;">
        <div style="font-weight:bold;">${item.name.toUpperCase()}</div>
    </td></tr>`).join('');
    const priceRows = invoice.items.map(item => `<tr><td style="padding:3px 12px; border:none;">
        <div class="currency-line"><span>${currencySymbol}</span><span class="num">${formatCurrency(item.amount)}</span></div>
    </td></tr>`).join('');
    const amountRows = invoice.items.map(item => `<tr><td style="padding:3px 12px; border:none;">
        <div class="currency-line"><span>${currencySymbol}</span><span class="num">${formatCurrency(item.amount)}</span></div>
    </td></tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #fff; padding: 0; margin: 0; color: #000; font-size: 11px; }
        .page { width: 100%; height: 100%; padding: 10mm; position: relative; overflow: hidden; }
        @page { size: A5 landscape; margin: 0; }
        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-15deg); font-size: 100px; font-weight: bold; color: #ccc; opacity: 0.25; pointer-events: none; z-index: 99; letter-spacing: 10px; user-select: none; }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { border: 1.5px solid #000; vertical-align: center !important; }
        .header-left { width: 61%; }
        .header-spacer { width: 1%; border: none !important; padding: 0 !important; }
        .header-right { width: 38%; padding: 0 !important; }
        .info-row { display: flex; border-bottom: 1.5px solid #000; }
        .info-row:last-child { border-bottom: none; }
        .info-label { padding: 8px 10px; white-space: nowrap; min-width: 90px; }
        .info-colon { padding: 8px 4px; }
        .info-value { padding: 8px 10px; font-weight: bold; flex: 1; }
        .bill-no-value { font-size: 16px; }
        .marking-value { padding: 8px 10px; flex: 1; }
        .marking-value div { font-weight: bold; }
        .spacer { height: 18px; }
        .body-table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; }
        .body-table th, .body-table td { border: 1.5px solid #000; padding: 8px 12px; }
        .body-table th { text-align: center; font-weight: bold; }
        .col-qty { width: 13%; }
        .col-desc { width: 49%; }
        .col-unitprice { width: 17%; }
        .col-amount { width: 21%; }
        .qty-cell { text-align: center; vertical-align: top; }
        .desc-cell, .price-cell, .amount-cell { vertical-align: top; }
        .currency-line { display: flex; justify-content: space-between; }
        .num { text-align: right; flex: 1; }
        .data-row { height: 250px; vertical-align: top; }
        .terbilang-cell { text-align: center; font-style: italic; font-size: 12px; }
        .divider-line { border-top: 1.5px solid #000; margin: 0 0 6px 0; }
        .footer { text-align: right; margin-top: 6px; font-size: 11px; color: #333; }
    </style>
</head>
<body>
    <div class="page">
        <table class="header-table">
            <tr>
                <td class="header-left" style="padding:0;">
                    <div style="display:flex; align-items:flex-start; gap:6px; padding:10px 12px 0 10px;">
                        <span style="font-size:18px; font-weight:bold; white-space:nowrap; margin-top:2px;">To :</span>
                        <span style="font-size:18px; font-weight:lighter; margin-top:5px;">${invoice.customer.name.toUpperCase()}</span>
                    </div>
                    <div style="padding:10px 12px; font-size:10px; color:#555;">${invoice.customer.address}</div>
                    <div style="display:flex; border-top:1.5px solid #000; margin-top:10px;">
                        <div style="width:55%; border-right:1.5px solid #000; padding:10px;">SALES : MS-SYS</div>
                        <div style="width:45%; padding:10px;">COLLECTOR : MS-SYS</div>
                    </div>
                </td>
                <td class="header-spacer"></td>
                <td class="header-right">
                    <div class="info-row">
                        <span class="info-label">BILL NO</span>
                        <span class="info-colon">:</span>
                        <span class="info-value bill-no-value">${invoice.id}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">DATE</span>
                        <span class="info-colon">:</span>
                        <span class="info-value">${invoice.dueDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">MARKING</span>
                        <span class="info-colon">:</span>
                        <span class="marking-value">
                            <div>SHIP-MOBILE</div>
                            <div>FLOW : 1-6</div>
                        </span>
                    </div>
                </td>
            </tr>
        </table>
        <div class="spacer"></div>
        <table class="body-table">
            <thead>
                <tr>
                    <th class="col-qty">QTY</th>
                    <th class="col-desc">DESCRIPTION</th>
                    <th class="col-unitprice">UNIT PRICE</th>
                    <th class="col-amount">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                <tr class="data-row">
                    <td class="qty-cell" style="border-bottom:none; padding:0; vertical-align:top;">
                        <table style="width:100%; border-collapse:collapse;">${qtyRows}</table>
                    </td>
                    <td class="desc-cell" style="border-bottom:none; padding:0; vertical-align:top;">
                        <table style="width:100%; border-collapse:collapse;">${descRows}</table>
                    </td>
                    <td class="price-cell" style="border-bottom:none; padding:0; vertical-align:top;">
                        <table style="width:100%; border-collapse:collapse;">${priceRows}</table>
                    </td>
                    <td class="amount-cell" style="border-bottom:none; padding:0; vertical-align:top;">
                        <table style="width:100%; border-collapse:collapse;">${amountRows}</table>
                    </td>
                </tr>
                <tr>
                    <td style="border-top:none;"></td>
                    <td class="terbilang-cell" style="border-top:none;">
                        ${terbilangText} &nbsp;&nbsp; ${currencySymbol}
                    </td>
                    <td style="border-top:none;"></td>
                    <td style="border-top:none;">
                        <div class="divider-line"></div>
                        <div class="currency-line"><span>${currencySymbol}</span><span class="num" style="font-weight:bold;">${formattedTotal}</span></div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="footer" style="font-size: xx-small;">Printed by : MShipping System</div>
        <div class="watermark">COPY</div>
    </div>
</body>
</html>`;

    try {
      // A5 landscape dimensions in points: 595 x 420
      const { uri } = await Print.printToFileAsync({ html, width: 595, height: 420 });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.log('PDF Error:', error);
    }
  };

  const HeaderRight = (
    <TouchableOpacity style={styles.iconBtn} onPress={onShare}>
      <Share2 color={Colors.primary} size={20} />
    </TouchableOpacity>
  );

  const statusColor = getStatusColor(invoice.status);

  return (
    <ScreenContainer
      showBack={true}
      rightContent={HeaderRight}
      showBottomNav={false}
      onRefresh={refetch}
      refreshing={refreshing}
      withScroll={false}
      title="Invoice Detail"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={{ backgroundColor: Colors.background }}>

          {/* Main Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>{invoice.status}</Text>
              </View>
              <Text style={styles.invoiceId}>#{invoice.id}</Text>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>TOTAL AMOUNT DUE</Text>
              <View style={styles.amountWrapper}>
                <Text style={styles.currencySymbol}>{invoice.currency}</Text>
                <Text
                  style={styles.amountValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {formatCurrency(invoice.total)}
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnPrimary} onPress={onDownloadPDF}>
                <Download color="#fff" size={20} />
                <Text style={styles.btnPrimaryText}>Download PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary} onPress={onShare}>
                <Share2 color={Colors.primary} size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Sections */}
          <View style={styles.sectionsContainer}>

            {/* Customer Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <User size={18} color={Colors.secondary} />
                <Text style={styles.sectionTitle}>Customer Information</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bill To</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.customerName}>{invoice.customer.name}</Text>
                  <Text style={styles.customerAddress}>{invoice.customer.address}</Text>
                </View>
              </View>
            </View>

            {/* Dates & Payment */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={18} color={Colors.secondary} />
                <Text style={styles.sectionTitle}>Billing Details</Text>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <Text style={styles.infoLabel}>Issue Date</Text>
                  <Text style={styles.gridValue}>{invoice.issueDate}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.infoLabel}>Due Date</Text>
                  <Text style={[styles.gridValue, { color: statusColor }]}>{invoice.dueDate}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment</Text>
                <View style={styles.paymentBox}>
                  <CreditCard size={16} color={Colors.primary} />
                  <Text style={styles.paymentText}>{invoice.paymentMethod} • {invoice.paymentDetail}</Text>
                </View>
              </View>
            </View>

            {/* Line Items */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Receipt size={18} color={Colors.secondary} />
                <Text style={styles.sectionTitle}>Invoice Items</Text>
              </View>
              {invoice.items.map((item, index) => (
                <View key={index} style={[styles.itemRow, index > 0 && styles.itemBorder]}>
                  <View style={styles.itemMain}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  </View>
                  <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
                </View>
              ))}

              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{invoice.currency} {formatCurrency(invoice.subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (0%)</Text>
                  <Text style={styles.summaryValue}>{invoice.currency} 0.00</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{invoice.currency} {formatCurrency(invoice.total)}</Text>
                </View>
              </View>
            </View>

          </View>

          <View style={{ height: 100 }} />
        </ViewShot>
      </ScrollView>
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: Colors.secondary, fontSize: 14 },

  mainCard: {
    backgroundColor: Colors.surface,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 8
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  invoiceId: { fontSize: 14, fontWeight: '700', color: Colors.secondary, fontFamily: 'monospace' },

  amountContainer: { alignItems: 'center', marginBottom: 32 },
  amountLabel: { fontSize: 10, fontWeight: '900', color: Colors.secondary, letterSpacing: 2, marginBottom: 8 },
  amountWrapper: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  currencySymbol: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginTop: 8 },
  amountValue: { fontSize: 42, fontWeight: '900', color: Colors.onSurface },

  actionRow: { flexDirection: 'row', gap: 12 },
  btnPrimary: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  btnSecondary: {
    width: 56,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },

  sectionsContainer: { gap: 16 },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.onSurface },

  infoRow: { gap: 8 },
  infoLabel: { fontSize: 11, fontWeight: '700', color: Colors.secondary, textTransform: 'uppercase', letterSpacing: 1 },
  infoContent: { gap: 4 },
  customerName: { fontSize: 16, fontWeight: '800', color: Colors.onSurface },
  customerAddress: { fontSize: 13, color: Colors.secondary, lineHeight: 20 },

  gridRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  gridItem: { flex: 1, gap: 4 },
  gridValue: { fontSize: 14, fontWeight: '700', color: Colors.onSurface },

  paymentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 12,
    borderRadius: 16
  },
  paymentText: { fontSize: 13, fontWeight: '600', color: Colors.onSurface },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16 },
  itemBorder: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  itemMain: { flex: 1, marginRight: 16 },
  itemName: { fontSize: 14, fontWeight: '800', color: Colors.onSurface, marginBottom: 4 },
  itemDesc: { fontSize: 12, color: Colors.secondary, lineHeight: 18 },
  itemAmount: { fontSize: 14, fontWeight: '800', color: Colors.onSurface },

  summaryContainer: { marginTop: 8, paddingTop: 20, borderTopWidth: 2, borderTopColor: 'rgba(0,0,0,0.05)', gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: Colors.secondary, fontWeight: '500' },
  summaryValue: { fontSize: 13, fontWeight: '700', color: Colors.onSurface },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  totalLabel: { fontSize: 16, fontWeight: '900', color: Colors.primary },
  totalValue: { fontSize: 20, fontWeight: '900', color: Colors.onSurface },
});
